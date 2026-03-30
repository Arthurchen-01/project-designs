# TASK-024 执行报告 — 评分引擎接入 AI 评估

**任务：** 评分引擎接入 AI 评估
**Agent:** 2
**日期：** 2026-03-30 23:50 Asia/Shanghai

## 通过项

| 检查项 | 状态 |
|---|---|
| DailyUpdate schema 新增 AI 字段（aiEvidenceLevel/aiDeltaScore/aiExplanation） | ✅ PASS |
| `npx prisma generate` + `npx prisma db push` | ✅ PASS |
| `calculateFiveRate` 支持 `ScoringInput` 重载（AI分优先，规则fallback） | ✅ PASS |
| `daily-update/route.ts` POST 调用 AI 评估并写回字段 | ✅ PASS |
| AI 评估失败不影响主流程（try/catch 隔离） | ✅ PASS |
| daily-update/page.tsx 显示 AI 评估结果（证据等级 + 分数 + 来源） | ✅ PASS |
| `npm run build` 无 TypeScript 错误 | ✅ PASS |

## 实现细节

### scoring-engine.ts 改造
- `calculateFiveRate` 现在接受两种调用方式：
  - `calculateFiveRate(studentId, subjectCode)` — 规则版
  - `calculateFiveRate({ studentId, subjectCode, aiQualityScore })` — AI分优先
- 权重：`reviewQualityScore` 始终占 10%，AI 分直接替换规则计算值

### daily-update/route.ts 改造
1. 创建 DailyUpdate 记录
2. 调用 `evaluateDailyUpdate()` 获取 AI 评估（失败不影响主流程）
3. 将 AI 评估结果写回 DailyUpdate 记录
4. 调用 `calculateFiveRate()` 时传入 AI 质量分
5. 返回结果中包含 `scoring` 和 `ai` 两个字段

### UI 显示
- 提交后显示 AI 评估 badge：
  - 证据充分（strong）→ 绿色
  - 证据一般（medium）→ 黄色
  - 证据薄弱（weak）→ 红色
  - 来源标签：via GPT / via 规则

## 已知限制

- 需要 `OPENAI_API_KEY` 环境变量才能使用真实 AI；未配置时自动降级为规则版
