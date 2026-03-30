# TASK-004: Prompt 生成器升级（morning/review 模式 + raw link）

## 目标
升级已有的 `generate_prompt.py`，支持：
1. `--mode morning`（完整 prompt：长期记忆 + 进度 + 角色）
2. `--mode review`（精简 prompt：角色 + 当天记录）
3. `--date YYYY-MM-DD`（review 模式指定日期）
4. 备选方案：生成 GitHub raw link 列表（粘贴一次即可）

## 输入
- 现有 `30_execution/tools/generate_prompt.py`（TASK-001 产出）
- 新增需求：morning/review 两种模式

## 输出
- 更新的 `generate_prompt.py`，支持 `--mode` 参数
- morning 模式：完整 prompt（所有设定 + 进度 + 中期记忆 + 近期日记）
- review 模式：精简 prompt（角色设定 + 指定日期的详细记录）

## 执行清单

- [ ] 1. 分析现有 generate_prompt.py，设计 --mode 参数扩展
- [ ] 2. 实现 morning 模式（加载所有文件，完整拼接）
- [ ] 3. 实现 review 模式（仅加载角色 + 指定日期 log）
- [ ] 4. 实现 --date 参数（review 模式必需）
- [ ] 5. 可选：实现 --link 模式（生成 GitHub raw link 列表）
- [ ] 6. 测试：morning 和 review 模式各跑一遍

## 依赖
- TASK-001 ✅ 已完成（基础 generate_prompt.py）

## 备注
此任务是对 TASK-001 的增量升级，改动范围较小。
