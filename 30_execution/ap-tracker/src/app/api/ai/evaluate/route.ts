import { NextRequest, NextResponse } from 'next/server'
import { evaluateDailyUpdate } from '@/lib/ai-evaluator'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, subjectCode, activityType, score: scorePercent, timedMode } = body

    if (!subjectCode || !activityType) {
      return NextResponse.json(
        { error: 'subjectCode 和 activityType 必填' },
        { status: 400 }
      )
    }

    const result = await evaluateDailyUpdate({
      description: description ?? '',
      subjectCode,
      activityType,
      scorePercent: scorePercent ?? undefined,
      timedMode: timedMode ?? undefined,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    console.error('[/api/ai/evaluate]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
