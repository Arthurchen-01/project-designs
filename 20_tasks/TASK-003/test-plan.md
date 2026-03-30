# TASK-002 测试计划

## 测试用例

### TC1: 基本 CSV 生成
- 命令：`python export_anki.py`
- 期望：生成 CSV 文件，包含 Q&A 对
- 验证：输出文件存在，至少包含 1 条记录

### TC2: CSV 格式验证
- 验证：tab 分隔、无多余引号、字段数一致
- 验证：每行 3 列（正面\t背面\ttags）

### TC3: 科目筛选
- 命令：`python export_anki.py --subject "AP-Calculus-BC"`
- 期望：只输出该科目的卡片
- 验证：所有记录的 tag 包含 "AP-Calculus-BC"

### TC4: tag 格式检查
- 期望：tag 格式符合 Anki 规范（逗号分隔，无空格）
- 验证：tag 包含课次编号和科目名

### TC5: 内容完整性
- 验证：提取的 Q&A 对与 progress.md / diary.md 中的原始内容一致
- 验证：无截断、无乱码