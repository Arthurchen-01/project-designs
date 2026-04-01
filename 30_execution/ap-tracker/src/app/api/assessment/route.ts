import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const currentStudentId = cookieStore.get("studentId")?.value;

  const body = await request.json();
  const {
    studentId,
    subjectCode,
    type,
    timedMode,
    difficulty,
    scorePercentRaw,
    maxScore,
    score,
    date,
  } = body;

  const sid = studentId || currentStudentId;
  if (!sid) {
    return NextResponse.json({ error: "未指定学生" }, { status: 400 });
  }
  if (!subjectCode || !type) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const record = await prisma.assessmentRecord.create({
    data: {
      student: { connect: { id: sid } },
      subject: { connect: { code: subjectCode } },
      type,
      timedMode: timedMode || "timed",
      difficulty: difficulty || "medium",
      score: Number(scorePercentRaw) || 0,
      maxScore: Number(maxScore) || 100,
      date: date || new Date().toISOString().slice(0, 10),
    },
  });

  return NextResponse.json(record);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const cookieStore = await cookies();
  const sid = studentId || cookieStore.get("studentId")?.value;

  if (!sid) {
    return NextResponse.json({ error: "未指定学生" }, { status: 400 });
  }

  const records = await prisma.assessmentRecord.findMany({
    where: { studentId: sid },
    orderBy: { date: "desc" },
    take: 50,
  });

  return NextResponse.json(records);
}
