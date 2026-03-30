# TASK-004 执行清单

## 步骤 1: 分析现有代码
- [ ] 阅读 generate_prompt.py，理解当前结构
- [ ] 设计 --mode 参数扩展方案

## 步骤 2: 实现 morning 模式
- [ ] 加载所有设定文件（现有逻辑，保持不变）
- [ ] 加载进度、中期记忆、近期日记
- [ ] 完整拼接 prompt

## 步骤 3: 实现 review 模式
- [ ] 仅加载角色设定文件
- [ ] 加载指定日期的 log 文件（logs/YYYY-MM-DD.md）
- [ ] 精简拼接 prompt

## 步骤 4: 实现 --date 参数
- [ ] argparse 添加 --date
- [ ] review 模式必须有 --date
- [ ] morning 模式忽略 --date

## 步骤 5: 可选 --link 模式
- [ ] 生成 GitHub raw link 列表
- [ ] 格式：`[文件名] https://raw.githubusercontent.com/.../file.md`

## 步骤 6: 测试
- [ ] morning 模式生成 prompt，验证包含所有章节
- [ ] review 模式生成 prompt，验证仅包含角色 + 当天记录
- [ ] --date 参数正确指定日期