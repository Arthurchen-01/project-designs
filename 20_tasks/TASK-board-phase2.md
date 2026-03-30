# AP 备考追踪平台 — 任务看板

> Phase 2：数据录入闭环

## 状态说明
- ⬜ 待开始
- 🔄 进行中
- ✅ 已完成

---

## TASK-011：Prisma + SQLite 数据库初始化
**负责人**：Agent 2
**状态**：✅ 已完成
**产出**：数据库 schema + 种子数据

- [ ] 安装 prisma：`npm install prisma @prisma/client`
- [ ] 初始化：`npx prisma init --datasource-provider sqlite`
- [ ] 根据 `10_architecture/AP-platform-architecture.md` 的 schema 写 prisma/schema.prisma
- [ ] 编写 seed 脚本：从 mock-data.ts 迁移数据到数据库
- [ ] `npx prisma db push` 创建数据库
- [ ] `npx prisma db seed` 填充种子数据
- [ ] 创建 `src/lib/prisma.ts` 单例客户端

**验收**：prisma studio 能看到所有表和数据

---

## TASK-012：学生注册/登录
**负责人**：Agent 2
**状态**：✅ 已完成
**前置**：TASK-011
**产出**：简易登录流程

- [ ] 创建 `/login` 页面
- [ ] 简单的学生选择登录（选择班级 + 输入姓名，匹配数据库）
- [ ] 用 cookie/session 存储登录状态（不需要复杂 auth）
- [ ] 导航栏显示当前登录学生姓名
- [ ] 登出按钮

**验收**：能选择学生登录，导航栏显示姓名

---

## TASK-013：每日更新表单提交入库
**负责人**：Agent 2
**状态**：✅ 已完成
**前置**：TASK-011, TASK-012
**产出**：表单数据写入 daily_updates 表

- [ ] 改造 daily-update/page.tsx，表单提交写入数据库
- [ ] 创建 API Route：POST /api/daily-update
- [ ] 表单提交后显示成功提示
- [ ] 显示该学生的历史更新记录

**验收**：填写表单提交后，数据库中能看到记录

---

## TASK-014：测试记录录入
**负责人**：Agent 2
**状态**：✅ 已完成
**前置**：TASK-011, TASK-012
**产出**：测试记录写入 assessment_records 表

- [ ] 创建 `/[classId]/record-test` 页面
- [ ] 表单字段：学生、科目、类型(MCQ/FRQ/FullMock)、作答条件、分数、日期
- [ ] API Route：POST /api/assessment
- [ ] 显示该学生历史测试记录

**验收**：录入测试记录后，数据库中能看到

---

## TASK-015：页面从 mock 数据切换到数据库
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-013, TASK-014
**产出**：所有页面从 prisma 读取真实数据

- [ ] 改造 dashboard/page.tsx 从数据库读取
- [ ] 改造 dashboard/[metric]/page.tsx 从数据库读取
- [ ] 改造 personal/page.tsx 从数据库读取
- [ ] 改造 personal/[subjectId]/page.tsx 从数据库读取
- [ ] 改造 resources/page.tsx 从数据库读取
- [ ] 保留 mock-data.ts 作为 fallback（可选）

**验收**：录入新数据后刷新页面能看到变化

---

## TASK-016：资源共享上传
**负责人**：Agent 2
**状态**：⬜ 待开始
**前置**：TASK-011, TASK-012
**产出**：资源上传写入 resources 表

- [ ] resources/page.tsx 添加"上传资源"按钮
- [ ] 弹出表单：标题、科目、类型、简介、链接
- [ ] API Route：POST /api/resources
- [ ] 新上传的资源立即显示在列表中

**验收**：上传资源后列表刷新显示

---

## Phase 2 总验收标准
1. `prisma studio` 能看到完整数据
2. 能登录为某个学生
3. 能提交每日更新，数据库有记录
4. 能录入测试成绩，数据库有记录
5. 仪表盘/个人中心显示的是数据库真实数据
6. 能上传资源
