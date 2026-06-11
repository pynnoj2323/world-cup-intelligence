// Review Agent — 赛后复盘，对比预测与实际结果
import type { ReviewAgentInput, ReviewAgentOutput, OptimizationSuggestion } from "./types";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function runReviewAgent(input: ReviewAgentInput): Promise<ReviewAgentOutput> {
  const { prediction, actualHomeScore, actualAwayScore, actualResult } = input;

  // 计算基础偏差（不需要LLM）
  const resultLabels = ["home_win", "draw", "away_win"];
  const predictedResult = getPredictedResult(prediction);
  const resultCorrect = predictedResult === actualResult;
  const scoreCorrect =
    prediction.predictedHomeScore === actualHomeScore &&
    prediction.predictedAwayScore === actualAwayScore;
  const scoreDiff =
    Math.abs(prediction.predictedHomeScore - actualHomeScore) +
    Math.abs(prediction.predictedAwayScore - actualAwayScore);

  const overallScore = calcOverallScore(resultCorrect, scoreCorrect, scoreDiff, prediction.confidence);

  const prompt = buildReviewPrompt(
    prediction,
    actualHomeScore,
    actualAwayScore,
    actualResult,
    predictedResult,
    resultCorrect,
    scoreDiff
  );

  const llmAnalysis = await analyzeWithLLM(prompt);

  return {
    predictionAccuracy: {
      resultCorrect,
      scoreCorrect,
      scoreDiff,
      probError: {
        homeWin: actualResult === "home_win" ? 1 - prediction.homeWin : prediction.homeWin,
        draw: actualResult === "draw" ? 1 - prediction.draw : prediction.draw,
        awayWin: actualResult === "away_win" ? 1 - prediction.awayWin : prediction.awayWin,
      },
      overallScore,
    },
    biasAnalysis: llmAnalysis.biasAnalysis || [],
    optimizationSuggestions: llmAnalysis.suggestions || [],
    learningPoints: llmAnalysis.learningPoints || [],
  };
}

function getPredictedResult(p: ReviewAgentInput["prediction"]): string {
  if (p.homeWin >= p.draw && p.homeWin >= p.awayWin) return "home_win";
  if (p.draw >= p.homeWin && p.draw >= p.awayWin) return "draw";
  return "away_win";
}

function calcOverallScore(
  resultCorrect: boolean,
  scoreCorrect: boolean,
  scoreDiff: number,
  confidence: number
): number {
  let s = 0;
  if (resultCorrect) s += 50;
  if (scoreCorrect) s += 30;
  s += Math.max(0, 20 - scoreDiff * 5);
  s = Math.round(s * confidence * 100) / 100;
  return Math.min(100, s);
}

function buildReviewPrompt(
  prediction: ReviewAgentInput["prediction"],
  actualHome: number,
  actualAway: number,
  actualResult: string,
  predictedResult: string,
  correct: boolean,
  scoreDiff: number
) {
  return `赛后复盘分析。预测 vs 实际：

预测：主胜${(prediction.homeWin * 100).toFixed(0)}% 平${(prediction.draw * 100).toFixed(0)}% 客胜${(prediction.awayWin * 100).toFixed(0)}%
      比分 ${prediction.predictedHomeScore}-${prediction.predictedAwayScore}
      推荐：${prediction.recommendationLabel}

实际：${actualHome}-${actualAway} (${actualResult})
      预测${correct ? "正确" : "错误"}
      比分差${scoreDiff}球

请分析：
1. 预测偏差在哪里？（高估/低估了什么）
2. 关键因素判断失误了吗？
3. 3条具体的优化建议

返回JSON：
{
  "bias_analysis": ["分析1","分析2"],
  "suggestions": [
    {"area":"概率推算|比分预测|置信度|战术分析","issue":"具体问题","suggestion":"改进建议","priority":"high|medium|low"}
  ],
  "learning_points": ["经验1","经验2"]
}`;
}

async function analyzeWithLLM(prompt: string): Promise<{
  biasAnalysis?: string[];
  suggestions?: OptimizationSuggestion[];
  learningPoints?: string[];
}> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是赛事预测复盘Agent。精准分析预测偏差，给出可执行的优化建议。只输出JSON。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    console.error("Review Agent API错误");
    return {};
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    const p = JSON.parse(cleaned);
    return {
      biasAnalysis: p.bias_analysis,
      suggestions: p.suggestions,
      learningPoints: p.learning_points,
    };
  } catch {
    return {};
  }
}
