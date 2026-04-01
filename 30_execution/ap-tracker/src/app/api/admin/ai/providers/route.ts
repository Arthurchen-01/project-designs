/**
 * /api/admin/ai/providers — GET (列表) | POST (新增)
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encryptApiKey, maskApiKey } from '@/lib/crypto-utils'

// GET — 返回所有 Provider，apiKeyEncrypted 返回掩码
export async function GET() {
  try {
    const providers = await prisma.aIProvider.findMany({
      orderBy: { createdAt: 'desc' },
      include: { routingRules: true },
    })

    const safe = providers.map((p: any) => ({
      ...p,
      apiKeyMasked: maskApiKey(p.apiKeyEncrypted),
      apiKeyEncrypted: undefined, // 不返回密文
    }))

    return NextResponse.json(safe)
  } catch (err) {
    console.error('[providers GET]', err)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}

// POST — 新增 Provider，加密存储 apiKey
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      provider,
      displayName,
      baseUrl,
      apiProtocol = 'openai_compatible',
      apiKey,
      modelId,
      modelName,
      timeoutSeconds = 30,
      retryCount = 2,
      defaultTemperature = 0.3,
      defaultMaxTokens = 2000,
      allowScoring = true,
      allowRecommendation = true,
      allowExplanation = true,
      isDefault = false,
    } = body

    // 校验必填
    if (!provider || !baseUrl || !apiKey || !modelId || !modelName) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, baseUrl, apiKey, modelId, modelName' },
        { status: 400 },
      )
    }

    const encrypted = encryptApiKey(apiKey)

    const created = await prisma.aIProvider.create({
      data: {
        provider,
        displayName: displayName || null,
        baseUrl,
        apiProtocol,
        apiKeyEncrypted: encrypted,
        modelId,
        modelName,
        timeoutSeconds,
        retryCount,
        defaultTemperature,
        defaultMaxTokens,
        allowScoring,
        allowRecommendation,
        allowExplanation,
        isDefault,
      },
    })

    return NextResponse.json({ success: true, id: created.id }, { status: 201 })
  } catch (err) {
    console.error('[providers POST]', err)
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 })
  }
}
