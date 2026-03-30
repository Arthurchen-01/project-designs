# TASK-025: AI 生成变化解释

**Dispatched by:** Agent 1
**Date:** 2026-03-30 23:57 CST
**Phase:** Phase 4 — AI Integration
**Target:** Agent 2

---

## 任务描述

将现有的模板规则解释（`src/lib/explanation.ts`）升级为 AI 驱动的自然语言解释。当 AI 不可用时自动 fallback 到模板规则。

## 要求

### 1. 创建 `src/lib/ai-explainer.ts`

- 导出 `generateAIExplanation(params)` 函数
- 参数：
  - `subjectCode: string`
  - `previousRate: number`（昨天的5分率）
  - `newRate: number`（今天的5分率）
  - `delta: number`（变化量）
  - `factors: object`（评分各维度的贡献值：testPerformance, trend, stability, reviewQuality, forgettingDecay）
  - `recentActivity: string`（学生当天的描述/活动内容）
  - `evidenceLevel: string`（AI 证据等级）
- 返回：`string`（一段自然语言解释，2-3句话，中文）

### 2. AI Prompt 设计要点

- 先说结论（5分率从X%变到Y%，+Z%/-Z%）
- 解释主要原因（哪些因子贡献最大）
- 给出简单建议（如"继续保持"或"建议多做计时练习"）
- 语气自然、像老师点评，不要过于学术
- 严格模式：不夸大，如实反映

### 3. Fallback

- 无 API Key 时或 AI 调用失败时，调用现有 `generateExplanation()` 模板版
- 返回 `source: 'ai' | 'rule'` 以便前端区分

### 4. 接入点

- 修改 `src/app/api/scoring/calculate/route.ts`：算出5分率后，调用 AI explainer 生成解释，写入 `FiveRateSnapshot.aiExplanation`（或 explanation 字段）
- 修改 `POST /api/daily-update/route.ts`：在 AI 评估完成后，也生成解释

### 5. 验收标准

- [ ] `ai-explainer.ts` 存在且编译通过
- [ ] 有 AI Key 时，解释内容不重复、有个性化
- [ ] 无 AI Key 时，fallback 到模板版解释不报错
- [ ] `npm run build` 通过
- [ ] 解释写入 FiveRateSnapshot（Prisma schema 如缺字段需加）

## 前置条件

- ✅ TASK-023: ai-config.ts + ai-evaluator.ts 已就绪
- ✅ TASK-024: 评分引擎已支持 AI quality score

## 参考文件

- `src/lib/ai-config.ts` — AI 配置（getAIConfig, callAI）
- `src/lib/ai-evaluator.ts` — AI 评估模块（参考其 callAI 用法）
- `src/lib/explanation.ts` — 现有模板解释（fallback 参考）

## 报告要求

完成后写入 `30_execution/STATUS-REPORT.md` 和 `30_execution/HANDOFF.md`，说明：
1. 哪些文件创建/修改
2. Build 是否通过
3. Fallback 是否正常工作
4. 下一步建议
