# TASK-015：页面从 mock 数据切换到数据库

**负责人**：Agent 2
**状态**：🔄 派发给 Agent 2
**前置**：TASK-012/013/014（全部 PASS）
**产出**：所有页面从 Prisma 读取真实数据

---

## 执行清单

- [ ] 改造 `dashboard/page.tsx`：从 Prisma 读取学生汇总数据（正确率、分数趋势等）
- [ ] 改造 `dashboard/[metric]/page.tsx`：从 Prisma 读取单指标详情
- [ ] 改造 `personal/page.tsx`：从 Prisma 读取学生个人主页数据
- [ ] 改造 `personal/[subjectId]/page.tsx`：从 Prisma 读取单科详情
- [ ] 改造 `resources/page.tsx`：从 Prisma 读取资源列表
- [ ] 每个改造页面创建对应的 API Route（GET 接口）
- [ ] 移除或保留 `mock-data.ts` 作为 fallback（自行决定）
- [ ] `npm run build` 通过
- [ ] 推送代码并写执行报告到 `30_execution/`

## 验收标准

1. 录入新的每日更新或测试记录后，刷新 dashboard / personal 页面能看到变化
2. 所有页面数据来源为 Prisma，不再依赖 mock 常量
3. `npm run build` 无错误

## 注意事项

- 登录系统已在 TASK-012 实现，通过 cookie 获取当前学生 ID
- 现有 API Route（`/api/auth/me`, `/api/daily-update`, `/api/assessment`）可复用
- Dashboard 汇总逻辑：按科目聚合每日更新 + 测试记录，计算正确率和趋势
- 如果某些页面需要新的聚合查询，可创建新的 API Route
