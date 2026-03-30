# TASK-001 执行指令

## 任务：项目初始化

### 目标
搭建一个可运行的 Next.js 项目，包含 mock 数据，为后续页面开发做准备。

### 具体步骤

1. **初始化 Next.js 项目**
   ```powershell
   cd C:\Users\25472\projects
   npx create-next-app@latest ap-tracker --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```

2. **安装依赖**
   ```powershell
   cd C:\Users\25472\projects\ap-tracker
   npx shadcn@latest init
   npm install recharts
   ```

3. **创建 mock 数据文件**
   在 `src/lib/mock-data.ts` 中创建以下 mock 数据：
   - 1 个班级（AP备考班 2026）
   - 8-10 个学生
   - AP 科目列表（Macro、Micro、Calc BC、Stats、Physics、Chemistry、Bio、Lang、Lit 等）
   - 每个学生 2-4 门报考科目
   - 模拟成绩记录（MCQ、FRQ，含计时/不计时）
   - 5 月考试日期
   - 每个学生每科的 mock 5 分率

4. **确认启动**
   - `npm run dev` 正常启动
   - 浏览器 `localhost:3000` 能看到默认页面

### 产出
- 可运行的项目代码
- `src/lib/mock-data.ts` 包含完整 mock 数据
- 执行报告写入 `30_execution/TASK-001-report.md`

### 验收标准
- [ ] 项目可正常 `npm run dev`
- [ ] mock 数据结构完整（班级、学生、科目、成绩、考试日期）
- [ ] TypeScript 无编译错误

### 参考
- PRD: `00_input/AP-备考平台-PRD-V1.md`
- 架构: `10_architecture/AP-platform-architecture.md`
- 任务板: `20_tasks/TASK-board-phase1.md`
