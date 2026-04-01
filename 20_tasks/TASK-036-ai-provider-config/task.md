# TASK-036: 后台 AI Provider 配置系统

## 背景
当前 `ai-config.ts` 只通过环境变量读取一个 AI 配置。新 PRD 要求：
- 管理员可在后台配置多个 AI Provider
- 支持 Provider / Base URL / API Protocol / API Key / Model ID / Model Name
- 不同业务场景可绑定不同模型
- API Key 加密存储，前台不可见

## 参考文档
- `00_input/2026-04-01-API接入与系统架构PRD.md` — 完整 PRD
- `30_execution/ap-tracker/src/lib/ai-config.ts` — 当前实现

## 执行要求

### 1. 数据库 Schema（Prisma）
新增以下模型：

```prisma
model AIProvider {
  id                String   @id @default(cuid())
  provider          String   // openai, openrouter, custom
  displayName       String?
  baseUrl           String
  apiProtocol       String   @default("openai_compatible")
  apiKeyEncrypted   String   // 加密存储
  modelId           String
  modelName         String
  timeoutSeconds    Int      @default(30)
  retryCount        Int      @default(2)
  defaultTemperature Float   @default(0.3)
  defaultMaxTokens  Int      @default(2000)
  allowScoring      Boolean  @default(true)
  allowRecommendation Boolean @default(true)
  allowExplanation  Boolean  @default(true)
  isDefault         Boolean  @default(false)
  status            String   @default("active") // active, inactive, error
  createdBy         String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  routingRules      AIRoutingRule[]
  callLogs          AICallLog[]
}

model AIRoutingRule {
  id                String   @id @default(cuid())
  sceneCode         String   // daily_update_analysis, probability_explanation, etc.
  providerId        String
  provider          AIProvider @relation(fields: [providerId], references: [id])
  enabled           Boolean  @default(true)
  fallbackEnabled   Boolean  @default(false)
  fallbackProviderId String?
  priority          Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([sceneCode])
}

model AICallLog {
  id            String   @id @default(cuid())
  sceneCode     String
  providerId    String?
  provider      AIProvider? @relation(fields: [providerId], references: [id])
  userId        String?
  requestSummary String?
  responseSummary String?
  status        String   // success, failed
  latencyMs     Int?
  errorMessage  String?
  createdAt     DateTime @default(now())
}

model AuditLog {
  id              String   @id @default(cuid())
  operatorUserId  String?
  actionType      String
  targetType      String
  targetId        String?
  beforeData      String?  // JSON
  afterData       String?  // JSON
  createdAt       DateTime @default(now())
}
```

### 2. API 路由
创建以下路由：

#### `src/app/api/admin/ai/providers/route.ts`
- GET: 返回所有 Provider 列表（apiKeyEncrypted 返回掩码）
- POST: 新增 Provider（加密存储 apiKey）

#### `src/app/api/admin/ai/providers/[id]/route.ts`
- GET: 返回单个 Provider 详情（apiKey 掩码）
- PUT: 更新 Provider
- DELETE: 删除 Provider

#### `src/app/api/admin/ai/providers/[id]/test/route.ts`
- POST: 测试连接（发一个最小请求到外部 API）

#### `src/app/api/admin/ai/providers/[id]/activate/route.ts`
- POST: 启用

#### `src/app/api/admin/ai/providers/[id]/deactivate/route.ts`
- POST: 停用

#### `src/app/api/admin/ai/routing/route.ts`
- GET: 返回路由配置
- PUT: 批量更新场景绑定

### 3. 更新 AI 调用层
修改 `ai-config.ts` → 改为从数据库读取配置：
- 新增 `getAIConfigForScene(sceneCode: string)` 函数
- 优先查路由表找到绑定的 Provider
- 无路由配置时 fallback 到环境变量（向后兼容）
- 解密 apiKey

### 4. 加密
- 使用 Node.js `crypto` 模块做 AES-256-GCM 加密
- 密钥从环境变量 `AI_KEY_ENCRYPTION_SECRET` 读取
- 数据库存加密后的字符串

### 5. 前端管理页面
创建 `src/app/admin/ai/page.tsx`：
- Provider 列表（表格）
- 新增/编辑表单
- 测试连接按钮
- 启用/停用切换
- 路由绑定配置

## 验证
- 能通过 API 新增 Provider
- API Key 存入数据库时已加密
- GET 接口返回的是掩码而非明文
- 测试连接能正确反馈成功/失败
- 无 Provider 时 fallback 到环境变量

## 报告
- 写入 `30_execution/TASK-036-report.md`
