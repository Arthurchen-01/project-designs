# Project Designs & Demos

> 项目设计构思 · 软件开发思考 · 成品 Demo 集合

**Author:** Arthur Chen  
**Created:** 2026-03-29

---

## 📚 目录结构

```
project-designs/
├── README.md                    ← 本文件
├── ap-learning-platform/        ← AP 学习平台项目
│   ├── DESIGN.md               ← 完整设计方案
│   ├── V1-ROADMAP.md           ← v1 开发路线图
│   └── assets/                 ← 相关资源
└── heartbeat-demo/             ← AI 自动运行模式 Demo
    ├── README.md               ← Demo 说明
    ├── TASK-LIST.md            ← 任务清单
    ├── walkthrough.md          ← 演示说明
    └── demo-project/           ← Demo 项目文件
```

---

## 🎯 项目列表

### 1. AP 多模态 AI 学习伴侣

**定位：** 以 Bluebook 模考体验为外壳，以多模态 AI 学伴为核心，以"提问—理解—追问—记录—复习"为主线的 AP 陪伴式学习系统。

**核心创新：**
- PDF 伴读工作台（左侧 PDF + 右侧 AI 对话）
- 静默识别学习流（先识别，不说话，等用户发问）
- 苏格拉底式教学法（引导式提问，不直接给答案）
- 四位老师人格系统（剑心/明日香/三笠/小樱）

**技术栈：**
- 前端：原生 HTML/CSS/JS
- PDF：pdf.js
- AI：OpenAI / Gemini / Claude
- 部署：GitHub Pages

**相关文档：**
- [完整设计方案](./ap-learning-platform/DESIGN.md)
- [v1 开发路线图](./ap-learning-platform/V1-ROADMAP.md)

---

### 2. HeartBeat - AI 自动运行模式 Demo

**定位：** 展示 AI Agent 如何自主循环执行任务的演示项目。

**核心概念：**
- 心跳机制（HeartBeat）- AI 周期性检查并执行任务
- 多 Agent 协作
- 任务队列管理
- 执行状态追踪

**相关文档：**
- [Demo 说明](./heartbeat-demo/README.md)
- [任务清单](./heartbeat-demo/TASK-LIST.md)
- [演示说明](./heartbeat-demo/walkthrough.md)

---

## 🛠️ 使用方法

### 克隆仓库

```bash
git clone https://github.com/Arthurchen-01/project-designs.git
cd project-designs
```

### 查看文档

```bash
# 查看 AP 学习平台设计
cat ap-learning-platform/DESIGN.md

# 查看 HeartBeat Demo 说明
cat heartbeat-demo/README.md
```

### 作为三 Agent 运行仓库使用

这个仓库现在也可以直接作为三机协作的共享 runtime 仓库使用。

新增的运行骨架包括：

- `AGENTS.md`
- `HEARTBEAT.md`
- `00_input/`
- `10_architecture/`
- `20_tasks/`
- `30_execution/`
- `40_review/`
- `memory/`
- `system/`

推荐做法：

1. 三台机器分别 clone 同一个仓库
2. 每台机器在仓库根目录写自己的 `.agent-role.local`
3. 1号、2号、3号通过仓库而不是聊天直接协作
4. 具体落地说明见 `docs/THREE-SERVER-BOOTSTRAP.md`
5. 风险与故障排查见 `docs/THREATS-AND-DEBUG.md`

---

## 📝 设计理念

### 为什么分开管理？

1. **设计方案**：记录完整的思考过程、技术选型、架构设计
2. **开发路线图**：明确的阶段性目标和优先级
3. **Demo 项目**：可运行的原型，验证核心概念

### 分支策略

- `main` - 主分支，包含所有设计文档
- `v1-dev` - v1 版本开发分支（AP 学习平台）
- `heartbeat-demo` - AI 自动运行模式演示

---

## 🔗 相关链接

- **AP 学习平台线上版：** https://arthurchen-01.github.io/could-coding/
- **GitHub Profile：** https://github.com/Arthurchen-01

---

## 📅 更新日志

### 2026-03-29
- 创建 repository
- 添加 AP 学习平台完整设计方案
- 添加 v1 开发路线图
- 添加 HeartBeat Demo 项目

---

**由 OpenClaw Agent 协助整理 · 2026-03-29**
