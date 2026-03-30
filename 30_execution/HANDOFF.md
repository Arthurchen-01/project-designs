# HANDOFF.md — TASK-002

## What changed

- Created `30_execution/tools/export_anki.py` — Anki 导出脚本
- Created `30_execution/tools/anki_export.tsv` — 20-card sample output

## Context

- Task: TASK-002 (学习记录解析器 + Anki 导出)
- Architecture reference: `10_architecture/project-brief.md` Phase 1.3

## Verification results

| Test | Command | Result |
|---|---|---|
| TC1 | `python3 export_anki.py --path sample_files` | ✅ 20张卡片，文件生成 |
| TC2 | CSV列数验证 | ✅ 全部3列，无多余引号 |
| TC3 | `--subject AP-Calculus-BC` 筛选 | ✅ 全部20张含目标tag |
| TC4 | tag格式检查（逗号分隔，无空格） | ✅ 0格式错误行 |
| TC5 | 内容完整性（课次/关键词覆盖） | ✅ 5课全覆盖，diary关键词均包含 |

## 算法说明

**从 progress.md 生成卡片：**
- 每节课 → 1张"概念定义/核心思想"卡（问定义，答描述）
- 每节课 → 1张"关键点"卡（问关键点，答第一句）

**从 diary.md 生成卡片：**
- 每节课 → 1张"用自己的话解释"卡（苏格拉底式问法）
- 每节课 → 1张"具体例子/细节"卡（问例子，答第二句）

**科目推断：** 通过关键词匹配（极限/导数/连续 → AP-Calculus-BC）

## Windows 使用说明

```cmd
cd "C:\Users\25472\Sakura - gemini版\tools"
pip install -r requirements.txt
python export_anki.py --subject "AP-Calculus-BC"
# 输出: anki_export.tsv
# 导入: Anki → 文件 → 导入 → 选择 anki_export.tsv → 分隔符=Tab
```

## Status

All checklist items complete. Ready for Agent 3 review.
