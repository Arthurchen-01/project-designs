import { requireAdmin, authGuardHandler } from '@/lib/auth-guard';
/**
 * /api/admin/ai/providers/[id]/test — POST 测试连接
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { decryptApiKey } from '@/lib/crypto-utils'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin(); if (!auth.success) return authGuardHandler(auth);
  const { id } = await params
  const startTime = Date.now()

  try {
    const provider = await prisma.aIProvider.findUnique({ where: { id } })
    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const apiKey = decryptApiKey(provider.apiKeyEncrypted)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), (provider.timeoutSeconds || 30) * 1000)

    try {
      const res = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: provider.modelId,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
        signal: controller.signal,
      })

      const latencyMs = Date.now() - startTime
      clearTimeout(timeout)

      if (res.ok) {
        return NextResponse.json({
          success: true,
          latencyMs,
          message: 'connection ok',
        })
      } else {
        const errorText = await res.text().catch(() => '')
        return NextResponse.json({
          success: false,
          latencyMs,
          message: `HTTP ${res.status}: ${errorText.slice(0, 200)}`,
        })
      }
    } catch (fetchErr: any) {
      const latencyMs = Date.now() - startTime
      clearTimeout(timeout)

      const message =
        fetchErr.name === 'AbortError'
          ? 'request timed out'
          : fetchErr.message || 'connection failed'

      return NextResponse.json({ success: false, latencyMs, message })
    }
  } catch (err) {
    console.error('[provider test]', err)
    return NextResponse.json({ error: 'Failed to test connection' }, { status: 500 })
  }
}
