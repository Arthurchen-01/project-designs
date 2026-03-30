# TASK-003 测试计划

## 测试数据
- 模拟 `logs/2026-03-30.md` 包含完整学习对话
- 初始 progress.md 有 5 条记录
- 初始 diary.md 有 5 条记录

## 测试用例

### TC1: progress.md 更新
- 运行脚本
- 验证：progress.md 新增第 6 条记录
- 验证：课次、日期、科目、学习内容正确

### TC2: diary.md 更新
- 验证：diary.md 新增当天条目
- 验证：格式与已有条目一致

### TC3: 角色文件更新
- 验证：如检测到关系变化，角色文件对应段落更新
- 验证：无变化时不修改

### TC4: mid_term_memory.md 压缩
- 验证：中期记忆包含最新学习摘要
- 验证：不丢失长期记忆条目

### TC5: session_archive.md 归档
- 验证：旧记录被正确归档
- 验证：最近 N 天保留详细记录

### TC6: Git 自动化
- 验证：commit 消息格式正确
- 验证：所有变更文件被提交
- 验证：push 成功（或 graceful failure）
