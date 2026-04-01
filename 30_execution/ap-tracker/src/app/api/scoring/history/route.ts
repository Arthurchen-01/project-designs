import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const subjectCode = searchParams.get('subjectCode')

    if (!studentId || !subjectCode) {
      return NextResponse.json({ error: 'studentId and subjectCode are required' }, { status: 400 })
    }

    const snapshots = await prisma.probabilitySnapshot.findMany({
      where: { studentId, subjectCode },
      orderBy: { updatedAt: 'asc' },
      select: {
        id: true,
        updatedAt: true,
        rate: true,
        confidence: true,
      },
    })

    return NextResponse.json(snapshots)
  } catch (err) {
    console.error('scoring/history error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
