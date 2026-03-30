# HANDOFF.md — TASK-005/006/007

## What changed

- `src/app/[classId]/dashboard/[metric]/page.tsx` — 新建：4种指标明细表格
- `src/app/[classId]/personal/page.tsx` — 重写：占位页 → 4模块卡片 + 科目列表 + 学生选择器
- `src/app/[classId]/personal/[subjectId]/page.tsx` — 新建：单科详情（图表+成绩表+掌握度）
- `src/components/ui/table.tsx` — 新建：shadcn/ui Table
- `src/components/ui/progress.tsx` — 新建：shadcn/ui Progress

## Context

- Tasks: TASK-005 (指标明细页), TASK-006 (个人中心), TASK-007 (单科详情)
- 项目路径: `C:\Users\25472\projects\ap-tracker`
- 技术栈: Next.js 16.2.1 + React 19.2.4 + Tailwind CSS v4 + shadcn/ui + Recharts

## Verification results

| Test | Result |
|---|---|
| dashboard/[metric] subjects | ✅ 学生姓名+科数+科目列表 |
| dashboard/[metric] five-rate | ✅ 5分率+最高最低科+风险Badge |
| dashboard/[metric] mcq/frq | ✅ 平均分+最高最低+趋势箭头 |
| 行点击跳转 personal | ✅ ?student=xxx |
| personal 学生选择器 | ✅ Select 下拉切换 |
| personal 4个模块卡片 | ✅ 5分率/FRQ/MCQ/计时对比 |
| personal 科目卡片 | ✅ 5分率+掌握度+考试日期 |
| personal 科目点击 | ✅ → personal/[subjectId] |
| subjectId 5分率趋势图 | ✅ Recharts LineChart |
| subjectId MCQ/FRQ成绩表 | ✅ Table + 计时模式Badge |
| subjectId 计时对比柱状图 | ✅ Recharts BarChart |
| subjectId 单元掌握度 | ✅ Progress 进度条 |
| next build | ✅ 0 TypeScript 错误 |
| Git commit | ✅ commit 175962f |

## 已知问题

无

## Phase 1 状态

所有 Phase 1 页面任务（TASK-001 ~ TASK-010）均已完成。
- 页面骨架全部就绪
- Mock 数据覆盖所有页面
- Build 通过，0 错误

## 下一步

| 选项 | 说明 |
|---|---|
| Agent 3 审查 | 对 TASK-005/006/007 进行代码审查 |
| Phase 2 | 接入真实数据 / API |
| UI 打磨 | 交互细节优化 |

## Status

TASK-005/006/007 complete. Phase 1 fully implemented. Ready for review or next phase.
