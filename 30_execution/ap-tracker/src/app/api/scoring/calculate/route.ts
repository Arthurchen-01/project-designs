import { NextRequest, NextResponse } from 'next/server'
import { calculateFiveRate } from '@/lib/scoring-engine'
import { generateExplanation } from '@/lib/explanation'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { studentId, subjectCode } = await req.json()
    if (!studentId || !subjectCode) return NextResponse.json({ error: 'studentId 和 subjectCode 必填' }, { status: 400 })

    const prevSnapshot = await prisma.probabilitySnapshot.findUnique({
      where: { studentId_subjectCode: { studentId, subjectCode } },
    })
    const prevRate = prevSnapshot?.rate ?? null

    const result = await calculateFiveRate(studentId, subjectCode)
    const explanation = generateExplanation({ prevRate, curr: result })

    await prisma.probabilitySnapshot.upsert({
      where: { studentId_subjectCode: { studentId, subjectCode } },
      update: { rate: result.rate, confidence: result.confidence, trend: result.trend, updatedAt: new Date() },
      create: { studentId, subjectCode, rate: result.rate, confidence: result.confidence, trend: result.trend },
    })

    return NextResponse.json({
      success: true,
      data: { ...result, explanation, prevRate, delta: prevRate != null ? result.rate - prevRate : null },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    console.error('[scoring/calculate]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
