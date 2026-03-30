# TASK-002 执行指令

## 任务：首页 — 班级选择器

### 目标
创建应用首页 `/`，显示班级卡片列表，点击进入班级空间。

### 具体步骤

1. **创建首页页面**
   - 文件：`src/app/page.tsx`
   - 使用 mock 数据中的 `classroom` 对象
   - V1 只有一个班级，但仍用卡片列表样式（为 V2 扩展留空间）

2. **创建班级卡片组件**
   - 文件：`src/components/class-card.tsx`
   - 显示：班级名称、学生人数、报考科目数、开考倒计时
   - 使用 shadcn/ui Card 组件
   - 点击跳转到 `/[classId]/dashboard`

3. **响应式布局**
   - 桌面端：居中卡片，最大宽度 `max-w-md`
   - 移动端：全宽，适当 padding

4. **页面标题**
   - 页面顶部显示 "AP 备考追踪平台"
   - 副标题 "选择班级"

### 产出
- `src/app/page.tsx` — 首页
- `src/components/class-card.tsx` — 班级卡片组件

### 验收标准
- [ ] 首页显示班级卡片
- [ ] 卡片显示班级名称、学生人数、科目数
- [ ] 点击卡片跳转到 `/classroom-1/dashboard`（或对应 classId）
- [ ] TypeScript 无编译错误
- [ ] `npx next build` 通过

### 参考
- PRD: `00_input/AP-备考平台-PRD-V1.md`
- Mock 数据: `src/lib/mock-data.ts`
- 任务板: `20_tasks/TASK-board-phase1.md`
