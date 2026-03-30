'use client'

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Users, BookOpen, Clock } from "lucide-react"

interface ClassInfo {
  id: string
  name: string
  season: string
  studentCount: number
  subjectCount: number
}

export function ClassCard() {
  const [data, setData] = useState<ClassInfo | null>(null)

  useEffect(() => {
    fetch('/api/classroom/summary')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .catch(() => null)
  }, [])

  const daysLeft = Math.ceil(
    (new Date("2026-05-04").getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  // Fallback while loading
  if (!data) {
    return (
      <div className="animate-pulse">
        <Card className="p-6 border-2 border-transparent">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-xl p-3 w-14 h-14" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <Link href={`/${data.id}/login`} className="block group">
      <Card className="p-6 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer border-2 border-transparent">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 rounded-xl p-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {data.name}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{data.season}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-gray-500">
                <Users className="w-4 h-4" />
                {data.studentCount} 人
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <BookOpen className="w-4 h-4" />
                {data.subjectCount} 科次
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              距首考 {daysLeft} 天
            </div>
            <span className="text-xs text-gray-400">
              人均 {(data.subjectCount / data.studentCount).toFixed(1)} 科 · 点击登录
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
