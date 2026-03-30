import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // 班级信息
  const cls = await prisma.class.findFirst({
    include: {
      _count: { select: { students: true } },
    },
  })

  if (!cls) {
    return NextResponse.json({ error: 'No class found' }, { status: 404 })
  }

  // 总报考科次
  const totalEnrollments = await prisma.studentSubject.count({
    where: { student: { classId: cls.id } },
  })

  // 班级整体5分率 = 所有"人×科"5分率均值
  const fiveRates = await prisma.probabilitySnapshot.findMany({
    where: { student: { classId: cls.id } },
  })
  const avgFiveRate = fiveRates.length > 0
    ? fiveRates.reduce((sum, f) => sum + f.rate, 0) / fiveRates.length
    : 0

  // 平均 MCQ 得分率
  const mcqScores = await prisma.assessmentRecord.findMany({
    where: { 
      student: { classId: cls.id },
      type: 'mcq',
    },
  })
  const avgMcqRate = mcqScores.length > 0
    ? mcqScores.reduce((sum, s) => sum + s.score / s.maxScore, 0) / mcqScores.length
    : 0

  // 平均 FRQ 得分率
  const frqScores = await prisma.assessmentRecord.findMany({
    where: { 
      student: { classId: cls.id },
      type: 'frq',
    },
  })
  const avgFrqRate = frqScores.length > 0
    ? frqScores.reduce((sum, s) => sum + s.score / s.maxScore, 0) / frqScores.length
    : 0

  return NextResponse.json({
    totalEnrollments,
    avgPerStudent: cls._count.students > 0 ? totalEnrollments / cls._count.students : 0,
    avgFiveRate,
    avgMcqRate,
    avgFrqRate,
  })
}
