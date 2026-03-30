"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  href: string
  accentColor: string
  icon: React.ReactNode
}

export function MetricCard({
  title,
  value,
  subtitle,
  href,
  accentColor,
  icon,
}: MetricCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="p-5 hover:shadow-md hover:-translate-y-0.5 transition-all h-full relative overflow-hidden">
        {/* Left accent bar */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl", accentColor)} />

        <div className="flex items-start justify-between pl-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-1 truncate">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>

          <div className="flex flex-col items-end justify-between h-full ml-2">
            <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
              {icon}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
              <span className="hidden group-hover:inline">点击查看明细</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
