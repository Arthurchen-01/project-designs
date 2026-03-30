# AP 备考追踪平台 — Phase 4 任务看板

> Phase 4：AI 接入（Task 23 — Agent 2 第一个执行包）

## 状态说明
- ⬜ 待开始
- 🔄 进行中
- ✅ 已完成
- ✅ 已审核

---

## Task 23：AI 模块初始化 + P1 修复

**负责人**: Agent 2
**批次**: M04-S01-R01
**前置**: Phase 3 完成

### 任务说明

本任务包含两个部分：

#### Part A: P1 Bug 修复

**文件**: `src/lib/scoring-engine.ts`

修复两处硬编码日期：

```diff
// reviewQuality() 约第68行
- const today = new Date('2026-03-30')
+ const today = new Date()

// forgettingDecay() 约第77行  
- const today = new Date('2026-03-30')
+ const today = new Date()
```

#### Part B: AI 配置模块

**新建文件**: `src/lib/ai-config.ts`

创建 AI 配置管理模块：

- [ ] 创建 `getAIConfig()` 函数
- [ ] 读取环境变量：`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`
- [ ] 默认值：base_url = `https://api.openai.com/v1`, model = `gpt-4o-mini`
- [ ] 返回 `isAvailable: boolean` — 如果没有 API Key 则为 false
- [ ] 返回配置对象供其他模块使用
- [ ] 添加类型定义：

```typescript
interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
  isAvailable: boolean
}
```

**新建文件**: `src/lib/ai-evaluator.ts`（骨架）

创建 AI 评估模块骨架：

- [ ] 创建 `evaluateDailyUpdate(params)` 函数签名
- [ ] 参数类型：`{ description, subjectCode, activityType, scorePercent, timedMode }`
- [ ] 返回类型：`Promise<{ evidenceLevel: 'weak'|'medium'|'strong', qualityScore: number, explanation: string }>`
- [ ] 实现占位逻辑：如果 `aiConfig.isAvailable === false`，返回规则版 fallback
- [ ] AI 调用逻辑留空（下个 task 实现）

### 验收标准

1. `npm run build` 通过
2. scoring-engine.ts 无硬编码日期（`grep "new Date('20" src/lib/scoring-engine.ts` 返回空）
3. ai-config.ts 可正确判断 API Key 是否可用
4. ai-evaluator.ts 有完整函数签名和类型，但 AI 调用为占位

### 产出报告

Agent 2 执行完成后请产出：
- `30_execution/TASK-023-report.md`
- `30_execution/STATUS-REPORT.md`（更新）
- `30_execution/HANDOFF.md`（更新）
