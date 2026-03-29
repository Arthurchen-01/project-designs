# 三 Agent 协作 Demo — 完整走读指南

> 场景：你要做一个 AP 微积分刷题网页，三个 Agent 帮你协作完成。
> 整个过程走了两轮：第一轮做基础版，第二轮加随机排序和题库同步。

---

## 一、先看最终产物

在 `demo-project/30_execution/` 目录下，有三个文件：
- `index.html` — 刷题页面（双击用浏览器打开就能做题）
- `style.css` — 样式
- `sync-data.js` — 题库同步脚本

**试一下**：把 `30_execution/index.html` 用浏览器打开，做几道题看看效果。

---

## 二、整个流程是怎么走的

### 时间线

```
14:00  你（用户）写了需求
14:05  Agent 1 读需求，写架构 + 拆任务卡
14:08  Agent 1 发了 TASK-001
14:10  Agent 2 看到 TASK-001，开始执行
14:18  Agent 2 完成，写了 index.html + style.css + HANDOFF.md
14:25  Agent 3 审查，通过，删了 TASK-001
14:30  Agent 1 看到审查报告，发了 TASK-002（根据 Agent 3 的改进建议）
14:35  Agent 2 执行 TASK-002，加了随机排序 + sync-data.js
14:42  Agent 2 完成，更新了 HANDOFF.md
14:50  Agent 3 审查，通过，删了 TASK-002
       项目完成 ✅
```

### 每一步谁写了什么文件

| 步骤 | 谁 | 写了什么 | 位置 |
|------|-----|---------|------|
| 1 | 用户 | requirement.md + questions.json | 00_input/ |
| 2 | Agent 1 | project-brief.md | 10_architecture/ |
| 3 | Agent 1 | TASK-001/task-card.md | 20_tasks/ |
| 4 | Agent 2 | index.html + style.css + HANDOFF.md | 30_execution/ |
| 5 | Agent 3 | review-20260329-1425.md + 删除 TASK-001 | 40_review/ |
| 6 | Agent 1 | TASK-002/task-card.md | 20_tasks/ |
| 7 | Agent 2 | 修改 index.html + sync-data.js + 更新 HANDOFF.md | 30_execution/ |
| 8 | Agent 3 | review-20260329-1450.md + 删除 TASK-002 | 40_review/ |

---

## 三、每个文件夹是干什么的

```
demo-project/
├── 00_input/               ← 你（用户）写的需求和资源
│   ├── requirement.md      ← "我要做一个刷题页"
│   └── assets/
│       └── questions.json  ← 题库数据
│
├── 10_architecture/        ← Agent 1 写的架构方案
│   └── project-brief.md    ← "技术方案：纯 HTML/CSS/JS，不内嵌 JSON"
│
├── 20_tasks/               ← Agent 1 发的任务卡（用完就删）
│                           ← 当前是空的，说明所有任务都完成了
│
├── 30_execution/           ← Agent 2 的执行产物
│   ├── index.html          ← 最终的刷题页面
│   ├── style.css           ← 样式
│   ├── sync-data.js        ← 题库同步脚本
│   └── HANDOFF.md          ← 给 Agent 3 的交接说明
│
├── 40_review/              ← Agent 3 的审查报告
│   ├── review-20260329-1425.md  ← 第一轮审查（通过）
│   └── review-20260329-1450.md  ← 第二轮审查（通过）
│
└── memory/                 ← 每个 Agent 的记忆（这个 demo 里没用到）
    ├── agent-1/
    ├── agent-2/
    └── agent-3/
```

---

## 四、关键概念解释

### 1. "仓库是唯一真相源"

三个 Agent 不通过聊天传话。所有信息都写到仓库文件里：
- Agent 1 不会在飞书里告诉 Agent 2 "去做这个"，而是写一个 task-card.md
- Agent 2 不会在微信里告诉 Agent 3 "我做完了"，而是写一个 HANDOFF.md
- Agent 3 不会在群里说"我通过了"，而是写 review 报告 + 删 task 文件

### 2. "Task 是一次性票据"

- Agent 1 发一张 task 卡 → Agent 2 执行 → Agent 3 审查 → **删除 task**
- 删除 = 标记完成。20_tasks/ 文件夹空了 = 所有任务做完了
- 有新需求？Agent 1 再发一张新 task，不用旧的

### 3. "Architecture 是长期控制面"

- `10_architecture/project-brief.md` 从头到尾都不删
- Agent 1 每轮都会更新它（根据审查反馈修正）
- Agent 2 和 Agent 3 每次开工都先读它，了解整体方向

### 4. "HANDOFF.md 是交接棒"

Agent 2 做完后必须写 HANDOFF.md，告诉 Agent 3：
- 我做了什么
- 哪些地方需要重点看
- 哪些地方可能有问题

这让 Agent 3 不需要从头到尾读代码，而是知道重点看哪里。

### 5. "审查通过 = 删除 task"

不需要额外的"确认消息"。Agent 3 删掉 task 文件，就是最明确的"通过"信号。Agent 1 下次 heartbeat 时 `git pull`，发现 20_tasks/ 空了，就知道任务完成了。

---

## 五、如果你要自己跑一遍

### 前提
你有三个 OpenClaw 实例（或者三个 AI agent），分别扮演 Agent 1、2、3。

### 步骤

1. **你（用户）**：写 `00_input/requirement.md`，放好 `assets/questions.json`
2. **Agent 1**（heartbeat 检查到 00_input/ 有新文件）：
   - 读 requirement.md
   - 写 10_architecture/project-brief.md
   - 写 20_tasks/TASK-001/task-card.md
   - git push
3. **Agent 2**（heartbeat 检查到 20_tasks/ 有新 task）：
   - 读 task-card.md
   - 读 architecture 了解上下文
   - 执行，写 index.html + style.css 到 30_execution/
   - 写 HANDOFF.md
   - git push
4. **Agent 3**（heartbeat 检查到 30_execution/ 有新文件）：
   - 读 requirement.md + project-brief.md + task-card.md
   - 读 index.html + style.css + HANDOFF.md
   - 写 40_review/review-xxx.md
   - 通过 → 删除 20_tasks/TASK-001/
   - git push
5. **Agent 1**（下一次 heartbeat，git pull 发现 task 被删）：
   - 读 review 报告
   - 根据改进建议发 TASK-002
   - git push
6. 循环直到 20_tasks/ 为空

---

## 六、这个 Demo 想让你理解的核心

```
你（用户）
  │
  │  只管写需求
  ▼
00_input/ ──→ Agent 1 读
                │
                │  写架构 + 拆任务
                ▼
              10_architecture/ + 20_tasks/ ──→ Agent 2 读
                                                │
                                                │  执行 + 写交接说明
                                                ▼
                                              30_execution/ + HANDOFF.md ──→ Agent 3 读
                                                                              │
                                                                              │  审查 + 通过则删 task
                                                                              ▼
                                                                            40_review/ ──→ Agent 1 读
                                                                                            │
                                                                                            │  有新建议？发新 task
                                                                                            ▼
                                                                                          回到顶部循环
```

**你永远不需要告诉 Agent "下一步做什么"。** 你只写需求，Agent 1 拆任务，Agent 2 执行，Agent 3 审查。整个流水线自动运转。
