// /api/predictions — 内存预测存储（直接可用，无需DB）
import { NextRequest, NextResponse } from "next/server";

let predStore: Record<string, any[]> = {};

export async function GET(req: NextRequest) {
  const matchId = new URL(req.url).searchParams.get("matchId");
  const limit = parseInt(new URL(req.url).searchParams.get("limit") || "20");

  if (!matchId) {
    const all = Object.entries(predStore).flatMap(([k, v]) => v.map((p: any) => ({ ...p, matchId: k })));
    all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(all.slice(0, limit));
  }

  const records = (predStore[matchId] || [])
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matchId, homeTeam, awayTeam, predictedHomeWin, predictedDraw, predictedAwayWin,
      predictedHomeScore, predictedAwayScore, confidence, confidenceLabel,
      recommendationLabel, recommendationReason, scorePredictionsJson,
      keyFactorsJson, riskFactorsJson, narrativeSummary } = body;

    if (!matchId) return NextResponse.json({ error: "需要 matchId" }, { status: 400 });

    const record = {
      id: `pred_${Date.now()}`,
      matchId,
      homeTeam, awayTeam,
      predictedHomeWin, predictedDraw, predictedAwayWin,
      predictedHomeScore, predictedAwayScore,
      confidence, confidenceLabel,
      recommendationLabel, recommendationReason: recommendationReason || "",
      scorePredictionsJson: scorePredictionsJson || "[]",
      keyFactorsJson: keyFactorsJson || "[]",
      riskFactorsJson: riskFactorsJson || "[]",
      narrativeSummary: narrativeSummary || "",
      createdAt: new Date().toISOString(),
    };

    if (!predStore[matchId]) predStore[matchId] = [];
    predStore[matchId].unshift(record);
    if (predStore[matchId].length > 20) predStore[matchId] = predStore[matchId].slice(0, 20);

    return NextResponse.json(record);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
