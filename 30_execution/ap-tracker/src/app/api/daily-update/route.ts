import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/daily-update — 获取当前学生的每日更新记录
export async function GET(req: NextRequest) {
  const studentId = req.cookies.get('ap_student_id')?.value

  if (!studentId) {
    return NextResponse.json({ updates: [], error: '未登录' }, { status: 401 })
  }

  const updates = await prisma.dailyUpdate.findMany({
    where: { studentId },
    include: { subject: { select: { code: true, name: true, color: true } } },
    orderBy: { date: 'desc' },
    take: 30,
  })

  return NextResponse.json({ updates })
}

// POST /api/daily-update — 创建每日更新记录
export async function POST(req: NextRequest) {
  const studentId = req.cookies.get('ap_student_id')?.value

  if (!studentId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await req.json()
  const { date, subjectCode, taskType, timedMode, score, totalCount, correctCount, timeMinutes, unit, notes } = body

  if (!date || !subjectCode || !taskType) {
    return NextResponse.json({ error: '缺少必填字段：date, subjectCode, taskType' }, { status: 400 })
  }

  const update = await prisma.dailyUpdate.create({
    data: {
      studentId,
      subjectCode,
      date,
      taskType,
      timedMode: timedMode ?? 'na',
      score: score != null ? Number(score) : null,
      totalCount: totalCount != null ? Number(totalCount) : null,
      correctCount: correctCount != null ? Number(correctCount) : null,
      timeMinutes: timeMinutes != null ? Number(timeMinutes) : null,
      unit: unit ?? null,
      notes: notes ?? null,
    },
    include: { subject: { select: { code: true, name: true, color: true } } },
  })

  return NextResponse.json({ update }, { status: 201 })
}
