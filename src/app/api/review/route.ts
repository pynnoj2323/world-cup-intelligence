// /api/review — Review Agent 复盘端点
import { NextRequest, NextResponse } from "next/server";
import { runReviewAgent } from "@/agents/review-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await runReviewAgent({
      prediction: {
        homeWin: body.predictedHomeWin,
        draw: body.predictedDraw,
        awayWin: body.predictedAwayWin,
        predictedHomeScore: body.predictedHomeScore,
        predictedAwayScore: body.predictedAwayScore,
        scorePredictions: [],
        scoreReasoning: "",
        over25Prob: 0,
        bttsProb: 0,
        correctScoreProb: 0,
        asianHandicap: "",
        confidence: body.confidence || 0.6,
        confidenceLabel: body.confidenceLabel || "medium",
        recommendationType: body.recommendationType || "",
        recommendationLabel: body.recommendationLabel || "",
        recommendationReason: body.recommendationReason || "",
        tacticalAnalysis: { homeTactics: "", awayTactics: "", keyBattle: "" },
        keyFactors: body.keyFactors || [],
        riskFactors: body.riskFactors || [],
        narrativeSummary: "",
        chainOfThought: [],
      },
      actualHomeScore: body.actualHomeScore,
      actualAwayScore: body.actualAwayScore,
      actualResult: body.actualResult,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
