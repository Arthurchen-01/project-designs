/**
 * scoring-engine-v2.ts — 加权 Beta 贝叶斯 5 分率引擎
 *
 * 核心模型：
 *   每次测试记录 → logistic 支持度 q → 按权重和信息量累加到 Beta 后验
 *   先验: alpha0=2, beta0=2（弱信息中性先验）
 *   输出: 点估计 + 90% 可信区间 + 置信等级
 *
 * 辅助层：
 *   - 复习质量微调（AI evaluator qualityScore，±2% 以内）
 *   - 遗忘衰减（连续不更新，每天 0.5%，上限 15%）
 */

import { prisma } from './prisma'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface ScoringOutputV2 {
  studentId: string
  subjectCode: string
  /** 点估计 5 分率（0-1） */
  rate: number
  /** 90% 可信区间下界 */
  lower: number
  /** 90% 可信区间上界 */
  upper: number
  /** 置信等级（基于区间宽度） */
  confidence: ConfidenceLevel
  /** 有效样本量 = alpha + beta - 4（扣除先验） */
  effectiveSampleSize: number
  /** 后验 alpha */
  alpha: number
  /** 后验 beta */
  beta: number
  /** 遗忘衰减比例（0-0.15） */
  forgettingDecay: number
  /** 趋势 */
  trend: 'rising' | 'stable' | 'falling'
  /** 数据点数（实际测试记录条数） */
  dataPoints: number
  updatedAt: string
}

export interface ScoringInputV2 {
  studentId: string
  subjectCode: string
  /** AI 评估质量分（0-1），用于复习质量微调层 */
  aiQualityScore?: number
}

// ---------------------------------------------------------------------------
// 配置常量
// ---------------------------------------------------------------------------

/** 科目 5 分线中心值 c（百分制） */
const CUTOFF_CENTERS: Record<string, number> = {
  'AP Macro': 60,
  'AP Stats': 62,
  'AP Biology': 64,
}
const DEFAULT_CUTOFF = 60

/** 测试类型权重 */
const TYPE_WEIGHTS: Record<string, number> = {
  'full-mock': 1.0,
  'mcq': 0.7,
  'frq': 0.7,
}
const DEFAULT_TYPE_WEIGHT = 0.5

/** 计时模式乘数 */
const TIMED_MULT: Record<string, number> = {
  'timed': 1.0,
  'untimed': 0.6,
  'semi-timed': 0.8,
}
const DEFAULT_TIMED_MULT = 0.7

/** 信息量 m */
const INFO_AMOUNT: Record<string, number> = {
  'full-mock': 12,
  'mcq': 8,
  'frq': 8,
}
const DEFAULT_INFO_AMOUNT = 5

/** Beta 先验 */
const ALPHA_0 = 2
const BETA_0 = 2

/** 遗忘衰减参数 */
const DECAY_PER_DAY = 0.005   // 0.5%/天
const DECAY_CAP = 0.15        // 上限 15%

/** 复习微调参数 */
const REVIEW_MAX_ADJUST = 0.02          // 最大 ±2%
const REVIEW_HIGH_CONF_REDUCTION = 0.5  // 高置信时减半

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * logistic 支持度函数
 * 将得分率映射到 [0,1]，表示"支持 5 分"的程度
 */
export function logisticSupport(scoreRate: number, cutoff: number, slope: number = 7): number {
  // scoreRate 是 0-1 之间，cutoff 是百分制
  const x = scoreRate * 100
  return 1 / (1 + Math.exp(-((x - cutoff) / slope)))
}

/**
 * 计算单条记录的实际权重 w = typeWeight * timedMult
 */
function calcWeight(type: string, timedMode: string): number {
  const tw = TYPE_WEIGHTS[type] ?? DEFAULT_TYPE_WEIGHT
  const tm = TIMED_MULT[timedMode] ?? DEFAULT_TIMED_MULT
  return tw * tm
}

/**
 * 计算单条记录的信息量 m
 */
function calcInfo(type: string): number {
  return INFO_AMOUNT[type] ?? DEFAULT_INFO_AMOUNT
}

/**
 * 基于区间宽度判定置信等级
 */
function classifyConfidence(width: number): ConfidenceLevel {
  if (width <= 0.15) return 'high'
  if (width <= 0.30) return 'medium'
  return 'low'
}

/**
 * 遗忘衰减：连续不更新天数 × 0.5%，上限 15%
 */
function calcForgettingDecay(records: { date: string }[], updates: { date: string }[]): number {
  const now = new Date()
  const allDates = [...records, ...updates]
    .map(r => new Date(r.date).getTime())
    .filter(t => !isNaN(t))
  if (allDates.length === 0) return DECAY_CAP
  const lastTimestamp = Math.max(...allDates)
  const daysSince = Math.ceil((now.getTime() - lastTimestamp) / 86_400_000)
  return Math.min(DECAY_CAP, daysSince * DECAY_PER_DAY)
}

/**
 * 复习质量微调层
 * 基于 AI evaluator 的 qualityScore 做 ±2% 以内的微调
 * 高置信状态下微调幅度减半
 */
function applyReviewAdjustment(rate: number, aiQualityScore: number | undefined, confidence: ConfidenceLevel): number {
  if (aiQualityScore == null) return rate
  // qualityScore 范围假设为 0-1，0.5 为中性
  const rawDelta = (aiQualityScore - 0.5) * REVIEW_MAX_ADJUST * 2
  const reduction = confidence === 'high' ? REVIEW_HIGH_CONF_REDUCTION : 1
  const delta = rawDelta * reduction
  return Math.max(0, Math.min(1, rate + delta))
}

// ---------------------------------------------------------------------------
// Trend estimation（从最近记录推断趋势）
// ---------------------------------------------------------------------------

function estimateTrend(records: { score: number; maxScore: number }[]): 'rising' | 'stable' | 'falling' {
  if (records.length < 3) return 'stable'
  const vals = records.slice(-5).map(r => r.score / r.maxScore)
  const n = vals.length
  const xm = (n - 1) / 2
  const ym = vals.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xm) * (vals[i] - ym)
    den += (i - xm) ** 2
  }
  const slope = den > 0 ? num / den : 0
  if (slope >= 0.03) return 'rising'
  if (slope <= -0.03) return 'falling'
  return 'stable'
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

interface AssessmentRecord {
  score: number
  maxScore: number
  type: string
  timedMode: string
  date: string
}

interface DailyUpdateRecord {
  taskType: string
  date: string
  score?: number | null
  totalCount?: number | null
}

interface SnapshotRecord {
  rate: number
}

async function fetchData(studentId: string, subjectCode: string) {
  const [records, updates, snapshots] = await Promise.all([
    prisma.assessmentRecord.findMany({
      where: { studentId, subjectCode },
      orderBy: { date: 'asc' },
    }) as Promise<AssessmentRecord[]>,
    prisma.dailyUpdate.findMany({
      where: { studentId, subjectCode },
      orderBy: { date: 'desc' },
      take: 10,
    }) as Promise<DailyUpdateRecord[]>,
    prisma.probabilitySnapshot.findMany({
      where: { studentId, subjectCode },
      orderBy: { updatedAt: 'desc' },
      take: 1,
    }) as Promise<SnapshotRecord[]>,
  ])
  return { records, updates, snapshots }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function calculateFiveRateV2(
  studentIdOrInput: string | ScoringInputV2,
  subjectCode?: string
): Promise<ScoringOutputV2> {
  const input: ScoringInputV2 =
    typeof studentIdOrInput === 'string'
      ? { studentId: studentIdOrInput, subjectCode: subjectCode! }
      : studentIdOrInput

  const { studentId, subjectCode: sc, aiQualityScore } = input
  const { records, updates, snapshots } = await fetchData(studentId, sc)

  // 5 分线中心值
  const cutoff = CUTOFF_CENTERS[sc] ?? DEFAULT_CUTOFF

  // Beta 更新：累加测试证据
  let successEvidence = 0
  let failEvidence = 0

  for (const r of records) {
    const scoreRate = r.maxScore > 0 ? r.score / r.maxScore : 0
    const q = logisticSupport(scoreRate, cutoff)
    const w = calcWeight(r.type, r.timedMode)
    const m = calcInfo(r.type)
    successEvidence += w * m * q
    failEvidence += w * m * (1 - q)
  }

  // 后验参数
  const alpha = ALPHA_0 + successEvidence
  const beta = BETA_0 + failEvidence

  // 有效样本量（扣除先验）
  const effectiveSampleSize = Math.max(0, alpha + beta - ALPHA_0 - BETA_0)

  // 点估计
  const rawRate = alpha / (alpha + beta)

  // 90% 可信区间（正态近似）
  const mean = rawRate
  const total = alpha + beta
  const variance = (alpha * beta) / (total * total * (total + 1))
  const std = Math.sqrt(variance)
  const lower0 = mean - 1.645 * std
  const upper0 = mean + 1.645 * std

  // 初始置信等级（基于区间宽度）
  const rawWidth = upper0 - lower0
  let confidence = classifyConfidence(rawWidth)

  // 遗忘衰减
  const decay = calcForgettingDecay(records, updates)

  // 先算衰减后 rate，再做复习微调
  const decayedRate = Math.max(0, rawRate * (1 - decay))
  const adjustedRate = applyReviewAdjustment(decayedRate, aiQualityScore, confidence)

  // 最终区间（缩放到 adjustedRate 附近，保持原始宽度和相对位置）
  const rateShift = adjustedRate - rawRate
  let lower = Math.max(0, lower0 + rateShift)
  let upper = Math.min(1, upper0 + rateShift)

  // 重新计算最终置信等级
  const finalWidth = upper - lower
  confidence = classifyConfidence(finalWidth)

  // 趋势
  const trend = estimateTrend(records)

  return {
    studentId,
    subjectCode: sc,
    rate: adjustedRate,
    lower,
    upper,
    confidence,
    effectiveSampleSize,
    alpha,
    beta,
    forgettingDecay: decay,
    trend,
    dataPoints: records.length,
    updatedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Batch entry point
// ---------------------------------------------------------------------------

export async function calculateBatchFiveRatesV2(classId: string) {
  const enrollments = await prisma.studentSubject.findMany({
    where: { student: { classId } },
  })
  const results = await Promise.allSettled(
    enrollments.map(e => calculateFiveRateV2(e.studentId, e.subjectCode))
  )
  return results
    .filter((r): r is PromiseFulfilledResult<ScoringOutputV2> => r.status === 'fulfilled')
    .map(r => r.value)
}
