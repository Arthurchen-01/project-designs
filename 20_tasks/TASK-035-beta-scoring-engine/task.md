# TASK-035: 升级 5 分率算法 — 加权 Beta 贝叶斯模型

## 背景
当前 `scoring-engine.ts` 使用加权平均法计算 5 分率。用户的新 PRD 要求改用**加权 Beta 贝叶斯模型**，输出：
1. 当前 5 分率（点估计）
2. 90% 可信区间
3. 置信等级（基于区间宽度）

## 参考文档
- `00_input/2026-04-01-5分率算法与PRD.md` — 算法规则（Step 1-8）
- `30_execution/ap-tracker/src/lib/scoring-engine.ts` — 当前实现
- `30_execution/ap-tracker/src/lib/confidence.ts` — 置信等级

## 执行要求

### 1. 新建 `scoring-engine-v2.ts`
保留原文件不动，新建 v2 版本。核心改动：

#### 1.1 科目 5 分线中心值 c
```ts
const CUTOFF_CENTERS: Record<string, number> = {
  'AP Macro': 60,
  'AP Stats': 62,
  'AP Biology': 64,
  // 其他科目默认 60
}
```

#### 1.2 logistic 支持度函数
```ts
function logisticSupport(scoreRate: number, cutoff: number, slope: number = 7): number {
  // scoreRate 是 0-1 之间的得分率
  // cutoff 是 5 分线中心值（百分制，如 60）
  // 需要把 scoreRate * 100 转成百分制再代入
  return 1 / (1 + Math.exp(-((scoreRate * 100) - cutoff) / slope))
}
```

#### 1.3 测试类型权重 w 和信息量 m
```ts
const TYPE_WEIGHTS = {
  'full-mock': 1.0,
  'mcq': 0.7,
  'frq': 0.7,
  // 默认 0.5
}
const TIMED_MULT = {
  'timed': 1.0,
  'untimed': 0.6,
  'semi-timed': 0.8,
  // 默认 0.7
}
const INFO_AMOUNT = {
  'full-mock': 12,
  'mcq': 8,
  'frq': 8,
  // 默认 5
}
```

实际权重 w = TYPE_WEIGHTS * TIMED_MULT

#### 1.4 Beta 更新
```ts
// 先验
const ALPHA_0 = 2
const BETA_0 = 2

// 对每条测试记录:
// q = logisticSupport(scoreRate, cutoff)
// w = typeWeight * timedMult
// m = infoAmount
// success += w * m * q
// fail    += w * m * (1 - q)

// 后验
alpha = ALPHA_0 + success
beta  = BETA_0 + fail
```

#### 1.5 输出
```ts
// 5 分率
rate = alpha / (alpha + beta)

// 90% 可信区间 — 使用 Beta 分布近似
// Beta 分布的分位数可以用正态近似（alpha+beta > 10 时足够精确）：
const mean = alpha / (alpha + beta)
const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1))
const std = Math.sqrt(variance)
// 90% 区间 = mean ± 1.645 * std
lower = Math.max(0, mean - 1.645 * std)
upper = Math.min(1, mean + 1.645 * std)

// 置信等级（基于区间宽度）
width = upper - lower
if (width <= 0.15) confidence = 'high'
else if (width <= 0.30) confidence = 'medium'
else confidence = 'low'
```

#### 1.6 复习质量微调层
- 文字复习不直接进 Beta 主模型
- 通过 AI evaluator 的 qualityScore 做 ±2% 以内的微调
- 高置信状态下微调幅度减半

#### 1.7 遗忘衰减
保持现有逻辑：连续不更新，每天衰减 0.5%，上限 15%

### 2. 更新 API 路由
修改 `scoring/calculate/route.ts`，让它引用 v2 引擎，并返回新字段：
- `rate`（保持兼容）
- `lower`（区间下界）
- `upper`（区间上界）
- `confidence`（保持兼容）
- `effectiveSampleSize`（有效样本量 = alpha + beta - 4，减去先验）

### 3. 更新每日更新提交接口
`daily-update/route.ts` 中的 scoring 返回也要包含 `lower`、`upper`

## 验证
- 单元测试：给定一组已知记录，手动算出 alpha/beta，验证引擎输出一致
- 边界测试：0 条记录（只有先验）、1 条记录、10+ 条记录
- 区间收敛：记录越多区间越窄

## 报告要求
- 写入 `30_execution/TASK-035-report.md`
- 包含：修改文件清单、参数表、测试用例、与旧版的差异
