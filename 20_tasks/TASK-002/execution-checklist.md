# TASK-002 执行清单

## 步骤 1: 设计 Q&A 数据结构
- [x] 定义 Q&A 对的数据模型（question, answer, subject, lesson）
- [x] 设计解析 regex/模式

## 步骤 2: 解析 progress.md
- [x] 读取 progress.md，提取每节课的"学习内容"和"备注"
- [x] 提取关键知识点

## 步骤 3: 解析 diary.md
- [x] 读取 diary.md，提取每节课中的问题和答案/理解
- [x] 建立 Q→A 映射

## 步骤 4: 生成 Anki CSV
- [x] 输出 tab 分隔 TSV（正面=问题，背面=答案）
- [x] tag 格式：课次+科目（如 "AP-Calculus-BC,lesson-0005"）
- [x] 支持 --subject 筛选参数

## 步骤 5: 测试验证
- [x] TC1: `python3 export_anki.py --path sample_files` → ✅ 20张卡片生成
- [x] TC2: CSV列数验证 → ✅ 3列，无多余引号
- [x] TC3: `--subject AP-Calculus-BC` 筛选 → ✅ 全部20张含目标tag
- [x] TC4: tag格式检查 → ✅ 0格式错误行
- [x] TC5: 内容完整性 → ✅ 5课全覆盖，diary关键词均包含

**结论：** 全部完成，共生成 20 张 Anki 卡片。
