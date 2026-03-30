/**
 * prisma.ts — Graceful Prisma client
 * Falls back to a mock client when Prisma is not configured.
 */

class MockPrismaClient {
  student = mockModel()
  subject = mockModel()
  class = mockModel()
  studentSubject = mockModel()
  assessmentRecord = mockModel()
  dailyUpdate = mockModel()
  probabilitySnapshot = mockModel()
  resource = mockModel()
  examDate = mockModel()
  $connect() { return Promise.resolve() }
  $disconnect() { return Promise.resolve() }
}

function mockModel() {
  return {
    findMany: async () => [], findFirst: async () => null,
    findUnique: async () => null, findUniqueOrThrow: async () => { throw new Error('Not found') },
    create: async (data: unknown) => data, update: async (data: unknown) => data,
    delete: async () => ({}), upsert: async (data: unknown) => data,
    count: async () => 0, aggregate: async () => ({}), groupBy: async () => [],
  }
}

const globalForPrisma = globalThis as unknown as { prisma: any | undefined }

function createPrismaClient() {
  try {
    const { PrismaClient } = require('../generated/prisma/client')
    return new PrismaClient()
  } catch {
    try {
      const { PrismaClient } = require('@prisma/client')
      return new PrismaClient()
    } catch {
      return new MockPrismaClient()
    }
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
