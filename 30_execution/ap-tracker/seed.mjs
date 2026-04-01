import { PrismaClient } from './src/generated/prisma/client.ts';
const prisma = new PrismaClient();
const cls = await prisma.class.create({
  data: { name: 'AP备考班 2026', season: '2025-2026' }
});
console.log('Seeded:', cls);
await prisma.$disconnect();
