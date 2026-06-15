// /api/review — 赛后复盘
import { NextRequest, NextResponse } from "next/server";
import { runReviewAgent } from "@/agents/review-agent";
import { db } from "@/lib/db";
import type { ReviewAgentInput } from "@/agents/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      matchId, homeTeam, awayTeam,
      predictedHomeWin, predictedDraw, predictedAwayWin,
      predictedHomeScore, predictedAwayScore,
      confidence, confidenceLabel, recommendationLabel, recommendationReason,
      actualHomeScore, actualAwayScore, actualResult,
      // 可选的额外上下文
      scorePredictionsJson, keyFactorsJson, riskFactorsJson,
      narrativeSummary, scoreReasoning,
      tacticalAnalysisJson, chainOfThoughtJson,
    } = body;

    if (actualHomeScore == null || actualAwayScore == null) {
      return NextResponse.json({ error: "缺少实际比分" }, { status: 400 });
    }

    const prediction: ReviewAgentInput["prediction"] = {
      homeWin: predictedHomeWin ?? 0,
      draw: predictedDraw ?? 0,
      awayWin: predictedAwayWin ?? 0,
      predictedHomeScore: predictedHomeScore ?? 0,
      predictedAwayScore: predictedAwayScore ?? 0,
      confidence: confidence ?? 0.5,
      confidenceLabel: confidenceLabel ?? "",
      recommendationLabel: recommendationLabel ?? "",
      recommendationType: (() => {
        const h = predictedHomeWin ?? 0, d = predictedDraw ?? 0, a = predictedAwayWin ?? 0;
        return h >= d && h >= a ? "home_win" : d >= a ? "draw" : "away_win";
      })(),
      recommendationReason: recommendationReason ?? "",
      scorePredictions: scorePredictionsJson ? JSON.parse(scorePredictionsJson) : [],
      scoreReasoning: scoreReasoning ?? "",
      narrativeSummary: narrativeSummary ?? "",
      tacticalAnalysis: tacticalAnalysisJson
        ? JSON.parse(tacticalAnalysisJson)
        : { homeTactics: "", awayTactics: "", keyBattle: "" },
      chainOfThought: chainOfThoughtJson ? JSON.parse(chainOfThoughtJson) : [],
      over25Prob: 0,
      bttsProb: 0,
      correctScoreProb: 0,
      asianHandicap: "",
      keyFactors: keyFactorsJson ? JSON.parse(keyFactorsJson) : [],
      riskFactors: riskFactorsJson ? JSON.parse(riskFactorsJson) : [],
    };

    const result = await runReviewAgent({
      prediction,
      actualHomeScore,
      actualAwayScore,
      actualResult: actualResult ?? (actualHomeScore > actualAwayScore ? "home_win" : actualHomeScore < actualAwayScore ? "away_win" : "draw"),
    });

    // 持久化复盘结果到数据库
    if (matchId) {
      try {
        const latest = await db.predictionRecord.findFirst({
          where: { matchId },
          orderBy: { createdAt: "desc" },
        });

        if (latest) {
          await db.predictionRecord.update({
            where: { id: latest.id },
            data: {
              actualHomeScore,
              actualAwayScore,
              actualResult: actualResult ?? (actualHomeScore > actualAwayScore ? "home_win" : actualHomeScore < actualAwayScore ? "away_win" : "draw"),
              resultUpdatedAt: new Date(),
              resultCorrect: result.predictionAccuracy.resultCorrect,
              scoreCorrect: result.predictionAccuracy.scoreCorrect,
              scoreDiff: result.predictionAccuracy.scoreDiff,
              accuracyScore: result.predictionAccuracy.overallScore,
            },
          });
        } else if (homeTeam && awayTeam) {
          // 无预测记录但有比赛信息：创建一条仅含实际结果的记录
          await db.predictionRecord.create({
            data: {
              matchId,
              userId: "anonymous",
              homeTeam,
              awayTeam,
              predictedHomeWin: predictedHomeWin ?? 0,
              predictedDraw: predictedDraw ?? 0,
              predictedAwayWin: predictedAwayWin ?? 0,
              predictedHomeScore: predictedHomeScore ?? 0,
              predictedAwayScore: predictedAwayScore ?? 0,
              confidence: confidence ?? 0.5,
              confidenceLabel: confidenceLabel ?? "",
              recommendationLabel: recommendationLabel ?? "",
              recommendationReason: recommendationReason ?? "",
              scorePredictionsJson: scorePredictionsJson ?? "[]",
              keyFactorsJson: keyFactorsJson ?? "[]",
              riskFactorsJson: riskFactorsJson ?? "[]",
              narrativeSummary: narrativeSummary ?? "",
              ensembleRuns: 3,
              actualHomeScore,
              actualAwayScore,
              actualResult: actualResult ?? (actualHomeScore > actualAwayScore ? "home_win" : actualHomeScore < actualAwayScore ? "away_win" : "draw"),
              resultUpdatedAt: new Date(),
              resultCorrect: result.predictionAccuracy.resultCorrect,
              scoreCorrect: result.predictionAccuracy.scoreCorrect,
              scoreDiff: result.predictionAccuracy.scoreDiff,
              accuracyScore: result.predictionAccuracy.overallScore,
            },
          });
        }
      } catch (e: any) {
        console.error("复盘持久化失败:", e.message);
        // 持久化失败不影响返回复盘结果
      }
    }

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
