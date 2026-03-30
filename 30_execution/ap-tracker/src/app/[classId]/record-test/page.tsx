"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  BarChart3, Calendar, BookOpen, CheckCircle2,
  History, LogIn, TrendingUp, AlertCircle
} from "lucide-react"

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------
interface Student {
  id: string
  name: string
  classId: string
  className: string
}

interface AssessmentRecord {
  id: string
  date: string
  type: string
  timedMode: string
  score: number
  maxScore: number | null
  difficulty: string | null
  subject: { code: string; name: string; color: string }
}

const ASSESSMENT_TYPES = [
  { value: "mcq",       label: "MCQ 单选" },
  { value: "frq",       label: "FRQ 问答" },
  { value: "full-mock", label: "整套模考" },
]

const TIMED_OPTIONS = [
  { value: "timed",   label: "计时" },
  { value: "untimed", label: "不计时" },
]

const DIFFICULTY_OPTIONS = [
  { value: "basic",   label: "基础" },
  { value: "medium", label: "中等" },
  { value: "hard",   label: "困难" },
]

export default function RecordTestPage() {
  const params = useParams()
  const classId = (params.classId as string) || "classroom-1"
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<Student | null>(null)
  const [subjects, setSubjects] = useState<{ code: string; name: string; color: string }[]>([])
  const [records, setRecords] = useState<AssessmentRecord[]>([])
  const [loadingUser, setLoadingUser] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    subjectCode: "",
    type: "mcq",
    timedMode: "timed",
    score: "",
    maxScore: "100",
    date: today,
    difficulty: "medium",
  })

  // ---------------------------------------------------------------------------
  // 加载用户 + 科目 + 历史记录
  // ---------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    setLoadingUser(true)
    try {
      const [meRes, assessRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/assessment"),
      ])
      const meData = await meRes.json()
      setCurrentUser(meData.student ?? null)

      if (meData.student) {
        const assessData = await assessRes.json()
        setRecords(assessData.records ?? [])
      }
    } catch {
      // ignore
    } finally {
      setLoadingUser(false)
    }

    // 备用：从 mock-data 拿科目
    try {
      const { subjects: mockSubjects } = await import("@/lib/mock-data")
      setSubjects(mockSubjects)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ---------------------------------------------------------------------------
  // 提交
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subjectCode || !form.score) return

    setSubmitting(true)
    setSubmitError("")

    try {
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectCode: form.subjectCode,
          type: form.type,
          timedMode: form.timedMode,
          score: Number(form.score),
          maxScore: form.maxScore ? Number(form.maxScore) : null,
          date: form.date,
          difficulty: form.difficulty,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "提交失败")
      }

      const data = await res.json()
      setRecords(prev => [data.record, ...prev])
      setSubmitted(true)
      setForm(f => ({ ...f, score: "" }))
      setTimeout(() => setSubmitted(false), 4000)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "提交失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // 未登录
  // ---------------------------------------------------------------------------
  if (!loadingUser && !currentUser) {
    return (
      <>
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href={`/${classId}/dashboard`} className="text-gray-500 hover:text-gray-700 text-sm">← 返回仪表盘</Link>
            <span className="text-gray-200">|</span>
            <h1 className="font-semibold text-gray-900">录入测试</h1>
          </div>
        </header>
        <div className="max-w-md mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
          <LogIn className="w-12 h-12 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700">请先登录</h2>
          <p className="text-sm text-gray-500">录入测试成绩前，需要先选择你的身份。</p>
          <Button onClick={() => router.push(`/${classId}/login`)}>去登录</Button>
        </div>
      </>
    )
  }

  // ---------------------------------------------------------------------------
  // 主界面
  // ---------------------------------------------------------------------------
  return (
    <>
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href={`/${classId}/dashboard`} className="text-gray-500 hover:text-gray-700 text-sm">← 返回仪表盘</Link>
          <span className="text-gray-200">|</span>
          <h1 className="font-semibold text-gray-900">录入测试成绩</h1>
          {currentUser && (
            <>
              <span className="text-gray-200">|</span>
              <span className="text-sm text-blue-600 font-medium">{currentUser.name}</span>
            </>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* 表单卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              录入本次测试
            </CardTitle>
            <p className="text-sm text-gray-500">记录每次模考或练习成绩，系统会更新你的5分概率预测</p>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-8 text-green-600">
                <CheckCircle2 className="w-12 h-12" />
                <p className="font-semibold text-lg">成绩已录入！</p>
                <p className="text-sm text-gray-500">数据已保存到数据库</p>
                <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-2">
                  继续录入
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {submitError}
                  </div>
                )}

                {/* 科目 + 日期 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="subject"><BookOpen className="w-3.5 h-3.5 inline mr-1" />科目 *</Label>
                    <Select value={form.subjectCode} onValueChange={v => setForm({ ...form, subjectCode: v })}>
                      <SelectTrigger id="subject"><SelectValue placeholder="选择科目" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="date"><Calendar className="w-3.5 h-3.5 inline mr-1" />测试日期</Label>
                    <Input id="date" type="date" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                </div>

                {/* 题型 + 条件 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="type"><TrendingUp className="w-3.5 h-3.5 inline mr-1" />测试类型 *</Label>
                    <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                      <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ASSESSMENT_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="timed">作答条件</Label>
                    <Select value={form.timedMode} onValueChange={v => setForm({ ...form, timedMode: v })}>
                      <SelectTrigger id="timed"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIMED_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 得分 + 满分 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="score">得分 *</Label>
                    <Input id="score" type="number" placeholder="78" min={0}
                      value={form.score}
                      onChange={e => setForm({ ...form, score: e.target.value })}
                      required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maxScore">满分</Label>
                    <Input id="maxScore" type="number" placeholder="100" min={1}
                      value={form.maxScore}
                      onChange={e => setForm({ ...form, maxScore: e.target.value })} />
                  </div>
                </div>

                {/* 难度 */}
                <div className="grid grid-cols-3 gap-4">
                  {DIFFICULTY_OPTIONS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, difficulty: d.value }))}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all text-center ${
                        form.difficulty === d.value
                          ? d.value === "hard"
                            ? "bg-red-50 border-red-300 text-red-700"
                            : d.value === "medium"
                            ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                            : "bg-green-50 border-green-300 text-green-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {/* 得分率预览 */}
                {form.score && form.maxScore && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
                    当前得分率：<strong>{((Number(form.score) / Number(form.maxScore)) * 100).toFixed(1)}%</strong>
                    {form.type === "mcq" && Number(form.score) / Number(form.maxScore) >= 0.7 && (
                      <span className="ml-2 text-green-600">✅ 目标区间</span>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "提交中..." : "录入成绩"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* 历史记录 */}
        {records.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                历史测试记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 font-medium">日期</th>
                      <th className="pb-2 font-medium">科目</th>
                      <th className="pb-2 font-medium">类型</th>
                      <th className="pb-2 font-medium">条件</th>
                      <th className="pb-2 font-medium">得分</th>
                      <th className="pb-2 font-medium">得分率</th>
                      <th className="pb-2 font-medium">难度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map(r => {
                      const rate = r.maxScore ? (r.score / r.maxScore * 100).toFixed(1) : "—"
                      return (
                        <tr key={r.id} className="text-gray-700">
                          <td className="py-2.5">{r.date}</td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.subject.color }} />
                              {r.subject.name}
                            </span>
                          </td>
                          <td className="py-2.5">
                            {ASSESSMENT_TYPES.find(t => t.value === r.type)?.label ?? r.type}
                          </td>
                          <td className="py-2.5">
                            {r.timedMode === "timed" ? "计时" : "不计时"}
                          </td>
                          <td className="py-2.5 font-medium">{r.score}{r.maxScore ? `/${r.maxScore}` : ""}</td>
                          <td className={`py-2.5 font-medium ${Number(rate) >= 70 ? "text-green-600" : "text-red-500"}`}>
                            {rate}%
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              r.difficulty === "hard" ? "bg-red-100 text-red-700" :
                              r.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                              r.difficulty === "basic" ? "bg-green-100 text-green-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {r.difficulty === "hard" ? "困难" : r.difficulty === "medium" ? "中等" : r.difficulty === "basic" ? "基础" : "—"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </>
  )
}
