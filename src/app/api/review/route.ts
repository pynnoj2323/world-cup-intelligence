// /api/review — 赛后复盘（无DB依赖版）
import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      predictedHomeWin, predictedDraw, predictedAwayWin,
      predictedHomeScore, predictedAwayScore,
      actualHomeScore, actualAwayScore, actualResult,
      recommendationLabel, scoreReasoning, keyFactorsJson,
    } = body;

    if (actualHomeScore == null || actualAwayScore == null) {
      return NextResponse.json({ error: "缺少实际比分" }, { status: 400 });
    }

    const hw = predictedHomeWin || 0, d = predictedDraw || 0, aw = predictedAwayWin || 0;
    const predResult = hw >= d && hw >= aw ? "home_win" : d >= aw ? "draw" : "away_win";
    const resultCorrect = predResult === actualResult;
    const scoreCorrect = predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore;
    const scoreDiff = Math.abs((predictedHomeScore || 0) - actualHomeScore) + Math.abs((predictedAwayScore || 0) - actualAwayScore);
    const overallScore = Math.min(100, Math.max(0, resultCorrect ? 60 : 10) + (scoreCorrect ? 40 : Math.max(0, 30 - scoreDiff * 10)));

    // LLM 偏差分析
    const prompt = `赛后复盘：

预测：${(hw * 100).toFixed(0)}% / ${(d * 100).toFixed(0)}% / ${(aw * 100).toFixed(0)}%
      比分 ${predictedHomeScore}-${predictedAwayScore}，推荐 ${recommendationLabel || "无"}
      比分推理：${scoreReasoning || "无"}

实际：${actualHomeScore}-${actualAwayScore} 胜负：${predResult === actualResult ? "正确" : "错误"} 比分差：${scoreDiff}球

分析预测偏差，给出3条优化建议。

返回JSON：{"bias_analysis":["...","..."], "suggestions":[{"area":"...","issue":"...","suggestion":"...","priority":"high"}], "learning_points":["..."]}`;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    let llmResult: any = {};

    if (apiKey) {
      try {
        const res = await fetch(DEEPSEEK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: "你是足球复盘专家。只输出JSON。" },
              { role: "user", content: prompt },
            ],
            temperature: 0.2,
            max_tokens: 1500,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const cleaned = (data.choices?.[0]?.message?.content || "").replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
          try { llmResult = JSON.parse(cleaned); } catch {}
        }
      } catch {}
    }

    return NextResponse.json({
      predictionAccuracy: { resultCorrect, scoreCorrect, scoreDiff, overallScore },
      biasAnalysis: llmResult.bias_analysis || [
        `预测${resultCorrect ? "正确" : "错误"}：预期${recommendationLabel || "未知"}，实际${actualResult}`,
        `比分误差${scoreDiff}球，预测${predictedHomeScore}-${predictedAwayScore} vs 实际${actualHomeScore}-${actualAwayScore}`,
        scoreDiff > 2 ? "比分预测偏差较大，建议增加阵容/伤病分析维度" : "基础预测模型可接受"
      ],
      optimizationSuggestions: llmResult.suggestions || [
        { area: "概率推算", issue: "基础规则限制", suggestion: "引入更多实时数据源", priority: "high" },
        { area: "比分预测", issue: "单一模型", suggestion: "多模型交叉验证", priority: "medium" },
        { area: "置信度", issue: "主观判断", suggestion: "基于历史准确率动态调整", priority: "medium" },
      ],
      learningPoints: llmResult.learning_points || ["预测模型需要更多维度数据支撑"],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
