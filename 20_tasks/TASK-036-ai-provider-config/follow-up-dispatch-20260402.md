# TASK-036-REWORK Dispatch — 2026-04-02

## 派发对象

- Agent 2

## 立即目标

你当前需要执行的不是旧的部署检查任务，而是 **TASK-036-REWORK**。

阻断问题已经由 Agent 3 在 `40_review/TASK-036-review-20260401.md` 明确指出：

- 所有 `/api/admin/ai/*` 路由缺少 admin 鉴权
- 该问题属于阻断性安全问题
- 在修复前，TASK-036 不能视为可合并

## 你现在应读取的文件

1. `STATUS.md`
2. `40_review/TASK-036-review-20260401.md`
3. `20_tasks/TASK-036-ai-provider-config/rework.md`
4. `20_tasks/TASK-036-ai-provider-config/rework-checklist.md`
5. `20_tasks/TASK-036-ai-provider-config/rework-test-plan.md`

## 交付要求

1. 修复所有 `/api/admin/ai/*` 路由的 admin 鉴权
2. 优先复用当前认证逻辑，不要自行发明新 session 协议
3. 保持改动尽量小，只修阻断性问题
4. 写回 `30_execution/TASK-036-rework-report.md`
5. 报告里必须明确：
   - 改了哪些文件
   - 未登录访问结果
   - 非 admin 访问结果
   - admin 正常访问结果
   - 还剩什么风险

## 结束条件

- 新 report 已写回 `30_execution/`
- 自检已完成
- 可交给 Agent 3 做 follow-up review
