# HeartBeat - AI 自动运行模式 Demo

> 三 Agent 自动协作 · 飞书指令触发 · GitHub 上线

**Created:** 2026-03-29

---

## 🎯 这是什么？

一个演示项目，展示 **AI Agent 如何自主循环执行任务**。

核心概念：
- **心跳机制（HeartBeat）**：AI 周期性检查并执行任务
- **多 Agent 协作**：三个 Agent 各司其职，接力完成任务
- **任务队列管理**：通过文件系统管理任务流转
- **执行状态追踪**：全程可追踪、可回放

---

## 🏗️ 架构概览

```
飞书群聊
  │
  │  你发："给物理C电磁加一套2025年真题"
  │
  ▼
Agent 1（大哥/本地 Windows）──飞书 Bot
  │  读需求 → 写架构 → 发 task 卡
  │  git push 到仓库
  ▼
Agent 2（二弟/云服务器）──飞书 Bot
  │  git pull → 发现新 task → 执行代码
  │  写 30_execution/ + HANDOFF.md
  │  git push
  ▼
Agent 3（三哥/云服务器）──飞书 Bot
  │  git pull → 看到执行结果 → 审查
  │  写 40_review/ → 通过则删 task
  │  git push
  ▼
  │  飞书群聊通知你："✅ 任务完成，已推送到 GitHub"
```

---

## 📁 目录结构

```
demo-project/
├── 00_input/               ← 你（用户）写的需求和资源
│   ├── requirement.md      ← 需求描述
│   └── assets/
│       └── questions.json  ← 题库数据
│
├── 10_architecture/        ← Agent 1 写的架构方案
│   └── project-brief.md    ← 技术方案
│
├── 20_tasks/               ← Agent 1 发的任务卡（用完就删）
│                           ← 空 = 所有任务完成
│
├── 30_execution/           ← Agent 2 的执行产物
│   ├── index.html          ← 最终产物
│   ├── style.css           ← 样式
│   ├── sync-data.js        ← 数据同步脚本
│   └── HANDOFF.md          ← 给 Agent 3 的交接说明
│
├── 40_review/              ← Agent 3 的审查报告
│   ├── review-xxx.md       ← 审查记录
│
└── memory/                 ← 每个 Agent 的记忆
    ├── agent-1/
    ├── agent-2/
    └── agent-3/
```

---

## 🔄 工作流程

### 核心原则

1. **仓库是唯一真相源**
   - 三个 Agent 不通过聊天传话
   - 所有信息都写到仓库文件里

2. **Task 是一次性票据**
   - Agent 1 发 task → Agent 2 执行 → Agent 3 审查 → **删除 task**
   - 删除 = 标记完成
   - 20_tasks/ 空了 = 所有任务做完了

3. **Architecture 是长期控制面**
   - `10_architecture/project-brief.md` 从头到尾都不删
   - Agent 1 每轮都会更新它

4. **HANDOFF.md 是交接棒**
   - Agent 2 做完后写 HANDOFF.md
   - 告诉 Agent 3：做了什么、重点看哪里、可能有什么问题

5. **审查通过 = 删除 task**
   - Agent 3 删掉 task 文件 = 最明确的"通过"信号

---

## 📋 完整 Task List

### Phase 0：基础设施（手动配置）

- [ ] Task 0.1：统一协作仓库
- [ ] Task 0.2：配置三个 Agent 的 AGENTS.md
- [ ] Task 0.3：配置三个 Agent 的 HEARTBEAT.md
- [ ] Task 0.4：配置三个 Agent 的飞书 Bot

### Phase 1：单 Agent 验证

- [ ] Task 1.1：验证 Agent 1 能读需求 + 写架构
- [ ] Task 1.2：验证 Agent 2 能发现任务 + 执行
- [ ] Task 1.3：验证 Agent 3 能审查 + 删 task

### Phase 2：串联测试

- [ ] Task 2.1：手动触发全流程
- [ ] Task 2.2：飞书指令触发全流程

### Phase 3：实际场景

- [ ] Task 3.1：数据转换 pipeline
- [ ] Task 3.2：新功能开发
- [ ] Task 3.3：Bug 修复

### Phase 4：自动化通知

- [ ] Task 4.1：飞书完成通知
- [ ] Task 4.2：GitHub Pages 自动部署验证

### Phase 5：持续优化

- [ ] Task 5.1：记忆系统
- [ ] Task 5.2：多项目支持

---

## 🚀 快速开始

### 1. 查看 Demo 成果

```bash
cd demo-project/30_execution/
# 用浏览器打开 index.html
```

### 2. 阅读完整走读指南

查看 [walkthrough.md](./walkthrough.md) 了解完整流程。

### 3. 阅读任务清单

查看 [TASK-LIST.md](./TASK-LIST.md) 了解如何搭建自己的三 Agent 协作系统。

---

## 💡 核心理念

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

**你永远不需要告诉 Agent "下一步做什么"。**

你只写需求，Agent 1 拆任务，Agent 2 执行，Agent 3 审查。整个流水线自动运转。

---

## 📚 相关文档

- [完整走读指南](./walkthrough.md) - 了解整个流程是如何运转的
- [任务清单](./TASK-LIST.md) - 如何搭建自己的三 Agent 协作系统
- [Demo 项目文件](./demo-project/) - 实际的文件结构和内容

---

## 🔗 应用场景

这个模式可以用于：

1. **自动化开发任务**
   - 飞书发一句话 → Agent 自动写代码 → 审查 → 上线

2. **数据处理 Pipeline**
   - 数据转换、清洗、验证全流程自动化

3. **持续集成/部署**
   - 代码提交 → 自动测试 → 自动部署

4. **知识管理**
   - 文档整理、知识库更新、报告生成

---

## ⚙️ 技术栈

- **Agent 框架：** OpenClaw
- **协作方式：** Git + 文件系统
- **触发方式：** HeartBeat（心跳）+ 飞书 Bot
- **部署：** GitHub Pages

---

*HeartBeat Demo · 让 AI 自动跑起来*