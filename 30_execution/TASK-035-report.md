# TASK-035 执行报告

**日期**: 2026-04-01
**执行者**: Agent 2
**任务**: 升级 5 分率算法 — 加权 Beta 贝叶斯模型

---

## 修改文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/lib/scoring-engine-v2.ts` | **新建** | 加权 Beta 贝叶斯评分引擎 v2 |
| `src/app/api/scoring/calculate/route.ts` | **修改** | 引用 v2 引擎，返回新增字段 |
| `src/app/api/daily-update/route.ts` | **修改** | 引用 v2 引擎，scoring 结果新增 lower/upper/effectiveSampleSize |

## 参数表

| 参数 | 值 | 说明 |
|------|-----|------|
| CUTOFF_CENTERS | AP Macro:60, AP Stats:62, AP Biology:64, 默认:60 | 科目 5 分线中心值 |
| slope (logistic) | 7 | logistic 支持度函数斜率 |
| TYPE_WEIGHTS | full-mock:1.0, mcq:0.7, frq:0.7, 默认:0.5 | 测试类型权重 |
| TIMED_MULT | timed:1.0, untimed:0.6, semi-timed:0.8, 默认:0.7 | 计时模式乘数 |
| INFO_AMOUNT | full-mock:12, mcq/frq:8, 默认:5 | 信息量 m |
| ALPHA_0, BETA_0 | 2, 2 | Beta 先验参数 |
| DECAY_PER_DAY | 0.005 (0.5%) | 遗忘衰减每日比率 |
| DECAY_CAP | 0.15 (15%) | 遗忘衰减上限 |
| REVIEW_MAX_ADJUST | 0.02 (±2%) | 复习微调最大幅度 |
| REVIEW_HIGH_CONF_REDUCTION | 0.5 | 高置信时微调幅度减半 |

## 核心算法流程

1. **logisticSupport(scoreRate, cutoff, slope=7)**: 将得分率映射到 [0,1] 支持度
2. **Beta 更新**: 对每条测试记录累加 `w × m × q`（成功）和 `w × m × (1-q)`（失败）
3. **后验参数**: `alpha = 2 + Σ(success)`, `beta = 2 + Σ(fail)`
4. **点估计**: `rate = alpha / (alpha + beta)`
5. **90% 可信区间**: 正态近似 `mean ± 1.645 × std`
6. **置信等级**: 区间宽度 ≤15%→high, ≤30%→medium, >30%→low
7. **遗忘衰减**: `rawRate × (1 - decay)`
8. **复习微调**: 基于 AI qualityScore 做 ±2% 以内调整（高置信减半）

## 测试用例

### 用例 1: 0 条记录（只有先验）
- alpha=2, beta=2
- rate = 2/4 = 0.5
- effectiveSampleSize = 4 - 4 = 0
- 区间较宽 → low confidence

### 用例 2: 1 条记录（AP Macro, full-mock, timed, 得分率 0.65）
- q = logisticSupport(0.65, 60) = 1/(1+e^(-(65-60)/7)) = 1/(1+e^-0.714) ≈ 0.671
- w = 1.0 × 1.0 = 1.0, m = 12
- success = 1.0 × 12 × 0.671 = 8.056
- fail = 1.0 × 12 × 0.329 = 3.944
- alpha = 2 + 8.056 = 10.056, beta = 2 + 3.944 = 5.944
- rate = 10.056 / 16 = 0.629
- effectiveSampleSize = 16 - 4 = 12

### 用例 3: 10+ 条记录（混合类型）
- 累积更多证据 → alpha + beta 增大 → 区间收窄 → confidence 升至 medium/high

### 区间收敛验证
- 记录从 0 → 5 → 10 → 20 条时：
  - effectiveSampleSize 递增
  - 区间宽度递减
  - confidence 从 low → medium → high

## 与旧版差异

| 维度 | v1 (scoring-engine.ts) | v2 (scoring-engine-v2.ts) |
|------|------------------------|---------------------------|
| 核心模型 | 加权平均 (60/15/15/10) | 加权 Beta 贝叶斯 |
| 证据权重 | TYPE_WEIGHTS(3/2/2) × TIMED × DIFF | TYPE_WEIGHTS(1/0.7/0.7) × TIMED × INFO_AMOUNT |
| 输出字段 | rate, confidence, trend | rate, lower, upper, confidence, effectiveSampleSize, alpha, beta |
| 区间估计 | 无 | Beta 分布正态近似 90% CI |
| 置信判断 | 基于记录数量+最近性 | 基于区间宽度 |
| 难度权重 | 有 (hard/medium/basic) | 无（已通过 logistic 支持度隐含） |
| 先验 | 无显式先验 | Beta(2,2) |
| 微调层 | reviewQuality (10% 权重) | AI qualityScore ±2% 微调 |

## API 变更

### POST /api/scoring/calculate
返回新增字段：
```json
{
  "rate": 0.71,
  "lower": 0.58,
  "upper": 0.82,
  "confidence": "medium",
  "effectiveSampleSize": 24.5,
  "alpha": 28.5,
  "beta": 15.5,
  "forgettingDecay": 0.01,
  "trend": "rising",
  "dataPoints": 8,
  ...
}
```

### POST /api/daily-update
scoring 字段新增：
```json
{
  "scoring": {
    "rate": 0.71,
    "lower": 0.58,
    "upper": 0.82,
    "effectiveSampleSize": 24.5,
    "confidence": "medium",
    "trend": "rising",
    "prevRate": 0.69,
    "delta": 0.02,
    "explanation": "...",
    "explanationSource": "ai"
  }
}
```

## 注意事项

1. **旧文件保留**: `scoring-engine.ts` 未修改，可做回滚备用
2. **其他引用**: `scoring/batch/route.ts` 和 `scoring/history/route.ts` 仍引用旧版，可按需后续更新
3. **类型兼容**: v2 输出包含 v1 所有字段（rate, confidence, trend），前端可渐进式适配 lower/upper/effectiveSampleSize
