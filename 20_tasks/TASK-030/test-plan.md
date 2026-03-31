# TASK-030 测试计划

## 测试用例

### TC1: Daily Update 提交字段正确
- 操作：在 daily-update 页面提交一条记录
- 期望：API 成功返回，数据库写入成功
- 验证：无 `activityType` / `description` / `updateDate` / `durationMinutes` 缺失错误

### TC2: personal 页 confidence 使用 API 值
- 前提：API 返回 `confidenceLevel=medium`
- 期望：页面显示“中”，不再按 `avgFiveRate` 自算

### TC3: subject detail 页 confidence 使用 API 值
- 前提：API 返回 `confidenceLevel=low`
- 期望：页面显示“低”，不再按 `fiveRate` 自算

### TC4: build 验证
- 命令：`npm run build`
- 期望：构建成功，无 TypeScript 错误

### TC5: 回归检查
- 期望：daily-update 成功后 explanation / AI advice 等既有功能不受影响
