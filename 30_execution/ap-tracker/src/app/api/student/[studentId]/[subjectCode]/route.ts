import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string; subjectCode: string }> }
) {
  const { studentId, subjectCode } = await params;
  const decodedSubject = decodeURIComponent(subjectCode);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    return NextResponse.json({ error: "学生不存在" }, { status: 404 });
  }

  // Get assessments for this subject
  const assessments = await prisma.assessmentRecord.findMany({
    where: { studentId, subjectCode: decodedSubject },
    orderBy: { date: "asc" },
  });

  // Get snapshots for trend
  const snapshots = await prisma.probabilitySnapshot.findMany({
    where: { studentId, subjectCode: decodedSubject },
    orderBy: { updatedAt: "asc" },
  });

  // Latest snapshot
  const latestSnap = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const rate = latestSnap ? Math.round(latestSnap.rate * 100) : 0;

  // Exam date
  const examDate = await prisma.examDate.findFirst({
    where: { subjectCode: decodedSubject },
  });

  // MCQ records
  const mcqRecords = assessments.filter((a) => a.type === "MCQ");
  const frqRecords = assessments.filter((a) => a.type === "FRQ");

  // Timed vs untimed comparison
  const timedMcq = mcqRecords.filter((a) => a.timedMode === "timed" && a.score != null);
  const untimedMcq = mcqRecords.filter((a) => a.timedMode !== "timed" && a.score != null);
  const timedFrq = frqRecords.filter((a) => a.timedMode === "timed" && a.score != null);
  const untimedFrq = frqRecords.filter((a) => a.timedMode !== "timed" && a.score != null);

  const avg = (arr: { score: number | null }[]) => {
    const vals = arr.map((r) => r.score!).filter((v) => v != null);
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  };

  // Trend data from snapshots
  const trendData = snapshots.map((s) => ({
    date: s.updatedAt.toISOString().split("T")[0],
    rate: Math.round(s.rate * 100),
  }));

  return NextResponse.json({
    studentId,
    studentName: student.name,
    subjectCode: decodedSubject,
    rate,
    confidence: latestSnap?.confidence ?? "未知",
    examDate: examDate ? examDate.date.split("T")[0] : null,
    mcqScores: mcqRecords.map((r) => ({
      date: r.date.split("T")[0],
      score: r.score,
      timed: r.timedMode === "timed",
    })),
    frqScores: frqRecords.map((r) => ({
      date: r.date.split("T")[0],
      score: r.score,
      timed: r.timedMode === "timed",
    })),
    barData: [
      { name: "MCQ", 不计时: avg(untimedMcq), 计时: avg(timedMcq) },
      { name: "FRQ", 不计时: avg(untimedFrq), 计时: avg(timedFrq) },
    ],
    trendData,
  });
}
