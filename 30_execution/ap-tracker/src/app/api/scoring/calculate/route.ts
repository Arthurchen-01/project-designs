import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateFiveRateV2 } from '@/lib/scoring-engine-v2'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { studentId, subjectCode } = body as { studentId: string; subjectCode: string }

    if (!studentId || !subjectCode) {
      return NextResponse.json({ error: 'studentId and subjectCode are required' }, { status: 400 })
    }

    const result = await calculateFiveRateV2(studentId, subjectCode)

    // Persist snapshot
    await prisma.probabilitySnapshot.create({
      data: {
        studentId,
        subjectCode,
        rate: result.rate,
        confidence: result.confidence,
        trend: result.trend,
      },
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('scoring/calculate error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
