/**
 * scoring-engine.ts — 5分率规则引擎
 *
 * 评分 = testPerformance(60%) + trendScore(15%) + stabilityScore(15%) + reviewQuality(10%)
 *      = min(rate, historical_max) * (1 - forgetting_decay)
 */

import { prisma } from './prisma'
import { calculateConfidence } from './confidence'

export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type Trend = 'rising' | 'stable' | 'falling'

export interface ScoringOutput {
  studentId: string; subjectCode: string
  rate: number; testPerformance: number; trendScore: number
  stabilityScore: number; reviewQualityScore: number
  forgettingDecay: number; confidence: ConfidenceLevel
  trend: Trend; historicalMax: number; dataPoints: number; updatedAt: string
}

// 权重配置
const TYPE_WEIGHTS    = { 'full-mock': 3.0, 'mcq': 2.0, 'frq': 2.0 }
const TIMED_MULT      = { timed: 1.0, untimed: 0.7, 'semi-timed': 0.85 }
const DIFF_WEIGHTS   = { hard: 1.2, medium: 1.0, basic: 0.8 }
const REVIEW_WEIGHTS  = { 'MCQ练习': 0.9, 'FRQ练习': 0.95, '整套模考': 1.0, '知识点复习': 0.7, '错题整理': 0.8, '看资料': 0.5, '其他': 0.3 }

async function fetchData(studentId: string, subjectCode: string) {
  const [records, updates, snapshots] = await Promise.all([
    prisma.assessmentRecord.findMany({ where: { studentId, subjectCode }, orderBy: { date: 'asc' } }),
    prisma.dailyUpdate.findMany({ where: { studentId, subjectCode }, orderBy: { date: 'desc' }, take: 10 }),
    prisma.probabilitySnapshot.findMany({ where: { studentId, subjectCode }, orderBy: { updatedAt: 'desc' }, take: 1 }),
  ])
  return { records, updates, snapshots }
}

function testPerformance(records: { score: number; maxScore: number; type: string; timedMode: string; difficulty?: string | null }[]): { score: number; count: number } {
  if (!records.length) return { score: 0, count: 0 }
  const recent = records.slice(-10)
  let sum = 0, weight = 0
  for (const r of recent) {
    const w = (TYPE_WEIGHTS[r.type as keyof typeof TYPE_WEIGHTS] ?? 1.0)
             * (TIMED_MULT[r.timedMode as keyof typeof TIMED_MULT] ?? 0.7)
             * (DIFF_WEIGHTS[r.difficulty as keyof typeof DIFF_WEIGHTS] ?? 1.0)
    sum += (r.score / r.maxScore) * w; weight += w
  }
  return { score: weight > 0 ? sum / weight : 0, count: recent.length }
}

function trendScore(records: { score: number; maxScore: number }[]): number {
  if (records.length < 3) return 0.5
  const vals = records.slice(-5).map(r => r.score / r.maxScore)
  const n = vals.length, xm = (n - 1) / 2, ym = vals.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) { num += (i - xm) * (vals[i] - ym); den += (i - xm) ** 2 }
  const slope = den > 0 ? num / den : 0
  return Math.max(0, Math.min(1, (slope + 0.2) / 0.4))
}

function stabilityScore(records: { score: number; maxScore: number }[]): number {
  if (records.length < 2) return 0.5
  const vals = records.slice(-10).map(r => r.score / r.maxScore)
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length
  const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length
  return Math.max(0, 1 - Math.sqrt(variance) * 3)
}

function reviewQuality(updates: { taskType: string; date: string; score?: number | null; totalCount?: number | null }[]): number {
  if (!updates.length) return 0.5
  const today = new Date()
  let total = 0
  for (const u of updates.slice(0, 5)) {
    let score = REVIEW_WEIGHTS[u.taskType as keyof typeof REVIEW_WEIGHTS] ?? 0.5
    if (u.score != null && u.totalCount != null && u.totalCount > 0)
      score = Math.min(1, score + (u.score / u.totalCount) * 0.2 - 0.1)
    try {
      const daysAgo = Math.ceil((today.getTime() - new Date(u.date).getTime()) / 86400000)
      score = Math.min(1, score + Math.max(0, (5 - daysAgo) * 0.05))
    } catch { /* ignore */ }
    total += score
  }
  return Math.min(1, total / Math.min(updates.length, 5))
}

function forgettingDecay(records: { date: string }[], updates: { date: string }[]): number {
  const today = new Date()
  const all = [...records, ...updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const last = all[0]
  if (!last) return 0.15
  const days = Math.ceil((today.getTime() - new Date(last.date).getTime()) / 86400000)
  return Math.min(0.15, days * 0.005)
}

export async function calculateFiveRate(studentId: string, subjectCode: string): Promise<ScoringOutput> {
  const { records, updates, snapshots } = await fetchData(studentId, subjectCode)
  const tp   = testPerformance(records)
  const ts   = trendScore(records)
  const ss   = stabilityScore(records)
  const rq   = reviewQuality(updates)
  const decay = forgettingDecay(records, updates)
  const histMax = snapshots.length ? Math.max(...snapshots.map(s => s.rate)) : 1.0
  const confidence = calculateConfidence(tp.count, records.length)
  const raw = tp.score * 0.60 + ts * 0.15 + ss * 0.15 + rq * 0.10
  const capped = Math.min(raw, histMax)
  const rate = Math.max(0, Math.min(1, capped * (1 - decay)))
  const trend: Trend = ts >= 0.65 ? 'rising' : ts <= 0.35 ? 'falling' : 'stable'
  return { studentId, subjectCode, rate, testPerformance: tp.score, trendScore: ts,
    stabilityScore: ss, reviewQualityScore: rq, forgettingDecay: decay,
    confidence, trend, historicalMax: histMax, dataPoints: tp.count, updatedAt: new Date().toISOString() }
}

export async function calculateBatchFiveRates(classId: string) {
  const enrollments = await prisma.studentSubject.findMany({
    where: { student: { classId } },
  })
  const results = await Promise.allSettled(
    enrollments.map(e => calculateFiveRate(e.studentId, e.subjectCode))
  )
  return results
    .filter((r): r is PromiseFulfilledResult<ScoringOutput> => r.status === 'fulfilled')
    .map(r => r.value)
}
