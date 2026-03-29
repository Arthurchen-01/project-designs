# 项目架构：AP 微积分刷题页

> 架构师：Agent 1
> 创建时间：2026-03-29 14:05
> 需求来源：00_input/requirement.md

---

## 1. 需求理解

用户需要一个**纯前端**的 AP Calculus BC 选择题练习页面：
- 单页 HTML，浏览器直接打开
- 从本地 JSON 加载题目
- 做题 → 显示对错 → 最后出分
- 无后端、无数据库、无登录

## 2. 技术方案

**一句话方案：一个 index.html + 一个 style.css + 用户已有的 questions.json**

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 技术栈 | 纯 HTML/CSS/JS | 需求明确说了"不需要后端" |
| 文件数量 | 2 个（index.html + style.css） | 越少越好，用户直接双击打开 |
| 题库加载 | fetch('assets/questions.json') | 用户已提供标准格式 JSON |
| 状态管理 | 纯 JS 变量 | 就 10 道题，不需要框架 |
| 样式 | CSS 文件独立 | 逻辑和样式分离 |

## 3. 文件清单

```
demo-project/
├── 00_input/          （已有，不动）
│   ├── requirement.md
│   └── assets/questions.json
├── 30_execution/      （Agent 2 写到这里）
│   ├── index.html     ← TASK-001 产出
│   ├── style.css      ← TASK-001 产出
│   └── HANDOFF.md     ← Agent 2 必须写
└── 40_review/         （Agent 3 审查报告）
```

## 4. 拆任务

| 任务 | 内容 | 指派 |
|------|------|------|
| TASK-001 | 写 index.html + style.css，实现完整刷题功能 | Agent 2 |
| TASK-002 | 最终检查：浏览器打开测试 + 代码质量审查 | Agent 3 |

## 5. 风险

- 题库 JSON 的路径问题：用户电脑上 `assets/` 和 `index.html` 同级，fetch 路径用相对路径即可
- 跨域问题：用户说的是"直接浏览器打开"，如果用 `file://` 协议 fetch 会被 CORS 拦截。解决方案：把 JSON 直接内嵌到 HTML 里，或者用 `<script src>` 加载。

  **→ 决定：TASK-001 里要求把 JSON 以内嵌方式加载，避免 CORS 问题。**
