import { ClassCard } from "@/components/class-card"
import { GraduationCap } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 rounded-2xl p-4 shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AP 备考追踪平台</h1>
          <p className="text-gray-500">选择班级</p>
        </div>

        {/* Class Card */}
        <ClassCard />

        <p className="text-center text-xs text-gray-400">
          Phase 1 — 页面骨架 + 假数据演示版
        </p>
      </div>
    </main>
  )
}
