# TASK-005/006/007 Report

**Date:** 2026-03-30 17:43 CST
**Agent:** 2

## Summary

Completed TASK-005, TASK-006, and TASK-007 in a single batch.

## TASK-005: 指标明细页

**File:** `src/app/[classId]/dashboard/[metric]/page.tsx` (新建)

- 4 种 metric 支持：subjects, five-rate, mcq, frq
- 共同顶部：指标名称 + 班级汇总数字
- shadcn/ui Table 展示学生明细
- 每行学生名可点击跳转 `/[classId]/personal?student={studentId}`
- five-rate 列含风险等级 Badge（绿=安全, 橙=关注, 红=高风险）
- mcq/frq 列含趋势箭头（↑↓→）
- 返回仪表盘链接

## TASK-006: 个人中心总览

**File:** `src/app/[classId]/personal/page.tsx` (重写)

- 从 `searchParams.student` 获取学生 ID，默认第一个
- 顶部学生选择器（Select 下拉框）
- 4 个模块卡片（2×2 grid）：
  1. 整体 5 分概率 + 置信等级 Badge（高/中/低）
  2. FRQ 测试情况（平均分 + 测试次数）
  3. MCQ 测试情况（平均分 + 测试次数）
  4. 计时 vs 不计时对比（两组数字对比）
- 下半部分：报名科目卡片列表
  - 每张卡片显示：科目名、5分率、掌握度、考试日期
  - 点击跳转 `/[classId]/personal/[subjectId]?student={studentId}`

## TASK-007: 单科详情页

**File:** `src/app/[classId]/personal/[subjectId]/page.tsx` (新建, "use client")

- 从 URL 获取 student + subjectId
- 上半部分：
  - 当前 5 分概率大数字 + 置信等级 Badge
  - Recharts LineChart 5 分率趋势（X=日期, Y=概率）
  - MCQ 历次成绩表（日期、分数、计时模式 Badge）
  - FRQ 历次成绩表
  - Recharts BarChart 计时 vs 不计时对比
- 下半部分：
  - "单元掌握度" 标题
  - 每个单元一行：名称 + Progress 进度条 + 百分比
- 返回个人中心链接

## New Components Used

- `src/components/ui/table.tsx` — shadcn/ui Table
- `src/components/ui/progress.tsx` — shadcn/ui Progress

## Verification

| Check | Result |
|---|---|
| TypeScript 编译 | ✅ 无错误 |
| next build | ✅ 通过 |
| 新增路由 | 2 个（dashboard/[metric], personal/[subjectId]）|
| Recharts 图表 | 折线图 + 柱状图 |
| 响应式布局 | grid + sm/md/lg breakpoints |

## Git

- ap-tracker: commit `feat: 指标明细+个人中心+单科详情`
