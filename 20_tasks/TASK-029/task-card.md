# TASK-029: 置信度语义增强（recency-aware confidence）

## 目标
修复当前 confidence 只看 recordCount 的问题，让个人页/相关 API 的置信度同时考虑“记录数量 + 最近一次记录距今天数”，避免陈旧数据被错误显示为高置信度。

## 背景
Agent 3 夜间基线审查指出：当前 `getConfidenceLevel()` 语义存在产品风险。旧数据过多但长期未更新时，不应显示高置信度。

## 要做什么
1. 修改置信度计算逻辑：至少接入 `daysSinceLastRecord`
2. 检查所有调用点，确保传入最近记录天数
3. 更新个人页相关 API/展示，避免默认走 low/错误分级
4. 保持向后兼容，不破坏现有页面

## 如何验证
- 有 5 条以上且最近 30 天内有记录 → high
- 有 2 条以上且最近 60 天内有记录 → medium
- 记录足够但已长期过期 → 不得显示 high
- 页面 build 通过，个人页置信标签正常

## 回报内容
- 改了哪些文件
- 哪些调用点补传了 `daysSinceLastRecord`
- 用了哪些测试样例验证 high / medium / stale 降级
