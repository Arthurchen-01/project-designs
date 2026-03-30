"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, BookOpen, Clock, FileText, CheckCircle2, History, LogIn } from "lucide-react"

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------
interface Student {
  id: string
  name: string
  classId: string
  className: string
}

interface Subject {
  code: string
  name: string
  color: string
}

interface DailyUpdate {
  id: string
  date: string
  taskType: string
  timedMode: string
  score: number | null
  totalCount: number | null
  correctCount: number | null
  timeMinutes: number | null
  unit: string | null
  notes: string | null
  subject: { code: string; name: string; color: string }
}

const TASK_TYPES = [
  { value: "MCQ练习", label: "MCQ 练习" },
  { value: "FRQ练习", label: "FRQ 练习" },
  { value: "整套模考", label: "整套模考" },
  { value: "知识点复习", label: "知识点复习" },
  { value: "错题整理", label: "错题整理" },
  { value: "看资料/视频", label: "看资料/视频" },
  { value: "其他", label: "其他" },
]

const TIMED_OPTIONS = [
  { value: "timed", label: "计时" },
  { value: "untimed", label: "不计时" },
  { value: "na", label: "不适用" },
]

export default function DailyUpdatePage() {
  const params = useParams()
  const classId = (params.classId as string) || "classroom-1"
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<Student | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [history, setHistory] = useState<DailyUpdate[]>([])
  const [loadingUser, setLoadingUser] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    date: today,
    subjectCode: "",
    taskType: "MCQ练习",
    timedMode: "timed",
    score: "",
    totalCount: "",
    correctCount: "",
    duration: "",
    unit: "",
    description: "",
  })

  // ---------------------------------------------------------------------------
  // 加载当前用户 + 科目列表 + 历史记录
  // ---------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    setLoadingUser(true)
    try {
      const [meRes, subRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/subjects").catch(() => null),
      ])
      const meData = await meRes.json()
      setCurrentUser(meData.student ?? null)

      if (meData.student) {
        const histRes = await fetch("/api/daily-update")
        const histData = await histRes.json()
        setHistory(histData.updates ?? [])
      }
    } catch {
      // ignore
    } finally {
      setLoadingUser(false)
    }

    // 备用：直接从 mock-data 拿科目
    try {
      const { subjects: mockSubjects } = await import("@/lib/mock-data")
      setSubjects(mockSubjects)
    } catch {
      // mock-data 可能不存在
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ---------------------------------------------------------------------------
  // 提交表单
  // ---------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subjectCode || !form.description) return

    setSubmitting(true)
    setSubmitError("")

    try {
      const res = await fetch("/api/daily-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          subjectCode: form.subjectCode,
          taskType: form.taskType,
          timedMode: form.timedMode,
          score: form.score || null,
          totalCount: form.totalCount || null,
          correctCount: form.correctCount || null,
          timeMinutes: form.duration ? Number(form.duration) : null,
          unit: form.unit || null,
          notes: form.description,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "提交失败")
      }

      const data = await res.json()
      setHistory(prev => [data.update, ...prev])
      setSubmitted(true)
      setForm(f => ({ ...f, score: "", totalCount: "", correctCount: "", duration: "", unit: "", description: "" }))
      setTimeout(() => setSubmitted(false), 4000)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "提交失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // 未登录状态
  // ---------------------------------------------------------------------------
  if (!loadingUser && !currentUser) {
    return (
      <>
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
            <Link href={`/${classId}/dashboard`} className="text-gray-500 hover:text-gray-700 text-sm">← 返回仪表盘</Link>
            <span className="text-gray-200">|</span>
            <h1 className="font-semibold text-gray-900">每日更新</h1>
          </div>
        </header>
        <div className="max-w-md mx-auto px-6 py-20 flex flex-col items-center gap-4 text-center">
          <LogIn className="w-12 h-12 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700">请先登录</h2>
          <p className="text-sm text-gray-500">记录每日学习动态前，需要先选择你的身份。</p>
          <Button onClick={() => router.push(`/${classId}/login`)}>去登录</Button>
        </div>
      </>
    )
  }

  // ---------------------------------------------------------------------------
  // 已登录 — 表单
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href={`/${classId}/dashboard`} className="text-gray-500 hover:text-gray-700 text-sm">← 返回仪表盘</Link>
          <span className="text-gray-200">|</span>
          <h1 className="font-semibold text-gray-900">每日更新</h1>
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
              <FileText className="w-5 h-5 text-blue-600" />
              记录今日学习
            </CardTitle>
            <p className="text-sm text-gray-500">填写今天的学习内容，系统将自动更新你的5分概率</p>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-8 text-green-600">
                <CheckCircle2 className="w-12 h-12" />
                <p className="font-semibold text-lg">已记录！</p>
                <p className="text-sm text-gray-500">数据已保存到数据库</p>
                <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-2">
                  继续填写
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
                    {submitError}
                  </div>
                )}

                {/* 日期 + 科目 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="date"><Calendar className="w-3.5 h-3.5 inline mr-1" />日期</Label>
                    <Input id="date" type="date" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="subject"><BookOpen className="w-3.5 h-3.5 inline mr-1" />科目 *</Label>
                    <Select value={form.subjectCode} onValueChange={v => setForm({ ...form, subjectCode: v })}>
                      <SelectTrigger id="subject"><SelectValue placeholder="选择科目" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 任务类型 + 作答条件 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="activity">任务类型</Label>
                    <Select value={form.taskType} onValueChange={v => setForm({ ...form, taskType: v })}>
                      <SelectTrigger id="activity"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TASK_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="timed">作答条件</Label>
                    <Select value={form.timedMode} onValueChange={v => setForm({ ...form, timedMode: v })}>
                      <SelectTrigger id="timed"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIMED_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 得分 + 总题数 + 正确数 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="score">得分</Label>
                    <Input id="score" type="number" placeholder="38"
                      value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="total">总题数</Label>
                    <Input id="total" type="number" placeholder="50"
                      value={form.totalCount} onChange={e => setForm({ ...form, totalCount: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="correct">正确数</Label>
                    <Input id="correct" type="number" placeholder="42"
                      value={form.correctCount} onChange={e => setForm({ ...form, correctCount: e.target.value })} />
                  </div>
                </div>

                {/* 时长 + 单元 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="duration"><Clock className="w-3.5 h-3.5 inline mr-1" />花费时间（分钟）</Label>
                    <Input id="duration" type="number" placeholder="60"
                      value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="unit">单元（可选）</Label>
                    <Input id="unit" placeholder="如：Unit 3"
                      value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
                  </div>
                </div>

                {/* 描述 */}
                <div className="space-y-1.5">
                  <Label htmlFor="desc"><FileText className="w-3.5 h-3.5 inline mr-1" />详细描述 *（AI会分析此内容）</Label>
                  <Textarea id="desc" rows={4} placeholder="今天复习了哪些内容？做了哪些题？越详细越好..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required />
                  <p className="text-xs text-gray-400">例如：复习了Macro Unit 3-4，做了20道MCQ，错了3道...</p>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "提交中..." : "提交更新"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* 历史记录 */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                历史记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: item.subject.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-800">{item.subject.name}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{item.taskType}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-400">{item.date}</span>
                        {item.score != null && (
                          <>
                            <span className="text-gray-400">·</span>
                            <span className="text-blue-600 font-medium">{item.score}分</span>
                          </>
                        )}
                        {item.timeMinutes != null && (
                          <>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-500">{item.timeMinutes}分钟</span>
                          </>
                        )}
                      </div>
                      {item.notes && <p className="text-gray-600 mt-1 line-clamp-2">{item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </>
  )
}
