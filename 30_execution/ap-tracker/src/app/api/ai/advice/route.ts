import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { generateAdvice, StudentContext } from '@/lib/ai-advisor'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')
  const cookieStore = await cookies()
  const sid = studentId || cookieStore.get('studentId')?.value

  if (!sid) {
    return NextResponse.json({ error: '未指定学生' }, { status: 400 })
  }

  const student = await prisma.student.findUnique({
    where: { id: sid },
    include: { enrollments: { include: { subject: true } } },
  })

  if (!student) {
    return NextResponse.json({ error: '学生不存在' }, { status: 404 })
  }

  const subjects: StudentContext['subjects'] = []
  for (const enrollment of student.enrollments) {
    const snapshots = await prisma.probabilitySnapshot.findMany({
      where: { studentId: sid, subjectCode: enrollment.subjectCode },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    })

    const latestRate = snapshots.length > 0 ? Math.round(snapshots[0].rate * 100) : 0

    let trend = 0
    if (snapshots.length >= 2) {
      trend = Math.round(snapshots[0].rate * 100) - Math.round(snapshots[snapshots.length - 1].rate * 100)
    }

    const confidence = latestRate >= 75 ? '高' : latestRate >= 55 ? '中' : '低'

    const weakestUnits: string[] = []
    if (latestRate < 60) {
      weakestUnits.push('核心概念')
    }

    subjects.push({
      code: enrollment.subjectCode,
      fiveRate: latestRate,
      confidence,
      trend,
      weakestUnits,
    })
  }

  const lastUpdate = await prisma.dailyUpdate.findFirst({
    where: { studentId: sid },
    orderBy: { date: 'desc' },
    select: { date: true },
  })

  let recentActivity = 'active'
  if (lastUpdate) {
    const today = new Date().toISOString().slice(0, 10)
    const daysSince = Math.floor((new Date(today).getTime() - new Date(lastUpdate.date).getTime()) / 86400000)
    if (daysSince > 3) recentActivity = 'inactive'
  } else {
    recentActivity = 'inactive'
  }

  // Find nearest exam from all subjects the student is enrolled in
  const subjectCodes = student.enrollments.map(e => e.subjectCode)
  const examDates = await prisma.examDate.findMany({
    where: { subjectCode: { in: subjectCodes } },
  })

  let daysUntilNearestExam = 999
  const today = new Date()
  for (const exam of examDates) {
    const days = Math.floor((new Date(exam.date).getTime() - today.getTime()) / 86400000)
    if (days >= 0 && days < daysUntilNearestExam) {
      daysUntilNearestExam = days
    }
  }

  const advice = await generateAdvice({
    name: student.name,
    subjects,
    recentActivity,
    daysUntilNearestExam,
  })

  return NextResponse.json({ advice })
}
