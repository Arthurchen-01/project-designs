# AP 备考追踪平台 — 技术架构

> 基于 PRD V1，Phase 1（页面骨架 + 假数据）

## 技术栈选型

| 层 | 选型 | 理由 |
|---|------|------|
| 前端 | Next.js 14 (App Router) + TypeScript | SSR/SSG、文件路由、部署简单 |
| UI | Tailwind CSS + shadcn/ui | 快速搭建、组件质量高 |
| 图表 | Recharts | React 生态、轻量、够用 |
| 后端 | Next.js API Routes (V1) | 前后端一体，Phase 1 够用 |
| 数据库 | SQLite (V1) → PostgreSQL (V2) | V1 先本地跑通，不依赖外部服务 |
| ORM | Prisma | 类型安全、迁移方便 |
| AI | OpenAI API (V1) | 后续可换模型 |

## 页面路由结构

```
/                          → 首页（班级选择器）
/[classId]                 → 班级主页
/[classId]/dashboard       → 班级仪表盘（指标卡片 + 日历）
/[classId]/dashboard/[metric] → 指标明细页
/[classId]/personal        → 个人中心
/[classId]/personal/[subjectId] → 单科详情
/[classId]/daily-update    → 每日更新表单
/[classId]/resources       → 资源共享
```

## 数据库表结构（Prisma Schema）

```prisma
model Class {
  id          String    @id @default(cuid())
  name        String
  season      String
  students    Student[]
  examDates   ExamDate[]
  createdAt   DateTime  @default(now())
}

model Student {
  id          String    @id @default(cuid())
  classId     String
  name        String
  role        String    @default("student") // student | teacher | admin
  class       Class     @relation(fields: [classId], references: [id])
  subjects    StudentSubject[]
  assessments AssessmentRecord[]
  dailyUpdates DailyUpdate[]
}

model Subject {
  id          String    @id @default(cuid())
  code        String    @unique // e.g. "AP-MACRO"
  name        String
  unitCount   Int
  passingScore Float
}

model StudentSubject {
  id          String    @id @default(cuid())
  studentId   String
  subjectCode String
  targetScore Float     @default(5)
  student     Student   @relation(fields: [studentId], references: [id])
}

model ExamDate {
  id          String    @id @default(cuid())
  classId     String
  subjectCode String
  examDate    DateTime
  class       Class     @relation(fields: [classId], references: [id])
}

model AssessmentRecord {
  id           String    @id @default(cuid())
  studentId    String
  subjectCode  String
  recordType   String    // MCQ | FRQ | FullMock | UnitQuiz
  timedMode    String    // timed | untimed | semi-timed
  difficulty   String    // basic | medium | hard
  source       String?
  scoreRaw     Float?
  scorePercent Float?
  takenAt      DateTime
  student      Student   @relation(fields: [studentId], references: [id])
}

model DailyUpdate {
  id              String    @id @default(cuid())
  studentId       String
  updateDate      DateTime
  subjectCode     String
  activityType    String    // MCQ | FRQ | FullMock | Review | etc
  timedMode       String?
  durationMinutes Int?
  scoreRaw        Float?
  scorePercent    Float?
  description     String?
  aiEvidenceLevel String?   // weak | medium | strong
  aiDeltaScore    Float?
  aiExplanation   String?
  student         Student   @relation(fields: [studentId], references: [id])
}

model ProbabilitySnapshot {
  id              String    @id @default(cuid())
  studentId       String
  subjectCode     String
  snapshotDate    DateTime
  fiveRate        Float
  readinessScore  Float?
  stabilityScore  Float?
  trendScore      Float?
  decayScore      Float?
  confidenceLevel String    // high | medium | low
  explanation     String?
}

model Resource {
  id          String    @id @default(cuid())
  uploaderId  String
  subjectCode String
  title       String
  resourceType String   // note | questions | video | lecture | summary
  unit        String?
  description String?
  url         String?
  createdAt   DateTime  @default(now())
}
```

## 5 分率计算引擎（Phase 3 实现）

```
fiveRate = 0.60 * testPerformance
         + 0.15 * trendScore
         + 0.15 * stabilityScore
         + 0.10 * reviewQuality
         - decayFactor
```

- testPerformance：加权测试成绩（计时模考权重最高）
- trendScore：最近 3-5 次的趋势方向
- stabilityScore：分数波动的反向指标
- reviewQuality：AI 判断复习描述深度
- decayFactor：每日轻微衰减，无复习时生效

## Phase 划分

### Phase 1：页面骨架 + 假数据（当前）
- 首页班级选择器
- 班级仪表盘（4 个指标卡 + 5 月日历）
- 个人中心
- 单科详情
- 每日更新表单（仅 UI）
- 全部用 mock 数据

### Phase 2：数据录入闭环
- Prisma + SQLite 数据库
- 学生注册/登录
- 每日更新表单提交
- 测试记录录入
- 资源上传

### Phase 3：基础评分引擎
- 规则版 5 分率计算
- 趋势/稳定性/遗忘衰减
- 概率快照生成

### Phase 4：AI 接入
- 每日描述质量判断
- 变化原因解释生成
- 学习建议输出

### Phase 5：班级管理增强
- 风险预警名单
- 断更/波动异常名单
- 薄弱单元热力图
