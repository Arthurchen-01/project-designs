/**
 * confidence.ts — 置信等级判断
 *
 * 结合记录数量和最近性（recency）判断：
 * - 高置信：≥5 条记录 且 最近30天内有数据
 * - 中置信：≥2 条记录 且 最近60天内有数据
 * - 低置信：其他
 */

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export function getConfidenceLevel(
  recordCount: number,
  daysSinceLastRecord?: number
): ConfidenceLevel {
  const daysSince = daysSinceLastRecord ?? 999

  if (recordCount >= 5 && daysSince <= 30) return 'high'
  if (recordCount >= 2 && daysSince <= 60) return 'medium'
  if (recordCount >= 5) return 'medium'  // enough records but stale
  return 'low'
}

export function calculateConfidence(
  testCount: number,
  _totalCount: number,
  daysSinceLastRecord?: number
): 'high' | 'medium' | 'low' {
  return getConfidenceLevel(testCount, daysSinceLastRecord)
}

export function confidenceLabel(level: ConfidenceLevel): string {
  return { high: '高', medium: '中', low: '低' }[level]
}

export function confidenceHint(level: ConfidenceLevel): string {
  return {
    high:   '数据充足且近期有效，预测置信度高',
    medium: '数据基本足够，预测供参考',
    low:    '数据不足或过旧，预测仅供参考',
  }[level]
}
