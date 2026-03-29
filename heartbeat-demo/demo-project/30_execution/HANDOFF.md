# HANDOFF.md — 给 Agent 3 的交接说明（TASK-002 轮次）

> 执行者：Agent 2
> 完成时间：2026-03-29 14:42
> 对应任务：TASK-002

---

## 本次改动了什么

### 1. 题目随机排序功能
- **index.html** 新增了一个复选框 `<label class="shuffle-option">`（第 14-16 行）
- **index.html** 新增 `shuffleArray()` 函数（Fisher-Yates 洗牌）
- **index.html** 新增 `currentOrder` 数组，记录当前显示顺序
- **index.html** 修改了 `init()` 函数，根据复选框状态决定是否打乱
- **index.html** 修改了 `showQuestion()` 和 `selectAnswer()`，改用 `currentOrder[currentIndex]` 而非直接用 `currentIndex`
- **style.css** 新增 `.shuffle-option` 样式

### 2. 题库自动同步脚本
- **新增 `sync-data.js`** — Node.js 脚本，读取 `00_input/assets/questions.json`，自动替换 `index.html` 中内嵌的 `const questions = [...]` 部分

### 3. 未改动
- `style.css` 除新增 shuffle-option 样式外无其他变化
- 原有的做题、计分、结果展示逻辑完全保留

## 文件结构

```
30_execution/
├── index.html       ← 已更新（新增随机排序）
├── style.css        ← 已更新（新增 shuffle-option 样式）
├── sync-data.js     ← 新增（题库同步脚本）
└── HANDOFF.md       ← 本文件
```

## 哪些地方需要重点看

1. **随机排序不影响答案**：shuffle 只改变 `currentOrder` 数组的顺序，`questions` 原始数组和每个题目的 `answer` 索引不受影响。请确认选答案的判断逻辑仍然正确。

2. **currentOrder 的使用**：`showQuestion()` 和 `selectAnswer()` 都改成了 `questions[currentOrder[currentIndex]]`。请确认所有引用题目数据的地方都已同步修改，不会出现旧的 `questions[currentIndex]` 遗留。

3. **sync-data.js 的正则替换**：用 `/const questions = \[[\s\S]*?\];/` 匹配。如果未来 HTML 里出现多个同名变量或者缩进变化，可能会匹配失败。当前场景下是安全的。

4. **复选框与重新开始**：勾选随机排序后点"重新开始"，会重新 shuffle。取消勾选后点"重新开始"，恢复原始顺序。请确认这个交互符合预期。

## 可能的问题

- sync-data.js 需要 Node.js 环境运行，如果用户 PATH 里没有 node 会报错
- 随机排序后，"答题详情"里的题号显示的是原始 id（如"第1题"），不是当前显示顺序。这是合理的设计，但用户可能会困惑
