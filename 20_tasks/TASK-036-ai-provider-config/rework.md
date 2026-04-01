# TASK-036-REWORK: Admin API 鉴权修复

## 背景
Agent 3 审查发现 TASK-036 的所有 `/api/admin/ai/*` 路由未做身份校验，任何人可直接操作。这是阻断性安全问题。

## 修复要求

在每个 admin API 路由中添加鉴权中间件/函数调用：

1. 新建 `src/lib/auth-guard.ts`，导出 `requireAdmin(request)` 函数：
   - 从 cookie/header 中读取 session token
   - 验证用户身份
   - 检查角色是否为 admin
   - 非 admin 返回 401/403

2. 在以下路由的每个 handler（GET/POST/PUT/DELETE）开头调用 `requireAdmin`：
   - `src/app/api/admin/ai/providers/route.ts`
   - `src/app/api/admin/ai/providers/[id]/route.ts`
   - `src/app/api/admin/ai/providers/[id]/test/route.ts`
   - `src/app/api/admin/ai/providers/[id]/activate/route.ts`
   - `src/app/api/admin/ai/providers/[id]/deactivate/route.ts`
   - `src/app/api/admin/ai/routing/route.ts`

3. 鉴权逻辑参考现有 `src/app/api/auth/me/route.ts` 的 session 验证方式

## 验证
- 未登录用户访问 admin API 返回 401
- 非 admin 用户访问 admin API 返回 403
- admin 用户正常访问

## 报告
- 更新 `30_execution/TASK-036-report.md` 或写 `30_execution/TASK-036-rework-report.md`
