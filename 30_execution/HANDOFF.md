# HANDOFF.md — TASK-003/004

## What changed

- `src/app/[classId]/dashboard/page.tsx` — 重写：占位页 → 4个指标卡片 + 考试日历
- `src/components/exam-calendar.tsx` — 新建：5月考试日历独立组件
- `src/components/ui/dialog.tsx` — 新建：shadcn/ui Dialog 组件（考试详情弹窗用）

## Context

- Tasks: TASK-003 (核心指标卡片), TASK-004 (5月考试日历)
- 项目路径: `C:\Users\25472\projects\ap-tracker`
- 技术栈: Next.js 16.2.1 + React 19.2.4 + Tailwind CSS v4 + shadcn/ui

## Verification results

| Test | Result |
|---|---|
| 4 个指标卡片渲染 | ✅ 数据从 mock-data 实时计算 |
| 卡片颜色区分 | ✅ 蓝/绿/橙/紫 |
| 卡片 hover 效果 | ✅ shadow + scale |
| 点击跳转 | ✅ → /[classId]/dashboard/[metric] |
| 考试日历 5月1-31 | ✅ 周一~周日网格 |
| 考试日期颜色 | ✅ 6档颜色规则 |
| 考试详情弹窗 | ✅ Dialog 显示学生+风险标注 |
| next build | ✅ 编译通过，0 错误 |
| Git commit | ✅ commit 7ef96ee |

## 已知问题

- dashboard/[metric] 路由页面尚未创建（TASK-005 范围）

## 下一步

| 任务 | 说明 | 前置 |
|---|---|---|
| TASK-005 | 指标明细页 dashboard/[metric] | TASK-003 ✅ |
| TASK-006 | 个人中心详情 | TASK-005 |
| TASK-007 | 单科详情页 | TASK-006 |

## Status

TASK-003/004 complete. Ready for next dispatch.
