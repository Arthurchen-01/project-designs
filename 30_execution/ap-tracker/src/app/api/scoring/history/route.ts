import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId   = searchParams.get('studentId')
    const subjectCode = searchParams.get('subjectCode')
    if (!studentId || !subjectCode) return NextResponse.json({ error: 'studentId 和 subjectCode 必填' }, { status: 400 })

    const snapshots = await prisma.probabilitySnapshot.findMany({
      where: { studentId, subjectCode }, orderBy: { updatedAt: 'asc' },
    })
    const records = await prisma.assessmentRecord.findMany({
      where: { studentId, subjectCode }, orderBy: { date: 'asc' },
    })

    return NextResponse.json({
      success: true,
      snapshots: snapshots.map(s => ({ date: s.updatedAt.toISOString().slice(0, 10), rate: s.rate, confidence: s.confidence })),
      records: records.map(r => ({ date: r.date, pct: Math.round((r.score / r.maxScore) * 100) / 100, type: r.type, timed: r.timedMode === 'timed' })),
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 })
  }
}
