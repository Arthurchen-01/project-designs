/**
 * explanation.ts — 自然语言解释生成
 */

import type { ScoringOutput } from './scoring-engine'
import { getAIConfig } from './ai-config'

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

import type { ScoringOutputV2 } from './scoring-engine-v2'
export interface ExplanationContext {
  prevRate: number | null
  curr: ScoringOutputV2 | ScoringOutput
  studentName?: string
  subjectName?: string
  recentActivities?: string[]
}

interface ExplanationResult {
  text: string
  source: 'ai' | 'rule'
}

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

export function generateExplanation(ctx: ExplanationContext): string {
  const { prevRate, curr } = ctx
  const { rate, trend, confidence } = curr
  const testPerformance = (curr as any).testPerformance ?? 0.5
  const stabilityScore = (curr as any).stabilityScore ?? 0.5
  const reviewQualityScore = (curr as any).reviewQualityScore ?? 0.5
  const pct = (r: number) => `${Math.round(r * 100)}%`
  const delta = prevRate != null ? rate - prevRate : null
  const parts: string[] = []

  if (delta != null && Math.abs(delta) >= 0.01) {
    parts.push(delta > 0 ? `5分率上升${Math.abs(Math.round(delta * 100))}%。` : `5分率下降${Math.abs(Math.round(delta * 100))}%，需注意。`)
  } else if (delta != null) {
    parts.push('5分率基本持平。')
  }

  const level = testPerformance >= 0.8 ? '表现优秀' : testPerformance >= 0.65 ? '表现良好' : testPerformance >= 0.5 ? '表现一般' : '需要加强'
  parts.push(`测试得分率${pct(testPerformance)}，${level}。`)

  if (stabilityScore < 0.6) {
    const stab = stabilityScore >= 0.4 ? '波动较大' : '波动剧烈'
    parts.push(`近期成绩${stab}，建议针对性训练。`)
  }

  if (reviewQualityScore < 0.5) {
    parts.push('近期复习投入较少，建议保持规律学习。')
  }

  if (trend === 'rising') parts.push('整体趋势向好，继续保持！')
  else if (trend === 'falling') parts.push('趋势有所下滑，建议调整复习策略。')

  if (confidence === 'low') parts.push('（当前数据不足，预测仅供参考）')
  return parts.join(' ')
}

// ---------------------------------------------------------------------------
// AI 生成解释（Task 025）
// ---------------------------------------------------------------------------

/**
 * 调用 AI 生成个性化变化解释。
 * AI 不可用时自动降级到模板规则版。
 */
export async function generateExplanationWithAI(
  ctx: ExplanationContext,
): Promise<ExplanationResult> {
  const config = getAIConfig()

  if (!config.isAvailable) {
    return { text: generateExplanation(ctx), source: 'rule' }
  }

  const { prevRate, curr, studentName, subjectName, recentActivities } = ctx
  const { rate, trend, confidence } = curr
  const testPerformance = (curr as any).testPerformance ?? 0.5
  const stabilityScore = (curr as any).stabilityScore ?? 0.5
  const reviewQualityScore = (curr as any).reviewQualityScore ?? 0.5
  const pct = (r: number) => `${Math.round(r * 100)}%`

  const delta = prevRate != null ? rate - prevRate : null
  const deltaStr = delta != null
    ? (delta >= 0 ? `+${Math.round(delta * 100)}%` : `${Math.round(delta * 100)}%`)
    : '首次评估'

  const systemPrompt =
    `你是一个AP备考学习教练。请根据以下信息，用2-3句简洁中文，解释学生的5分概率变化并给出建议。` +
    `要求：语气亲切自然，像教练在跟学生对话，不罗列数据，重点说原因和下一步。` +
    `格式：直接输出中文，不要JSON，不要markdown。`

  const recentStr = recentActivities?.length
    ? `最近学习：${recentActivities.slice(0, 3).join('；')}。`
    : ''

  const userPrompt =
    `学生姓名：${studentName ?? '同学'}\n` +
    `科目：${subjectName ?? '该科目'}\n` +
    `上次5分概率：${prevRate != null ? pct(prevRate) : '首次评估'}\n` +
    `本次5分概率：${pct(rate)}（${deltaStr}）\n` +
    `测试得分率：${pct(testPerformance)}，${testPerformance >= 0.7 ? '较好' : testPerformance >= 0.5 ? '一般' : '需加强'}\n` +
    `学习稳定性：${stabilityScore >= 0.7 ? '稳定' : stabilityScore >= 0.5 ? '轻微波动' : '波动较大'}\n` +
    `复习质量：${reviewQualityScore >= 0.7 ? '高质量' : reviewQualityScore >= 0.5 ? '一般' : '投入不足'}\n` +
    `整体趋势：${trend === 'rising' ? '上升' : trend === 'falling' ? '下降' : '平稳'}\n` +
    `数据可信度：${confidence === 'high' ? '高' : confidence === 'medium' ? '中等' : '低（数据不足）'}\n` +
    `${recentStr}\n` +
    `请给出简洁解释和1-2句建议。`

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.warn('[explanation] AI API error:', response.status)
      return { text: generateExplanation(ctx), source: 'rule' }
    }

    const data = await response.json() as {
      choices?: { message?: { content?: string } }[]
    }
    const text = data.choices?.[0]?.message?.content?.trim()
    if (!text) return { text: generateExplanation(ctx), source: 'rule' }

    return { text, source: 'ai' }
  } catch (err) {
    console.warn('[explanation] AI call failed, using fallback:', err)
    return { text: generateExplanation(ctx), source: 'rule' }
  }
}

// ---------------------------------------------------------------------------
// 辅助
// ---------------------------------------------------------------------------

export function changeLabel(delta: number | null): string {
  if (delta == null || Math.abs(delta) < 0.005) return '±0%'
  return (delta > 0 ? '+' : '') + `${Math.round(delta * 100)}%`
}
