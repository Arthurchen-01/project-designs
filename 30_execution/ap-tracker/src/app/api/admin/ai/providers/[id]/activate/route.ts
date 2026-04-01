/**
 * /api/admin/ai/providers/[id]/activate — POST 启用
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const existing = await prisma.aIProvider.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    await prisma.aIProvider.update({
      where: { id },
      data: { status: 'active' },
    })

    return NextResponse.json({ success: true, status: 'active' })
  } catch (err) {
    console.error('[provider activate]', err)
    return NextResponse.json({ error: 'Failed to activate provider' }, { status: 500 })
  }
}
