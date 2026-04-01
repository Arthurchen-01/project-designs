/**
 * prisma.ts — Prisma Client singleton
 * Prisma v7 + adapter-libsql for SQLite (本地运行，不走公网)
 */

import { PrismaClient } from '@/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function createPrismaClient(): PrismaClient {
  const dbPath = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const adapter = new PrismaLibSql({ url: dbPath })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
