/**
 * /api/admin/ai/routing — GET (路由列表) | PUT (批量更新)
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — 返回所有路由配置
export async function GET() {
  try {
    const rules = await prisma.aIRoutingRule.findMany({
      orderBy: { priority: 'desc' },
      include: { provider: { select: { id: true, provider: true, modelName: true, modelId: true } } },
    })

    return NextResponse.json(rules)
  } catch (err) {
    console.error('[routing GET]', err)
    return NextResponse.json({ error: 'Failed to fetch routing rules' }, { status: 500 })
  }
}

// PUT — 批量更新场景绑定
export async function PUT(req: Request) {
  try {
    const rules: Array<{
      sceneCode: string
      providerId: string
      enabled?: boolean
      fallbackEnabled?: boolean
      fallbackProviderId?: string
      priority?: number
    }> = await req.json()

    if (!Array.isArray(rules)) {
      return NextResponse.json({ error: 'Expected an array of rules' }, { status: 400 })
    }

    const results = []
    for (const rule of rules) {
      if (!rule.sceneCode || !rule.providerId) {
        return NextResponse.json(
          { error: 'Each rule must have sceneCode and providerId' },
          { status: 400 },
        )
      }

      const upserted = await prisma.aIRoutingRule.upsert({
        where: { sceneCode: rule.sceneCode },
        create: {
          sceneCode: rule.sceneCode,
          providerId: rule.providerId,
          enabled: rule.enabled ?? true,
          fallbackEnabled: rule.fallbackEnabled ?? false,
          fallbackProviderId: rule.fallbackProviderId ?? null,
          priority: rule.priority ?? 0,
        },
        update: {
          providerId: rule.providerId,
          enabled: rule.enabled ?? true,
          fallbackEnabled: rule.fallbackEnabled ?? false,
          fallbackProviderId: rule.fallbackProviderId ?? null,
          priority: rule.priority ?? 0,
        },
      })
      results.push(upserted)
    }

    return NextResponse.json({ success: true, count: results.length })
  } catch (err) {
    console.error('[routing PUT]', err)
    return NextResponse.json({ error: 'Failed to update routing rules' }, { status: 500 })
  }
}
