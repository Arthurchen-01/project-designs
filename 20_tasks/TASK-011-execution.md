# TASK-011 执行指令

## 任务：Prisma + SQLite 数据库初始化

### 目标
在 ap-tracker 项目中配置 Prisma ORM + SQLite，创建数据库 schema，填充种子数据。

### 具体步骤

1. **安装 Prisma**
   ```bash
   cd C:\Users\25472\projects\ap-tracker
   npm install prisma @prisma/client
   npx prisma init --datasource-provider sqlite
   ```

2. **写 Schema**
   参考 `C:\Users\25472\.openclaw\workspace-agent1\10_architecture\AP-platform-architecture.md` 中的 Prisma Schema，写入 `prisma/schema.prisma`。

   核心表：
   - Class（班级）
   - Student（学生，关联班级）
   - Subject（AP 科目）
   - StudentSubject（学生报考关系）
   - ExamDate（考试日期）
   - AssessmentRecord（测试记录）
   - DailyUpdate（每日更新）
   - ProbabilitySnapshot（5分率快照）
   - Resource（资源共享）

3. **创建数据库**
   ```bash
   npx prisma db push
   ```

4. **写 Seed 脚本**
   创建 `prisma/seed.ts`，从现有的 mock-data.ts 迁移数据：
   - 1 个班级
   - 9 个学生
   - 8 个科目
   - 学生报考关系
   - 考试日期
   - 每个学生的测试记录
   - 每个学生每科的 5 分率快照
   - 资源数据

   在 package.json 中添加 seed 配置：
   ```json
   "prisma": {
     "seed": "npx tsx prisma/seed.ts"
   }
   ```

5. **创建 Prisma 客户端单例**
   创建 `src/lib/prisma.ts`：
   ```typescript
   import { PrismaClient } from '@prisma/client'

   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

   export const prisma = globalForPrisma.prisma ?? new PrismaClient()

   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```

6. **验证**
   - `npx prisma db seed` 成功
   - `npx prisma studio` 能看到所有表和数据
   - `npm run build` 无错误

### 产出
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/prisma.ts`
- 已填充数据的 SQLite 数据库文件

### 完成后
1. 在 workspace 仓库写执行报告：`30_execution/TASK-011-report.md`
2. 更新 `30_execution/STATUS-REPORT.md`
3. 更新 `30_execution/HANDOFF.md`
4. git add + commit + push（两个仓库都要）

### 参考
- 架构：`10_architecture/AP-platform-architecture.md`
- mock 数据：`C:\Users\25472\projects\ap-tracker\src\lib\mock-data.ts`
- PRD：`00_input/AP-备考平台-PRD-V1.md`（第16节数据结构）
