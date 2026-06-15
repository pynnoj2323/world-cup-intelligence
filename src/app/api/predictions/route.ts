// /api/predictions — 预测存储（DB + 内存双写）
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// 内存备用存储（DB写入失败时不丢数据）
let predStore: Record<string, any[]> = {};

export async function GET(req: NextRequest) {
  const matchId = new URL(req.url).searchParams.get("matchId");
  const limit = parseInt(new URL(req.url).searchParams.get("limit") || "20");

  try {
    if (matchId) {
      const records = await db.predictionRecord.findMany({
        where: { matchId },
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 100),
      });
      return NextResponse.json(records.map(r => ({
        id: r.id,
        matchId: r.matchId,
        homeTeam: r.homeTeam,
        awayTeam: r.awayTeam,
        predictedHomeWin: r.predictedHomeWin,
        predictedDraw: r.predictedDraw,
        predictedAwayWin: r.predictedAwayWin,
        predictedHomeScore: r.predictedHomeScore,
        predictedAwayScore: r.predictedAwayScore,
        confidence: r.confidence,
        confidenceLabel: r.confidenceLabel,
        recommendationLabel: r.recommendationLabel,
        recommendationReason: r.recommendationReason,
        scorePredictionsJson: r.scorePredictionsJson,
        keyFactorsJson: r.keyFactorsJson,
        riskFactorsJson: r.riskFactorsJson,
        narrativeSummary: r.narrativeSummary,
        actualHomeScore: r.actualHomeScore,
        actualAwayScore: r.actualAwayScore,
        actualResult: r.actualResult,
        resultCorrect: r.resultCorrect,
        scoreDiff: r.scoreDiff,
        accuracyScore: r.accuracyScore,
        createdAt: r.createdAt.toISOString(),
      })));
    }

    const all = await db.predictionRecord.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });
    return NextResponse.json(all.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })));
  } catch {
    // DB不可用时回退内存
    if (!matchId) {
      const all = Object.entries(predStore).flatMap(([k, v]) =>
        v.map((p: any) => ({ ...p, matchId: k }))
      );
      all.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return NextResponse.json(all.slice(0, limit));
    }
    const records = (predStore[matchId] || [])
      .sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
    return NextResponse.json(records);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      matchId, homeTeam, awayTeam, group, stage,
      predictedHomeWin, predictedDraw, predictedAwayWin,
      predictedHomeScore, predictedAwayScore,
      confidence, confidenceLabel,
      recommendationLabel, recommendationReason,
      scorePredictionsJson, keyFactorsJson, riskFactorsJson,
      narrativeSummary, scoreReasoning, tacticalAnalysisJson,
      chainOfThoughtJson,
    } = body;

    if (!matchId)
      return NextResponse.json({ error: "需要 matchId" }, { status: 400 });

    const recordData = {
      id: `pred_${Date.now()}`,
      matchId,
      homeTeam: homeTeam || "",
      awayTeam: awayTeam || "",
      predictedHomeWin: predictedHomeWin || 0,
      predictedDraw: predictedDraw || 0,
      predictedAwayWin: predictedAwayWin || 0,
      predictedHomeScore: predictedHomeScore || 0,
      predictedAwayScore: predictedAwayScore || 0,
      confidence: confidence || 0.5,
      confidenceLabel: confidenceLabel || "",
      recommendationLabel: recommendationLabel || "",
      recommendationReason: recommendationReason || "",
      scorePredictionsJson: scorePredictionsJson || "[]",
      keyFactorsJson: keyFactorsJson || "[]",
      riskFactorsJson: riskFactorsJson || "[]",
      narrativeSummary: narrativeSummary || "",
      createdAt: new Date().toISOString(),
    };

    // 内存存储（始终成功）
    if (!predStore[matchId]) predStore[matchId] = [];
    predStore[matchId].unshift(recordData);
    if (predStore[matchId].length > 20)
      predStore[matchId] = predStore[matchId].slice(0, 20);

    // DB 持久化
    try {
      const dbRecord = await db.predictionRecord.create({
        data: {
          matchId,
          userId: "anonymous",
          homeTeam: homeTeam || "",
          awayTeam: awayTeam || "",
          group: group || null,
          stage: stage || null,
          predictedHomeWin: predictedHomeWin || 0,
          predictedDraw: predictedDraw || 0,
          predictedAwayWin: predictedAwayWin || 0,
          predictedHomeScore: predictedHomeScore || 0,
          predictedAwayScore: predictedAwayScore || 0,
          confidence: confidence || 0.5,
          confidenceLabel: confidenceLabel || "",
          recommendationLabel: recommendationLabel || "",
          recommendationReason: recommendationReason || "",
          scorePredictionsJson: scorePredictionsJson || "[]",
          keyFactorsJson: keyFactorsJson || "[]",
          riskFactorsJson: riskFactorsJson || "[]",
          narrativeSummary: narrativeSummary || "",
          ensembleRuns: 3,
        },
      });
      return NextResponse.json({ ...recordData, id: dbRecord.id });
    } catch {
      // DB失败时仍返回内存记录
      return NextResponse.json(recordData);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
