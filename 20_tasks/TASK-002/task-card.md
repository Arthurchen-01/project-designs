# TASK-002: 学习记录解析器 + Anki 导出

## 目标
解析 diary.md 和 progress.md，提取 Q&A 对，生成 Anki 可导入的 CSV 文件。

## 执行清单

- [ ] 1. 设计 Q&A 对提取的数据结构
- [ ] 2. 解析 progress.md，提取每节课的"学习内容"和"备注"中的关键知识点
- [ ] 3. 解析 diary.md，提取每节课中提到的问题和对应答案/理解
- [ ] 4. 生成 Anki CSV 格式（正面=问题，背面=答案，tag=课次+科目）
- [ ] 5. 支持 --subject 筛选（只导出特定科目的卡片）
- [ ] 6. 测试：导入到 Anki 验证格式正确

## 测试计划
- 生成 CSV 文件，检查列格式（tab 分隔）
- 用 Anki 导入功能验证
- 检查 tag 格式正确（如 "AP-Calculus-BC", "lesson-0005"）
