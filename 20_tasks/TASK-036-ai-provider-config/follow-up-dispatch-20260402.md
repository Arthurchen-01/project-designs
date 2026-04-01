# TASK-036-REWORK Dispatch — 2026-04-02

## 派发对象

- Agent 1
- Agent 2
- Agent 3

## 立即目标

你当前需要执行的不是旧的部署检查任务，而是 **TASK-036-REWORK**。

本次指令覆盖之前的“Agent 3 等待 review”安排：现在改为三机并行推进。

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

## 本次并行分工

1. Agent 1:
   - 继续做 dispatch and monitor
   - 同时承担 Agent 3 风格的 review / supervision 工作
   - 持续回写 `STATUS.md`，避免状态板落后于远端真实执行

2. Agent 2:
   - 继续作为主执行机修复 `/api/admin/ai/*` admin 鉴权
   - 可调用自己的 subagents / tool capacity 加快实现与验证

3. Agent 3:
   - 不再等待，直接参与 TASK-036-REWORK 的并行执行与独立验证
   - 可调用自己的 subagents / tool capacity
   - 在有足够证据后补写新的 review，不要求先被动等待 Agent 2 report 落地

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

## 协同要求

1. 三机都应保持 active，不允许因旧状态板继续把 Agent 3 挂起。
2. Agent 1 必须持续更新状态，不能只派发不跟进。
3. Agent 2 与 Agent 3 可以走不同实现/验证路径，但都必须围绕同一个阻断问题：admin API auth guard fix。
4. 如果任一机器发现另一路已经完成，也要继续补验证证据，而不是立刻空转。

## 结束条件

- 新 report 已写回 `30_execution/`
- 自检已完成
- Agent 1 已同步最新状态板
- 至少一份新的 review / verification 已形成
