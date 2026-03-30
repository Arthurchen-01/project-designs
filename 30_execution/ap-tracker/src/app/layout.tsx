import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AP 备考追踪平台",
  description: "实时掌握备考进度，5分概率可视化",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
