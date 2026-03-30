# TASK-002 执行清单

## 步骤 1: 设计 Q&A 数据结构
- [ ] 定义 Q&A 对的数据模型（question, answer, subject, lesson）
- [ ] 设计解析 regex/模式

## 步骤 2: 解析 progress.md
- [ ] 读取 progress.md，提取每节课的"学习内容"和"备注"
- [ ] 提取关键知识点

## 步骤 3: 解析 diary.md
- [ ] 读取 diary.md，提取每节课中的问题和答案/理解
- [ ] 建立 Q→A 映射

## 步骤 4: 生成 Anki CSV
- [ ] 输出 tab 分隔 CSV（正面=问题，背面=答案）
- [ ] tag 格式：课次+科目（如 "AP-Calculus-BC,lesson-0005"）
- [ ] 支持 --subject 筛选参数

## 步骤 5: 测试验证
- [ ] 生成 CSV 文件，检查列格式
- [ ] 验证 tag 格式正确
- [ ] 用 Anki 导入功能验证（或目视检查格式）