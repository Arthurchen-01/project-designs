# TASK-036 执行清单

## Agent 2 执行步骤

- [x] 1. 读 `00_input/2026-04-01-API接入与系统架构PRD.md` 了解需求
- [x] 2. 读 `30_execution/ap-tracker/src/lib/ai-config.ts` 了解当前实现
- [x] 3. 读 `30_execution/ap-tracker/prisma/schema.prisma` 了解数据库结构
- [x] 4. 更新 Prisma schema，新增 AIProvider / AIRoutingRule / AICallLog / AuditLog
- [x] 5. 创建加密工具函数 `src/lib/crypto-utils.ts`
- [x] 6. 创建 API 路由：providers CRUD
- [x] 7. 创建 API 路由：providers/[id]/test
- [x] 8. 创建 API 路由：providers/[id]/activate|deactivate
- [x] 9. 创建 API 路由：routing CRUD
- [x] 10. 更新 `ai-config.ts` 支持从数据库读取
- [x] 11. 创建前端管理页面 `admin/ai/page.tsx`
- [x] 12. 运行 `npx prisma generate` 生成客户端
- [x] 13. 修复类型错误（routing route.ts results 类型 + Prisma 7 schema url 迁移）
- [x] 14. `npx next build` ✅ 通过
- [x] 15. 写 `30_execution/TASK-036-report.md`
