import type { ConfidenceLevel } from './scoring-engine'

export function calculateConfidence(testCount: number, _totalCount: number): ConfidenceLevel {
  if (testCount >= 5) return 'high'
  if (testCount >= 3) return 'medium'
  return 'low'
}

export function confidenceLabel(level: ConfidenceLevel): string {
  return { high: '高', medium: '中', low: '低' }[level]
}

export function confidenceHint(level: ConfidenceLevel): string {
  return {
    high:   '数据充足（≥5条记录），预测置信度高',
    medium: '数据基本足够（3-4条），预测供参考',
    low:    '数据不足（<3条），预测仅供参考',
  }[level]
}
