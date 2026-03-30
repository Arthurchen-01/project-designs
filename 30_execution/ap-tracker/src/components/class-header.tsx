'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, BookOpen } from 'lucide-react'

interface StudentInfo {
  id: string
  name: string
  classId: string
  className: string
}

export function ClassHeader({ classId }: { classId: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [student, setStudent] = useState<StudentInfo | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setStudent(d.student))
      .catch(() => null)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push(`/${classId}/login`)
    router.refresh()
  }

  const baseHref = `/${classId}`

  return (
    <header className="bg-white border-b sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors text-sm">
            ← 返回首页
          </Link>
          <span className="text-gray-200">|</span>
          <span className="font-semibold text-gray-900">{student?.className ?? '加载中…'}</span>
        </div>

        {/* Right: nav + user info */}
        <div className="flex items-center gap-5 text-sm">
          <nav className="flex gap-5">
            <Link
              href={`${baseHref}/dashboard`}
              className={`hover:text-blue-600 transition-colors ${pathname === `${baseHref}/dashboard` ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              仪表盘
            </Link>
            <Link
              href={`${baseHref}/daily-update`}
              className={`hover:text-blue-600 transition-colors ${pathname === `${baseHref}/daily-update` ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              每日更新
            </Link>
            <Link
              href={`${baseHref}/record-test`}
              className={`hover:text-blue-600 transition-colors ${pathname === `${baseHref}/record-test` ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              录入成绩
            </Link>
            <Link
              href={`${baseHref}/personal`}
              className={`hover:text-blue-600 transition-colors ${pathname?.startsWith(`${baseHref}/personal`) ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              个人中心
            </Link>
            <Link
              href={`${baseHref}/resources`}
              className={`hover:text-blue-600 transition-colors ${pathname === `${baseHref}/resources` ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              资源共享
            </Link>
          </nav>

          {student ? (
            <div className="flex items-center gap-3 border-l pl-4">
              <div className="flex items-center gap-1.5 text-gray-700">
                <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  {student.name.slice(0, 1)}
                </div>
                <span className="text-sm font-medium">{student.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href={`/${classId}/login`}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
            >
              <BookOpen className="w-4 h-4" />
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
