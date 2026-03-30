import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { studentId, classId } = await req.json()

    if (!studentId || !classId) {
      return NextResponse.json({ error: '缺少参数' }, { status: 400 })
    }

    // 查找学生，确认班级匹配
    const student = await prisma.student.findFirst({
      where: { id: studentId, classId },
      include: { class: true },
    })

    if (!student) {
      return NextResponse.json({ error: '学生不存在或班级不匹配' }, { status: 401 })
    }

    const response = NextResponse.json({
      id: student.id,
      name: student.name,
      classId: student.classId,
      className: student.class.name,
    })

    // 写 cookie，30天有效期
    response.cookies.set('ap_student_id', student.id, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })
    response.cookies.set('ap_class_id', student.classId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })

    return response
  } catch (err) {
    console.error('[auth/login]', err)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
