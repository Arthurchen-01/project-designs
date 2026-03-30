// ============================================================
// AP 备考追踪平台 — Mock 数据
// ============================================================

// ----------------------------------------------------------------
// 班级
// ----------------------------------------------------------------
export const classroom = {
  id: "classroom-1",
  name: "AP备考班 2026",
  season: "2025-2026",
}

// ----------------------------------------------------------------
// 科目
// ----------------------------------------------------------------
export const subjects = [
  { code: "AP-MACRO",  name: "AP宏观经济学",  color: "#3B82F6" },
  { code: "AP-MICRO",  name: "AP微观经济学",  color: "#8B5CF6" },
  { code: "AP-CALC-BC", name: "AP微积分BC",  color: "#10B981" },
  { code: "AP-STAT",   name: "AP统计学",      color: "#F59E0B" },
  { code: "AP-PHY-C",  name: "AP物理C力学",  color: "#EF4444" },
  { code: "AP-CHEM",   name: "AP化学",        color: "#06B6D4" },
  { code: "AP-BIO",    name: "AP生物学",      color: "#84CC16" },
  { code: "AP-LANG",   name: "AP英语语言",    color: "#EC4899" },
]

// ----------------------------------------------------------------
// 学生
// ----------------------------------------------------------------
export const students = [
  { id: "stu-01", name: "陈冠宇",   gender: "男" },
  { id: "stu-02", name: "林思远",   gender: "男" },
  { id: "stu-03", name: "王诗涵",   gender: "女" },
  { id: "stu-04", name: "张明轩",   gender: "男" },
  { id: "stu-05", name: "李雨桐",   gender: "女" },
  { id: "stu-06", name: "刘子涵",   gender: "男" },
  { id: "stu-07", name: "赵晓晨",   gender: "女" },
  { id: "stu-08", name: "周宇航",   gender: "男" },
  { id: "stu-09", name: "吴思琪",   gender: "女" },
]

// ----------------------------------------------------------------
// 报考关系
// ----------------------------------------------------------------
export const studentSubjects: Record<string, string[]> = {
  "stu-01": ["AP-MACRO", "AP-MICRO", "AP-CALC-BC", "AP-STAT"],
  "stu-02": ["AP-MACRO", "AP-CALC-BC", "AP-PHY-C",  "AP-STAT"],
  "stu-03": ["AP-MACRO", "AP-LANG",   "AP-ENG",    "AP-LIT"],
  "stu-04": ["AP-MACRO", "AP-CHEM",   "AP-BIO",    "AP-CALC-BC"],
  "stu-05": ["AP-MACRO", "AP-STAT",   "AP-MICRO"],
  "stu-06": ["AP-MACRO", "AP-MICRO",  "AP-PHY-C",  "AP-CALC-BC"],
  "stu-07": ["AP-LANG",  "AP-LIT",    "AP-ENG"],
  "stu-08": ["AP-MACRO", "AP-STAT",   "AP-CHEM"],
  "stu-09": ["AP-BIO",   "AP-CHEM",   "AP-MACRO"],
}

// ----------------------------------------------------------------
// 5月AP考试日期
// ----------------------------------------------------------------
export const examDates = [
  { date: "2026-05-04", subjects: ["AP-CHEM",  "AP-PHY-C"] },
  { date: "2026-05-05", subjects: ["AP-MACRO", "AP-MICRO"] },
  { date: "2026-05-06", subjects: ["AP-CALC-BC"] },
  { date: "2026-05-07", subjects: ["AP-STAT"] },
  { date: "2026-05-08", subjects: ["AP-LANG"] },
  { date: "2026-05-11", subjects: ["AP-BIO"] },
  { date: "2026-05-12", subjects: ["AP-LIT"] },
]

// ----------------------------------------------------------------
// 成绩记录
// ----------------------------------------------------------------
export interface MockScore {
  id: string
  studentId: string
  subjectCode: string
  type: "mcq" | "frq" | "full-mock"
  timedMode: "timed" | "untimed"
  score: number
  maxScore: number
  date: string
  difficulty?: "basic" | "medium" | "hard"
}

export const scores: MockScore[] = [
  // 陈冠宇 - AP-MACRO
  { id: "s001", studentId: "stu-01", subjectCode: "AP-MACRO", type: "full-mock", timedMode: "timed",   score: 78, maxScore: 100, date: "2026-01-10", difficulty: "medium" },
  { id: "s002", studentId: "stu-01", subjectCode: "AP-MACRO", type: "mcq",       timedMode: "timed",   score: 41, maxScore: 50,  date: "2026-01-24", difficulty: "medium" },
  { id: "s003", studentId: "stu-01", subjectCode: "AP-MACRO", type: "frq",       timedMode: "timed",   score: 28, maxScore: 40,  date: "2026-02-07", difficulty: "hard" },
  { id: "s004", studentId: "stu-01", subjectCode: "AP-MACRO", type: "full-mock", timedMode: "untimed", score: 89, maxScore: 100, date: "2026-02-21", difficulty: "medium" },
  { id: "s005", studentId: "stu-01", subjectCode: "AP-MACRO", type: "mcq",       timedMode: "timed",   score: 47, maxScore: 50,  date: "2026-03-07", difficulty: "medium" },
  { id: "s006", studentId: "stu-01", subjectCode: "AP-MACRO", type: "full-mock", timedMode: "timed",   score: 84, maxScore: 100, date: "2026-03-21", difficulty: "medium" },
  // 陈冠宇 - AP-CALC-BC
  { id: "s007", studentId: "stu-01", subjectCode: "AP-CALC-BC", type: "full-mock", timedMode: "timed",   score: 65, maxScore: 100, date: "2026-01-15", difficulty: "hard" },
  { id: "s008", studentId: "stu-01", subjectCode: "AP-CALC-BC", type: "mcq",       timedMode: "timed",   score: 37, maxScore: 45,  date: "2026-02-05", difficulty: "medium" },
  { id: "s009", studentId: "stu-01", subjectCode: "AP-CALC-BC", type: "full-mock", timedMode: "untimed", score: 80, maxScore: 100, date: "2026-02-26", difficulty: "hard" },
  { id: "s010", studentId: "stu-01", subjectCode: "AP-CALC-BC", type: "frq",       timedMode: "timed",   score: 26, maxScore: 45,  date: "2026-03-12", difficulty: "hard" },
  // 林思远 - AP-MACRO
  { id: "s011", studentId: "stu-02", subjectCode: "AP-MACRO", type: "full-mock", timedMode: "timed",   score: 55, maxScore: 100, date: "2026-01-10", difficulty: "medium" },
  { id: "s012", studentId: "stu-02", subjectCode: "AP-MACRO", type: "mcq",       timedMode: "timed",   score: 28, maxScore: 50,  date: "2026-02-01", difficulty: "medium" },
  { id: "s013", studentId: "stu-02", subjectCode: "AP-MACRO", type: "full-mock", timedMode: "untimed", score: 72, maxScore: 100, date: "2026-02-21", difficulty: "medium" },
  { id: "s014", studentId: "stu-02", subjectCode: "AP-MACRO", type: "mcq",       timedMode: "timed",   score: 34, maxScore: 50,  date: "2026-03-14", difficulty: "medium" },
  // 王诗涵 - AP-LANG
  { id: "s015", studentId: "stu-03", subjectCode: "AP-LANG", type: "full-mock", timedMode: "timed",   score: 62, maxScore: 100, date: "2026-01-18", difficulty: "hard" },
  { id: "s016", studentId: "stu-03", subjectCode: "AP-LANG", type: "frq",       timedMode: "untimed", score: 22, maxScore: 40,  date: "2026-02-14", difficulty: "hard" },
  { id: "s017", studentId: "stu-03", subjectCode: "AP-LANG", type: "full-mock", timedMode: "timed",   score: 68, maxScore: 100, date: "2026-03-07", difficulty: "hard" },
  // 张明轩 - AP-CHEM
  { id: "s018", studentId: "stu-04", subjectCode: "AP-CHEM", type: "full-mock", timedMode: "timed",   score: 48, maxScore: 100, date: "2026-01-22", difficulty: "hard" },
  { id: "s019", studentId: "stu-04", subjectCode: "AP-CHEM", type: "mcq",       timedMode: "untimed", score: 32, maxScore: 50,  date: "2026-02-18", difficulty: "medium" },
  { id: "s020", studentId: "stu-04", subjectCode: "AP-CHEM", type: "full-mock", timedMode: "timed",   score: 55, maxScore: 100, date: "2026-03-14", difficulty: "hard" },
]

// ----------------------------------------------------------------
// 5分率快照 (人×科)
// ----------------------------------------------------------------
export interface FiveRate {
  studentId: string
  subjectCode: string
  rate: number          // 0-1
  confidence: "high" | "medium" | "low"
  trend: "rising" | "stable" | "falling"
}

export const fiveRates: FiveRate[] = [
  { studentId: "stu-01", subjectCode: "AP-MACRO",   rate: 0.74, confidence: "high",   trend: "rising" },
  { studentId: "stu-01", subjectCode: "AP-CALC-BC", rate: 0.58, confidence: "medium", trend: "rising" },
  { studentId: "stu-01", subjectCode: "AP-MICRO",   rate: 0.68, confidence: "medium", trend: "stable" },
  { studentId: "stu-01", subjectCode: "AP-STAT",    rate: 0.75, confidence: "high",   trend: "rising" },
  { studentId: "stu-02", subjectCode: "AP-MACRO",   rate: 0.51, confidence: "medium", trend: "stable" },
  { studentId: "stu-02", subjectCode: "AP-CALC-BC", rate: 0.45, confidence: "medium", trend: "stable" },
  { studentId: "stu-03", subjectCode: "AP-LANG",    rate: 0.45, confidence: "medium", trend: "rising" },
  { studentId: "stu-04", subjectCode: "AP-CHEM",    rate: 0.38, confidence: "low",   trend: "stable" },
]

// ----------------------------------------------------------------
// 知识点掌握度
// ----------------------------------------------------------------
export const unitMastery: Record<string, Record<string, number>> = {
  "AP-MACRO": {
    "Unit 1 基础概念": 0.85, "Unit 2 供需": 0.80,
    "Unit 3 国民收入": 0.72, "Unit 4 失业通胀": 0.68,
    "Unit 5 财政政策": 0.90, "Unit 6 货币政策": 0.75,
  },
  "AP-CALC-BC": {
    "Unit 1 极限": 0.88, "Unit 2 连续": 0.82,
    "Unit 3 导数": 0.76, "Unit 4 导数应用": 0.70,
    "Unit 5 积分": 0.65, "Unit 6 积分应用": 0.58,
    "Unit 7 微分方程": 0.72, "Unit 8 无穷级数": 0.55,
  },
  "AP-CHEM": {
    "Unit 1 原子结构": 0.60, "Unit 2 分子结构": 0.55,
    "Unit 3 化学键": 0.48, "Unit 4 计量学": 0.65,
    "Unit 5 热化学": 0.40, "Unit 6 化学动力学": 0.35,
  },
}

// ----------------------------------------------------------------
// 资源共享
// ----------------------------------------------------------------
export interface SharedResource {
  id: string
  uploaderId: string
  subjectCode: string
  title: string
  type: "note" | "video" | "practice" | "flashcard" | "lecture"
  unit?: string
  description: string
  url: string
  likes: number
}

export const sharedResources: SharedResource[] = [
  { id: "r01", uploaderId: "stu-01", subjectCode: "AP-MACRO",   title: "Macro 所有公式速查表",       type: "note",     description: "总结了Macro所有核心公式，适合考前快速复习",      url: "#", likes: 12 },
  { id: "r02", uploaderId: "stu-02", subjectCode: "AP-MACRO",   title: "2023年FRQ标准答案解析",      type: "practice", description: "官方案例分析，每道题都有详细评分点说明",       url: "#", likes: 8  },
  { id: "r03", uploaderId: "stu-01", subjectCode: "AP-CALC-BC", title: "BC 积分技巧总结",              type: "note",     description: "分部积分、换元法、三角换元三大方法汇总",       url: "#", likes: 15 },
  { id: "r04", uploaderId: "stu-04", subjectCode: "AP-CHEM",    title: "Chemistry Unit 1-3 讲义",       type: "lecture",  description: "学校老师发的电子版讲义，全彩高清",               url: "#", likes: 20 },
  { id: "r05", uploaderId: "stu-03", subjectCode: "AP-LANG",    title: "AP Lang Essay 框架模板",       type: "note",     description: "Synthesis/Argument/Rhetorical Analysis 三种模板", url: "#", likes: 25 },
  { id: "r06", uploaderId: "stu-02", subjectCode: "AP-STAT",    title: "Stats 公式速记卡",             type: "flashcard", description: "AP Stats 核心公式做成 Anki 闪卡格式",         url: "#", likes: 18 },
  { id: "r07", uploaderId: "stu-01", subjectCode: "AP-MICRO",   title: "Micro 图形分析专题",           type: "practice", description: "垄断/寡头/完全竞争图形汇总，附练习题",        url: "#", likes: 10 },
  { id: "r08", uploaderId: "stu-06", subjectCode: "AP-PHY-C",  title: "Physics C 公式推导讲解",        type: "video",    description: "B站搬运，含推导过程和中文字幕",                   url: "#", likes: 14 },
]

// ----------------------------------------------------------------
// 辅助函数
// ----------------------------------------------------------------
export function getStudentById(id: string) {
  return students.find(s => s.id === id)
}

export function getSubjectByCode(code: string) {
  return subjects.find(s => s.code === code)
}

export function getStudentsBySubject(subjectCode: string) {
  return students.filter(s => (studentSubjects[s.id] || []).includes(subjectCode))
}

export function getResourcesBySubject(subjectCode: string) {
  return sharedResources.filter(r => r.subjectCode === subjectCode)
}

export function getClassroomStats() {
  const totalEnrollments = students.reduce((sum, s) => sum + (studentSubjects[s.id] || []).length, 0)
  const avgPerStudent = totalEnrollments / students.length

  // 班级整体5分率 = 所有"人×科"5分率均值
  const avgFiveRate = fiveRates.length > 0
    ? fiveRates.reduce((sum, f) => sum + f.rate, 0) / fiveRates.length
    : 0

  const mcqScores = scores.filter(s => s.type === "mcq")
  const frqScores = scores.filter(s => s.type === "frq")

  const avgMcqRate = mcqScores.length > 0
    ? mcqScores.reduce((sum, s) => sum + s.score / s.maxScore, 0) / mcqScores.length
    : 0

  const avgFrqRate = frqScores.length > 0
    ? frqScores.reduce((sum, s) => sum + s.score / s.maxScore, 0) / frqScores.length
    : 0

  return {
    totalEnrollments,
    avgPerStudent,
    avgFiveRate,
    avgMcqRate,
    avgFrqRate,
  }
}

export function daysUntil(dateStr: string): number {
  const today = new Date("2026-03-30")
  const target = new Date(dateStr)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
