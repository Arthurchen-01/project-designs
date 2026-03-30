import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const studentId = req.cookies.get('ap_student_id')?.value

  if (!studentId) {
    return NextResponse.json({ student: null })
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true },
  })

  if (!student) {
    return NextResponse.json({ student: null })
  }

  return NextResponse.json({
    student: {
      id: student.id,
      name: student.name,
      classId: student.classId,
      className: student.class.name,
    },
  })
}
