import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/personal/summary — 获取当前学生的个人中心数据
export async function GET(req: NextRequest) {
  const studentId = req.cookies.get('ap_student_id')?.value

  if (!studentId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: true,
      enrollments: {
        include: { subject: true },
      },
      fiveRates: {
        include: { subject: true },
      },
    },
  })

  if (!student) {
    return NextResponse.json({ error: '学生不存在' }, { status: 404 })
  }

  const overallRate = student.fiveRates.length > 0
    ? student.fiveRates.reduce((sum, f) => sum + f.rate, 0) / student.fiveRates.length
    : 0

  return NextResponse.json({
    id: student.id,
    name: student.name,
    classId: student.classId,
    className: student.class.name,
    enrollmentCount: student.enrollments.length,
    overallRate,
    fiveRates: student.fiveRates,
  })
}