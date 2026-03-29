# GitHub Repository 创建与上传指南

> 步骤 1-2-3，5 分钟搞定

---

## 📋 准备工作

我已经帮你准备好了所有文件，结构如下：

```
project-designs/
├── README.md                              ← 主 README
├── GITHUB-SETUP-GUIDE.md                  ← 本文件
├── ap-learning-platform/
│   ├── DESIGN.md                          ← AP 学习平台完整设计方案
│   └── V1-ROADMAP.md                      ← v1 开发路线图
└── heartbeat-demo/
    ├── README.md                          ← HeartBeat Demo 说明
    ├── TASK-LIST.md                       ← 任务清单（需从桌面复制）
    ├── walkthrough.md                     ← 走读指南（需从桌面复制）
    └── demo-project/                      ← Demo 项目文件（需从桌面复制）
```

---

## 🚀 三步完成

### 第一步：在 GitHub 创建 Repository

1. 打开 https://github.com/new

2. 填写信息：
   - **Repository name**: `project-designs`
   - **Description**: `项目设计构思 · 软件开发思考 · 成品 Demo 集合`
   - **Visibility**: 选择 `Public` 或 `Private`（建议 Public）
   - **不要勾选** "Add a README file"（我们已经有了）
   - **不要勾选** "Add .gitignore"
   - **不要勾选** "Choose a license"

3. 点击 **Create repository**

---

### 第二步：上传文件到 GitHub

打开 PowerShell 或 CMD，执行以下命令：

```powershell
# 1. 进入项目目录
cd C:\Users\25472\.openclaw\project-designs

# 2. 初始化 Git
git init

# 3. 复制 HeartBeatDemo 的文件（从桌面）
# 注意：这些命令需要你在 PowerShell 中执行
Copy-Item "C:\Users\25472\Desktop\HeartBeatDemo\TASK-LIST.md" "heartbeat-demo\"
Copy-Item "C:\Users\25472\Desktop\HeartBeatDemo\walkthrough.md" "heartbeat-demo\"
Copy-Item -Recurse "C:\Users\25472\Desktop\HeartBeatDemo\demo-project" "heartbeat-demo\"
Copy-Item -Recurse "C:\Users\25472\Desktop\HeartBeatDemo\memory" "heartbeat-demo\"

# 4. 添加所有文件
git add .

# 5. 提交
git commit -m "初始提交：AP学习平台设计 + v1路线图 + HeartBeat Demo"

# 6. 设置主分支
git branch -M main

# 7. 添加远程仓库（替换为你的实际 URL）
git remote add origin https://github.com/Arthurchen-01/project-designs.git

# 8. 推送到 GitHub
git push -u origin main
```

---

### 第三步：创建分支（可选）

如果你想把 v1 开发建议和 HeartBeat Demo 分开管理：

```powershell
# 创建 v1-dev 分支（AP 学习平台开发）
git checkout -b v1-dev
git push -u origin v1-dev

# 创建 heartbeat-demo 分支
git checkout -b heartbeat-demo
git push -u origin heartbeat-demo

# 回到主分支
git checkout main
```

---

## ✅ 验证

上传完成后，你的 GitHub 仓库应该是这样的：

```
https://github.com/Arthurchen-01/project-designs/

├── README.md                    ← 主页展示
├── ap-learning-platform/
│   ├── DESIGN.md                ← 完整设计方案
│   └── V1-ROADMAP.md            ← v1 开发路线图
└── heartbeat-demo/
    ├── README.md                ← Demo 说明
    ├── TASK-LIST.md             ← 任务清单
    ├── walkthrough.md           ← 走读指南
    ├── demo-project/            ← Demo 项目
    └── memory/                  ← Agent 记忆
```

访问 https://github.com/Arthurchen-01/project-designs/ 确认文件已上传。

---

## 🔀 分支策略

```
main                ← 主分支（所有设计文档）
├── v1-dev          ← AP 学习平台 v1 开发分支
└── heartbeat-demo  ← HeartBeat Demo 分支
```

### 使用场景

- **main**: 存放所有设计文档、路线图、README
- **v1-dev**: 在这个分支上开发 AP 学习平台的新功能
- **heartbeat-demo**: 在这个分支上实验三 Agent 协作

---

## 📝 后续操作

### 1. 更新 README 中的链接

上传后，你需要更新 `README.md` 中的链接，确保它们指向正确的文件：

```markdown
- [完整设计方案](./ap-learning-platform/DESIGN.md)
- [v1 开发路线图](./ap-learning-platform/V1-ROADMAP.md)
- [HeartBeat Demo](./heartbeat-demo/README.md)
```

### 2. 设置 GitHub Pages（可选）

如果你想让这些文档可以在线浏览：

1. 进入仓库 Settings → Pages
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `main` → `/ (root)`
4. 点击 Save

访问地址：`https://arthurchen-01.github.io/project-designs/`

---

## 🆘 常见问题

### Q: 推送时要求输入用户名和密码？

A: 你需要配置 Git 凭据：

```powershell
# 方法 1：使用 GitHub CLI（推荐）
winget install GitHub.cli
gh auth login

# 方法 2：使用 Personal Access Token
# 去 GitHub → Settings → Developer settings → Personal access tokens → 生成新 token
# 推送时用 token 代替密码
```

### Q: 文件太多，推送太慢？

A: 可以先推送核心文档：

```powershell
# 只推送文档
git add README.md ap-learning-platform/
git commit -m "添加 AP 学习平台设计文档"
git push

# 之后再推送 HeartBeat Demo
git add heartbeat-demo/
git commit -m "添加 HeartBeat Demo"
git push
```

### Q: 想要私有仓库但以后可能公开？

A: 可以先创建私有仓库，以后在 Settings → Danger Zone → Change visibility 中改为公开。

---

## 📚 参考

- [GitHub 官方文档](https://docs.github.com/en/repositories/creating-and-managing-repositories)
- [Git 基础命令](https://git-scm.com/book/zh/v2)
- [GitHub CLI](https://cli.github.com/)

---

*指南创建 · 2026-03-29*