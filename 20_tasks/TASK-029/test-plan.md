# TASK-029 测试计划

## 测试用例

### TC1: 新鲜且数据充足
- 输入：recordCount=5, daysSinceLastRecord=7
- 期望：high

### TC2: 数据中等且最近更新
- 输入：recordCount=2, daysSinceLastRecord=14
- 期望：medium

### TC3: 数据充足但陈旧
- 输入：recordCount=8, daysSinceLastRecord=120
- 期望：medium（不得为 high）

### TC4: 数据很少
- 输入：recordCount=1, daysSinceLastRecord=3
- 期望：low

### TC5: 页面构建
- 命令：`npm run build`
- 期望：构建通过，无 TypeScript 错误

### TC6: 页面展示
- 进入 personal 页面
- 期望：confidence badge 与测试样例语义一致，不出现显然错误的高置信度
