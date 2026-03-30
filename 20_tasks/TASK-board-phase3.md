# AP 备考追踪平台 — 任务看板

> Phase 3：基础评分引擎 + AI 接入

## 状态说明
- ⬜ 待开始
- 🔄 进行中
- ✅ 已完成

---

## TASK-017：5 分率规则引擎 V1
**负责人**：Agent 2
**状态**：⬜ 待开始
**产出**：评分计算核心模块

- [ ] 创建 `src/lib/scoring-engine.ts`
- [ ] 实现 `calculateFiveRate(studentId, subjectCode)` 函数
- [ ] 计算逻辑：
  - 测试表现分（60%）：加权平均最近成绩，计时模考权重最高
  - 趋势分（15%）：最近 3-5 次成绩的方向
  - 稳定性分（15%）：分数标准差的反向指标
  - 复习质量分（10%）：从 DailyUpdate.description 字段获取（V1 先用简单规则）
  - 遗忘衰减：距上次学习每 1 天衰减 0.5%
- [ ] 输出置信等级（high/medium/low），基于数据量
- [ ] 严格模式：五分率不超过历史最高表现对应的概率
- [ ] 创建 `src/lib/confidence.ts`：根据测试记录数量判断置信等级

**验收**：对 mock 数据计算出合理的 5 分率，置信等级正确

---

## TASK-018：评分引擎 API + 快照存储
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-017
**产出**：API + 快照持久化

- [ ] 创建 API Route `POST /api/scoring/calculate`
  - 接收 studentId + subjectCode
  - 调用 scoring-engine 计算
  - 结果写入 ProbabilitySnapshot 表
  - 返回计算结果 + 解释
- [ ] 创建 API Route `POST /api/scoring/batch`
  - 全班所有学生 × 科目批量计算
  - 返回汇总结果
- [ ] 创建 API Route `GET /api/scoring/history?studentId=&subjectCode=`
  - 返回该学生该科的历史快照（趋势图数据源）

**验收**：调用 API 后 ProbabilitySnapshot 表有新记录

---

## TASK-019：每日更新触发重算
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-018
**产出**：每日更新自动触发 5 分率重算

- [ ] 改造 `POST /api/daily-update`：
  - 写入 DailyUpdate 后自动调用 scoring-engine
  - 计算该学生该科的最新 5 分率
  - 存入 ProbabilitySnapshot
  - 返回新旧 5 分率对比 + 变化量
- [ ] 改造 daily-update/page.tsx：
  - 提交后显示"5 分率变化"提示（如：从 72% → 74% ↑）
  - 显示变化原因简述

**验收**：提交每日更新后仪表盘数据即时变化

---

## TASK-020：AI 解释生成
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-018
**产出**：AI 生成变化解释

- [ ] 创建 `src/lib/ai-explainer.ts`
- [ ] 实现 `generateExplanation(context)` 函数：
  - 输入：学生信息、历史成绩、本次更新内容、5分率变化
  - 输出：自然语言解释（如"今天5分率上升2%，因为你做了计时MCQ且正确率高于过去3次平均"）
- [ ] V1 简单实现：不调用外部 AI API，用模板规则生成解释
  - 根据分数变化方向（↑↓→）
  - 根据更新类型（测试/复习/无更新）
  - 根据置信等级
  - 拼接解释文案
- [ ] 将解释存入 ProbabilitySnapshot.explanation
- [ ] 在页面中展示解释文案

**验收**：每次 5 分率变化都能显示可读的解释

---

## TASK-021：个人页趋势图接入真实数据
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-018
**产出**：Recharts 图表使用历史快照数据

- [ ] 改造 personal/[subjectId]/page.tsx：
  - 5 分率趋势折线图从 `/api/scoring/history` 获取数据
  - X 轴为日期，Y 轴为 5 分率
- [ ] 添加"本周 vs 上周"对比卡片
- [ ] 添加"下一步建议"模块（基于规则生成）

**验收**：单科详情页的图表显示真实的历史快照趋势

---

## TASK-022：班级仪表盘增强
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-018
**产出**：老师视角的风险预警

- [ ] 改造 dashboard/page.tsx 增加：
  - 风险学生名单（5 分率 < 50% 的学生）
  - 连续 3 天未更新名单
  - 近期波动异常名单（标准差 > 阈值）
- [ ] 创建 API Route `GET /api/dashboard/alerts?classId=`
  - 返回风险、断更、波动异常学生列表

**验收**：仪表盘显示风险预警模块

---

## Phase 3 总验收标准
1. 5 分率由规则引擎计算，不再只是 seed 静态值
2. 提交每日更新后 5 分率自动重算
3. 每次变化有可读的解释文案
4. 个人页趋势图显示真实历史数据
5. 班级仪表盘有风险预警
6. 置信等级正确显示
