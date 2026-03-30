/**
 * ai-evaluator.ts — AI 复习质量评估
 *
 * V1：API Key 未配置时使用规则 fallback。
 */

import { getAIConfig } from './ai-config'

export type EvidenceLevel = 'weak' | 'medium' | 'strong'

export interface EvaluateParams {
  description: string
  subjectCode: string
  activityType: string
  scorePercent?: number
  timedMode?: string
}

export interface EvaluateResult {
  evidenceLevel: EvidenceLevel
  qualityScore: number
  explanation: string
  source: 'ai' | 'rule'
}

const ACTIVITY_WEIGHTS: Record<string, number> = {
  '整套模考': 1.0, 'FRQ练习': 0.95, 'MCQ练习': 0.9,
  '错题整理': 0.8, '知识点复习': 0.7, '看资料': 0.5, '其他': 0.3,
}

function ruleBasedEvaluate(params: EvaluateParams): EvaluateResult {
  const { description, activityType, scorePercent } = params
  let qualityScore = ACTIVITY_WEIGHTS[activityType] ?? 0.5

  if (scorePercent != null) {
    qualityScore = Math.min(1, qualityScore + (scorePercent / 100) * 0.15 - 0.05)
  }

  const descLen = description.trim().length
  if (descLen > 100)      qualityScore = Math.min(1, qualityScore + 0.1)
  else if (descLen < 10 && descLen > 0) qualityScore = Math.max(0, qualityScore - 0.15)
  else if (descLen === 0)  qualityScore = Math.max(0, qualityScore - 0.3)

  let evidenceLevel: EvidenceLevel
  if (qualityScore >= 0.75)      evidenceLevel = 'strong'
  else if (qualityScore >= 0.50) evidenceLevel = 'medium'
  else                           evidenceLevel = 'weak'

  const levelText = evidenceLevel === 'strong' ? '详细' : evidenceLevel === 'medium' ? '一般' : '简略'
  const explanation =
    `描述${levelText}（${descLen}字），` +
    `活动类型「${activityType}」，` +
    (scorePercent != null ? `得分率${Math.round(scorePercent)}%。` : '无成绩数据。')

  return { evidenceLevel, qualityScore, explanation, source: 'rule' }
}

async function aiEvaluate(params: EvaluateParams): Promise<EvaluateResult> {
  const config = getAIConfig()

  const systemPrompt =
    '你是一个AP学习质量评估专家。请评估用户提供的每日学习描述，判断其真实学习深度。' +
    '返回JSON：{evidenceLevel: "weak"|"medium"|"strong", qualityScore: 0-1, explanation: string}'

  const userPrompt =
    `活动类型：${params.activityType}\n` +
    `科目：${params.subjectCode}\n` +
    `得分率：${params.scorePercent ?? '无'}\n` +
    `作答模式：${params.timedMode ?? '未知'}\n` +
    `描述：${params.description || '(无)'}\n\n请评估这段学习的真实质量。`

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
        temperature: 0.3,
        max_tokens: 200,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.error('[ai-evaluator] API error:', response.status)
      return ruleBasedEvaluate(params)
    }

    const data = await response.json() as {
      choices?: { message?: { content?: string } }[]
    }
    const raw = data.choices?.[0]?.message?.content ?? ''
    const parsed = JSON.parse(raw) as {
      evidenceLevel: EvidenceLevel; qualityScore: number; explanation: string
    }
    return { ...parsed, source: 'ai' }
  } catch (err) {
    console.error('[ai-evaluator] AI call failed, using fallback:', err)
    return ruleBasedEvaluate(params)
  }
}

export async function evaluateDailyUpdate(params: EvaluateParams): Promise<EvaluateResult> {
  const config = getAIConfig()
  if (!config.isAvailable) return ruleBasedEvaluate(params)
  return aiEvaluate(params)
}
