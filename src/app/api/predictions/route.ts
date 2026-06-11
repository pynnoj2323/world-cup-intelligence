import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

// POST — 保存预测记录
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    const record = await db.predictionRecord.create({
      data: {
        matchId: body.matchId,
        userId: user.id,
        homeTeam: body.homeTeam,
        awayTeam: body.awayTeam,
        group: body.group || null,
        stage: body.stage || null,
        predictedHomeWin: body.predictedHomeWin,
        predictedDraw: body.predictedDraw,
        predictedAwayWin: body.predictedAwayWin,
        predictedHomeScore: body.predictedHomeScore,
        predictedAwayScore: body.predictedAwayScore,
        confidence: body.confidence,
        confidenceLabel: body.confidenceLabel,
        recommendationLabel: body.recommendationLabel,
        recommendationReason: body.recommendationReason || null,
        scorePredictionsJson: body.scorePredictionsJson || null,
        keyFactorsJson: body.keyFactorsJson || null,
        riskFactorsJson: body.riskFactorsJson || null,
        narrativeSummary: body.narrativeSummary || null,
        ensembleRuns: body.ensembleRuns || 3,
        voteAgreement: body.voteAgreement || null,
        isRisky: body.isRisky || false,
      },
    });

    return NextResponse.json({ success: true, id: record.id });
  } catch (error: any) {
    console.error("保存预测记录失败:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET — 查询预测记录
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const url = new URL(req.url);
  const matchId = url.searchParams.get("matchId");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  try {
    const where: any = {};
    if (matchId) where.matchId = matchId;

    const records = await db.predictionRecord.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 50),
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(records);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — 更新实际结果（校准）
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, actualHomeScore, actualAwayScore, actualResult } = body;

    const record = await db.predictionRecord.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: "记录不存在" }, { status: 404 });

    // 计算准确度
    const resultCorrect = actualResult
      ? (actualResult === "home_win" && record.predictedHomeWin > record.predictedDraw && record.predictedHomeWin > record.predictedAwayWin) ||
        (actualResult === "draw" && record.predictedDraw > record.predictedHomeWin && record.predictedDraw > record.predictedAwayWin) ||
        (actualResult === "away_win" && record.predictedAwayWin > record.predictedHomeWin && record.predictedAwayWin > record.predictedDraw)
      : null;

    const scoreCorrect = actualHomeScore !== undefined && actualAwayScore !== undefined
      ? actualHomeScore === record.predictedHomeScore && actualAwayScore === record.predictedAwayScore
      : null;

    const scoreDiff = actualHomeScore !== undefined && actualAwayScore !== undefined
      ? Math.abs(actualHomeScore - record.predictedHomeScore) + Math.abs(actualAwayScore - record.predictedAwayScore)
      : null;

    const accuracyScore = actualHomeScore !== undefined
      ? Math.round(Math.max(0, 100 - scoreDiff! * 20 - (resultCorrect ? 0 : 30)) * 100) / 100
      : null;

    const updated = await db.predictionRecord.update({
      where: { id },
      data: {
        actualHomeScore,
        actualAwayScore,
        actualResult,
        resultUpdatedAt: new Date(),
        resultCorrect,
        scoreCorrect,
        scoreDiff,
        accuracyScore,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
