# TASK-003 执行指令

## 任务：班级仪表盘 — 核心指标卡片

### 目标
替换 `dashboard/page.tsx` 占位页，实现上半部分的 4 个核心指标卡片。

### 前置确认
- TASK-002 已通过 Agent 3 审查 ✅
- 项目路径：`C:\Users\25472\projects\ap-tracker`
- Mock 数据文件：`src/lib/mock-data.ts`
- 现有占位页：`src/app/[classId]/dashboard/page.tsx`

### ⚠️ 重要提示：Next.js 15 params
`page.tsx` 的 `params` 在 Next.js 15 中是 `Promise`，需要 `await`：
```tsx
export default async function DashboardPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params
  // ...
}
```

### 具体步骤

#### 1. 创建指标卡片组件
- 文件：`src/components/metric-card.tsx`
- Props：`title: string`, `value: string | number`, `subtitle?: string`, `href: string`, `icon?: ReactNode`
- 使用 shadcn/ui Card 组件
- 整张卡片可点击（用 `<Link>` 包裹 Card）
- 显示标题、大号数值、副标题（可选）
- hover 时有轻微阴影/边框变化

#### 2. 实现 dashboard/page.tsx
从 `mock-data.ts` 导入 `classroom` 和 `getClassroomStats()`，计算 4 个指标：

| 指标 | 计算方式 | 显示格式 | 跳转路径 |
|------|---------|---------|---------|
| 全班 AP 报考总科次数 | `classroom.students` 每人的 `subjects.length` 之和 | "36 科次" + "人均 4.0 科" | `/{classId}/dashboard/total-subjects` |
| 班级整体 5 分概率 | 所有学生所有科目的 `fiveRate` 平均值 | "72%" + "整体预测" | `/{classId}/dashboard/five-rate` |
| 平均 MCQ 得分率 | 所有 `scores` 中 `type === 'mcq'` 的 `score/maxScore` 平均值 | "78%" | `/{classId}/dashboard/mcq` |
| 平均 FRQ 得分率 | 所有 `scores` 中 `type === 'frq'` 的 `score/maxScore` 平均值 | "65%" | `/{classId}/dashboard/frq` |

#### 3. 页面布局
- 标题：`{classroom.name} — 仪表盘`
- 4 个卡片用 grid 布局：`grid-cols-2 lg:grid-cols-4`
- 卡片间距 `gap-4`
- 响应式：移动端 2 列，桌面端 4 列

#### 4. 仪表盘下半部分暂留空
- 用注释标明 `// TODO: TASK-004 考试日历`
- 不要创建日历组件，那是 TASK-004 的范围

### 产出文件
- `src/components/metric-card.tsx` — 指标卡片组件（新建）
- `src/app/[classId]/dashboard/page.tsx` — 仪表盘页（替换占位）

### 验收标准
- [ ] 仪表盘显示 4 个指标卡片
- [ ] 数值从 mock 数据正确计算
- [ ] 点击卡片跳转到对应 `/{classId}/dashboard/[metric]` 路径
- [ ] 响应式布局（2列 / 4列）
- [ ] TypeScript 无编译错误
- [ ] `npx next build` 通过

### 参考
- PRD：`00_input/AP-备考平台-PRD-V1.md`
- Mock 数据：`src/lib/mock-data.ts`
- 任务板：`20_tasks/TASK-board-phase1.md`
- Agent 3 注意事项：Next.js 15 `params` 是 Promise，需 await
