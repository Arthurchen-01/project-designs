import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateFiveRateV2 } from '@/lib/scoring-engine-v2'
import { generateExplanation, generateExplanationWithAI } from '@/lib/explanation'
import { evaluateDailyUpdate } from '@/lib/ai-evaluator'

// ---------------------------------------------------------------------------
// GET /api/daily-update — 获取历史记录
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const studentId = req.cookies.get('ap_student_id')?.value
  if (!studentId) return NextResponse.json({ updates: [], error: '未登录' }, { status: 401 })

  const updates = await prisma.dailyUpdate.findMany({
    where: { studentId },
    include: {
      subject: { select: { code: true, name: true, color: true } },
    },
    orderBy: { date: 'desc' },
    take: 30,
  })

  return NextResponse.json({ updates })
}

// ---------------------------------------------------------------------------
// POST /api/daily-update — 提交每日更新 → AI评估 → 计算5分率 → 生成解释
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const studentId = req.cookies.get('ap_student_id')?.value
  if (!studentId) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json()

  // Accept both legacy names (taskType/timeMinutes/notes) and new names (activityType/durationMinutes/description)
  const {
    date, subjectCode, timedMode, score, totalCount, correctCount, unit,
  } = body
  const taskType     = body.activityType   ?? body.taskType
  const timeMinutes  = body.durationMinutes ?? body.timeMinutes
  const notes        = body.description    ?? body.notes

  if (!date || !subjectCode || !taskType) {
    return NextResponse.json({ error: '缺少必填字段：date, subjectCode, activityType' }, { status: 400 })
  }

  // Step 1: 创建每日更新记录
  const update = await prisma.dailyUpdate.create({
    data: {
      studentId, subjectCode, date, taskType,
      timedMode: timedMode ?? 'na',
      score:        score       != null ? Number(score)       : null,
      totalCount:   totalCount  != null ? Number(totalCount)  : null,
      correctCount: correctCount != null ? Number(correctCount) : null,
      timeMinutes:  timeMinutes != null ? Number(timeMinutes) : null,
      unit:         unit         ?? null,
      notes:        notes         ?? null,
    },
    include: {
      subject: { select: { code: true, name: true, color: true } },
    },
  })

  // Step 2: 获取学生和科目名称（用于 AI 解释）
  const student = await prisma.student.findUnique({ where: { id: studentId } })
  const studentName = student?.name ?? '同学'
  const subjectName = update.subject.name

  // Step 3: AI 评估（失败不影响主流程）
  let aiResult: { evidenceLevel: string; qualityScore: number; explanation: string; source: string } | null = null
  try {
    const evalResult = await evaluateDailyUpdate({
      description:  notes ?? '',
      subjectCode,
      activityType: taskType,
      scorePercent: score != null && totalCount != null && totalCount > 0
        ? (score / totalCount) * 100
        : undefined,
      timedMode,
    })
    aiResult = evalResult

    await prisma.dailyUpdate.update({
      where: { id: update.id },
      data: {
        aiEvidenceLevel: evalResult.evidenceLevel,
        aiDeltaScore:    evalResult.qualityScore,
        aiExplanation:   evalResult.explanation,
      },
    })
  } catch (err) {
    console.warn('[daily-update] AI evaluation skipped:', err)
  }

  // Step 4: 计算 5 分率（传入 AI 质量分优先使用）
  const prevSnapshot = await prisma.probabilitySnapshot.findUnique({
    where: { studentId_subjectCode: { studentId, subjectCode } },
  })
  const prevRate = prevSnapshot?.rate ?? null

  let scoringResult: {
    rate: number; lower: number; upper: number; confidence: string; trend: string
    effectiveSampleSize: number
    prevRate: number | null; delta: number | null
    explanation: string; explanationSource: 'ai' | 'rule'
  } | null = null

  try {
    const result = aiResult
      ? await calculateFiveRateV2({ studentId, subjectCode, aiQualityScore: aiResult.qualityScore })
      : await calculateFiveRateV2(studentId, subjectCode)

    // 获取最近 5 条活动摘要（用于 AI 解释上下文）
    const recentUpdates = await prisma.dailyUpdate.findMany({
      where: { studentId, subjectCode },
      orderBy: { date: 'desc' },
      take: 5,
      select: { taskType: true, date: true, aiEvidenceLevel: true },
    })
    const recentActivities = recentUpdates.map(u =>
      `${u.date}的${u.taskType}${u.aiEvidenceLevel ? `(${u.aiEvidenceLevel}证据)` : ''}`
    )

    // 优先使用 AI 生成解释（Task 025）
    const explanationResult = await generateExplanationWithAI({
      prevRate,
      curr: result,
      studentName,
      subjectName,
      recentActivities,
    })

    await prisma.probabilitySnapshot.upsert({
      where: { studentId_subjectCode: { studentId, subjectCode } },
      update: {
        rate: result.rate, confidence: result.confidence,
        trend: result.trend, updatedAt: new Date(),
      },
      create: {
        studentId, subjectCode,
        rate: result.rate, confidence: result.confidence, trend: result.trend,
      },
    })

    scoringResult = {
      rate: result.rate,
      confidence: result.confidence,
      trend: result.trend,
      prevRate,
      delta: prevRate != null ? result.rate - prevRate : null,
      explanation: explanationResult.text,
      explanationSource: explanationResult.source,
    }
  } catch (err) {
    console.error('[daily-update] scoring error:', err)
  }

  return NextResponse.json({
    update: {
      ...update,
      aiEvidenceLevel: aiResult?.evidenceLevel ?? null,
      aiDeltaScore:    aiResult?.qualityScore ?? null,
      aiExplanation:   aiResult?.explanation ?? null,
    },
    scoring: scoringResult,
    ai: aiResult
      ? { evidenceLevel: aiResult.evidenceLevel, qualityScore: aiResult.qualityScore, source: aiResult.source }
      : null,
  }, { status: 201 })
}
