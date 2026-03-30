/**
 * explanation.ts — 模板规则生成自然语言解释（V1）
 */
import type { ScoringOutput } from './scoring-engine'

export interface ExplanationContext {
  prevRate: number | null
  curr: ScoringOutput
}

export function generateExplanation(ctx: ExplanationContext): string {
  const { prevRate, curr } = ctx
  const { rate, trend, testPerformance, stabilityScore, reviewQualityScore, confidence } = curr
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

export function changeLabel(delta: number | null): string {
  if (delta == null || Math.abs(delta) < 0.005) return '±0%'
  return (delta > 0 ? '+' : '') + `${Math.round(delta * 100)}%`
}
