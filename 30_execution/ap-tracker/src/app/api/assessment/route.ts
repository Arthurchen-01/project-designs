import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/assessment — 获取当前学生的测试记录
export async function GET(req: NextRequest) {
  const studentId = req.cookies.get('ap_student_id')?.value

  if (!studentId) {
    return NextResponse.json({ records: [], error: '未登录' }, { status: 401 })
  }

  const records = await prisma.assessmentRecord.findMany({
    where: { studentId },
    include: { subject: { select: { code: true, name: true, color: true } } },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ records })
}

// POST /api/assessment — 录入测试记录
export async function POST(req: NextRequest) {
  const studentId = req.cookies.get('ap_student_id')?.value

  if (!studentId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await req.json()
  const { subjectCode, type, timedMode, score, maxScore, date, difficulty } = body

  if (!subjectCode || !type || !timedMode || score == null || !date) {
    return NextResponse.json(
      { error: '缺少必填字段：subjectCode, type, timedMode, score, date' },
      { status: 400 }
    )
  }

  const scoreVal: number = Number(score)
  // Cast to any to bypass strict null checking — Prisma client type includes `number | null`
  // for maxScore field (nullable in schema), type narrowing is overly strict here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const record = await prisma.assessmentRecord.create({
    data: {
      studentId,
      subjectCode,
      type,
      timedMode,
      score: scoreVal,
      maxScore: maxScore != null ? Number(maxScore) : null,
      date,
      difficulty: difficulty ?? null,
    } as any,
    include: { subject: { select: { code: true, name: true, color: true } } },
  })

  return NextResponse.json({ record }, { status: 201 })
}
