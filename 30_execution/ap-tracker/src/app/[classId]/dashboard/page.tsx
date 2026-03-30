'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { useParams } from "next/navigation"
import { pct } from "@/lib/utils"
import { MetricCard } from "@/components/metric-card"
import { BookOpen, Target, TrendingUp, PenLine, Loader2 } from "lucide-react"

interface ClassroomStats {
  totalEnrollments: number
  avgPerStudent: number
  avgFiveRate: number
  avgMcqRate: number
  avgFrqRate: number
}

export default function DashboardPage() {
  const params = useParams()
  const classId = (params.classId as string) || "classroom-1"

  const [stats, setStats] = useState<ClassroomStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/classroom/summary')
      .then(r => r.json())
      .then(d => {
        setStats(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>加载中...</span>
          </div>
        ) : stats ? (
          <>
            {/* 4 核心指标卡片 */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="全班 AP 报考总科次数"
                value={`${stats.totalEnrollments} 科次`}
                subtitle={`人均 ${stats.avgPerStudent.toFixed(1)} 科`}
                href={`/${classId}/dashboard/total-subjects`}
                accentColor="bg-blue-500"
                icon={<BookOpen className="w-6 h-6" />}
              />
              <MetricCard
                title="班级整体 5 分概率"
                value={pct(stats.avgFiveRate)}
                subtitle="整体预测"
                href={`/${classId}/dashboard/five-rate`}
                accentColor="bg-green-500"
                icon={<Target className="w-6 h-6" />}
              />
              <MetricCard
                title="班级平均 MCQ 得分率"
                value={pct(stats.avgMcqRate)}
                subtitle="计时练习综合"
                href={`/${classId}/dashboard/mcq`}
                accentColor="bg-orange-500"
                icon={<TrendingUp className="w-6 h-6" />}
              />
              <MetricCard
                title="班级平均 FRQ 得分率"
                value={pct(stats.avgFrqRate)}
                subtitle="计时练习综合"
                href={`/${classId}/dashboard/frq`}
                accentColor="bg-purple-500"
                icon={<PenLine className="w-6 h-6" />}
              />
            </section>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">无法加载数据</div>
        )}

        {/* 考试日历占位 */}
        <section className="bg-white rounded-xl p-8 border border-gray-100 text-center text-gray-400">
          <p className="text-sm">📅 考试日历 — TASK-004</p>
          <p className="text-xs mt-1">5月 AP 考试日历待实现</p>
        </section>
      </div>
    </>
  )
}