// /api/predict — Agent 管道入口：Data Agent → Prediction Agent
import { NextRequest, NextResponse } from "next/server";
import { runDataAgent } from "@/agents/data-agent";
import { runPredictionAgent } from "@/agents/prediction-agent";
import type { PredictionAgentOutput } from "@/agents/types";

export async function POST(req: NextRequest) {
  try {
    const { homeTeam, awayTeam, group, stage, venue, dimensions } = await req.json();
    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: "缺少球队信息" }, { status: 400 });
    }

    // === Step 1: Data Agent ===
    const dataResult = await runDataAgent({
      match: {
        matchId: `${homeTeam.name}-${awayTeam.name}`,
        homeTeam: {
          name: homeTeam.name,
          fifaRanking: homeTeam.rank,
          group: homeTeam.group,
        },
        awayTeam: {
          name: awayTeam.name,
          fifaRanking: awayTeam.rank,
          group: awayTeam.group,
        },
        group,
        stage,
        venue,
      },
      includeStats: true,
      includeNews: true,
    });

    // === Step 2: Prediction Agent (带dimensions上下文) ===
    const prediction = await runPredictionAgent({
      matchData: dataResult.matchData,
      userDims: dimensions,
    });

    // === 转换为前端期望格式 ===
    const response = formatResponse(prediction, dataResult);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Agent Pipeline 失败:", error);
    return NextResponse.json(
      { error: error.message || "AI 服务暂时不可用" },
      { status: 500 }
    );
  }
}

function formatResponse(prediction: PredictionAgentOutput, dataResult: any) {
  return {
    home_win_probability: prediction.homeWin,
    draw_probability: prediction.draw,
    away_win_probability: prediction.awayWin,

    score_predictions: prediction.scorePredictions,
    predicted_home_score: prediction.predictedHomeScore,
    predicted_away_score: prediction.predictedAwayScore,
    score_reasoning: prediction.scoreReasoning,

    over_25_probability: prediction.over25Prob,
    both_teams_score_probability: prediction.bttsProb,
    correct_score_probability: prediction.correctScoreProb,
    asian_handicap_analysis: prediction.asianHandicap,

    confidence: prediction.confidence,
    confidence_label: prediction.confidenceLabel,

    recommendation_type: prediction.recommendationType,
    recommendation_label: prediction.recommendationLabel,
    recommendation_reason: prediction.recommendationReason,

    tactical_analysis: prediction.tacticalAnalysis,
    key_factors: prediction.keyFactors,
    risk_factors: prediction.riskFactors,
    narrative_summary: prediction.narrativeSummary,

    chain_of_thought: prediction.chainOfThought,
    data_summary: dataResult.summary,
    data_key_findings: dataResult.keyFindings,

    pipeline_metadata: {
      agents_used: ["Data Agent", "Prediction Agent"],
      data_freshness: dataResult.matchData.dataFreshness,
    },
  };
}
