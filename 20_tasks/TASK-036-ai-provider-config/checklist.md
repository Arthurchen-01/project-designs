# TASK-036 执行清单

## Agent 2 执行步骤

- [ ] 1. 读 `00_input/2026-04-01-API接入与系统架构PRD.md` 了解需求
- [ ] 2. 读 `30_execution/ap-tracker/src/lib/ai-config.ts` 了解当前实现
- [ ] 3. 读 `30_execution/ap-tracker/prisma/schema.prisma`（如有）了解数据库结构
- [ ] 4. 更新 Prisma schema，新增 AIProvider / AIRoutingRule / AICallLog / AuditLog
- [ ] 5. 创建加密工具函数 `src/lib/crypto-utils.ts`
- [ ] 6. 创建 API 路由：providers CRUD
- [ ] 7. 创建 API 路由：providers/[id]/test
- [ ] 8. 创建 API 路由：providers/[id]/activate|deactivate
- [ ] 9. 创建 API 路由：routing CRUD
- [ ] 10. 更新 `ai-config.ts` 支持从数据库读取
- [ ] 11. 创建前端管理页面 `admin/ai/page.tsx`
- [ ] 12. 运行 `npx prisma generate` 生成客户端
- [ ] 13. 写 `30_execution/TASK-036-report.md`
