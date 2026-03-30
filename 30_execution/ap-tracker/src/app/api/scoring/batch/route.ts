import { NextRequest, NextResponse } from 'next/server'
import { calculateBatchFiveRates } from '@/lib/scoring-engine'

export async function POST(req: NextRequest) {
  try {
    const { classId } = await req.json().catch(() => ({}))
    const results = await calculateBatchFiveRates(classId || 'classroom-1')
    const total = results.length
    const avg = total > 0 ? results.reduce((s, r) => s + r.rate, 0) / total : 0
    return NextResponse.json({
      success: true,
      summary: { total, avgRate: Math.round(avg * 100) / 100,
        high: results.filter(r => r.confidence === 'high').length,
        rising: results.filter(r => r.trend === 'rising').length,
        falling: results.filter(r => r.trend === 'falling').length },
      data: results.map(r => ({ studentId: r.studentId, subjectCode: r.subjectCode, rate: r.rate, confidence: r.confidence, trend: r.trend })),
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 })
  }
}
