import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RISK_THRESHOLD = 0.50, VOLATILITY_THRESHOLD = 0.20, DRIFT_DAYS = 3

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get('classId') || 'classroom-1'
    const today = new Date().toISOString().slice(0, 10)

    const students = await prisma.student.findMany({ where: { classId }, select: { id: true, name: true } })
    const sIds = students.map(s => s.id)

    const snapshots = await prisma.probabilitySnapshot.findMany({ where: { studentId: { in: sIds } }, orderBy: { updatedAt: 'desc' } })
    const updates  = await prisma.dailyUpdate.findMany({ where: { studentId: { in: sIds } }, orderBy: { date: 'desc' } })
    const records  = await prisma.assessmentRecord.findMany({ where: { studentId: { in: sIds } }, orderBy: { date: 'desc' } })
    const enrollments = await prisma.studentSubject.findMany({ where: { studentId: { in: sIds } } })

    // 风险：5分率 < 50%
    const risk = snapshots.filter(s => s.rate < RISK_THRESHOLD).map(s => {
      const stu = students.find(x => x.id === s.studentId)
      return { studentId: s.studentId, studentName: stu?.name ?? s.studentId, rate: s.rate, confidence: s.confidence, trend: s.trend, reason: '5分率低于50%' }
    })

    // 断更：连续3天未更新
    const lastUpdate = new Map<string, string>()
    for (const u of updates) { if (!lastUpdate.has(u.studentId)) lastUpdate.set(u.studentId, u.date) }
    const drift = students.filter(s => {
      const last = lastUpdate.get(s.id)
      if (!last) return true
      return Math.ceil((new Date(today).getTime() - new Date(last).getTime()) / 86400000) >= DRIFT_DAYS
    }).map(s => ({ studentId: s.id, studentName: s.name, lastUpdateDate: lastUpdate.get(s.id) ?? null, reason: '连续3天以上未更新' }))

    // 波动：最近5次标准差 > 20%
    const volatility: { studentId: string; studentName: string; subjectCode: string; stdDev: number; reason: string }[] = []
    for (const e of enrollments) {
      const recs = records.filter(r => r.studentId === e.studentId && r.subjectCode === e.subjectCode).slice(0, 5)
      if (recs.length < 3) continue
      const vals = recs.map(r => r.score / r.maxScore)
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length
      const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length
      const std = Math.sqrt(variance)
      if (std > VOLATILITY_THRESHOLD) {
        const stu = students.find(x => x.id === e.studentId)
        volatility.push({ studentId: e.studentId, studentName: stu?.name ?? e.studentId, subjectCode: e.subjectCode, stdDev: Math.round(std * 100) / 100, reason: '成绩波动异常' })
      }
    }

    return NextResponse.json({ success: true, alerts: { risk, drift, volatility, total: risk.length + drift.length + volatility.length } })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 })
  }
}
