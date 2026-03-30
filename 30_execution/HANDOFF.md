# HANDOFF.md — TASK-002 (v2)

## What changed

- Created `30_execution/tools/export_anki_docx.py` — Anki DOCX 导出脚本
- Updated `30_execution/requirements.txt` — 添加 `python-docx>=1.0.0`
- Created `30_execution/tools/output/2026-03-30-anki.docx` — 示例输出

## Context

- Task: TASK-002 (Anki DOCX 导出，需求 v2)
- Architecture reference: `10_architecture/project-brief.md` Phase 2

## 验证结果

| Test | Command | Result |
|---|---|---|
| TC1 | `python3 export_anki_docx.py --date 2026-03-30` | ✅ 6张卡片，2章节，DOCX生成 |
| TC2 | DOCX内容结构验证（关键词检查） | ✅ 27段落，含 Sakura/AP-Calculus/TAG/简答/洛必达/临界点 |
| TC3 | `--subject AP-Calculus-BC` 筛选 | ✅ 6→6张（全部属于该科目） |
| TC4 | 无效日期错误处理 | ✅ 正确报错，不崩溃 |

## 算法说明

**日志解析：**
- 正则匹配 `\*\*[Q(\d+)]\*\*` 和 `\*\*[A(\d+)]\*\*`（注意 `**` 是字面星号）
- 按章节 `## ` 分段，同一 A 紧跟 Q 后配对

**题型判断规则：**
- 含 `A. B. C. D.` → 多选题；含单个选项 → 单选题
- 含"对/错"或"T/F" → 判断题
- 含 `____` / `……` / `（  ）` → 填空题
- 含"什么是/定义是"且答案短 → 名词解释
- 默认 → 简答题

**科目推断：** 关键词匹配（极限/导数/洛必达 → AP-Calculus-BC）

## Windows 使用说明

```cmd
cd "C:\Users\25472\Sakura - gemini版\tools"
pip install -r requirements.txt
python export_anki_docx.py --date 2026-03-30
:: 输出: output\2026-03-30-anki.docx
:: 导入: 直接用 Anki 打开 DOCX，或 Anki → 文件 → 导入
```

## 已知限制

- 题型判断 heuristics 基于关键词，简单内容可用；复杂多选题可能误判为简答
- DOCX 颜色格式（填空红/答案绿/判断蓝）用于视觉区分，Anki 导入时颜色通常丢失，内容完整

## Status

All checklist items complete. Ready for Agent 3 review.
