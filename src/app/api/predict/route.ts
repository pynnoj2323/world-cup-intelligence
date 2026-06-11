import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { homeTeam, awayTeam, group, stage, venue } = await req.json();

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: "缺少球队信息" }, { status: 400 });
    }

    const prompt = buildPrompt(homeTeam, awayTeam, group, stage, venue);
    const result = await callDeepSeek(prompt);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI 预测失败:", error);
    return NextResponse.json(
      { error: error.message || "AI 服务暂时不可用" },
      { status: 500 }
    );
  }
}

function buildPrompt(
  home: { name: string; rank: number; group: string },
  away: { name: string; rank: number; group: string },
  group?: string,
  stage?: string,
  venue?: string
) {
  return `你是 2026 世界杯赛事分析专家。基于以下数据，对这场比赛给出专业的预测分析。

球队信息：
- 主队：${home.name}，FIFA 排名 ${home.rank}，所在组 ${home.group}
- 客队：${away.name}，FIFA 排名 ${away.rank}，所在组 ${away.group}
${group ? `- 比赛阶段：${group} 组小组赛` : stage ? `- 比赛阶段：${stage}` : ""}
${venue ? `- 比赛场地：${venue}` : ""}

请根据两队 FIFA 排名差距、近期国际赛事表现趋势、球队阵容深度、战术风格等，分析比赛走势。

返回纯 JSON（不要 markdown 代码块，不要额外文字）：
{
  "home_win_probability": 0.xx,
  "draw_probability": 0.xx,
  "away_win_probability": 0.xx,
  "predicted_home_score": x,
  "predicted_away_score": x,
  "over_25_probability": 0.xx,
  "both_teams_score_probability": 0.xx,
  "confidence": 0.xx,
  "confidence_label": "low|medium|medium_high|high",
  "recommendation_label": "主胜|平局|客胜|主不败|客不败",
  "key_factors": [
    { "factor": "因素名", "impact": "positive_home|positive_away|neutral", "explanation": "一句话解释" }
  ],
  "risk_factors": [
    { "risk": "风险描述", "severity": "low|medium|high", "explanation": "一句话解释" }
  ],
  "narrative_summary": "两句话的综合分析"
}`;
}

async function callDeepSeek(prompt: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("API key 未配置");

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是一名专业的世界杯赛事分析 AI。只输出 JSON，不要任何其他内容。概率必须是 0-1 之间的数字，三个概率之和为 1。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API 错误 (${res.status}): ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  // 清理可能包裹的 markdown 代码块
  const cleaned = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleaned);
}
