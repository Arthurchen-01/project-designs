import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function HomePage() {
  const classData = await prisma.class.findFirst()
  const studentCount = await prisma.student.count()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="text-4xl font-bold text-gray-900">AP 备考追踪平台</div>
        <p className="text-gray-500">实时掌握备考进度，5分概率可视化</p>
        {classData ? (
          <Link href={`/${classData.id}/dashboard`}
            className="block bg-white rounded-xl p-6 shadow hover:shadow-lg transition text-left">
            <h2 className="text-xl font-semibold text-gray-900">{classData.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{studentCount} 名学生</p>
          </Link>
        ) : (
          <p className="text-gray-400">请先运行 `npx prisma db seed` 初始化数据</p>
        )}
        <p className="text-xs text-gray-400">Phase 3 — 评分引擎已集成</p>
      </div>
    </main>
  )
}
