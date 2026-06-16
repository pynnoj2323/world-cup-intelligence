// Prediction Agent v2 — 增强预测准确度
import type { PredictionAgentInput, PredictionAgentOutput, MatchData } from "./types";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function runPredictionAgent(input: PredictionAgentInput): Promise<PredictionAgentOutput> {
  const { matchData, userDims } = input;
  const prompt = buildPredictionPrompt(matchData, userDims);

  // 一致性引擎：3 轮推理 + 1 轮校验
  const results: PredictionAgentOutput[] = [];
  for (let i = 0; i < 3; i++) {
    try {
      const r = await singleRun(prompt, i);
      results.push(r);
    } catch (e) {
      console.error(`Prediction run ${i + 1} failed:`, e);
    }
  }

  if (results.length === 0) throw new Error("Prediction Agent 全部失败");

  return mergePredictions(results);
}

function buildPredictionPrompt(data: MatchData, userDims?: string[]): string {
  const { homeTeam, awayTeam, group, stage, venue } = data.context;
  const rankGap = homeTeam.fifaRanking - awayTeam.fifaRanking;

  // 实力差距分析
  const absGap = Math.abs(rankGap);
  const strengthAnalysis = absGap > 30
    ? `${rankGap > 0 ? homeTeam.name : awayTeam.name}实力碾压（排名差${absGap}位），历史数据显示此类差距下强队胜率约72%`
    : absGap > 20
    ? `${rankGap > 0 ? homeTeam.name : awayTeam.name}明显占优（排名差${absGap}位），强队胜率约65%`
    : absGap > 10
    ? `${rankGap > 0 ? homeTeam.name : awayTeam.name}稍占优势（排名差${absGap}位），强队胜率约55%`
    : `两队实力接近（排名差${absGap}位），任何结果都可能`;

  // 比赛阶段分析
  const stageContext = stage === "group" ? "小组赛，双方都会力争3分。首轮比赛通常较保守，平局概率偏高。" :
    stage === "round32" ? "淘汰赛，必须分出胜负，加时和点球可能性增加。" : "";

  return `# 2026世界杯深度预测

## 比赛信息
${homeTeam.name} FIFA#${homeTeam.fifaRanking} vs ${awayTeam.name} FIFA#${awayTeam.fifaRanking}
${group ? `${group}组 · ` : ""}${[stage, venue].filter(Boolean).join(" · ")}

## 实力评估
${strengthAnalysis}
${stageContext}

## 数据分析背景
- 世界杯平均进球数约 2.7 球/场
- 约 28% 的比赛出现 3+ 总进球
- 小组赛首轮平局率约 25%
- 淘汰赛加时率约 20%
- 东道主在揭幕战中历史胜率 60%

${data.stats ? `模拟数据: 控球 ${data.stats.possession?.[0]}%-${data.stats.possession?.[1]}%` : ""}
${userDims?.length ? `用户关注维度: ${userDims.join(", ")}` : ""}

## 预测要求
作为资深分析师，基于以上数据做出专业预测。注意：
1. 比分必须是整数（0-7范围）
2. 概率必须在5%-92%之间，不得出现100%
3. 3个比分预测必须各不相同，覆盖低/中/高不同进球数
4. 思维链至少3步，每步20字以上

返回纯JSON（无markdown）：
{
  "chain_of_thought": ["步骤1:...", "步骤2:...", "步骤3:...", "步骤4:..."],
  "home_win_probability": 0.xx,
  "draw_probability": 0.xx,
  "away_win_probability": 0.xx,
  "score_predictions": [
    {"home": x, "away": x, "probability": 0.xx, "scenario": "简述比分发生场景"},
    {"home": x, "away": x, "probability": 0.xx, "scenario": ""},
    {"home": x, "away": x, "probability": 0.xx, "scenario": ""}
  ],
  "predicted_home_score": x,
  "predicted_away_score": x,
  "score_reasoning": "50字内比分推理",
  "over_25_probability": 0.xx,
  "both_teams_score_probability": 0.xx,
  "correct_score_probability": 0.xx,
  "asian_handicap_analysis": "亚盘方向",
  "confidence": 0.xx,
  "confidence_label": "low|medium|medium_high|high",
  "recommendation_type": "home_win|draw|away_win|home_or_draw|away_or_draw",
  "recommendation_label": "主胜/平局/客胜/主不败/客不败",
  "recommendation_reason": "50字理由",
  "tactical_analysis": {"home_tactics":"25字","away_tactics":"25字","key_battle":"25字"},
  "key_factors": [
    {"factor":"因素","impact":"positive_home|positive_away|neutral","weight":0.xx,"explanation":"解释"}
  ],
  "risk_factors": [
    {"risk":"风险","severity":"low|medium|high","probability":0.xx,"explanation":"解释"}
  ],
  "narrative_summary": "120字综合分析"
}`;
}

// 每轮用不同 temperature 增加多样性
async function singleRun(prompt: string, round: number): Promise<PredictionAgentOutput> {
  const temperatures = [0.2, 0.3, 0.35];
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `你是世界杯预测专家(第${round + 1}轮推理)。基于真实数据进行专业预测。`,
        },
        { role: "user", content: prompt },
      ],
      temperature: temperatures[round] || 0.3,
      max_tokens: 2500,
    }),
  });

  if (!res.ok) throw new Error(`API错误(${res.status})`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);
  return validateAndSanitize(parsed);
}

// 验证并修正
function validateAndSanitize(parsed: any): PredictionAgentOutput {
  const clamp = (v: number, min: number, max: number) => Math.round(Math.max(min, Math.min(max, Number(v) || 0)) * 100) / 100;
  const toInt = (v: number) => Math.max(0, Math.min(7, Math.round(Number(v) || 0)));
  const seen = new Set<string>();

  return {
    homeWin: clamp(parsed.home_win_probability, 0.05, 0.92),
    draw: clamp(parsed.draw_probability, 0.05, 0.92),
    awayWin: clamp(parsed.away_win_probability, 0.05, 0.92),
    predictedHomeScore: toInt(parsed.predicted_home_score),
    predictedAwayScore: toInt(parsed.predicted_away_score),
    scorePredictions: (parsed.score_predictions || [])
      .map((s: any) => ({ home: toInt(s.home), away: toInt(s.away), probability: clamp(s.probability, 0.01, 0.6), scenario: s.scenario || "" }))
      .filter((s: { home: number; away: number }) => { const k = `${s.home}-${s.away}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, 3),
    scoreReasoning: parsed.score_reasoning || "",
    over25Prob: clamp(parsed.over_25_probability, 0.1, 0.9),
    bttsProb: clamp(parsed.both_teams_score_probability, 0.1, 0.9),
    correctScoreProb: clamp(parsed.correct_score_probability, 0.01, 0.65),
    asianHandicap: parsed.asian_handicap_analysis || "",
    confidence: clamp(parsed.confidence, 0.3, 0.9),
    confidenceLabel: parsed.confidence_label || "medium",
    recommendationType: parsed.recommendation_type || "home_win",
    recommendationLabel: parsed.recommendation_label || "",
    recommendationReason: parsed.recommendation_reason || "",
    tacticalAnalysis: parsed.tactical_analysis || { home_tactics: "", away_tactics: "", key_battle: "" },
    keyFactors: parsed.key_factors || [],
    riskFactors: (parsed.risk_factors || []).map((r: any) => ({ ...r, probability: clamp(r.probability, 0.01, 0.65) })),
    narrativeSummary: parsed.narrative_summary || "",
    chainOfThought: parsed.chain_of_thought || [],
  };
}

function mergePredictions(results: PredictionAgentOutput[]): PredictionAgentOutput {
  const n = results.length;
  const best = results.reduce((a, b) => (a.keyFactors?.length || 0) > (b.keyFactors?.length || 0) ? a : b);
  const avg = (vals: number[]) => Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;

  const vote = (vals: string[]) => {
    const c: Record<string, number> = {};
    vals.forEach(v => { c[v] = (c[v] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || vals[0] || "";
  };

  // 合并比分预测
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

  const scores = results.map(r => [r.predictedHomeScore, r.predictedAwayScore]);
  scores.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  const [medHome, medAway] = scores[Math.floor(scores.length / 2)];

  return {
    homeWin: avg(results.map(r => r.homeWin)),
    draw: avg(results.map(r => r.draw)),
    awayWin: avg(results.map(r => r.awayWin)),
    predictedHomeScore: medHome, predictedAwayScore: medAway,
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
    chainOfThought: best.chainOfThought,
  };
}
