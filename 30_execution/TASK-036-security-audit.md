# 安全封网审计报告 — 2026-04-02 02:20

**审计范围:** AP Tracker 全代码库（30_execution/ap-tracker/）
**审计人:** Agent 2

---

## 1. 外发公网风险排查

### ✅ 已修复
| 风险点 | 原状态 | 修复 |
|--------|--------|------|
| `ai-config.ts` DEFAULT_BASE_URL | `https://api.openai.com/v1` | → `http://localhost:8000/v1` |
| `ai-config.ts` DEFAULT_MODEL | `gpt-4o-mini` | → `xiaomi/mimo-v2-pro` |
| `daily-update/route.ts` cookie 名 | `ap_student_id` (不匹配) | → `studentId` |

### ✅ 已确认安全
| 检查项 | 结果 |
|--------|------|
| 所有 AI 调用 (ai-advisor, ai-evaluator, explanation, ai-explainer) | 全部通过 `getAIConfig().baseUrl`，已指向本地 |
| 前端 fetch 调用 | 全部用相对路径 `/api/*`，无外部 URL |
| `.env` 文件 | 只有 `DATABASE_URL`，无 API key |
| `.gitignore` | 已包含 `.env` 和 `*.db` |
| Prisma client | 使用 local SQLite，无外部数据库 |
| 代码中硬编码 API key | 无 |
| 依赖遥测/telemetry | Next.js 默认无遥测；Prisma 无遥测 |

### ⚠️ 已知风险（非代码层面）
| 风险 | 说明 | 建议 |
|------|------|------|
| `00_input/` PRD 文件含明文 OpenRouter API Key | `sk-or-v1-30b...` 已在 GitHub 公开仓库 | **需立即轮换该 key** |
| 环境变量 `OPENAI_API_KEY` 兼容 | 代码兼容旧变量名，如服务器上有此变量可能指向公网 | 部署时确保只设 `AI_*` 变量 |

## 2. 数据安全

| 检查项 | 结果 |
|--------|------|
| 密码加密 | User model 有 `passwordHash` 字段 ✅ |
| API Key 加密 | `crypto-utils.ts` 实现 AES-256-GCM ✅ |
| 数据库 | SQLite 本地文件，不暴露公网 ✅ |
| Cookie 安全 | `httpOnly: true`, `sameSite: lax` ✅ |
| Admin API 鉴权 | `requireAdmin()` 检查 role ✅ |

## 3. 测试验证

### API 测试（全部通过 ✅）
- `GET /api/classes` — 班级列表
- `GET /api/students?classId=xxx` — 学生列表
- `POST /api/auth/login` — 登录（正常/无效ID/缺字段）
- `GET /api/auth/me` — 当前用户
- `POST /api/daily-update` — 每日更新（写入DB + 5分率计算）
- `GET /api/daily-update` — 历史记录
- `POST /api/assessment` — 测试成绩
- `GET /api/admin/ai/providers` — 权限拦截（403）
- `GET /api/dashboard?classId=xxx` — 统计数据

### 5分率验证
- 首次提交 → rate=0.494, confidence=low, trend=stable ✅
- AI 评估降级到 rule-based（本地模型未运行）✅

## 4. 待办

- [ ] 轮换 `00_input/` 中暴露的 OpenRouter API Key
- [ ] 在 3 号机部署本地 MIMO 服务并验证 AI 调用链
- [ ] 测试前端完整链路（当前只测了 API 层）
- [ ] 配置 `AI_KEY_ENCRYPTION_SECRET` 环境变量
- [ ] 部署到 samuraiguan.cloud 并配置反向代理
