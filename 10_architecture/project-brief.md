# 架构方案 v2：苏格拉底家教系统完整工作流

## 整体架构

```
┌─────────────────────────────────────────────────────┐
│                  Git Repository                      │
│          (Sakura - gemini版 / 新仓库)                │
│                                                      │
│  system.md          learner_profile.md               │
│  Mikasa.md          Asuka.md                         │
│  Sakura.md          Kenshin.md                       │
│  progress.md        diary.md                         │
│  mid_term_memory.md session_archive.md               │
│  wechat_group.md    wechat_unread.md                 │
│  book_revision_notes.md                              │
│  logs/  (每日对话记录)                                │
│  tools/ (脚本工具)                                    │
│    ├── generate_prompt.py                            │
│    ├── export_anki.py                                │
│    └── post_session_update.py                        │
└─────────────────────────────────────────────────────┘
```

## 工作流

### 早上学习流程
1. 运行 `python tools/generate_prompt.py --mode morning`
2. 脚本读取所有设定文件 + 进度 + 中期记忆 + 最近日记
3. 生成完整 prompt，复制到剪贴板
4. 打开 Gemini/GPT 侧边栏，粘贴，开始学习
5. 学习过程中，所有 Q&A 实时在对话中

### 学习结束流程
1. 把对话内容复制保存到 `logs/YYYY-MM-DD.md`
2. 运行 `python tools/export_anki.py --date YYYY-MM-DD`
   - 解析当天对话，提取所有 Q&A
   - 生成符合排版规范的 DOCX
3. 运行 `python tools/post_session_update.py --date YYYY-MM-DD`
   - 更新 progress.md, diary.md, 角色文件, mid_term_memory.md 等
   - 自动 git commit + push

### 晚上复习流程
1. 运行 `python tools/generate_prompt.py --mode review --date YYYY-MM-DD`
2. 生成精简 prompt（角色设定 + 当天详细记录）
3. 粘贴到 Gemini/GPT，开始苏格拉底式复习
4. 或者直接用 Anki 复习导出的卡片

## Prompt 生成方案

### 方案：GitHub Raw Link
将 repository 放在 GitHub/Gitee 上，每个 md 文件都有一个 raw 链接。
生成的 prompt 可以是：

```
请先读取以下链接中的所有文件来了解你的角色和我的学习进度：
[系统设定] https://raw.githubusercontent.com/.../system.md
[你的角色] https://raw.githubusercontent.com/.../Mikasa.md
[学习进度] https://raw.githubusercontent.com/.../progress.md
...
```

**优点**：只需粘贴一次，AI 自动读取所有信息
**注意**：需要 Gemini/GPT 支持访问 URL（目前两者都支持）

### 备选方案：纯文本 Prompt
如果 AI 不能访问链接，就把所有内容拼成一个超长文本 prompt。
缺点是太长，但最可靠。

## Anki DOCX 生成方案

### 对话记录格式（logs/YYYY-MM-DD.md）
```markdown
# 2026-03-30 学习记录

## 对话

**[Q1]** 什么是极限？
**[A1]** 极限是当 x 无限趋近于某个值时，f(x) 的趋近值...

**[Q2]** 连续和可导有什么区别？
**[A2]** 连续是函数图像不断开，可导是函数图像平滑无尖点...
```

### DOCX 生成逻辑
1. 解析 logs 中的 Q&A 对
2. 根据内容判断题型（有选项 = 选择题，有"判断"关键词 = 判断题，否则 = 简答题）
3. 按 word.docx 规范生成 DOCX：
   - `# AP-Calculus-BC` 作为子牌组
   - `TAG lesson-0005 limits` 作为标签
   - `* 简答题` 作为题型
   - 题目 + 答案格式

## 依赖
- Python 3.x
- python-docx（生成 DOCX）
- pyperclip（复制到剪贴板）
- Git（版本管理）
