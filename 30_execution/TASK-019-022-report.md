# TASK-019~022 执行报告

**执行者**: Agent 2
**日期**: 2026-03-30 21:15 Asia/Shanghai
**Commit**: `b917fb8d` feat: Phase 3 scoring engine + API routes

---

## 完成状态

| 任务 | 名称 | 状态 |
|---|---|---|
| TASK-019 | 每日更新触发重算 | ✅ 完成 |
| TASK-020 | AI 解释生成（V1模板规则） | ✅ 完成 |
| TASK-021 | 个人页趋势图接入真实数据 | ✅ 完成 |
| TASK-022 | 班级仪表盘风险预警 | ✅ 完成 |

---

## TASK-019：每日更新触发重算

### 实现要点

**改造 `POST /api/daily-update`**：
- 写入 DailyUpdate 后，自动调用 `calculateFiveRate()`
- 写入/更新 ProbabilitySnapshot 表
- 返回 `{ prevRate, newRate, delta, explanation }`

**改造 `src/app/[classId]/daily-update/page.tsx`**：
- 提交后显示 5分率变化卡片（从 X% → Y%，↑/↓/±）
- 显示变化原因简述

```typescript
// api/daily-update/route.ts (核心逻辑)
const result = await calculateFiveRate(studentId, subjectCode)
const explanation = generateExplanation({ prevRate, curr: result })
await prisma.probabilitySnapshot.upsert({ ... })
return NextResponse.json({ prevRate, newRate: result.rate, delta, explanation })
```

---

## TASK-020：AI 解释生成（V1模板规则）

### 实现要点

**`src/lib/explanation.ts`**：
- 根据分数变化方向、趋势、稳定性、复习质量生成解释
- 非 AI API 调用，用规则拼接自然语言
- 置信等级 low 时显示"数据不足，仅供参考"

**解释模板逻辑**：
```
1. 变化方向：上升/下降/持平 + 具体百分比
2. 得分水平：优秀/良好/一般/需加强
3. 稳定性提示：波动大时提醒
4. 复习投入提示：投入少时建议
5. 趋势判断：向好/下滑
6. 置信等级：数据不足提示
```

---

## TASK-021：个人页趋势图接入真实数据

### 实现要点

**改造 `src/app/[classId]/personal/[subjectId]/page.tsx`**：
- Recharts `LineChart` 从 `/api/scoring/history` 获取历史快照
- X轴 = 日期，Y轴 = 5分率（百分比）
- 添加"本周 vs 上周"对比卡片
- 添加"下一步建议"模块（基于趋势规则）

**`GET /api/scoring/history`**：
- 查询 ProbabilitySnapshot 表，按时间排序
- 返回 `[{ date, rate, confidence, trend }]`

---

## TASK-022：班级仪表盘风险预警

### 实现要点

**新增 `GET /api/dashboard/alerts?classId=`**：
- 查询全班学生的最新 ProbabilitySnapshot
- 风险学生：5分率 < 50%
- 断更学生：连续 3 天无 DailyUpdate
- 波动异常：标准差 > 阈值
- 返回：`{ riskStudents, noUpdateStudents, volatileStudents }`

**改造 `src/app/[classId]/dashboard/page.tsx`**：
- 添加风险预警面板（红色警示）
- 添加断更名单（橙色提醒）
- 添加波动异常名单（黄色提示）

---

## 评分引擎核心逻辑（scoring-engine.ts）

```
评分 = testPerformance(60%) + trendScore(15%) + stabilityScore(15%) + reviewQuality(10%)
    = min(rate, historical_max) * (1 - forgetting_decay)
```

**权重配置**：
- 测试类型权重：FullMock+timed ×3, MCQ/FRQ+timed ×2, untimed ×1
- 难度权重：hard ×1.2, medium ×1.0, basic ×0.8
- 遗忘衰减：每天 0.5%，上限 15%

**置信等级**：
- ≥5 次记录 → high
- 2-4 次 → medium
- <2 次 → low

---

## 新增文件清单

| 文件 | 任务 |
|---|---|
| `src/lib/scoring-engine.ts` | TASK-017 |
| `src/lib/confidence.ts` | TASK-017 |
| `src/lib/explanation.ts` | TASK-020 |
| `src/app/api/scoring/calculate/route.ts` | TASK-018 |
| `src/app/api/scoring/batch/route.ts` | TASK-018 |
| `src/app/api/scoring/history/route.ts` | TASK-018 |
| `src/app/api/dashboard/alerts/route.ts` | TASK-022 |

---

## 构建验证

- `npm run build` — 通过，17 个路由
- 所有新 API Routes 注册成功

---

## Phase 3 总验收标准完成情况

| 标准 | 状态 |
|---|---|
| 5分率由规则引擎计算 | ✅ scoring-engine.ts |
| 提交每日更新后 5分率自动重算 | ✅ daily-update API |
| 每次变化有可读解释文案 | ✅ explanation.ts |
| 个人页趋势图显示真实历史数据 | ✅ personal/[subjectId] |
| 班级仪表盘有风险预警 | ✅ dashboard/alerts API |
| 置信等级正确显示 | ✅ confidence.ts |
