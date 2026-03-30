# TASK-005 执行指令：指标明细页

**Batch**: Phase 1
**Task**: TASK-005
**状态**: Agent 1 → Agent 2
**前置**: TASK-003 ✅（指标卡片已实现，点击跳转到 `/[classId]/dashboard/[metric]`）

---

## 目标

创建 `/[classId]/dashboard/[metric]` 页面，点击仪表盘指标卡片后展示该指标的学生明细表。

## 4 个指标路由

| route param | 说明 | 列定义 |
|---|---|---|
| `subjects` | 报考总科数 | 学生姓名、报考科数、人均科数 |
| `five-rate` | 5 分概率 | 学生姓名、平均 5 分率、最高科、最低科 |
| `mcq` | MCQ 得分率 | 学生姓名、平均 MCQ 得分率、最近一次成绩 |
| `frq` | FRQ 得分率 | 学生姓名、平均 FRQ 得分率、最近一次成绩 |

## 实现要求

1. **动态路由文件**: `src/app/[classId]/dashboard/[metric]/page.tsx`
2. **页面组件**:
   - 顶部：返回仪表盘按钮 + 指标标题
   - 表格：学生明细，按指标值降序排列
   - 点击学生行跳转到 `/[classId]/personal?student={studentId}`
3. **数据来源**: 从 `mock-data` 实时计算（复用 TASK-003 的计算逻辑）
4. **UI**: 使用 shadcn/ui 的 Table 组件（如果没有则安装）
5. **params**: Next.js 15 params 是 Promise，需 `await`
6. **响应式**: 表格在移动端可横向滚动

## 验收标准

- [ ] 4 个指标路由都能正确渲染
- [ ] 表格数据与仪表盘卡片数据一致
- [ ] 点击学生行可跳转到个人中心
- [ ] `npx tsc --noEmit` 无错误
- [ ] `next build` 通过

## 产出文件

- `src/app/[classId]/dashboard/[metric]/page.tsx`

## 完成后

更新 `30_execution/STATUS-REPORT.md` 和 `30_execution/HANDOFF.md`，commit 并 push。
