import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { homeTeam, awayTeam, group, stage, venue, dimensions } = await req.json();

    if (!homeTeam || !awayTeam) {
      return NextResponse.json({ error: "缺少球队信息" }, { status: 400 });
    }

    const prompt = buildPrompt(homeTeam, awayTeam, group, stage, venue, dimensions);

    // 一致性引擎：跑 3 次取平均（temperature=0.3 保证一定探索但不会过于随机）
    const runs = 3;
    const results: any[] = [];
    for (let i = 0; i < runs; i++) {
      try {
        const r = await callDeepSeek(prompt, 0.3);
        results.push(r);
      } catch (e) {
        console.error(`Run ${i + 1} failed:`, e);
      }
    }

    if (results.length === 0) {
      throw new Error("所有预测尝试均失败");
    }

    // 多轮结果融合
    const final = mergeResults(results, homeTeam.name, awayTeam.name);

    return NextResponse.json(final);
  } catch (error: any) {
    console.error("AI 预测失败:", error);
    return NextResponse.json(
      { error: error.message || "AI 服务暂时不可用" },
      { status: 500 }
    );
  }
}

function mergeResults(results: any[], homeName: string, awayName: string) {
  const n = results.length;

  // 取最完整的结果作为模板（选 key_factors 最多的那个）
  const template = [...results].sort((a, b) => (b.key_factors?.length || 0) - (a.key_factors?.length || 0))[0];

  // 数值型字段取平均
  const avg = (key: string) => {
    const vals = results.map(r => r[key]).filter(v => typeof v === "number");
    return vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : template[key] || 0;
  };

  // 投票型字段取多数
  const vote = (key: string) => {
    const counts: Record<string, number> = {};
    results.forEach(r => {
      const v = r[key];
      if (v) counts[v] = (counts[v] || 0) + 1;
    });
    const max = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return max ? max[0] : template[key] || "";
  };

  // 比分预测取最接近中位数的
  const medianScores = () => {
    const scores = results.map(r => ({ home: r.predicted_home_score || 0, away: r.predicted_away_score || 0 }));
    scores.sort((a, b) => (a.home + a.away) - (b.home + b.away));
    return scores[Math.floor(scores.length / 2)] || { home: 1, away: 1 };
  };

  // 合并多个比分的预测（去重 + 重算概率）
  const mergedScores: Record<string, { count: number; scenarios: string[] }> = {};
  results.forEach(r => {
    (r.score_predictions || []).forEach((sp: any) => {
      const key = `${sp.home}-${sp.away}`;
      if (!mergedScores[key]) mergedScores[key] = { count: 0, scenarios: [] };
      mergedScores[key].count++;
      if (sp.scenario) mergedScores[key].scenarios.push(sp.scenario);
    });
  });

  const scorePredictions = Object.entries(mergedScores)
    .map(([key, val]) => {
      const [h, a] = key.split("-").map(Number);
      return {
        home: h,
        away: a,
        probability: Math.round((val.count / n) * 100) / 100,
        scenario: val.scenarios[0] || `${homeName} ${h}-${a} ${awayName}`,
      };
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  const medScore = medianScores();

  return {
    home_win_probability: avg("home_win_probability"),
    draw_probability: avg("draw_probability"),
    away_win_probability: avg("away_win_probability"),

    score_predictions: scorePredictions,
    predicted_home_score: medScore.home,
    predicted_away_score: medScore.away,
    score_reasoning: template.score_reasoning || "",

    over_25_probability: avg("over_25_probability"),
    both_teams_score_probability: avg("both_teams_score_probability"),
    correct_score_probability: avg("correct_score_probability"),
    asian_handicap_analysis: template.asian_handicap_analysis || "",

    confidence: avg("confidence"),
    confidence_label: vote("confidence_label"),

    recommendation_type: vote("recommendation_type"),
    recommendation_label: template.recommendation_label || "",
    recommendation_reason: template.recommendation_reason || "",

    tactical_analysis: template.tactical_analysis || {},
    key_factors: template.key_factors || [],
    risk_factors: template.risk_factors || [],
    narrative_summary: template.narrative_summary || "",

    // 一致性指标
    ensemble_info: {
      runs: n,
      method: "3轮投票+取平均",
      vote_agreement: voteAgreement(results),
    },
  };
}

function voteAgreement(results: any[]) {
  const keys = ["recommendation_type", "confidence_label"];
  let agreement = 0;
  let total = 0;
  for (const key of keys) {
    const counts: Record<string, number> = {};
    results.forEach(r => {
      const v = r[key];
      if (v) counts[v] = (counts[v] || 0) + 1;
    });
    const max = Math.max(...Object.values(counts));
    agreement += max;
    total += results.length;
  }
  return total > 0 ? Math.round((agreement / total) * 100) : 0;
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
    rankGap < -25
      ? `${away.name}在FIFA排名上大幅领先${Math.abs(rankGap)}位，纸面实力明显占优。`
      : rankGap < -10
      ? `${away.name}FIFA排名领先${Math.abs(rankGap)}位，实力占优。`
      : rankGap > 25
      ? `${home.name}在FIFA排名上大幅领先${rankGap}位，纸面实力明显占优。`
      : rankGap > 10
      ? `${home.name}FIFA排名领先${rankGap}位，实力占优。`
      : rankGap > 3
      ? `${home.name}排名略高于${away.name}（领先${rankGap}位），实力稍占上风。`
      : `${home.name}与${away.name}FIFA排名接近（差距仅${Math.abs(rankGap)}位），实力在伯仲之间。`;

  return `# 2026世界杯赛事预测任务

## 比赛信息
- **赛事**：2026 FIFA 世界杯
${stage ? `- **阶段**：${stage}` : group ? `- **阶段**：${group} 组小组赛` : ""}
${venue ? `- **场地**：${venue}` : ""}

## 主队：${home.name}
- FIFA 排名：第 ${home.rank} 位 | 小组：${home.group}

## 客队：${away.name}  
- FIFA 排名：第 ${away.rank} 位 | 小组：${away.group}

## 实力对比
${strengthHint}

---

## 预测规则（严格遵守）

### 胜平负概率推算规则：
- 排名差 > 25 位 → 强队胜率约 65-75%，弱队胜率 10-15%
- 排名差 10-25 位 → 强队胜率约 55-65%，弱队胜率 15-20%
- 排名差 3-10 位 → 主队胜率约 45-55%，平局概率约 25-30%
- 排名差 < 3 位 → 三结果接近均衡，平局概率不低于 25%
- 小组赛首轮 → 平局概率上浮 5%
- 淘汰赛 → 平局概率下调 5%（加时有分胜负动力）

### 比分推算规则：
- 实力悬殊（排名差 > 20）→ 常见比分 2-0, 3-0, 3-1
- 实力接近（排名差 < 10）→ 常见比分 1-0, 1-1, 2-1
- 防守型球队 → 低比分（0-0, 1-0）
- 进攻型球队 → 高比分（2-1, 3-1, 2-2）

### 置信度规则：
- 排名差 > 20 → 置信度 medium_high 或 high
- 排名差 10-20 → 置信度 medium
- 排名差 < 10 → 置信度 medium 或 low

## 分析要求

请给出专业预测。**只返回纯 JSON（不要 markdown 代码块）**：

{
  "home_win_probability": 0.xx,
  "draw_probability": 0.xx,
  "away_win_probability": 0.xx,
  "score_predictions": [
    {"home": x, "away": x, "probability": 0.xx, "scenario": "一句话描述这个比分的比赛走向"},
    {"home": x, "away": x, "probability": 0.xx, "scenario": "描述"},
    {"home": x, "away": x, "probability": 0.xx, "scenario": "描述"}
  ],
  "predicted_home_score": x,
  "predicted_away_score": x,
  "score_reasoning": "结合两队攻防特点、排名差距和战术风格解释为何是这个比分，50字",
  "over_25_probability": 0.xx,
  "both_teams_score_probability": 0.xx,
  "correct_score_probability": 0.xx,
  "asian_handicap_analysis": "结合排名差距给出亚盘方向分析，如：主让0.5球看主胜",
  "confidence": 0.xx,
  "confidence_label": "low|medium|medium_high|high",
  "recommendation_type": "home_win|draw|away_win|home_or_draw|away_or_draw",
  "recommendation_label": "如：主胜、主不败、平局、客胜 等",
  "recommendation_reason": "基于排名差距和比赛阶段的分析，50字以内",
  "tactical_analysis": {
    "home_tactics": "主队的战术打法，结合其FIFA排名和传统风格，25字",
    "away_tactics": "客队的战术打法，25字",
    "key_battle": "本场比赛最关键的对位或战术博弈点，25字"
  },
  "key_factors": [
    {"factor": "因素名", "impact": "positive_home|positive_away|neutral", "weight": 0.xx, "explanation": "解释为什么这个因素重要"},
    {"factor": "因素名", "impact": "positive_home|positive_away|neutral", "weight": 0.xx, "explanation": "解释"},
    {"factor": "因素名", "impact": "positive_home|positive_away|neutral", "weight": 0.xx, "explanation": "解释"}
  ],
  "risk_factors": [
    {"risk": "具体风险点", "severity": "low|medium|high", "probability": 0.xx, "explanation": "为什么这是风险，30字以内"},
    {"risk": "具体风险点", "severity": "low|medium|high", "probability": 0.xx, "explanation": "解释"}
  ],
  "narrative_summary": "120-150字的综合分析，必须包含：实力对比结论、战术预判、比赛走向、最关键的决定性因素。"
}

**关键**：1) 三概率之和=1.0 2) 预测必须严格遵循上述排名-概率映射规则 3) 不可凭空给出极端值`;
}

async function callDeepSeek(prompt: string, temperature: number) {
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
            "你是一名专业的世界杯赛事预测AI。你基于FIFA排名、历史规律和战术分析进行预测。你必须严格遵守给定的概率推算规则，不可随意编造。你的输出必须是纯JSON，不得包含任何其他文字或markdown格式。",
        },
        { role: "user", content: prompt },
      ],
      temperature,
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
