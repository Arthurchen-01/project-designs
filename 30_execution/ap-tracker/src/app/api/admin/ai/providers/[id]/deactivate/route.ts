import { requireAdmin, authGuardHandler } from '@/lib/auth-guard';
/**
 * /api/admin/ai/providers/[id]/deactivate — POST 停用
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdmin(); if (!auth.success) return authGuardHandler(auth);
  const { id } = await params
  try {
    const existing = await prisma.aIProvider.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    await prisma.aIProvider.update({
      where: { id },
      data: { status: 'inactive' },
    })

    return NextResponse.json({ success: true, status: 'inactive' })
  } catch (err) {
    console.error('[provider deactivate]', err)
    return NextResponse.json({ error: 'Failed to deactivate provider' }, { status: 500 })
  }
}
