# TASK-030: Daily Update 数据流修正 + Confidence 展示对齐

## 目标
修复 Agent 3 产品审查中发现的 1 个 P1 和 2 个 P2：
1. daily-update 前端提交字段与 API 预期字段不一致
2. personal 页面错误地按 avgFiveRate 计算 confidence
3. personal/[subjectId] 页面错误地按 fiveRate 计算 confidence

## 背景
当前产品功能已基本齐全，但存在关键数据流问题：daily-update 提交可能因字段名不一致而失败；两个页面的 confidence 展示也绕过了 TASK-029 的 recency-aware 语义。

## 要做什么
### P1
- 统一 daily-update page 与 `/api/daily-update` route 的字段命名
- 前端应发送：`updateDate`, `activityType`, `durationMinutes`, `description`
- 或在 API 增加兼容映射层（二选一，但要明确）

### P2
- `personal/page.tsx` 使用 API 返回的 `confidenceLevel`
- `personal/[subjectId]/page.tsx` 使用 API 返回的 `confidenceLevel`
- 不再按分数区间在前端重算 confidence

## 如何验证
- daily-update 提交成功，API 能收到完整字段
- personal 页 confidence 与 API 一致
- subject detail 页 confidence 与 API 一致
- build 通过

## 回报内容
- 选择了“前端改字段”还是“API兼容映射”
- 哪些文件改了
- 提交 daily-update 的验证结果
- 两个 confidence 展示页的验证结果
