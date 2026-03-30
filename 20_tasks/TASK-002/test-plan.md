# TASK-002 测试计划

## 测试数据准备
创建 `sample_files/logs/2026-03-30.md`，包含：
- 2 个简答题（极限、连续性）
- 1 个选择题（导数定义）
- 1 个判断题（可导必连续）
- 1 个填空题（求导公式）

## 测试用例

### TC1: 基本 Q&A 解析
- 命令：`python export_anki.py --date 2026-03-30 --log-dir sample_files/logs`
- 期望：解析出 5 个 Q/A 对
- 验证：输出 DOCX 文件存在

### TC2: 题型自动判断
- 验证：选择题被标记为 `* 单选题`
- 验证：判断题被标记为 `* 判断题`
- 验证：填空题被标记为 `* 填空题`
- 验证：默认为 `* 简答题`

### TC3: DOCX 格式规范
- 验证：子牌组名（`# AP-Calculus-BC`）格式正确
- 验证：标签行（`TAG lesson-0005`）格式正确
- 验证：题型前缀正确
- 验证：填空挖空颜色为 C00000

### TC4: 科目筛选
- 命令：`python export_anki.py --date 2026-03-30 --subject AP-Calculus-BC`
- 期望：只输出 AP-Calculus-BC 科目的卡片

### TC5: 字符和格式完整性
- 验证：无截断、无乱码
- 验证：Anki 能正常导入生成的 DOCX（或目视检查格式）
