# TASK-002: Anki DOCX 导出工具

## 目标
解析 `logs/YYYY-MM-DD.md` 中的 Q&A 对，生成符合 `word.docx` 排版规范的 DOCX 文件，可直接导入 Anki。

## 输入
- `logs/YYYY-MM-DD.md` — 每日对话记录（`**[Q1]** ... **[A1]** ...` 格式）
- `progress.md` — 用于提取课次编号和科目信息
- `learner_profile.md` — 用于辅助判断题型

## 输出
- `output/YYYY-MM-DD-anki.docx` — 符合 Anki 导入规范的 DOCX 文件

## DOCX 格式规范（来自 word.docx）
- `#` = 子牌组名称（如 `# AP-Calculus-BC`）
- `TAG` = 标签行（如 `TAG lesson-0005 limits`）
- 题型前缀：`* 单选题` / `* 多选题` / `* 判断题` / `* 简答题` / `* 名词解释` / `* 填空题`
- 填空挖空颜色：C00000
- 批注：文本 E97132，内容 00B0F0
- 折叠：标题 F64926，内容 0E2841
- 隐藏：标签 CF4DAA，内容 3A7C22

## 执行清单

- [ ] 1. 设计 Q&A 对数据结构（question, answer, subject, lesson, question_type）
- [ ] 2. 实现 logs/YYYY-MM-DD.md 解析器（提取 **[Qn]**/**[An]** 对）
- [ ] 3. 实现题型自动判断（选择题/判断题/简答题/填空题）
- [ ] 4. 实现 DOCX 生成（python-docx），按规范格式化
- [ ] 5. 命令行参数：`--date YYYY-MM-DD`，`--subject` 筛选
- [ ] 6. 测试：用 sample log 数据生成 DOCX，验证格式

## 测试计划
- 创建 sample `logs/2026-03-30.md` 测试数据
- 运行脚本生成 DOCX，检查牌组/标签/题型格式
- 用 Anki 导入功能或目视检查验证
- 验证颜色代码正确应用
- 验证 --subject 筛选只输出指定科目卡片
