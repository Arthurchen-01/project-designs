import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      enrollments: true,
      scores: {
        orderBy: { date: "desc" },
      },
      fiveRates: {
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "学生不存在" }, { status: 404 });
  }

  // Latest five-rate per subject
  const latestSnapshots = new Map<string, { rate: number; confidence: string }>();
  for (const snap of student.fiveRates) {
    if (!latestSnapshots.has(snap.subjectCode)) {
      latestSnapshots.set(snap.subjectCode, {
        rate: snap.rate,
        confidence: snap.confidence,
      });
    }
  }

  // Overall five rate
  const rates = Array.from(latestSnapshots.values()).map((s) => s.rate);
  const avgFiveRate =
    rates.length > 0
      ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100)
      : 0;

  // MCQ stats
  const mcqRecords = student.scores.filter(
    (a) => a.type === "MCQ" && a.score != null
  );
  const mcqScores = mcqRecords.map((r) => r.score!);
  const avgMcq =
    mcqScores.length > 0
      ? Math.round(mcqScores.reduce((a, b) => a + b, 0) / mcqScores.length)
      : 0;

  // FRQ stats
  const frqRecords = student.scores.filter(
    (a) => a.type === "FRQ" && a.score != null
  );
  const frqScores = frqRecords.map((r) => r.score!);
  const avgFrq =
    frqScores.length > 0
      ? Math.round(frqScores.reduce((a, b) => a + b, 0) / frqScores.length)
      : 0;

  // Timed vs untimed
  const timedRecords = student.scores.filter((a) => a.timedMode === "timed" && a.score != null);
  const untimedRecords = student.scores.filter((a) => a.timedMode !== "timed" && a.score != null);
  const avgTimed =
    timedRecords.length > 0
      ? Math.round(timedRecords.reduce((sum, r) => sum + (r.score ?? 0), 0) / timedRecords.length)
      : 0;
  const avgUntimed =
    untimedRecords.length > 0
      ? Math.round(untimedRecords.reduce((sum, r) => sum + (r.score ?? 0), 0) / untimedRecords.length)
      : 0;

  // Subject details
  const subjects = student.enrollments.map((sub) => {
    const snap = latestSnapshots.get(sub.subjectCode);
    return {
      subjectCode: sub.subjectCode,
      rate: snap ? Math.round(snap.rate * 100) : 0,
      confidence: snap?.confidence ?? "未知",
    };
  });

  // Exam dates
  const examDates = await prisma.examDate.findMany({
    where: { subjectCode: { in: student.enrollments.map(e => e.subjectCode) } },
  });

  return NextResponse.json({
    id: student.id,
    name: student.name,
    classId: student.classId,
    avgFiveRate,
    avgMcq,
    mcqTestCount: mcqRecords.length,
    avgFrq,
    frqTestCount: frqRecords.length,
    avgTimed,
    avgUntimed,
    subjects,
    examDates: examDates.map((e) => ({
      subjectCode: e.subjectCode,
      date: e.date,
    })),
  });
}
