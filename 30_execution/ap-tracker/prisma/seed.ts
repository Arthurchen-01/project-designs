/**
 * seed.ts — 数据库初始化数据
 *
 * 创建默认班级、科目、学生，用于测试登录和核心链路。
 */

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  })
  const prisma = new PrismaClient({ adapter })

  // 1. 创建班级
  const cls = await prisma.class.upsert({
    where: { id: 'class-2026' },
    update: {},
    create: {
      id: 'class-2026',
      name: 'AP备考班 2026',
      season: '2025-2026',
    },
  })
  console.log('✅ 班级:', cls.name)

  // 2. 创建科目
  const subjects = [
    { code: 'AP-MACRO', name: 'AP宏观经济学', color: '#3B82F6' },
    { code: 'AP-MICRO', name: 'AP微观经济学', color: '#10B981' },
    { code: 'AP-CALC-AB', name: 'AP微积分AB', color: '#F59E0B' },
    { code: 'AP-STAT', name: 'AP统计学', color: '#8B5CF6' },
    { code: 'AP-PHYS-1', name: 'AP物理1', color: '#EF4444' },
  ]
  for (const s of subjects) {
    await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    })
  }
  console.log('✅ 科目:', subjects.map(s => s.name).join(', '))

  // 3. 创建考试日期
  const examDates = [
    { date: '2026-05-04', subjectCode: 'AP-MACRO' },
    { date: '2026-05-05', subjectCode: 'AP-MICRO' },
    { date: '2026-05-08', subjectCode: 'AP-CALC-AB' },
    { date: '2026-05-09', subjectCode: 'AP-STAT' },
    { date: '2026-05-11', subjectCode: 'AP-PHYS-1' },
  ]
  for (const e of examDates) {
    await prisma.examDate.create({ data: e }).catch(() => {})
  }
  console.log('✅ 考试日期已设置')

  // 4. 创建测试学生
  const students = [
    { id: 'stu-001', name: '张三', gender: '男' },
    { id: 'stu-002', name: '李四', gender: '女' },
    { id: 'stu-003', name: '王五', gender: '男' },
  ]
  for (const s of students) {
    await prisma.student.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, classId: cls.id },
    })
  }
  console.log('✅ 学生:', students.map(s => s.name).join(', '))

  // 5. 创建报考关系
  const enrollments = [
    { studentId: 'stu-001', subjectCode: 'AP-MACRO' },
    { studentId: 'stu-001', subjectCode: 'AP-CALC-AB' },
    { studentId: 'stu-002', subjectCode: 'AP-MACRO' },
    { studentId: 'stu-002', subjectCode: 'AP-STAT' },
    { studentId: 'stu-003', subjectCode: 'AP-MICRO' },
    { studentId: 'stu-003', subjectCode: 'AP-PHYS-1' },
  ]
  for (const e of enrollments) {
    await prisma.studentSubject.create({ data: e }).catch(() => {})
  }
  console.log('✅ 报考关系已设置')

  // 6. 创建 admin 用户（User 表）
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ap.local' },
    update: {},
    create: {
      name: 'admin',
      email: 'admin@ap.local',
      passwordHash: 'placeholder-hash-change-in-production',
      role: 'admin',
    },
  })
  console.log('✅ 管理员用户:', adminUser.email)

  console.log('\n🎉 Seed 完成！')
  console.log('测试登录: 用 stu-001, stu-002, stu-003 作为 studentId')
}

main().catch(console.error)
