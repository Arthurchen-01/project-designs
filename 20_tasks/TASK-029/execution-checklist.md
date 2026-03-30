# TASK-029 执行清单

## 步骤 1: 审查现有置信度实现
- [ ] 阅读 `src/lib/confidence.ts`
- [ ] 找出所有 `getConfidenceLevel` / `calculateConfidence` 调用点
- [ ] 确认是否有未传 `daysSinceLastRecord` 的地方

## 步骤 2: 实现 recency-aware 逻辑
- [ ] high: `recordCount >= 5 && daysSinceLastRecord <= 30`
- [ ] medium: `recordCount >= 2 && daysSinceLastRecord <= 60`
- [ ] stale fallback: `recordCount >= 5` 但超时 → medium
- [ ] 其余 → low

## 步骤 3: 修正调用点
- [ ] personal summary / student API 传入最近记录天数
- [ ] subject detail / dashboard 若展示 confidence，也统一传值
- [ ] 默认值路径不误伤真实用户

## 步骤 4: 本地验证
- [ ] 构造 3 组样例（fresh enough / stale enough / low data）
- [ ] 验证输出等级正确
- [ ] `npm run build` 通过

## 步骤 5: 报告
- [ ] 更新 `30_execution/STATUS-REPORT.md`
- [ ] 更新 `30_execution/HANDOFF.md`
- [ ] 写 `30_execution/TASK-029-report.md`
