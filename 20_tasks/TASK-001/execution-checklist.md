# TASK-001 执行清单

## 步骤 1: 创建项目结构和依赖
- [ ] 创建 `C:\Users\25472\Sakura - gemini版\tools\` 目录
- [ ] 创建 `requirements.txt`（pyperclip 等）
- [ ] 验证 Python 环境可用

## 步骤 2: 实现核心读取逻辑
- [ ] 读取 system.md, learner_profile.md, progress.md
- [ ] 读取四位老师的人设文件
- [ ] 读取 mid_term_memory.md, diary.md（最近 N 条）

## 步骤 3: 实现 prompt 拼接
- [ ] 按 system.md 第 9 节定义的顺序组装 prompt
- [ ] 注入当前进度信息
- [ ] 注入选定的老师角色

## 步骤 4: 命令行参数和输出
- [ ] argparse 实现 --teacher 参数
- [ ] 自动提取最新课次编号
- [ ] 输出到文件 + 剪贴板

## 步骤 5: 测试验证
- [ ] 跑一遍完整流程
- [ ] 检查输出 prompt 的字符数和格式
