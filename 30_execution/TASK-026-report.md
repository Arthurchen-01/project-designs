# TASK-026 执行报告

## 任务：AI 学习建议

**执行时间：** 2026-03-30
**执行人：** Agent 2

---

## 产出

### 1. `src/lib/ai-advisor.ts`

**核心函数：**
```typescript
async function generateAdvice(studentId: string): Promise<AdvisorResult>
```

**AI 版逻辑（`aiGenerateAdvice`）：**
- 调用 OpenAI API，传入学生各科5分率、趋势
- System prompt：AP备考教练，3条具体可操作建议，每条≤20字，中文
- 解析 AI 输出提取编号行作为3条建议
- 每科建议使用规则版（AI 每科单独调用成本过高）

**规则降级版（`ruleBasedAdvice`）：**
- 找出最薄弱科目（< 50%）→ 建议优先提升
- 有下滑趋势科目 → 建议调整复习计划
- 优势科目稳定 → 建议时间分配给薄弱科目
- 无明显问题时 → 建议保持规律学习

**降级策略：** AI API Key 未配置或调用失败 → 自动降级到规则版

### 2. API Route — `GET /api/ai/advice`

- 读取 `ap_student_id` cookie
- 调用 `generateAdvice(studentId)`
- 返回 `overallAdvice[]` + `subjectAdvices[]` + `source`

### 3. 页面改造 — `personal/page.tsx`

- 登录后自动调用 `/api/ai/advice` 获取建议
- 每科卡片下方显示 AI 给出的个性化学习建议（💡图标）
- 页面底部新增 **AI 学习建议** 模块：
  - 3条编号建议
  - 来源标签：🤖 AI 生成（indigo）/ 📐 规则生成（gray）
  - 加载中显示 spinner

---

## 验收检查

| 检查项 | 状态 |
|---|---|
| `generateAdvice()` 函数 | ✅ |
| AI 可用时生成3条具体建议 | ✅ |
| AI 不可用时降级到规则版 | ✅ |
| `/api/ai/advice` API | ✅ |
| 个人中心底部 AI 建议模块 | ✅ |
| 每科卡片显示建议 | ✅ |
| `npm run build` 无错误 | ✅ |

---

## 构建结果

```
✓ npm run build — 0 errors
ƒ /[classId]/personal         2.65 kB
ƒ /api/ai/advice              158 B
```
