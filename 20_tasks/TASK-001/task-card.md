# TASK-001: 一键 Prompt 生成器

## 目标
创建一个 Python 脚本，能自动读取 `Sakura - gemini版/` 下所有设定文件，
生成一个完整的"系统 prompt"，用户只需复制粘贴到 Gemini/GPT 侧边栏即可启动教学会话。

## 输入
- `C:\Users\25472\Sakura - gemini版\system.md`
- `C:\Users\25472\Sakura - gemini版\learner_profile.md`
- `C:\Users\25472\Sakura - gemini版\progress.md`
- `C:\Users\25472\Sakura - gemini版\Mikasa.md` / `Asuka.md` / `Sakura.md` / `Kenshin.md`
- `C:\Users\25472\Sakura - gemini版\mid_term_memory.md`
- `C:\Users\25472\Sakura - gemini版\diary.md`（最近几条）

## 输出
- 一个完整可粘贴的 prompt 文本（保存到文件 + 输出到剪贴板）
- 支持通过命令行参数选择主讲老师

## 执行清单

- [ ] 1. 创建 `generate_prompt.py` 脚本
- [ ] 2. 实现文件读取逻辑（读取上述所有 md 文件）
- [ ] 3. 实现 prompt 拼接逻辑（按 system.md 中定义的课前流程顺序）
- [ ] 4. 添加命令行参数：`--teacher mikasa|asuka|sakura|kenshin`
- [ ] 5. 自动从 progress.md 提取最新课次编号，生成下一个课次编号
- [ ] 6. 输出到文件 + 自动复制到剪贴板（pyperclip）
- [ ] 7. 测试：生成并验证 prompt 完整性

## 测试计划
- 运行脚本生成 prompt，检查是否包含所有必要设定
- 检查 prompt 是否可以完整粘贴到 Gemini 侧边栏（字符数检查）
- 验证课次编号自动递增正确
