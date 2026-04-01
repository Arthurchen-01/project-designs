# TASK-036 Report: 后台 AI Provider 配置系统

**Agent:** 2
**Date:** 2026-04-01
**Status:** ✅ Complete (build passing)

## 完成内容

### 数据库 Schema（Prisma）
- ✅ AIProvider — 支持 provider/baseUrl/apiProtocol/apiKeyEncrypted/modelId/modelName 等字段
- ✅ AIRoutingRule — 场景路由绑定，支持 fallback provider
- ✅ AICallLog — AI 调用日志
- ✅ AuditLog — 管理操作审计
- ✅ Prisma 7 兼容：移除 schema 中的 `url` 字段，改用 `prisma.config.ts`

### 加密
- ✅ `src/lib/crypto-utils.ts` — AES-256-GCM 加解密 + 掩码显示
- 密钥从 `AI_KEY_ENCRYPTION_SECRET` 环境变量读取

### API 路由（全部 ✅）
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/admin/ai/providers` | GET/POST | Provider 列表 / 新增 |
| `/api/admin/ai/providers/[id]` | GET/PUT/DELETE | 单个 Provider CRUD |
| `/api/admin/ai/providers/[id]/test` | POST | 测试连接 |
| `/api/admin/ai/providers/[id]/activate` | POST | 启用 |
| `/api/admin/ai/providers/[id]/deactivate` | POST | 停用 |
| `/api/admin/ai/routing` | GET/PUT | 场景路由配置 |

### AI 调用层
- ✅ `ai-config.ts` — 优先从 DB 读取，支持场景路由，fallback 到环境变量

### 前端管理页面
- ✅ `/admin/ai/page.tsx` — Provider 管理 + 路由配置

### 修复项
- 修复 `routing/route.ts` 的 TypeScript 类型错误（`results` 推断为 `never[]`）
- Prisma 7 迁移：schema datasource 不再内联 `url`

## Build 验证
```
npx next build ✅
- 24 个页面全部生成成功
- admin/ai 静态页面 3.91 kB
- 所有 API 路由正常注册
```

## 注意事项
- 需要设置环境变量 `AI_KEY_ENCRYPTION_SECRET` 才能正常加解密 API Key
- 需要 `npx prisma db push` 或 migrate 来创建数据库表
- API Key 在 GET 响应中返回掩码（前4后3）
