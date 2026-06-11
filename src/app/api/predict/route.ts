import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { homeTeam, awayTeam, group, stage, venue, dimensions } = await req.json();

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: "缺少球队信息" }, { status: 400 });
    }

    const prompt = buildPrompt(homeTeam, awayTeam, group, stage, venue, dimensions);
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
  venue?: string,
  dimensions?: string[]
) {
  const rankGap = home.rank - away.rank;
  const strengthHint =
    rankGap < -20
      ? `${away.name}在FIFA排名上领先${Math.abs(rankGap)}位，纸面实力明显占优。`
      : rankGap > 20
      ? `${home.name}在FIFA排名上领先${rankGap}位，纸面实力明显占优。`
      : rankGap > 5
      ? `${home.name}排名略高于${away.name}（领先${rankGap}位），实力稍占上风。`
      : `${home.name}与${away.name}FIFA排名接近，实力在伯仲之间。`;

  return `# 2026世界杯赛事深度分析

## 比赛基本信息
- **赛事**：2026 年 FIFA 世界杯
${stage ? `- **阶段**：${stage}` : group ? `- **阶段**：${group} 组小组赛` : ""}
${venue ? `- **场地**：${venue}` : ""}

## 主队：${home.name}
- FIFA 排名：第 ${home.rank} 位
- 所属小组：${home.group}

## 客队：${away.name}
- FIFA 排名：第 ${away.rank} 位
- 所属小组：${away.group}

## 实力对比
${strengthHint}

${dimensions?.length ? `## 重点分析维度\n${dimensions.map(d => `- ${d}`).join("\n")}` : ""}

---

请作为资深足球赛事分析师，完成以下深度分析报告。**只返回纯 JSON（不要 markdown 代码块，不要任何其他文字）**：

{
  "home_win_probability": 0.xx,
  "draw_probability": 0.xx,
  "away_win_probability": 0.xx,
  
  "score_predictions": [
    { "home": x, "away": x, "probability": 0.xx, "scenario": "描述这个比分会如何发生，一句话" },
    { "home": x, "away": x, "probability": 0.xx, "scenario": "描述" },
    { "home": x, "away": x, "probability": 0.xx, "scenario": "描述" }
  ],
  
  "predicted_home_score": x,
  "predicted_away_score": x,
  "score_reasoning": "为什么预测这个比分，结合两队攻防特点分析，50字以内",
  
  "over_25_probability": 0.xx,
  "both_teams_score_probability": 0.xx,
  "correct_score_probability": 0.xx,
  "asian_handicap_analysis": "亚盘方向分析，一句话",
  
  "confidence": 0.xx,
  "confidence_label": "low|medium|medium_high|high",
  
  "recommendation_type": "home_win|draw|away_win|home_or_draw|away_or_draw",
  "recommendation_label": "中文推荐标签",
  "recommendation_reason": "推荐理由，50字以内",
  
  "tactical_analysis": {
    "home_tactics": "主队可能战术，30字",
    "away_tactics": "客队可能战术，30字",
    "key_battle": "关键对决描述，30字"
  },
  
  "key_factors": [
    { "factor": "因素名", "impact": "positive_home|positive_away|neutral", "weight": 0.xx, "explanation": "一句话解释" },
    { "factor": "因素名", "impact": "positive_home|positive_away|neutral", "weight": 0.xx, "explanation": "一句话解释" },
    { "factor": "因素名", "impact": "positive_home|positive_away|neutral", "weight": 0.xx, "explanation": "一句话解释" }
  ],
  
  "risk_factors": [
    { "risk": "风险描述", "severity": "low|medium|high", "probability": 0.xx, "explanation": "详细解释，30字" },
    { "risk": "风险描述", "severity": "low|medium|high", "probability": 0.xx, "explanation": "详细解释，30字" }
  ],
  
  "narrative_summary": "150字以内的综合分析，涵盖两队的实力对比、战术风格、关键球员、比赛走向预测。要求专业且有洞察力，不是泛泛而谈。",
  
  "generated_at": "ISO时间戳"
}

**严格要求**：
1. 三个概率之和必须等于 1.0
2. score_predictions 中的 probability 越大表示该比分越可能出现，三个 probability 应递减，且之和不超过 0.8
3. 所有概率值保留两位小数，如 0.58
4. 置信度置信标注必须基于排名差距和阵容深度给出，不可随意标注为 high
5. 综合分析必须结合球队特点、近期表现趋势，有实质内容`;
}

async function callDeepSeek(prompt: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY 未配置");

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
            "你是一名专业的世界杯赛事分析AI，拥有20年足球分析经验。你精通战术分析、数据统计和历史规律。你的分析必须基于FIFA排名、球队近期状态、阵容深度、战术体系和历史交锋等客观数据。每次分析都要给出具体且有洞察力的结论，不泛泛而谈。只输出JSON，不要任何其他内容。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API 错误 (${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  const cleaned = content
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`DeepSeek 返回非 JSON 格式: ${cleaned.slice(0, 200)}`);
  }
}
