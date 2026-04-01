# TASK-036-REWORK 测试计划

## 目标

验证 `/api/admin/ai/*` 的阻断性安全问题已关闭，同时不破坏 admin 正常功能。

## 最小必测项

### 1. 未登录访问

- 请求任一 admin AI API
- 预期：返回 `401`

### 2. 非 admin 用户访问

- 使用有效 session，但角色非 admin
- 请求任一 admin AI API
- 预期：返回 `403`

### 3. admin 用户访问

- 使用 admin session 请求至少一个 providers 路由和一个 routing 路由
- 预期：可正常通过，不出现误拦截

### 4. 回归检查

- 若有现成 build / lint / route-level smoke test，可执行最小一轮
- 不要求在本次 rework 中扩展新产品能力

## 报告格式

在 `30_execution/TASK-036-rework-report.md` 中写明：

- 测试输入
- 实际返回
- 是否符合预期
- 未覆盖项与原因
