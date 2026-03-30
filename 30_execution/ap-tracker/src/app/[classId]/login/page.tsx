import { prisma } from '@/lib/prisma'
import { LoginForm } from './login-form'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ classId: string }>
}

export default async function LoginPage({ params }: Props) {
  const { classId } = await params

  const classroom = await prisma.class.findUnique({
    where: { id: classId },
  })

  if (!classroom) {
    notFound()
  }

  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: { name: 'asc' },
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p className="text-gray-500 text-sm">{classroom.name}</p>
          <p className="text-gray-400 text-xs">选择你的名字登录</p>
        </div>
        <LoginForm
          classId={classId}
          className={classroom.name}
          students={students.map(s => ({ id: s.id, name: s.name, gender: s.gender }))}
        />
      </div>
    </main>
  )
}
