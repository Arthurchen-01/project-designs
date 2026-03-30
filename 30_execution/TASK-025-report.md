# TASK-025 执行报告

## 任务：AI 生成变化解释

**执行时间：** 2026-03-30
**执行人：** Agent 2

---

## 产出

### 1. `src/lib/explanation.ts` — 新增 `generateExplanationWithAI()`

**签名：**
```typescript
async function generateExplanationWithAI(ctx: ExplanationContext): Promise<ExplanationResult>
```

**输入上下文：**
- `prevRate` — 上次5分率
- `curr` — 当前评分输出（含 testPerformance/stabilityScore/reviewQualityScore/trend/confidence）
- `studentName` — 学生姓名
- `subjectName` — 科目名称
- `recentActivities` — 最近5条活动摘要（用于 AI 理解连贯性）

**Prompt 设计：**
- System：AP备考教练语气，2-3句简洁中文，不罗列数据，重点说原因和下一步
- User：包含所有评分组件和活动摘要

**降级策略：**
- AI 不可用（未配置 API Key）→ 自动降级到规则版 `generateExplanation()`
- AI 调用超时/错误 → 降级到规则版

**返回：**
```typescript
{ text: string; source: 'ai' | 'rule' }
```

### 2. `src/app/api/daily-update/route.ts` — 集成 AI 解释

- POST handler 增加：获取学生姓名 + 科目名称
- 获取最近5条活动摘要用于上下文
- 调用 `generateExplanationWithAI()` 替代 `generateExplanation()`
- 返回新增 `explanationSource: 'ai' | 'rule'` 字段

### 3. 页面改造 — `[classId]/daily-update/page.tsx`

- `scoringResult` 状态类型新增 `explanationSource: 'ai' | 'rule'`
- 提交成功后在解释文字下方显示来源标签：
  - 🤖 AI 生成（indigo 标签）
  - 📐 规则生成（gray 标签）

---

## 验收检查

| 检查项 | 状态 |
|---|---|
| AI 可用时生成自然语言解释 | ✅ |
| AI 不可用时降级到规则版 | ✅ |
| Prompt 包含学生姓名/科目/活动上下文 | ✅ |
| 页面显示解释来源标签 | ✅ |
| `npm run build` 无错误 | ✅ |

---

## 构建结果

```
✓ npm run build — 0 errors
ƒ /[classId]/daily-update  6.13 kB
ƒ /api/daily-update        156 B
```
