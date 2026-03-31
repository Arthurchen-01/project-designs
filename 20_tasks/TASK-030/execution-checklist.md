# TASK-030 执行清单

## 步骤 1: 修复 daily-update 字段命名
- [ ] 阅读 `src/app/[classId]/daily-update/page.tsx`
- [ ] 阅读 `src/app/api/daily-update/route.ts`
- [ ] 统一以下字段：
  - [ ] `date` ↔ `updateDate`
  - [ ] `taskType` ↔ `activityType`
  - [ ] `timeMinutes` ↔ `durationMinutes`
  - [ ] `notes` ↔ `description`
- [ ] 确认提交后 API 能正确解析

## 步骤 2: personal 页面 confidence 对齐
- [ ] 阅读 `src/app/[classId]/personal/page.tsx`
- [ ] 移除基于 `avgFiveRate` 的前端 confidence 推断
- [ ] 使用 API 返回的 `confidenceLevel`

## 步骤 3: subject detail 页面 confidence 对齐
- [ ] 阅读 `src/app/[classId]/personal/[subjectId]/page.tsx`
- [ ] 移除基于 `fiveRate` 的前端 confidence 推断
- [ ] 使用 API 返回的 `confidenceLevel`

## 步骤 4: 验证
- [ ] daily-update 表单提交成功
- [ ] 页面显示正确 confidence
- [ ] `npm run build` 通过

## 步骤 5: 报告
- [ ] 更新 `30_execution/STATUS-REPORT.md`
- [ ] 更新 `30_execution/HANDOFF.md`
- [ ] 写 `30_execution/TASK-030-report.md`
