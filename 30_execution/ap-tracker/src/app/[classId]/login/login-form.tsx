'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { LogIn } from 'lucide-react'

interface Student {
  id: string
  name: string
  gender: string
}

interface Props {
  classId: string
  className: string
  students: Student[]
}

export function LoginForm({ classId, className: classDisplay, students }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(studentId: string) {
    setLoading(studentId)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, classId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '登录失败')
        return
      }
      router.push(`/${classId}/dashboard`)
      router.refresh()
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Card className="p-4 space-y-2">
        {students.map(student => (
          <button
            key={student.id}
            onClick={() => handleLogin(student.id)}
            disabled={loading !== null}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
          >
            <span className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
              {student.gender === '女' ? '♀' : '♂'}
            </span>
            <span className="flex-1 font-medium text-gray-800">{student.name}</span>
            {loading === student.id ? (
              <span className="text-xs text-gray-400 animate-pulse">登录中…</span>
            ) : (
              <LogIn className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ))}
      </Card>

      <p className="text-center text-xs text-gray-400">
        {students.length} 位学生 · {classDisplay}
      </p>
    </div>
  )
}
