# HANDOFF.md — TASK-004

## What changed

- Updated `30_execution/tools/generate_prompt.py` — 升级支持 morning/review/link 三种模式
- Created `30_execution/tools/sample_files/logs/2026-03-30.md` — 样例日志文件

## Context

- Task: TASK-004 (Prompt 生成器升级)
- Depends on: TASK-001 ✅

## Verification results

| Test | Command | Result |
|---|---|---|
| TC1 | `python generate_prompt.py --path sample_files` (morning) | ✅ 字符数 1786，包含六大部分，课次第0006课 |
| TC2 | `python generate_prompt.py --mode review --date 2026-03-30 --path sample_files` | ✅ 精简 prompt，字符数 638，无日期日志警告正常 |
| TC2b | review + 指定老师 + 日志文件存在 | ✅ 包含角色+日志，字符数 1301 |
| TC3 | `python generate_prompt.py --mode review`（无--date） | ✅ 报错退出，提示明确 |
| TC4 | `--mode morning --teacher asuka` | ✅ 与老师参数兼容 |
| TC5 | `--mode link --repo-url https://github.com/user/sakura` | ✅ 生成9个raw链接，格式正确 |

## 新功能使用说明

```cmd
# Morning 模式（默认，完整设定）
python generate_prompt.py --path "C:\Users\25472\Sakura - gemini版"
python generate_prompt.py --path "C:\Users\25472\Sakura - gemini版" --teacher asuka

# Review 模式（精简，指定日期日志）
python generate_prompt.py --mode review --date 2026-03-30 --path "C:\Users\25472\Sakura - gemini版"
python generate_prompt.py --mode review --date 2026-03-30 --teacher sakura --path "C:\Users\25472\Sakura - gemini版"

# Link 模式（GitHub raw 文件链接列表，粘贴一次即可加载所有文件）
python generate_prompt.py --mode link --repo-url https://github.com/你的用户名/你的仓库
```

## Status

All checklist items complete. Ready for Agent 3 review.
