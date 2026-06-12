// /api/matches/status — 管理端更新比赛状态和比分
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// POST — 更新比分/状态
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "仅管理员可操作" }, { status: 403 });
  }

  try {
    const { matchId, status, homeScore, awayScore } = await req.json();
    if (!matchId) return NextResponse.json({ error: "缺少 matchId" }, { status: 400 });

    const data: any = { updatedBy: user.email };
    if (status) data.status = status;
    if (homeScore !== undefined) data.homeScore = homeScore;
    if (awayScore !== undefined) data.awayScore = awayScore;

    const record = await db.matchStatus.upsert({
      where: { matchId },
      create: { matchId, ...data },
      update: data,
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — 获取所有比赛状态
export async function GET(req: NextRequest) {
  const matchId = new URL(req.url).searchParams.get("matchId");

  try {
    const where = matchId ? { matchId } : {};
    const records = await db.matchStatus.findMany({ where, orderBy: { updatedAt: "desc" } });
    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
