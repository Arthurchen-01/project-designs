# 飞书指令 → 三 Agent 自动协作 → GitHub 上线：完整 Task List

> 目标：你在飞书群聊发一句话（如"给物理C电磁加一套2025年真题"），三个 Agent 自动完成：分析需求 → 写架构 → 拆任务 → 执行代码 → 审查 → push 到 GitHub。
> 你全程不需要干预，最后在飞书收到完成通知。

---

## 一、当前资产盘点

| 仓库 | 作用 | 当前状态 |
|------|------|---------|
| `Heart-Beat-War--3.28` | 三 Agent 协作框架（模板 + 部署指南） | ✅ 模板已完成 |
| `AP-Learning-Web` | AP 题库数据源 | ✅ 有 AGENTS.md + HEARTBEAT.md，已有 mock-data |
| `could-coding` | 主站（GitHub Pages 线上） | ✅ 功能基本完成，58 commits |
| `Special-for-Cloud-Server` | Agent 记忆/大脑 | ⚠️ 有规则文件，但和新框架不统一 |
| `study-pod` | 伴读导师插件 | ⚠️ 仅 1 commit，基本未开发 |

### 现有问题
1. AP-Learning-Web 的 AGENTS.md 用的是旧版"单 Agent + QQ 通知"模式，不是三 Agent 协作
2. could-coding 没有 AGENTS.md，Agent 不知道这是什么项目
3. Special-for-Cloud-Server 的规则文件定义了"双仓库阵地"，但和 Heart-Beat-War 框架的 "GitHub 作为唯一真相源" 冲突
4. 三个 Agent 的飞书 Bot 还没配好
5. 没有统一的协作仓库

---

## 二、目标架构

```
飞书群聊
  │
  │  你发："给物理C电磁加一套2025年真题"
  │
  ▼
Agent 1（大哥/本地 Windows）──飞书 Bot
  │  读需求 → 写架构 → 发 task 卡
  │  git push 到 could-coding
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
  │  你打开 GitHub Pages，改动已上线
```

### 核心原则
- **所有协作落到 GitHub 文件**，不靠飞书聊天传话
- **could-coding 是唯一的工作仓库**（代码 + 任务 + 架构都在这里）
- **Special-for-Cloud-Server 只存 Agent 记忆**（不参与任务流转）
- **飞书只是入口和通知渠道**，不是协作通道

---

## 三、完整 Task List（按顺序执行）

### Phase 0：基础设施（你手动做一次）

#### Task 0.1：统一协作仓库
**做什么：** 决定用哪个仓库作为三 Agent 的协作主仓库。

**决策：** 用 `could-coding`。因为：
- 它是最终产出物（线上站点）
- 代码、题库数据、脚本都在这
- GitHub Pages 部署指向这里

**你做的事：**
1. 在 `could-coding` 根目录创建 Heart-Beat-War 的目录结构：
```
could-coding/
├── 00_input/              ← 你写需求的地方
├── 10_architecture/       ← Agent 1 写架构
├── 20_tasks/              ← Agent 1 发任务卡（用完删）
├── 30_execution/          ← Agent 2 写执行结果
├── 40_review/             ← Agent 3 写审查报告
├── system/
│   ├── workflow-rules.md  ← 从 Heart-Beat-War 模板复制
│   └── naming-rules.md    ← 从 Heart-Beat-War 模板复制
├── memory/
│   ├── agent-1/
│   ├── agent-2/
│   └── agent-3/
├── exam/                  ← （已有，不动）
├── dashboard/             ← （已有，不动）
├── data/                  ← （已有，不动）
└── ...
```

2. 把这些目录 commit + push 到 GitHub

**测试：** 打开 GitHub 看到 `00_input/`、`10_architecture/` 等目录存在。

---

#### Task 0.2：配置三个 Agent 的 AGENTS.md
**做什么：** 每个 Agent 的 workspace 根目录各放一个 AGENTS.md，定义角色和行为。

**Agent 1（大哥/本地 Windows）的 AGENTS.md：**
```
workspace: C:\Users\25472\.openclaw\workspace-agent1\

根目录放 AGENTS.md，内容：读 Heart-Beat-War 模板的 agent1-AGENTS.md，
把所有路径从 "projects/*" 改成 could-coding 仓库内的路径。
```

**Agent 2（二弟/云服务器）的 AGENTS.md：**
```
workspace: /root/.openclaw/workspace-agent2\

根目录放 AGENTS.md，内容：读 Heart-Beat-War 模板的 agent2-AGENTS.md，
路径指向 could-coding 仓库。
核心职责：读 20_tasks/ → 执行代码 → 写 30_execution/ + HANDOFF.md
```

**Agent 3（三哥/云服务器）的 AGENTS.md：**
```
workspace: /root/.openclaw/workspace-agent3\

根目录放 AGENTS.md，内容：读 Heart-Beat-War 模板的 agent3-AGENTS.md，
路径指向 could-coding 仓库。
核心职责：审查 → 写 40_review/ → 通过则删 task
```

**你做的事：**
1. 从 `Heart-Beat-War--3.28/templates/` 复制三个 AGENTS.md 模板
2. 修改路径，指向 `could-coding` 仓库
3. 分别放到三个 Agent 的 workspace 根目录

**测试：** 在每个 Agent 的飞书 Bot 发 `/status`，确认它读到了正确的 AGENTS.md。

---

#### Task 0.3：配置三个 Agent 的 HEARTBEAT.md
**做什么：** 每个 Agent 的 workspace 根目录放 HEARTBEAT.md，定义心跳时做什么。

**Agent 1 的 HEARTBEAT.md：**
```markdown
# Heartbeat Checklist (Agent 1)

每次心跳：
1. cd 到 could-coding 仓库目录，git pull
2. 检查 00_input/ 有没有新需求文件
3. 检查 40_review/ 有没有新的审查报告
4. 有新需求？→ 写 10_architecture/ → 发 20_tasks/ → git push
5. 有审查打回？→ 修改架构 → 重新发 task → git push
6. 都没？→ HEARTBEAT_OK
```

**Agent 2 的 HEARTBEAT.md：**
```markdown
# Heartbeat Checklist (Agent 2)

每次心跳：
1. cd 到 could-coding 仓库目录，git pull
2. 扫描 20_tasks/ 有没有待执行的任务卡
3. 有新 task？→ 读 task 卡 + 架构 → 执行 → 写 30_execution/ + HANDOFF.md → git push
4. 30_execution/ 已有结果且 40_review/ 还没审？→ 等 Agent 3
5. 没事？→ HEARTBEAT_OK
```

**Agent 3 的 HEARTBEAT.md：**
```markdown
# Heartbeat Checklist (Agent 3)

每次心跳：
1. cd 到 could-coding 仓库目录，git pull
2. 检查 30_execution/ 有没有新的执行结果（看 HANDOFF.md 是否存在且未审查）
3. 有新结果？→ 读需求 + 架构 + task 卡 + 执行结果 → 审查 → 写 40_review/
   - 通过 → 删除对应 task 文件夹 → git push
   - 不通过 → 写审查报告说明问题 → git push
4. 没事？→ HEARTBEAT_OK
```

**你做的事：** 把上述内容分别放到三个 Agent 的 workspace 根目录。

**测试：** 手动在 `00_input/` 放一个测试需求，等 Agent 1 心跳触发，看它是否自动写了架构。

---

#### Task 0.4：配置三个 Agent 的飞书 Bot
**做什么：** 三个 Agent 各绑定一个独立的飞书 Bot，你在飞书群聊里 @不同的 Bot 下达指令。

**具体操作：**
1. 在飞书开发者后台创建 3 个应用（Bot）：
   - `agent-1-architect`（大哥）
   - `agent-2-executor`（二弟）
   - `agent-3-reviewer`（三哥）
2. 每个应用开通机器人能力 + 消息权限（和你之前做的一样）
3. 在 `could-coding` 的 OpenClaw 配置中，为每个 Agent 绑定对应的飞书 Bot

**飞书群聊用法：**
- @agent-1-architect："给物理C电磁加一套2025年真题" → Agent 1 写需求到 00_input/
- @agent-2-executor：（不需要手动 @，Agent 2 的 heartbeat 会自动发现任务）
- @agent-3-reviewer：（不需要手动 @，Agent 3 的 heartbeat 会自动发现结果）

**或者更简单的方式：只用一个飞书 Bot 作为入口**
- Agent 1 的飞书 Bot 同时承担"接收你的指令"的角色
- 你直接 @Agent 1 说需求，Agent 1 自己写到 00_input/ 然后走后续流程

**测试：** 在飞书群聊 @Agent 1 说"测试需求"，看它是否在 00_input/ 创建了文件。

---

### Phase 1：单 Agent 验证（每个 Agent 单独测试）

#### Task 1.1：验证 Agent 1 能读需求 + 写架构
**测试步骤：**
1. 手动在 `could-coding/00_input/` 放一个 `requirement.md`
2. 等 Agent 1 心跳触发（或手动让它执行）
3. 检查 `10_architecture/` 是否有新文件
4. 检查 `20_tasks/` 是否有新 task 卡

**预期结果：**
- `10_architecture/project-brief.md` 出现，内容合理
- `20_tasks/TASK-001/task-card.md` 出现，格式正确

**失败排查：**
- 没触发？→ 检查 heartbeat 配置和频率
- 触发了但没写？→ 检查 AGENTS.md 路径是否正确
- 写了但内容不对？→ 检查 AGENTS.md 的指令是否清晰

---

#### Task 1.2：验证 Agent 2 能发现任务 + 执行
**测试步骤：**
1. 确保 `20_tasks/TASK-001/` 存在（Task 1.1 产出的）
2. 等 Agent 2 心跳触发
3. 检查 `30_execution/` 是否有新文件
4. 检查 `30_execution/HANDOFF.md` 是否存在

**预期结果：**
- `30_execution/` 下出现代码文件
- `HANDOFF.md` 出现，内容包含"做了什么 + 哪些需要重点看"

**失败排查：**
- 没发现任务？→ 检查 Agent 2 是否在正确目录做了 git pull
- 发现了但没执行？→ 检查 AGENTS.md 中的执行指令是否清晰
- 执行了但写错目录？→ 检查路径配置

---

#### Task 1.3：验证 Agent 3 能审查 + 删 task
**测试步骤：**
1. 确保 `30_execution/` 和 `HANDOFF.md` 存在（Task 1.2 产出的）
2. 等 Agent 3 心跳触发
3. 检查 `40_review/` 是否有审查报告
4. 检查 `20_tasks/TASK-001/` 是否被删除

**预期结果：**
- `40_review/review-xxx.md` 出现，有审查结论
- `20_tasks/TASK-001/` 被删除（或还在但报告写了"不通过"）

**失败排查：**
- 没发现结果？→ 检查 git pull 是否在正确目录
- 审查了但没删 task？→ 检查 AGENTS.md 里是否写了"通过则删 task"

---

### Phase 2：串联测试（三 Agent 接力跑）

#### Task 2.1：手动触发全流程
**测试步骤：**
1. 在 `could-coding/00_input/` 放一个简单的测试需求：
```markdown
# 测试需求

请在 30_execution/ 下创建一个 hello.txt，内容为 "Hello from Agent 2"。
```
2. 等三个 Agent 依次心跳触发
3. 观察完整流转：

```
00_input/ 有需求
  → (Agent 1 心跳) → 10_architecture/ 出现架构 + 20_tasks/ 出现 TASK-001
  → (Agent 2 心跳) → 30_execution/ 出现 hello.txt + HANDOFF.md
  → (Agent 3 心跳) → 40_review/ 出现审查报告 + TASK-001 被删除
```

**预期时间：** 三个 Agent 的心跳周期之和。如果每个 Agent 是 3 分钟，最理想情况下 9 分钟跑完。

**测试检查点：**
| 时间点 | 应该看到 | 如果没看到怎么办 |
|--------|----------|----------------|
| T+3min | 10_architecture/ 有新文件 | Agent 1 没触发，检查 heartbeat |
| T+3min | 20_tasks/TASK-001/ 出现 | Agent 1 触发了但没拆 task，检查 AGENTS.md |
| T+6min | 30_execution/hello.txt 出现 | Agent 2 没触发，检查 heartbeat |
| T+6min | 30_execution/HANDOFF.md 出现 | Agent 2 执行了但没写 HANDOFF |
| T+9min | 40_review/ 有报告 | Agent 3 没触发，检查 heartbeat |
| T+9min | 20_tasks/ 为空 | Agent 3 审查了但没删 task |

---

#### Task 2.2：飞书指令触发全流程
**测试步骤：**
1. 在飞书群聊 @Agent 1 说："测试：在 30_execution 下创建一个 test.md，内容是'自动协作成功'"
2. Agent 1 收到后写到 00_input/requirement.md，然后走后续流程
3. 最终在飞书群聊收到完成通知

**这是你最终想要的体验的验证。**

---

### Phase 3：实际场景测试（AP 题库整合）

#### Task 3.1：数据转换 pipeline
**需求：** 把 AP-Learning-Web 的题库数据转换成 could-coding 格式。

**你发飞书指令：** "把 AP-Learning-Web 的物理C电磁 2025 年样题数据转换成 could-coding 格式，放到 data/ 目录"

**预期流转：**
1. Agent 1 读需求，产出架构：
   - 分析两个仓库的数据格式差异（参考 INTEGRATION-PLAN.md）
   - 写转换方案：读 AP-Learning-Web 的 mock-data → 转换格式 → 写入 could-coding 的 data/
   - 拆 task 卡

2. Agent 2 执行：
   - 写 Python/JS 转换脚本
   - 运行脚本，生成 JSON 文件
   - 写到 30_execution/ + HANDOFF.md

3. Agent 3 审查：
   - 验证 JSON 格式是否符合 data-service.js 的要求
   - 验证题目数量是否完整
   - 验证答案是否正确对应
   - 通过 → 删 task

**测试：** 在 could-coding 线上打开 dashboard，选择物理C电磁，看题目是否正确加载。

---

#### Task 3.2：新功能开发
**需求：** "给模考界面加一个 Scratchpad 草稿板功能"

**你发飞书指令：** "给 exam/ 加一个 Scratchpad 草稿板，可以画简单图形和写字"

**预期流转：**
1. Agent 1 产出架构（技术方案：Canvas 实现）
2. Agent 2 写代码
3. Agent 3 审查功能是否正常
4. 通过 → 删 task → push 到 GitHub → GitHub Pages 自动部署

**测试：** 打开线上地址，做题时能打开草稿板。

---

#### Task 3.3：Bug 修复
**需求：** "FRQ 模式的计时器没有暂停功能"

**你发飞书指令：** "FRQ 做题时计时器没有暂停按钮，修一下"

**预期流转：**
1. Agent 1 定位问题范围，拆 task
2. Agent 2 修改代码
3. Agent 3 审查
4. 通过 → push → 上线

**测试：** 打开 FRQ 模考，验证暂停按钮可用。

---

### Phase 4：自动化 + 通知

#### Task 4.1：飞书完成通知
**做什么：** Agent 3 审查通过后，自动在飞书群聊发通知。

**实现方式：** 在 Agent 3 的 AGENTS.md 中加一条规则：
```
审查通过后，调用飞书 Bot API 发送群消息：
"✅ [项目名] 任务完成：[任务简述]。已推送到 GitHub，Pages 将在 1-2 分钟内更新。"
```

**测试：** 完成一轮协作后，飞书群聊收到通知。

---

#### Task 4.2：GitHub Pages 自动部署验证
**做什么：** push 到 GitHub 后，验证 GitHub Pages 是否自动更新。

**当前状态：** could-coding 已部署在 `https://arthurchen-01.github.io/could-coding/`
如果用的是 GitHub Pages 直接从 main 分支部署，push 后 1-2 分钟自动更新。

**Agent 3 的附加检查：** 审查通过后，等 2 分钟检查线上是否更新，然后发通知。

**测试：** 改一个页面标题，push，等 2 分钟，刷新线上页面，标题已变。

---

### Phase 5：持续优化

#### Task 5.1：记忆系统
**做什么：** 让 Agent 通过 memory/ 目录积累经验。

每个 Agent 的三层记忆：
- `memory/agent-X/daily/YYYY-MM-DD.md`：当天做了什么
- `memory/agent-X/MEMORY.md`：长期经验（踩过的坑、常用命令、项目结构）
- `memory/agent-X/summaries/`：定期压缩

**效果：** 跑几轮后，Agent 2 会记住"这个项目的数据在 data/ 目录"、"Python 脚本放在 scripts/"，不用每次重新分析。

---

#### Task 5.2：多项目支持
**做什么：** 在 `00_input/` 下支持多个项目的需求。

```
00_input/
├── project-A/
│   └── requirement.md
└── project-B/
    └── requirement.md
```

Agent 1 按项目名创建对应的架构和 task。当前可以先不做，等单项目跑稳了再说。

---

## 四、总结：你应该按什么顺序做

```
Phase 0（手动配置，做一次）
  Task 0.1  统一协作仓库 → could-coding 加目录结构
  Task 0.2  配置三个 Agent 的 AGENTS.md
  Task 0.3  配置三个 Agent 的 HEARTBEAT.md
  Task 0.4  配置飞书 Bot

Phase 1（单 Agent 逐个验证）
  Task 1.1  Agent 1 能读需求 + 写架构
  Task 1.2  Agent 2 能发现任务 + 执行
  Task 1.3  Agent 3 能审查 + 删 task

Phase 2（串联测试）
  Task 2.1  手动放需求，三 Agent 自动接力跑完
  Task 2.2  飞书指令触发全流程

Phase 3（实际场景）
  Task 3.1  题库数据转换 pipeline
  Task 3.2  新功能开发
  Task 3.3  Bug 修复

Phase 4（自动化通知）
  Task 4.1  飞书完成通知
  Task 4.2  GitHub Pages 自动部署验证

Phase 5（持续优化）
  Task 5.1  记忆系统
  Task 5.2  多项目支持
```

**每个 Phase 都要在前一个 Phase 测试通过后才进入下一个。不要跳步。**
