import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateFiveRate } from '@/lib/scoring-engine'
import { generateExplanation } from '@/lib/explanation'
import { evaluateDailyUpdate } from '@/lib/ai-evaluator'

export async function GET(req: NextRequest) {
  const studentId = req.cookies.get('ap_student_id')?.value
  if (!studentId) return NextResponse.json({ updates: [], error: '未登录' }, { status: 401 })
  const updates = await prisma.dailyUpdate.findMany({
    where: { studentId },
    include: { subject: { select: { code: true, name: true, color: true } } },
    orderBy: { date: 'desc' }, take: 30,
  })
  return NextResponse.json({ updates })
}

export async function POST(req: NextRequest) {
  const studentId = req.cookies.get('ap_student_id')?.value
  if (!studentId) return NextResponse.json({ error: '未登录' }, { status: 401 })
  const body = await req.json()
  const {
    date, subjectCode, taskType, timedMode,
    score, totalCount, correctCount, timeMinutes, unit, notes,
  } = body
  if (!date || !subjectCode || !taskType) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
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

  // Step 2: 调用 AI 评估（失败不影响主流程）
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

    // 将 AI 评估结果写回 DailyUpdate 记录
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

  // Step 3: 计算 5 分率（传入 AI 质量分优先使用）
  const prevSnapshot = await prisma.probabilitySnapshot.findUnique({
    where: { studentId_subjectCode: { studentId, subjectCode } },
  })
  const prevRate = prevSnapshot?.rate ?? null

  try {
    const result = aiResult
      ? await calculateFiveRate({ studentId, subjectCode, aiQualityScore: aiResult.qualityScore })
      : await calculateFiveRate(studentId, subjectCode)
    const explanation = generateExplanation({ prevRate, curr: result })

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

    return NextResponse.json({
      update: {
        ...update,
        aiEvidenceLevel: aiResult?.evidenceLevel ?? null,
        aiDeltaScore:    aiResult?.qualityScore ?? null,
        aiExplanation:   aiResult?.explanation ?? null,
      },
      scoring: {
        rate: result.rate,
        confidence: result.confidence,
        trend: result.trend,
        prevRate,
        delta: prevRate != null ? result.rate - prevRate : null,
        explanation,
      },
      ai: aiResult
        ? { evidenceLevel: aiResult.evidenceLevel, qualityScore: aiResult.qualityScore, source: aiResult.source }
        : null,
    }, { status: 201 })
  } catch (err) {
    console.error('[daily-update] scoring error:', err)
    return NextResponse.json({ update, scoring: null, ai: null }, { status: 201 })
  }
}
