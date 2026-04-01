# AP Tracker 接手手册

## A. 前端怎么用

- **入口**: `http://localhost:3000`（dev）或 `https://samuraiguan.cloud`（生产）
- **登录**: 用 studentId（测试用 `stu-001`, `stu-002`, `stu-003`）
- **提交每日更新**: 登录后进 `/{classId}/daily-update` 填表
- **看5分率**: `/{classId}/dashboard` 或 `/{classId}/personal`
- **管理后台**: `/admin/ai`（需 admin 权限）

## B. 后端在哪

- **代码**: `30_execution/ap-tracker/`
- **启动**: `DATABASE_URL="file:./prisma/dev.db" npx next start -p 3000`
- **Dev模式**: `DATABASE_URL="file:./prisma/dev.db" npx next dev -p 3000`
- **Build**: `npx next build`
- **日志**: 终端输出，或查看 `.next/` 构建日志

## C. API 在哪

- **基础入口**: `/api`
- **关键接口**:
  - `POST /api/auth/login` — 登录（body: `{studentId}`）
  - `GET /api/auth/me` — 当前用户
  - `POST /api/daily-update` — 提交每日更新
  - `GET /api/daily-update` — 历史记录
  - `GET /api/dashboard?classId=xxx` — 仪表盘
  - `GET /api/student/{id}` — 学生详情
  - `GET /api/admin/ai/providers` — AI Provider管理（需admin）
- **验证**: `curl http://localhost:3000/api/classes`

## D. 数据库在哪

- **类型**: SQLite
- **位置**: `30_execution/ap-tracker/prisma/dev.db`
- **主要表**:
  - `user` — 用户账号
  - `student` — 学生（实际登录用这个表）
  - `class` — 班级
  - `subject` — AP科目
  - `daily_update` — 每日学习记录
  - `assessment_record` — 测试成绩
  - `probability_snapshot` — 5分率快照
  - `ai_provider` — AI Provider配置
  - `ai_call_log` — AI调用日志
- **初始化**: `DATABASE_URL="file:./prisma/dev.db" npx tsx prisma/seed.ts`
- **迁移**: `DATABASE_URL="file:./prisma/dev.db" npx prisma db push`

## E. 模型在哪

- **本地模型**: 小米 MIMO，服务地址 `http://localhost:8000/v1`
- **配置位置**: `src/lib/ai-config.ts`（DEFAULT_BASE_URL 和 DEFAULT_MODEL）
- **确认不走公网**: 检查 `ai-config.ts` 中 `DEFAULT_BASE_URL` 不包含 `openai.com` 或 `openrouter.ai`
- **所有AI调用**: ai-advisor.ts, ai-evaluator.ts, explanation.ts, ai-explainer.ts → 都通过 `getAIConfig().baseUrl`

## F. 环境变量在哪

- **配置文件**: `30_execution/ap-tracker/.env`
- **当前内容**: `DATABASE_URL="file:./prisma/dev.db"`
- **需要的变量**:
  - `DATABASE_URL` — SQLite路径
  - `AI_API_KEY` — 本地模型API key（可选，本地模型可能不需要）
  - `AI_BASE_URL` — 模型地址（默认 localhost:8000）
  - `AI_MODEL` — 模型名（默认 xiaomi/mimo-v2-pro）
  - `AI_KEY_ENCRYPTION_SECRET` — API Key加密密钥（管理后台需要）
- **绝对不能动错**: `DATABASE_URL` 错了整个数据库连不上
