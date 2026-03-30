# TASK-001 测试计划

## 测试用例

### TC1: 基本 prompt 生成
- 命令：`python generate_prompt.py`
- 期望：成功生成 prompt 文件，包含 system.md 的所有核心内容
- 验证：输出文件存在，字符数 > 3000

### TC2: 指定主讲老师
- 命令：`python generate_prompt.py --teacher asuka`
- 期望：prompt 中包含明日香的角色设定作为主讲
- 验证：输出中包含 "明日香" 或 "Asuka" 相关内容

### TC3: 课次编号自动递增
- 前提：progress.md 最后一条课次为 0005
- 命令：`python generate_prompt.py`
- 期望：生成的 prompt 中包含"第 0006 课"或类似编号
- 验证：检查输出文件中课次编号

### TC4: 剪贴板复制
- 命令：`python generate_prompt.py`
- 期望：prompt 内容已复制到系统剪贴板
- 验证：手动粘贴检查

### TC5: 字符数限制检查
- 期望：输出 prompt 的 token 数应在合理范围内（Gemini 侧边栏限制）
- 验证：打印字符数统计
