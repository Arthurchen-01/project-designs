import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateFiveRate } from '@/lib/scoring-engine'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { classId } = body as { classId: string }

    if (!classId) {
      return NextResponse.json({ error: 'classId is required' }, { status: 400 })
    }

    const students = await prisma.student.findMany({
      where: { classId },
      include: { enrollments: true },
    })

    const subjects = await prisma.subject.findMany({ select: { code: true } })

    const results: {
      studentId: string
      subjectCode: string
      rate: number
      confidence: string
      trend: string
    }[] = []

    for (const student of students) {
      for (const subject of subjects) {
        const result = await calculateFiveRate(student.id, subject.code)

        await prisma.probabilitySnapshot.create({
          data: {
            studentId: student.id,
            subjectCode: subject.code,
            rate: result.rate,
            confidence: result.confidence,
            trend: result.trend,
          },
        })

        results.push({
          studentId: student.id,
          subjectCode: subject.code,
          rate: result.rate,
          confidence: result.confidence,
            trend: result.trend,
        })
      }
    }

    return NextResponse.json({
      total: results.length,
      updated: results.length,
      results,
    })
  } catch (err) {
    console.error('scoring/batch error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
