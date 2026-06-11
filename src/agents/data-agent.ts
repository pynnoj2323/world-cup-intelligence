// Data Agent — 整理赛事数据结构化
import type { DataAgentInput, DataAgentOutput, MatchData, TeamProfile } from "./types";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function runDataAgent(input: DataAgentInput): Promise<DataAgentOutput> {
  const { match, includeStats, includeOdds, includeNews } = input;

  // 基础数据直接从输入构造，不需要 LLM
  const baseData: MatchData = {
    context: match,
    stats: includeStats ? generateMockStats(match.homeTeam, match.awayTeam) : null,
    standings: null,
    odds: includeOdds ? generateMockOdds() : null,
    news: includeNews ? await fetchRelevantNews(match) : [],
    videoInsights: [],
    dataFreshness: new Date().toISOString(),
  };

  // 用 LLM 做数据总结
  const summary = await generateDataSummary(baseData);

  return {
    matchData: baseData,
    summary: summary.summary,
    keyFindings: summary.keyFindings,
  };
}

function generateMockStats(home: TeamProfile, away: TeamProfile) {
  const homeBetter = home.fifaRanking < away.fifaRanking;
  return {
    possession: homeBetter ? [55, 45] as [number, number] : [45, 55] as [number, number],
    shots: homeBetter ? [14, 9] as [number, number] : [10, 13] as [number, number],
    corners: [5, 4] as [number, number],
    cards: [2, 3] as [number, number],
  };
}

function generateMockOdds() {
  return {
    provider: "模拟数据",
    homeWin: 2.1,
    draw: 3.4,
    awayWin: 3.8,
    over25: 1.9,
    under25: 2.0,
  };
}

async function fetchRelevantNews(match: DataAgentInput["match"]): Promise<any[]> {
  // 用 LLM 生成模拟新闻（未来可接真实新闻API）
  const prompt = `基于以下比赛信息，生成2-3条赛前相关新闻摘要：
主队${match.homeTeam.name}(排名${match.homeTeam.fifaRanking}) vs 客队${match.awayTeam.name}(排名${match.awayTeam.fifaRanking})。

返回JSON数组：[{"title":"新闻标题","summary":"一句话摘要","relevance":"high|medium|low"}]`;

  return await callLLM(prompt, "你是一个体育新闻编辑。只输出JSON数组。", 0.3);
}

async function generateDataSummary(data: MatchData): Promise<{ summary: string; keyFindings: string[] }> {
  const prompt = `基于以下比赛数据，用2-3句话总结数据亮点，并列出2-3个关键发现：

主队: ${data.context.homeTeam.name} (排名${data.context.homeTeam.fifaRanking})
客队: ${data.context.awayTeam.name} (排名${data.context.awayTeam.fifaRanking})
排名差: ${data.context.homeTeam.fifaRanking - data.context.awayTeam.fifaRanking}

返回JSON：{"summary":"数据总结","keyFindings":["发现1","发现2","发现3"]}`;

  return await callLLM(prompt, "只输出JSON。", 0.2);
}

async function callLLM(prompt: string, system: string, temp: number): Promise<any> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      temperature: temp,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Data Agent LLM错误(${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // fallback: 把文本当 summary 返回
    return { summary: cleaned, keyFindings: [] };
  }
}
