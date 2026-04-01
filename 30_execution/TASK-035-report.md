# TASK-035 报告

## 执行者：Agent 2
## 日期：2026-04-01
## 状态：✅ 完成

### 完成内容

1. **新建 `scoring-engine-v2.ts`** — 加权 Beta 贝叶斯评分引擎（10KB）
   - `logisticSupport()` — 得分率→支持度映射（slope=7，cutoff 按科目配置）
   - Beta 更新：先验 Beta(2,2) + 测试证据累加（w × m × q）
   - 90% 可信区间（正态近似 mean ± 1.645σ）
   - 置信等级：区间宽度 ≤15%→high, ≤30%→medium, >30%→low
   - 复习微调层：AI qualityScore ±2%（高置信减半）
   - 遗忘衰减：每天 0.5%，上限 15%
   - 科目 cutoff 中心值：AP Macro=60, AP Stats=62, AP Biology=64

2. **更新 `scoring/calculate/route.ts`** — 改用 v2 引擎
   - 返回新增：lower, upper, effectiveSampleSize, alpha, beta

3. **更新 `daily-update/route.ts`** — 改用 v2 引擎
   - scoring 结果新增 lower/upper/effectiveSampleSize

### 参数表

| 参数 | 值 | 说明 |
|------|------|------|
| ALPHA_0 | 2 | Beta 先验 alpha |
| BETA_0 | 2 | Beta 先验 beta |
| slope | 7 | logistic 过渡斜率 |
| DECAY_PER_DAY | 0.005 | 每天遗忘衰减 0.5% |
| DECAY_CAP | 0.15 | 衰减上限 15% |
| REVIEW_MAX_ADJUST | 0.02 | 复习微调最大 ±2% |

### 与旧版差异

| 特性 | 旧版 (v1) | 新版 (v2) |
|------|-----------|-----------|
| 核心模型 | 加权平均 | 加权 Beta 贝叶斯 |
| 区间输出 | ❌ 无 | ✅ 90% 可信区间 |
| 置信等级 | 基于记录数+最近性 | 基于区间宽度 |
| 支持度函数 | 阈值判断 | logistic 平滑过渡 |
| 先验 | 无 | Beta(2,2) |
| 有效样本量 | 无 | ✅ 有 |

### 注意事项
- 旧版 `scoring-engine.ts` 保留未动，可回滚
- `scoring/batch/route.ts` 和 `scoring/history/route.ts` 仍引用旧版
- v2 输出向后兼容（保留 rate/confidence/trend 字段）
