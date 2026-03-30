/**
 * ai-config.ts — AI 配置管理
 *
 * 环境变量：
 *   OPENAI_API_KEY    — API 密钥（必填）
 *   OPENAI_BASE_URL   — API 基础地址（默认 https://api.openai.com/v1）
 *   OPENAI_MODEL      — 模型名称（默认 gpt-4o-mini）
 */

export interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
  isAvailable: boolean
}

const DEFAULT_BASE_URL = 'https://api.openai.com/v1'
const DEFAULT_MODEL   = 'gpt-4o-mini'

export function getAIConfig(): AIConfig {
  const apiKey   = process.env['OPENAI_API_KEY'] ?? ''
  const baseUrl  = process.env['OPENAI_BASE_URL'] ?? DEFAULT_BASE_URL
  const model    = process.env['OPENAI_MODEL']   ?? DEFAULT_MODEL
  const isAvailable = Boolean(apiKey && apiKey.length > 0)

  return { apiKey, baseUrl, model, isAvailable }
}
export function isAIEnabled(): boolean { return getAIConfig().isAvailable }
