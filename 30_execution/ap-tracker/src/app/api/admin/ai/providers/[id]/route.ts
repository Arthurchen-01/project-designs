/**
 * /api/admin/ai/providers/[id] — GET (详情) | PUT (更新) | DELETE (删除)
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encryptApiKey, maskApiKey } from '@/lib/crypto-utils'

// GET — 单个 Provider 详情（apiKey 掩码）
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const provider = await prisma.aIProvider.findUnique({ where: { id } })
    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...provider,
      apiKeyMasked: maskApiKey(provider.apiKeyEncrypted),
      apiKeyEncrypted: undefined,
    })
  } catch (err) {
    console.error('[provider GET]', err)
    return NextResponse.json({ error: 'Failed to fetch provider' }, { status: 500 })
  }
}

// PUT — 更新 Provider
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const existing = await prisma.aIProvider.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const updateData: Record<string, any> = {}

    // 基础字段
    if (body.provider !== undefined) updateData.provider = body.provider
    if (body.displayName !== undefined) updateData.displayName = body.displayName
    if (body.baseUrl !== undefined) updateData.baseUrl = body.baseUrl
    if (body.apiProtocol !== undefined) updateData.apiProtocol = body.apiProtocol
    if (body.modelId !== undefined) updateData.modelId = body.modelId
    if (body.modelName !== undefined) updateData.modelName = body.modelName
    if (body.timeoutSeconds !== undefined) updateData.timeoutSeconds = body.timeoutSeconds
    if (body.retryCount !== undefined) updateData.retryCount = body.retryCount
    if (body.defaultTemperature !== undefined) updateData.defaultTemperature = body.defaultTemperature
    if (body.defaultMaxTokens !== undefined) updateData.defaultMaxTokens = body.defaultMaxTokens
    if (body.allowScoring !== undefined) updateData.allowScoring = body.allowScoring
    if (body.allowRecommendation !== undefined) updateData.allowRecommendation = body.allowRecommendation
    if (body.allowExplanation !== undefined) updateData.allowExplanation = body.allowExplanation
    if (body.isDefault !== undefined) updateData.isDefault = body.isDefault
    if (body.status !== undefined) updateData.status = body.status

    // API Key — 有新值才加密覆盖
    if (body.apiKey && body.apiKey.length > 0 && !body.apiKey.includes('****')) {
      updateData.apiKeyEncrypted = encryptApiKey(body.apiKey)
    }

    const updated = await prisma.aIProvider.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      id: updated.id,
      apiKeyMasked: maskApiKey(updated.apiKeyEncrypted),
    })
  } catch (err) {
    console.error('[provider PUT]', err)
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 })
  }
}

// DELETE — 删除 Provider
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const existing = await prisma.aIProvider.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    await prisma.aIProvider.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[provider DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 })
  }
}
