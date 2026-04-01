# TASK-035 执行清单

## Agent 2 执行步骤

- [ ] 1. 阅读 `30_execution/ap-tracker/src/lib/scoring-engine.ts` 理解当前实现
- [ ] 2. 阅读 `00_input/2026-04-01-5分率算法与PRD.md` Step 1-8 理解新算法
- [ ] 3. 新建 `scoring-engine-v2.ts`，实现加权 Beta 贝叶斯模型
- [ ] 4. 实现 logisticSupport 函数
- [ ] 5. 实现 Beta 更新逻辑（先验 + 测试证据累加）
- [ ] 6. 实现区间计算（正态近似 90% 区间）
- [ ] 7. 实现置信等级（基于区间宽度）
- [ ] 8. 实现复习质量微调层
- [ ] 9. 实现遗忘衰减
- [ ] 10. 更新 `scoring/calculate/route.ts` 返回 lower/upper/effectiveSampleSize
- [ ] 11. 更新 `daily-update/route.ts` 返回 lower/upper
- [ ] 12. 写测试验证：0/1/10+ 条记录，区间收敛
- [ ] 13. 写 `30_execution/TASK-035-report.md`
