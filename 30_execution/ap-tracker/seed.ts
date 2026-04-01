import { PrismaClient } from './src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cls = await prisma.class.create({
    data: { name: 'AP备考班 2026', season: '2025-2026' }
  })
  console.log('Seeded:', cls)
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
