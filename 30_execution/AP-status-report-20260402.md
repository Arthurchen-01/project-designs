# Agent 3: AP Tracking 现状排查与封网风险报告

**时间:** 2026-04-02 01:50+08:00
**状态:** Agent 1 已启动（01:35），Agent 2 在做封网排查，Agent 3 已完成初步排查并补充关键发现

---

## 🔴 关键发现

### 1. 公网风险 — ai-config.ts 默认值危险

**文件:** `src/lib/ai-config.ts`
```typescript
baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
```
**问题:** 如果没有设置 `OPENAI_BASE_URL` 环境变量，系统会默认调用 OpenAI 公网 API。
**状态:** ⚠️ 需要立即修复 — 改为指向 3 号机本地 MIMO。

### 2. 所有 AI 调用都经过 ai-config.ts

以下三个文件都 import `AI_CONFIG` 并使用 `AI_CONFIG.baseUrl`:
- `src/lib/ai-evaluator.ts` — 每日更新质量评估
- `src/lib/ai-advisor.ts` — 学习建议生成
- `src/lib/ai-explainer.ts` — 5分率变化解释

**好消息:** 所有 AI 调用都有 fallback（rule-based），`isAIEnabled()` 在没设 API Key 时返回 false，不会实际发出请求。

### 3. 没有 .env 文件（nightly 版本）

`/tmp/ap-tracker-nightly/` 没有 `.env` 文件，意味着：
- `DATABASE_URL` 没设置 → 使用 SQLite `file:./dev.db`（prisma 默认）
- `OPENAI_API_KEY` 没设置 → `isAIEnabled()` 返回 false → AI 调用走 rule-based fallback
- `OPENAI_BASE_URL` 没设置 → 默认 OpenAI（但因为没 key，不会实际调用）

**当前安全性:** 暂时安全（因为没 key，不会真正发出请求）。但默认值本身是危险的，必须修改。

### 4. 本地模型状态

- 3 号机（本机）**没有运行小米 MIMO 服务**
- 常见端口（8000, 8001, 11434, 5000, 8888）均无响应
- **需要先启动 MIMO 服务，才能接入 AI 调用**

### 5. 域名与服务状态

- `samuraiguan.cloud` → DNS 已解析到 `42.192.56.101`（本机）
- **没有运行 nginx/caddy/apache** — 反向代理还没搭
- **没有服务在 3000/8080 端口运行** — AP Tracking 还没启动
- SSL 证书也没有配置

### 6. 代码库位置

| 版本 | 路径 | 状态 |
|------|------|------|
| 旧版 | `30_execution/ap-tracker/` | Next.js 15, Prisma 7.6, 无 seed |
| 新版 | `/tmp/ap-tracker-nightly/` | Next.js 16.2, Prisma 6.19, 有 seed, 有 dev.db |

**新版是主要工作版本。**

### 7. 数据库

- SQLite 文件: `/tmp/ap-tracker-nightly/prisma/dev.db`
- Schema 包含 8 个 model: Class, Student, Subject, StudentSubject, ExamDate, AssessmentRecord, DailyUpdate, ProbabilitySnapshot, Resource
- seed.ts 有 9 个学生、8 个科目、考试日期、资源数据

---

## ✅ 安全检查结果

| 检查项 | 结果 |
|--------|------|
| OpenRouter 引用 | ❌ 未发现 |
| 外部 API 地址 | ⚠️ ai-config.ts 默认 OpenAI（但无 key 不会调用） |
| .env 中的密钥 | ✅ 无敏感数据暴露 |
| .gitignore 配置 | ✅ 有基本忽略规则 |
| telemetry/遥测 | 🔍 待查依赖包 |
| Git 自动推送 | ✅ 无 auto-push 配置 |
| 数据库暴露公网 | ✅ SQLite 本地文件，无远程连接 |

---

## 📋 需要做的事（按优先级）

1. **修复 ai-config.ts 默认值** — 改为指向本地 MIMO，移除 OpenAI 默认值
2. **启动本地 MIMO 服务** — 确认端口和 API 格式
3. **配置 .env** — DATABASE_URL + MIMO_BASE_URL + 禁用公网 API
4. **启动 AP Tracking** — `npm run dev` 或 build + start
5. **配置 nginx 反向代理** — samuraiguan.cloud → localhost:3000
6. **配置 SSL** — certbot 或 caddy 自动 HTTPS
7. **完整测试链路** — 注册/登录/提交/模型调用
8. **交付说明**
