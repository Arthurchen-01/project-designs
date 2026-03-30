# TASK-001 审查检查清单

> 审查人：Agent 3
> 审查日期：2026-03-30
> 审查目标：确认项目初始化（TASK-001）是否按规范完成

---

## 一、项目初始化检查

| # | 检查项 | 通过标准 | 状态 |
|---|--------|----------|------|
| 1.1 | `create-next-app` 初始化 | 项目目录存在，包含 package.json、tsconfig.json、next.config.js | ⬜ |
| 1.2 | TypeScript 模式 | tsconfig.json 中 `strict: true` | ⬜ |
| 1.3 | App Router 模式 | 目录结构为 `app/` 而非 `pages/` | ⬜ |
| 1.4 | src 目录 | 代码在 `src/` 下，根目录无散落源码 | ⬜ |
| 1.5 | Tailwind CSS | tailwind.config.ts 存在且包含正确的 content 路径 | ⬜ |
| 1.6 | shadcn/ui 初始化 | components.json 存在，`@/components/ui/` 目录下有基础组件 | ⬜ |
| 1.7 | Recharts 安装 | package.json 中 dependencies 包含 `recharts` | ⬜ |
| 1.8 | import alias | tsconfig.json 中配置了 `@/*` 指向 `src/*` | ⬜ |
| 1.9 | ESLint 配置 | .eslintrc.json 或 eslint.config.mjs 存在 | ⬜ |
| 1.10 | npm run dev 启动 | 执行后无错误，浏览器可访问 localhost:3000 | ⬜ |

## 二、TypeScript 编译检查

| # | 检查项 | 通过标准 | 状态 |
|---|--------|----------|------|
| 2.1 | `npx tsc --noEmit` | 无编译错误 | ⬜ |
| 2.2 | strict 模式 | 无 `any` 滥用，类型定义完整 | ⬜ |
| 2.3 | 组件 props 类型 | 所有组件定义了明确的 props interface/type | ⬜ |
| 2.4 | mock 数据类型 | `src/lib/mock-data.ts` 中数据有明确类型注解 | ⬜ |
| 2.5 | 导入路径 | 使用 `@/` alias，无相对路径 `../../` 泛滥 | ⬜ |

## 三、Mock 数据完整性检查

对照 PRD 和架构文档，mock 数据应覆盖以下实体：

| # | 实体 | 期望字段 | 状态 |
|---|------|----------|------|
| 3.1 | 班级 (Class) | id, name, season | ⬜ |
| 3.2 | 学生 (Student) | id, classId, name, role | ⬜ |
| 3.3 | 学生数量 | 8-10 个学生（含学生和老师角色） | ⬜ |
| 3.4 | 科目 (Subject) | id, code, name, unitCount, passingScore | ⬜ |
| 3.5 | 科目覆盖 | AP Macro/Micro/Calc BC/Stats/Physics/Chemistry/Bio/Lang/Lit 等 | ⬜ |
| 3.6 | 报考关系 (StudentSubject) | studentId, subjectCode, targetScore | ⬜ |
| 3.7 | 每人报考科目数 | 每个学生 2-4 门科目 | ⬜ |
| 3.8 | 考试日期 (ExamDate) | 5 月考试日期，含科目和日期 | ⬜ |
| 3.9 | 测试记录 (AssessmentRecord) | MCQ/FRQ/FullMock 记录，含 scorePercent, timedMode, takenAt | ⬜ |
| 3.10 | 每个学生有成绩记录 | 每人每科至少 3 条历史记录（用于趋势分析） | ⬜ |
| 3.11 | 5 分率 (ProbabilitySnapshot) | studentId, subjectCode, fiveRate, confidenceLevel | ⬜ |
| 3.12 | 计时/不计时覆盖 | 数据中同时包含 timed 和 untimed 记录 | ⬜ |
| 3.13 | MCQ/FRQ 覆盖 | 数据中同时包含 MCQ 和 FRQ 记录 | ⬜ |

## 四、技术栈配置检查

| # | 检查项 | 通过标准 | 状态 |
|---|--------|----------|------|
| 4.1 | Next.js 版本 | >= 14.x (App Router) | ⬜ |
| 4.2 | Tailwind 版本 | >= 3.x | ⬜ |
| 4.3 | shadcn/ui 组件 | 至少包含 Button, Card, Table 等基础组件 | ⬜ |
| 4.4 | 目录结构 | 符合架构文档约定：`src/app/`, `src/lib/`, `src/components/` | ⬜ |
| 4.5 | 路由结构 | `app/` 下有 `(classId)` 动态路由目录结构预备 | ⬜ |
| 4.6 | package.json scripts | 包含 dev, build, lint, start | ⬜ |
| 4.7 | gitignore | 包含 node_modules, .next, .env 等 | ⬜ |

## 五、代码质量检查

| # | 检查项 | 通过标准 | 状态 |
|---|--------|----------|------|
| 5.1 | 无 console.log 残留 | 生产代码中无调试 console.log | ⬜ |
| 5.2 | 文件命名规范 | 使用 kebab-case 或与 Next.js 约定一致 | ⬜ |
| 5.3 | 组件可复用性 | mock 数据与组件分离 | ⬜ |
| 5.4 | 环境变量 | 如有 .env 文件，已添加到 .gitignore | ⬜ |

## 六、审查结果

| 维度 | 判定 |
|------|------|
| 项目初始化 | ⬜ 通过 / ❌ 不通过 |
| TypeScript 编译 | ⬜ 通过 / ❌ 不通过 |
| Mock 数据完整性 | ⬜ 通过 / ❌ 不通过 |
| 技术栈配置 | ⬜ 通过 / ❌ 不通过 |
| 代码质量 | ⬜ 通过 / ❌ 不通过 |

**总体判定**：⬜ 待审查

**审查意见**：_（等 Agent 2 完成 TASK-001 后填写）_

**建议后续行动**：_（等 Agent 2 完成 TASK-001 后填写）_
