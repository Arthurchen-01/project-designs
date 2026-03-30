# TASK-003: 课后自动更新脚本

## 目标
学习结束后，一键运行脚本自动更新 repository 中的所有 md 文件，并 git commit + push。

## 输入
- `logs/YYYY-MM-DD.md` — 当天的对话记录
- 现有的 progress.md, diary.md, 角色文件, mid_term_memory.md 等

## 输出
更新以下文件：
- `progress.md` — 追加新的课次记录
- `diary.md` — 追加当天日记
- 角色人设文件（Mikasa.md 等）— 更新关系变化
- `mid_term_memory.md` — 压缩更新中期记忆
- `session_archive.md` — 归档旧记录
- `wechat_unread.md` — 更新群聊状态

## 执行清单（待 TASK-002 完成后细化）

- [ ] 1. 设计更新策略（增量 vs 全量重写）
- [ ] 2. 实现 log 解析，提取学习内容摘要
- [ ] 3. 实现 progress.md 更新（课次 + 学习内容 + 备注）
- [ ] 4. 实现 diary.md 更新（当天日记条目）
- [ ] 5. 实现角色文件更新（关系变化段落）
- [ ] 6. 实现 mid_term_memory.md 压缩更新
- [ ] 7. 实现 session_archive.md 归档
- [ ] 8. 实现 git commit + push 自动化
- [ ] 9. 测试：模拟一天学习记录，验证所有文件更新正确

## 依赖
- TASK-001（prompt generator）✅ 已完成
- TASK-002（Anki DOCX export）需完成

## 备注
此任务依赖 TASK-002 的 log 解析逻辑，可在 TASK-002 完成后复用解析器。
