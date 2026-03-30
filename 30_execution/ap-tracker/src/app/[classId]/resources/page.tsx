"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Heart, ExternalLink, FileText, Video, BookOpen, Layers, Zap, Plus, Loader2 } from "lucide-react"

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  note:     { label: "笔记",   color: "bg-blue-100 text-blue-700",   icon: FileText },
  video:    { label: "视频",   color: "bg-purple-100 text-purple-700", icon: Video },
  practice: { label: "练习",   color: "bg-green-100 text-green-700",   icon: BookOpen },
  lecture:  { label: "讲义",   color: "bg-yellow-100 text-yellow-700", icon: Layers },
  flashcard:{ label: "闪卡",   color: "bg-orange-100 text-orange-700", icon: Zap },
}

interface Resource {
  id: string
  title: string
  subjectCode: string
  type: string
  unit: string | null
  description: string
  url: string
  likes: number
  createdAt: string
  subject: { code: string; name: string; color: string }
  uploader: { name: string }
}

export default function ResourcesPage() {
  const params = useParams()
  const classId = (params.classId as string) || "classroom-1"
  
  const [filter, setFilter] = useState("全部")
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/resources')
      .then(r => r.json())
      .then(d => {
        setResources(d.resources || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch(`/api/resources${filter !== '全部' ? `?subjectCode=${filter}` : ''}`)
      .then(r => r.json())
      .then(d => setResources(d.resources || []))
      .catch(() => {})
  }, [filter])

  const filtered = filter === "全部"
    ? resources
    : resources.filter(r => r.subjectCode === filter)

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${classId}/dashboard`} className="text-gray-500 hover:text-gray-700 text-sm">← 返回</Link>
            <span className="text-gray-200">|</span>
            <h1 className="font-semibold text-gray-900">资源共享</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-48">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger><SelectValue placeholder="筛选科目" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部科目</SelectItem>
                  <SelectItem value="AP-MACRO">AP宏观经济学</SelectItem>
                  <SelectItem value="AP-MICRO">AP微观经济学</SelectItem>
                  <SelectItem value="AP-CALC-BC">AP微积分BC</SelectItem>
                  <SelectItem value="AP-STAT">AP统计学</SelectItem>
                  <SelectItem value="AP-PHY-C">AP物理C力学</SelectItem>
                  <SelectItem value="AP-CHEM">AP化学</SelectItem>
                  <SelectItem value="AP-BIO">AP生物学</SelectItem>
                  <SelectItem value="AP-LANG">AP英语语言</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* TODO: TASK-016 上传功能 */}
            <Button size="sm" variant="outline" disabled className="opacity-50" title="TASK-016 待实现">
              <Plus className="w-4 h-4 mr-1" />上传
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>加载中...</span>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(res => {
              const cfg = typeConfig[res.type] || typeConfig.note
              const Icon = cfg.icon
              return (
                <Card key={res.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{res.title}</h3>
                        <p className="text-xs text-gray-500">{res.subject.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-4 line-clamp-2">{res.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className={cfg.color + " text-xs px-2 py-0.5 rounded-full font-medium"}>
                          {cfg.label}
                        </span>
                        {res.unit && (
                          <Badge variant="outline" className="text-xs">{res.unit}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                          <Heart className="w-3.5 h-3.5" />
                          <span className="text-xs">{res.likes}</span>
                        </button>
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">暂无该科目的资源</p>
          </div>
        )}
      </div>
    </>
  )
}