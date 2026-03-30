# TASK-017/018 执行报告

**日期**: 2026-03-30  
**执行者**: Agent 2  
**状态**: ✅ 完成

---

## TASK-017：5 分率规则引擎 V1

### 产出文件
| 文件 | 说明 |
|------|------|
| `src/lib/confidence.ts` | 置信等级判断工具函数 |
| `src/lib/scoring-engine.ts` | 评分引擎核心模块 |

### 实现要点
- **测试表现分 (60%)**: 加权平均，FullMock+timed 权重 3，MCQ/FRQ+timed 权重 2，untimed 权重 1
- **趋势分 (15%)**: 最近 5 次 scorePercent 线性回归，正斜率 → 0.7+，负斜率 → 0.3+，不足 3 次 → 0.5
- **稳定性分 (15%)**: `1 - (stdDev / 50)`，限制 [0,1]
- **复习质量分 (10%)**: 按最近 7 天 DailyUpdate 活动分级：有测试成绩 0.7 > 有详细描述 0.5 > 简短描述 0.3 > 无更新 0.1
- **遗忘衰减**: 距最后活动每 1 天衰减 0.5%，上限 10%
- **置信等级**: ≥5 high, 2-4 medium, <2 low
- 最终 fiveRate 限制在 [0.01, 0.99]

---

## TASK-018：评分引擎 API + 快照存储

### 产出文件
| 文件 | 说明 |
|------|------|
| `src/app/api/scoring/calculate/route.ts` | POST 单人计算 + 写快照 |
| `src/app/api/scoring/batch/route.ts` | POST 全班批量计算 |
| `src/app/api/scoring/history/route.ts` | GET 历史快照（趋势图用） |

### API 规范
- **calculate**: `POST { studentId, subjectCode }` → 计算结果 + ProbabilitySnapshot
- **batch**: `POST { classId }` → 遍历学生×科目，批量写快照，返回 `{ total, updated, results[] }`
- **history**: `GET ?studentId=&subjectCode=` → 按 snapshotDate 升序返回快照数组

---

## 验证
- `npm run build` → ✅ Compiled successfully，TypeScript 无错误
- 3 个 API route 均出现在路由表中
- git commit: `addf6d0`，本地已提交（无远程 remote，未 push）
