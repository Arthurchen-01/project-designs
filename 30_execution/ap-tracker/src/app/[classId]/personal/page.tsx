"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { pct } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, LogIn, Loader2 } from "lucide-react"

interface StudentData {
  id: string
  name: string
  classId: string
  className: string
  enrollmentCount: number
  overallRate: number
  fiveRates: Array<{
    id: string
    rate: number
    trend: string
    subject: { code: string; name: string; color: string }
  }>
}

export default function PersonalPage() {
  const params = useParams()
  const classId = (params.classId as string) || "classroom-1"
  const router = useRouter()

  const [student, setStudent] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/personal/summary')
      .then(r => r.json())
      .then(d => {
        setStudent(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>加载中...</span>
      </div>
    )
  }

  if (!student) {
    return (
      <>
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href={`/${classId}/dashboard`} className="text-gray-500 hover:text-gray-700 text-sm">← 返回仪表盘</Link>
            <span className="text-gray-200">|</span>
            <h1 className="font-semibold text-gray-900">个人中心</h1>
          </div>
        </header>
        <div className="max-w-md mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
          <LogIn className="w-12 h-12 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700">请先登录</h2>
          <p className="text-sm text-gray-500">查看个人学习数据前，需要先选择你的身份。</p>
          <button onClick={() => router.push(`/${classId}/login`)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            去登录
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href={`/${classId}/dashboard`} className="text-gray-500 hover:text-gray-700 text-sm">← 返回仪表盘</Link>
          <span className="text-gray-200">|</span>
          <h1 className="font-semibold text-gray-900">个人中心</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>学生信息</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{student.name}</p>
            <p className="text-gray-500 mt-1">整体 5 分率：<span className="font-semibold text-blue-600">{pct(student.overallRate)}</span></p>
            <p className="text-sm text-gray-400 mt-1">报考 {student.enrollmentCount} 科</p>
          </CardContent>
        </Card>

        {/* 科目列表 */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">各科 5 分概率</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {student.fiveRates.map(fr => (
              <Card key={fr.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-800">{fr.subject.name}</p>
                    <span className={`text-sm font-semibold ${
                      fr.rate >= 0.7 ? "text-green-600" :
                      fr.rate >= 0.5 ? "text-yellow-600" : "text-red-500"
                    }`}>
                      {pct(fr.rate)} {fr.trend === "rising" ? "↑" : fr.trend === "falling" ? "↓" : "→"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${fr.rate >= 0.7 ? "bg-green-500" : fr.rate >= 0.5 ? "bg-yellow-400" : "bg-red-400"}`}
                      style={{ width: pct(fr.rate) }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}