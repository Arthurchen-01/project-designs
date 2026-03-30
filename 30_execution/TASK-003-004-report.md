# TASK-003/004 执行报告

**Date:** 2026-03-30 17:37 CST  
**Agent:** 2  
**Tasks:** TASK-003 (核心指标卡片) + TASK-004 (5月考试日历)

---

## TASK-003：班级仪表盘 — 核心指标卡片

### 完成内容

改造 `src/app/[classId]/dashboard/page.tsx`：

- 4 个可点击指标卡片，响应式 2×2 网格布局
- 使用 shadcn/ui Card 组件，带左侧彩色边框
- 从 mock-data 实时计算指标数据：
  1. **全班 AP 报考总科次数** — 28科，共9人，人均3.1科（蓝色）
  2. **班级整体 5 分概率** — 按人×科平均（绿色）
  3. **班级平均 MCQ 得分率** — 最近一次模考（橙色）
  4. **班级平均 FRQ 得分率** — 最近一次模考（紫色）
- hover 有阴影 + 放大效果
- 点击跳转 `/${classId}/dashboard/${metric}`
- 右下角"点击查看明细 →"提示

### 文件变更

| 文件 | 操作 |
|---|---|
| `src/app/[classId]/dashboard/page.tsx` | 重写（占位 → 完整实现） |

---

## TASK-004：班级仪表盘 — 5月考试日历

### 完成内容

新建 `src/components/exam-calendar.tsx`：

- 独立客户端组件（"use client"）
- 2026年5月网格日历，周一到周日排布
- 无考试日期：浅灰小格
- 有考试日期：较大格子，按规则着色
- 每格显示：日期、科目缩写、参考人数、平均5分率、距今天数
- 颜色规则完全实现（6档：绿/浅绿/橙/浅橙/红/浅红）
- 点击弹出 shadcn/ui Dialog，显示详情：
  - 考试科目 + 日期 + 时间
  - 参加学生列表（姓名 + 5分率）
  - 风险学生标红（5分率<60%）
- 底部图例说明

### 文件变更

| 文件 | 操作 |
|---|---|
| `src/components/exam-calendar.tsx` | 新建 |
| `src/components/ui/dialog.tsx` | 新建（shadcn 安装） |

---

## 验证

| 检查项 | 结果 |
|---|---|
| TypeScript 编译 | ✅ 无错误 |
| next build | ✅ 通过 |
| 数据来源 | ✅ 从 mock-data.ts 导入 |
| 响应式布局 | ✅ grid + sm:grid-cols-2 |
| Git commit | ✅ 7ef96ee |
