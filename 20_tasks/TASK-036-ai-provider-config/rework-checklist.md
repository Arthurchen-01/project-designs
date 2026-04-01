# TASK-036-REWORK 执行清单

- [ ] 1. 先读 `STATUS.md`，确认当前 live task 已切换为 `TASK-036-REWORK`
- [ ] 2. 读 `40_review/TASK-036-review-20260401.md`，锁定阻断项
- [ ] 3. 参考 `src/app/api/auth/me/route.ts`，抽取可复用的 session/admin 校验方式
- [ ] 4. 新建或完善 `src/lib/auth-guard.ts`
- [ ] 5. 给 `src/app/api/admin/ai/providers/route.ts` 加鉴权
- [ ] 6. 给 `src/app/api/admin/ai/providers/[id]/route.ts` 加鉴权
- [ ] 7. 给 `src/app/api/admin/ai/providers/[id]/test/route.ts` 加鉴权
- [ ] 8. 给 `src/app/api/admin/ai/providers/[id]/activate/route.ts` 加鉴权
- [ ] 9. 给 `src/app/api/admin/ai/providers/[id]/deactivate/route.ts` 加鉴权
- [ ] 10. 给 `src/app/api/admin/ai/routing/route.ts` 加鉴权
- [ ] 11. 运行最小验证，覆盖未登录 / 非 admin / admin 三种路径
- [ ] 12. 写 `30_execution/TASK-036-rework-report.md`
