import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/resources — 获取资源列表，支持按科目筛选
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subjectCode = searchParams.get('subjectCode')
  const studentId = req.cookies.get('ap_student_id')?.value

  const resources = await prisma.resource.findMany({
    where: {
      ...(subjectCode && subjectCode !== '全部' ? { subjectCode } : {}),
    },
    include: {
      subject: true,
      uploader: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ resources })
}
