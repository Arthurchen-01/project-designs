# AP 备考追踪平台 — 任务看板

> Phase 4：AI 接入

## 状态说明
- ⬜ 待开始
- 🔄 进行中
- ✅ 已完成

---

## TASK-023：AI 复习质量评估
**负责人**：Agent 2
**状态**：⬜ 待开始
**产出**：AI 判断每日更新描述的质量

- [ ] 创建 `src/lib/ai-evaluator.ts`
- [ ] 实现 `evaluateDailyUpdate(context)` 函数
- [ ] 接收参数：description、subjectCode、activityType、scorePercent、timedMode
- [ ] 调用 OpenAI-compatible API（用户配置 API Key）
- [ ] 返回结构化结果：
  - evidenceLevel: "weak" | "medium" | "strong"
  - qualityScore: 0-1（替代简单规则版的 reviewQuality）
  - explanation: 自然语言解释
- [ ] 创建 `src/app/api/ai/evaluate/route.ts` API Route
- [ ] 创建 `src/lib/ai-config.ts`：管理 API Key 和模型配置
- [ ] 环境变量：OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL

**验收**：提交带描述的每日更新，AI 返回合理的评估结果

---

## TASK-024：评分引擎接入 AI 评估
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-023
**产出**：scoring-engine 使用 AI 评估结果

- [ ] 改造 `scoring-engine.ts` 的 `computeReviewQuality`：
  - 优先使用 AI 评估的 qualityScore
  - 如果 AI 不可用（无 key / 超时），fallback 到规则版
- [ ] 改造 `daily-update/route.ts`：
  - 提交后先调 AI 评估
  - 将评估结果存入 DailyUpdate 的 aiEvidenceLevel / aiDeltaScore / aiExplanation
  - 然后再调 scoring-engine 重算 5 分率

**验收**：AI 评估结果影响 5 分率计算

---

## TASK-025：AI 生成变化解释
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-023
**产出**：AI 生成更自然的变化解释

- [ ] 改造 `ai-explainer.ts`：
  - 增加 `generateExplanationWithAI(context)` 函数
  - 调用 AI API 生成解释
  - 如果 AI 不可用，fallback 到模板规则版
- [ ] 解释模板提示词：
  - 输入：学生姓名、科目、旧5分率、新5分率、变化量、最近活动描述、评分引擎各组件分数
  - 要求：简洁中文，2-3句话，说明变化原因和下一步建议
- [ ] 在 daily-update 页面展示 AI 生成的解释

**验收**：每次更新后显示 AI 生成的个性化解释

---

## TASK-026：AI 学习建议
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-023
**产出**：AI 给出个性化学习建议

- [ ] 创建 `src/lib/ai-advisor.ts`
- [ ] 实现 `generateAdvice(studentData)` 函数
- [ ] 输入：学生所有科目的5分率、趋势、薄弱单元、最近活动
- [ ] 输出：3条具体建议（如"建议加强AP Macro Unit 4的FRQ练习"）
- [ ] 在个人中心页面底部展示"AI 学习建议"模块
- [ ] 创建 `GET /api/ai/advice?studentId=` API

**验收**：个人中心显示个性化的 AI 学习建议

---

## Phase 4 总验收标准
1. 每日更新提交后，AI 评估复习质量并影响 5 分率
2. 变化解释由 AI 生成（可读、个性化）
3. 个人中心有 AI 学习建议
4. 所有 AI 功能有 fallback（无 API Key 时用规则版）
5. AI 配置通过环境变量管理
