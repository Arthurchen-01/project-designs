# HANDOFF.md — Phase 4（2026-03-30 23:55）

**From**: Agent 2
**To**: Agent 1
**Date**: 2026-03-30

---

## Phase 4 完成情况

| 任务 | 状态 | 产出 |
|---|---|---|
| TASK-023 AI模块初始化 | ✅ | ai-config.ts, ai-evaluator.ts |
| TASK-024 评分引擎接入AI | ✅ | scoring-engine 支持 AI 质量分注入 |
| TASK-025 AI生成变化解释 | ✅ | generateExplanationWithAI, daily-update 集成 |
| TASK-026 AI学习建议 | ✅ | ai-advisor.ts, /api/ai/advice, 个人中心建议模块 |

---

## TASK-025 详情（最新）

### `src/lib/explanation.ts` — 新增 `generateExplanationWithAI()`

- **Prompt**：AP备考教练语气，包含学生姓名/科目/活动上下文
- **降级**：AI 不可用 → `generateExplanation()` 规则版
- **返回**：`{ text: string; source: 'ai' | 'rule' }`

### `src/app/api/daily-update/route.ts`

- POST 增加获取学生姓名 + 科目名称
- 获取最近5条活动摘要用于 AI 上下文
- 调用 `generateExplanationWithAI()` 替代 `generateExplanation()`
- 返回新增 `explanationSource: 'ai' | 'rule'`

### 页面改造

- 提交成功后解释文字下方显示来源标签
- 🤖 AI 生成（indigo） / 📐 规则生成（gray）

---

## TASK-026 详情

### `src/lib/ai-advisor.ts`

- `generateAdvice(studentId)`：获取学生各科5分率，生成个性化建议
- AI 版：调用 OpenAI，每科趋势数据 → 3条可操作建议
- 规则版降级：识别薄弱科目/下滑趋势/优势科目 → 给出建议

### API Route — `GET /api/ai/advice`

- 读取 `ap_student_id` cookie
- 返回 `overallAdvice[]` + `subjectAdvices[]` + `source`

### `personal/page.tsx` 改造

- 登录后自动调用 `/api/ai/advice`
- 每科卡片下方显示 AI 给出的个性化学习建议（💡图标）
- 页面底部新增 **AI 学习建议** 模块（编号建议 + 来源标签）

---

## Phase 4 总验收标准

| 验收项 | 状态 |
|---|---|
| 每日更新提交后 AI 评估复习质量并影响 5 分率 | ✅ |
| 变化解释由 AI 生成（可读、个性化） | ✅ |
| 个人中心有 AI 学习建议 | ✅ |
| `npm run build` 无错误 | ✅ |

---

## 技术说明

- AI 配置：`OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL`
- AI 不可用时所有功能自动降级到规则版，不影响主流程
- Prisma client：`src/generated/prisma/client`

## What Agent 1 Should Do Next

- Phase 4 完成，可发起 Agent 3 审查 TASK-025/026
- 检查是否有 Phase 5 新任务
