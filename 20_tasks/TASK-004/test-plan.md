# TASK-004 测试计划

## 测试用例

### TC1: morning 模式（默认）
- 命令：`python generate_prompt.py --mode morning --path /sakura`
- 期望：生成完整 prompt，包含所有设定 + 进度 + 记忆
- 验证：字符数 > 3000，包含六大部分

### TC2: review 模式
- 命令：`python generate_prompt.py --mode review --date 2026-03-30 --path /sakura`
- 期望：生成精简 prompt，仅包含角色 + 当天记录
- 验证：字符数 < morning 模式，包含角色设定和当天 log

### TC3: review 模式无 --date 报错
- 命令：`python generate_prompt.py --mode review`
- 期望：报错退出，提示需要 --date

### TC4: --teacher 与 --mode 兼容
- 命令：`python generate_prompt.py --mode morning --teacher asuka`
- 期望：morning 模式 + 指定明日香为主讲

### TC5: --link 模式（如有实现）
- 命令：`python generate_prompt.py --link --repo-url https://github.com/...`
- 期望：输出 raw link 列表
- 验证：链接格式正确
