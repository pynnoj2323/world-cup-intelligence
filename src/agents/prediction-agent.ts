// Prediction Agent — 基于数据输出预测
import type { PredictionAgentInput, PredictionAgentOutput, MatchData } from "./types";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function runPredictionAgent(input: PredictionAgentInput): Promise<PredictionAgentOutput> {
  const { matchData } = input;
  const { homeTeam, awayTeam, group, stage, venue } = matchData.context;

  const prompt = buildPredictionPrompt(matchData);

  // 一致性引擎：跑3轮
  const runs = 3;
  const results: PredictionAgentOutput[] = [];
  for (let i = 0; i < runs; i++) {
    try {
      const r = await singleRun(prompt);
      results.push(r);
    } catch (e) {
      console.error(`Prediction run ${i + 1} failed:`, e);
    }
  }

  if (results.length === 0) throw new Error("Prediction Agent 全部失败");

  return mergePredictions(results, matchData);
}

function buildPredictionPrompt(data: MatchData): string {
  const { homeTeam, awayTeam, group, stage, venue } = data.context;
  const rankGap = homeTeam.fifaRanking - awayTeam.fifaRanking;

  const strengthSummary =
    Math.abs(rankGap) > 20
      ? `${rankGap > 0 ? homeTeam.name : awayTeam.name}实力明显占优(FIFA排名差${Math.abs(rankGap)}位)`
      : Math.abs(rankGap) > 10
      ? `${rankGap > 0 ? homeTeam.name : awayTeam.name}实力占优(排名差${Math.abs(rankGap)}位)`
      : `两队实力接近(排名差${Math.abs(rankGap)}位)`;

  return `# 2026世界杯预测任务

## 比赛
${homeTeam.name} vs ${awayTeam.name}
${group ? `${group}组` : stage || ""} · ${venue || ""}

## 实力
${strengthSummary}
主队FIFA排名:${homeTeam.fifaRanking} | 客队:${awayTeam.fifaRanking}

${data.stats ? `## 模拟数据\n控球率:${data.stats.possession?.[0]}%-${data.stats.possession?.[1]}%\n射门:${data.stats.shots?.[0]}-${data.stats.shots?.[1]}` : ""}

## 预测规则
- 排名差>25→强队胜率65-75%
- 排名差10-25→强队胜率55-65%
- 排名差<10→接近均衡
- 小组赛首轮平局+5%

## 思维链要求
先输出你的分析步骤，再输出JSON预测。

## 输出JSON
{
  "chain_of_thought": ["步骤1:评估实力差距...","步骤2:分析战术风格...","步骤3:综合判断..."],
  "home_win_probability": 0.xx,
  "draw_probability": 0.xx,
  "away_win_probability": 0.xx,
  "score_predictions": [
    {"home":x,"away":x,"probability":0.xx,"scenario":"描述"},
    {"home":x,"away":x,"probability":0.xx,"scenario":"描述"},
    {"home":x,"away":x,"probability":0.xx,"scenario":"描述"}
  ],
  "predicted_home_score": x,
  "predicted_away_score": x,
  "score_reasoning": "比分推理",
  "over_25_probability": 0.xx,
  "both_teams_score_probability": 0.xx,
  "correct_score_probability": 0.xx,
  "asian_handicap_analysis": "亚盘分析",
  "confidence": 0.xx,
  "confidence_label": "medium",
  "recommendation_type": "home_win",
  "recommendation_label": "推荐标签",
  "recommendation_reason": "推荐理由",
  "tactical_analysis": {"home_tactics":"","away_tactics":"","key_battle":""},
  "key_factors": [{"factor":"","impact":"positive_home","weight":0.xx,"explanation":""}],
  "risk_factors": [{"risk":"","severity":"medium","probability":0.xx,"explanation":""}],
  "narrative_summary": "综合分析150字"
}`;
}

async function singleRun(prompt: string): Promise<PredictionAgentOutput> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是世界杯预测专家Agent。先思考分析，再输出JSON。必须严格遵守给定的概率推算规则。只输出JSON，无其他文字。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    }),
  });

  if (!res.ok) throw new Error(`Prediction Agent API错误(${res.status})`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  const parsed = JSON.parse(cleaned);
  return {
    homeWin: parsed.home_win_probability,
    draw: parsed.draw_probability,
    awayWin: parsed.away_win_probability,
    predictedHomeScore: parsed.predicted_home_score,
    predictedAwayScore: parsed.predicted_away_score,
    scorePredictions: parsed.score_predictions || [],
    scoreReasoning: parsed.score_reasoning || "",
    over25Prob: parsed.over_25_probability,
    bttsProb: parsed.both_teams_score_probability,
    correctScoreProb: parsed.correct_score_probability || 0,
    asianHandicap: parsed.asian_handicap_analysis || "",
    confidence: parsed.confidence,
    confidenceLabel: parsed.confidence_label,
    recommendationType: parsed.recommendation_type,
    recommendationLabel: parsed.recommendation_label,
    recommendationReason: parsed.recommendation_reason || "",
    tacticalAnalysis: parsed.tactical_analysis || {},
    keyFactors: parsed.key_factors || [],
    riskFactors: parsed.risk_factors || [],
    narrativeSummary: parsed.narrative_summary || "",
    chainOfThought: parsed.chain_of_thought || [],
  };
}

function mergePredictions(
  results: PredictionAgentOutput[],
  matchData: MatchData
): PredictionAgentOutput {
  const n = results.length;
  const best = results.reduce((a, b) =>
    (a.keyFactors?.length || 0) > (b.keyFactors?.length || 0) ? a : b
  );

  const avg = (vals: number[]) =>
    Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;

  const vote = (vals: string[]) => {
    const c: Record<string, number> = {};
    vals.forEach(v => { c[v] = (c[v] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  };

  // 合并多比分
  const scoreMap: Record<string, { count: number; scenarios: string[] }> = {};
  results.forEach(r => {
    (r.scorePredictions || []).forEach(sp => {
      const key = `${sp.home}-${sp.away}`;
      if (!scoreMap[key]) scoreMap[key] = { count: 0, scenarios: [] };
      scoreMap[key].count++;
      scoreMap[key].scenarios.push(sp.scenario);
    });
  });
  const mergedScores = Object.entries(scoreMap)
    .map(([k, v]) => {
      const [h, a] = k.split("-").map(Number);
      return { home: h, away: a, probability: Math.round((v.count / n) * 100) / 100, scenario: v.scenarios[0] };
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  // 取中位数比分
  const scores = results.map(r => [r.predictedHomeScore, r.predictedAwayScore]);
  scores.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  const [medHome, medAway] = scores[Math.floor(scores.length / 2)];

  return {
    homeWin: avg(results.map(r => r.homeWin)),
    draw: avg(results.map(r => r.draw)),
    awayWin: avg(results.map(r => r.awayWin)),
    predictedHomeScore: medHome,
    predictedAwayScore: medAway,
    scorePredictions: mergedScores,
    scoreReasoning: best.scoreReasoning,
    over25Prob: avg(results.map(r => r.over25Prob)),
    bttsProb: avg(results.map(r => r.bttsProb)),
    correctScoreProb: avg(results.map(r => r.correctScoreProb)),
    asianHandicap: best.asianHandicap,
    confidence: avg(results.map(r => r.confidence)),
    confidenceLabel: vote(results.map(r => r.confidenceLabel)),
    recommendationType: vote(results.map(r => r.recommendationType)),
    recommendationLabel: best.recommendationLabel,
    recommendationReason: best.recommendationReason,
    tacticalAnalysis: best.tacticalAnalysis,
    keyFactors: best.keyFactors,
    riskFactors: best.riskFactors,
    narrativeSummary: best.narrativeSummary,
    chainOfThought: results[0]?.chainOfThought || [],
  };
}
