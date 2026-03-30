# AP 备考追踪平台 — 任务看板

> Phase 4：UI 完善 + P1 修复 + 清理

## 状态说明
- ⬜ 待开始
- 🔄 进行中
- ✅ 已完成

---

## TASK-023：P1 Bug 修复 — 硬编码日期
**负责人**：Agent 2
**状态**：⬜ 待开始（最高优先级）
**文件**：`src/lib/scoring-engine.ts`

- [ ] 第 68 行 `reviewQuality()`: `new Date('2026-03-30')` → `new Date()`
- [ ] 第 77 行 `forgettingDecay()`: `new Date('2026-03-30')` → `new Date()`
- [ ] 验证：日期修复后评分计算正确

**验收**：`npm run build` 通过，评分逻辑无硬编码日期

---

## TASK-024：个人页趋势图接入 Recharts
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-023

- [ ] personal/page.tsx 接入 /api/scoring/history
- [ ] 添加 Recharts LineChart（5分率趋势）
- [ ] 添加 MCQ/FRQ 历次成绩表格
- [ ] 添加计时 vs 不计时对比柱状图
- [ ] 科目卡片添加 Link → 单科详情页

**验收**：个人页显示趋势图表 + 科目可点击

---

## TASK-025：Dashboard 接入 Alerts + 恢复考试日历
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-023

- [ ] dashboard/page.tsx 调用 /api/dashboard/alerts
- [ ] 显示风险学生名单
- [ ] 显示断更学生名单
- [ ] 显示波动异常名单
- [ ] 恢复考试日历为真实数据（从 Prisma 读取 ExamDate）

**验收**：Dashboard 显示 alerts + 真实考试日历

---

## TASK-026：单科详情页
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-024

- [ ] 创建 /[classId]/personal/[subjectId] 页面
- [ ] 接入 /api/student/[id]/[subject]
- [ ] 5分率趋势图（Recharts LineChart）
- [ ] MCQ/FRQ 成绩表
- [ ] 计时对比柱状图
- [ ] 单元掌握度进度条
- [ ] 返回个人中心链接

**验收**：点击科目卡片进入详情页，图表+表格完整

---

## TASK-027：清理 mock-data.ts + 代码整理
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-024, TASK-025, TASK-026

- [ ] 确认所有页面不再 import mock-data.ts
- [ ] 删除或重命名 mock-data.ts
- [ ] 删除不再使用的占位组件
- [ ] `npm run build` 全量验证

**验收**：build 通过，无 mock-data 引用，无死代码

---

## Phase 4 总验收标准
1. scoring-engine 无硬编码日期
2. 个人页有 Recharts 趋势图
3. 科目卡片可点击进入单科详情
4. Dashboard 显示 alerts + 考试日历
5. 无 mock-data.ts 残留
6. `npm run build` 通过
