/**
 * ai-config.ts — AI 配置管理
 *
 * V2: 优先从数据库读取 AI Provider 配置，无配置时 fallback 到环境变量（向后兼容）。
 *
 * 环境变量（fallback）：
 *   AI_API_KEY    — API 密钥
 *   AI_BASE_URL   — API 基础地址（默认 http://localhost:8000/v1，即本地小米 MIMO）
 *   AI_MODEL      — 模型名称（默认 xiaomi/mimo-v2-pro）
 *
 * ⚠️ 封网原则：绝不能调用公网模型 API（OpenRouter / OpenAI 等）。
 */

import { decryptApiKey } from './crypto-utils'

export interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
  timeoutSeconds: number
  retryCount: number
  defaultTemperature: number
  defaultMaxTokens: number
  isAvailable: boolean
  source: 'database' | 'env'
}

// ⚠️ 封网：只走本地小米 MIMO，禁止公网 API
const DEFAULT_BASE_URL = 'http://localhost:8000/v1'
const DEFAULT_MODEL = 'xiaomi/mimo-v2-pro'

// ── 环境变量 fallback ────────────────────────────────
function getConfigFromEnv(): AIConfig {
  // 兼容旧变量名（OPENAI_*）和新变量名（AI_*）
  const apiKey = process.env['AI_API_KEY'] ?? process.env['OPENAI_API_KEY'] ?? ''
  const baseUrl = process.env['AI_BASE_URL'] ?? process.env['OPENAI_BASE_URL'] ?? DEFAULT_BASE_URL
  const model = process.env['AI_MODEL'] ?? process.env['OPENAI_MODEL'] ?? DEFAULT_MODEL
  return {
    apiKey,
    baseUrl,
    model,
    timeoutSeconds: 30,
    retryCount: 2,
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    isAvailable: Boolean(apiKey && apiKey.length > 0),
    source: 'env',
  }
}

// ── 从数据库读取默认 Provider ────────────────────────
async function getConfigFromDB(): Promise<AIConfig | null> {
  try {
    // Dynamic import to handle mock gracefully
    const { prisma } = await import('./prisma')
    const provider = await prisma.aIProvider.findFirst({
      where: { status: 'active', isDefault: true },
    })

    if (!provider) {
      // Try any active provider
      const anyActive = await prisma.aIProvider.findFirst({
        where: { status: 'active' },
      })
      if (!anyActive) return null

      return {
        apiKey: decryptApiKey(anyActive.apiKeyEncrypted),
        baseUrl: anyActive.baseUrl,
        model: anyActive.modelId,
        timeoutSeconds: anyActive.timeoutSeconds,
        retryCount: anyActive.retryCount,
        defaultTemperature: anyActive.defaultTemperature,
        defaultMaxTokens: anyActive.defaultMaxTokens,
        isAvailable: true,
        source: 'database',
      }
    }

    return {
      apiKey: decryptApiKey(provider.apiKeyEncrypted),
      baseUrl: provider.baseUrl,
      model: provider.modelId,
      timeoutSeconds: provider.timeoutSeconds,
      retryCount: provider.retryCount,
      defaultTemperature: provider.defaultTemperature,
      defaultMaxTokens: provider.defaultMaxTokens,
      isAvailable: true,
      source: 'database',
    }
  } catch {
    return null
  }
}

// ── 按场景获取配置 ────────────────────────────────────
async function getConfigForScene(sceneCode: string): Promise<AIConfig | null> {
  try {
    const { prisma } = await import('./prisma')
    const rule = await prisma.aIRoutingRule.findUnique({
      where: { sceneCode },
      include: { provider: true },
    })

    if (rule?.enabled && rule.provider && rule.provider.status === 'active') {
      return {
        apiKey: decryptApiKey(rule.provider.apiKeyEncrypted),
        baseUrl: rule.provider.baseUrl,
        model: rule.provider.modelId,
        timeoutSeconds: rule.provider.timeoutSeconds,
        retryCount: rule.provider.retryCount,
        defaultTemperature: rule.provider.defaultTemperature,
        defaultMaxTokens: rule.provider.defaultMaxTokens,
        isAvailable: true,
        source: 'database',
      }
    }

    // Fallback to default provider
    if (rule?.fallbackEnabled && rule.fallbackProviderId) {
      const fallback = await prisma.aIProvider.findUnique({
        where: { id: rule.fallbackProviderId, status: 'active' },
      })
      if (fallback) {
        return {
          apiKey: decryptApiKey(fallback.apiKeyEncrypted),
          baseUrl: fallback.baseUrl,
          model: fallback.modelId,
          timeoutSeconds: fallback.timeoutSeconds,
          retryCount: fallback.retryCount,
          defaultTemperature: fallback.defaultTemperature,
          defaultMaxTokens: fallback.defaultMaxTokens,
          isAvailable: true,
          source: 'database',
        }
      }
    }

    return null
  } catch {
    return null
  }
}

// ── 公开接口 ──────────────────────────────────────────

/**
 * 获取 AI 配置（通用，优先数据库，fallback 环境变量）
 */
export function getAIConfig(): AIConfig {
  // 同步兼容 — 环境变量 fallback
  return getConfigFromEnv()
}

/**
 * 获取 AI 配置（异步，优先数据库 → 场景路由 → 环境变量）
 */
export async function getAIConfigForScene(sceneCode: string): Promise<AIConfig> {
  // 1. 按场景路由
  const sceneConfig = await getConfigForScene(sceneCode)
  if (sceneConfig) return sceneConfig

  // 2. 默认 Provider
  const dbConfig = await getConfigFromDB()
  if (dbConfig) return dbConfig

  // 3. 环境变量 fallback
  return getConfigFromEnv()
}

/**
 * 获取 AI 配置（异步，无场景，优先数据库 → 环境变量）
 */
export async function getAIConfigAsync(): Promise<AIConfig> {
  const dbConfig = await getConfigFromDB()
  if (dbConfig) return dbConfig
  return getConfigFromEnv()
}

/**
 * 判断 AI 是否可用
 */
export function isAIEnabled(): boolean {
  return getAIConfig().isAvailable
}
