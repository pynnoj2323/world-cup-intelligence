// /api/matches/auto-update — 自动拉取比赛比分
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// 公开的免费足球比分数据源
const SCORE_SOURCES = [
  // worldcupjson.net — 免费世界杯数据 API
  "https://worldcupjson.net/matches/today",
  // thesportsdb.com — 免费体育数据
  "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=4424&s=2026",
];

export async function GET(req: NextRequest) {
  const results: string[] = [];

  for (const url of SCORE_SOURCES) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) continue;

      const data = await res.json();
      const parsed = parseScores(data, url);
      if (parsed.length === 0) continue;

      for (const m of parsed) {
        await db.matchStatus.upsert({
          where: { matchId: m.matchId },
          create: { matchId: m.matchId, status: m.status, homeScore: m.homeScore, awayScore: m.awayScore, updatedBy: "auto" },
          update: { status: m.status, homeScore: m.homeScore, awayScore: m.awayScore, updatedBy: "auto" },
        });
        results.push(`${m.matchId}: ${m.homeScore}-${m.awayScore} (${m.status})`);
      }

      if (results.length > 0) break;
    } catch {
      continue;
    }
  }

  return NextResponse.json({
    updated: results.length,
    results: results.length > 0 ? results : ["未找到新比分数据，请稍后重试或手动到 /admin/scores 更新"],
    source: results.length > 0 ? "auto" : "manual",
  });
}

function parseScores(data: any, sourceUrl: string): Array<{ matchId: string; status: string; homeScore: number; awayScore: number }> {
  const matches: any[] = [];

  if (sourceUrl.includes("worldcupjson") && Array.isArray(data)) {
    // worldcupjson.net 格式
    for (const m of data) {
      if (m.home_team && m.away_team && m.home_team.goals !== undefined) {
        const status = m.status === "completed" ? "finished" : m.status === "in_progress" ? "live" : "scheduled";
        matches.push({
          matchId: m.id ? `m${m.id}` : teamToId(m.home_team.country) + teamToId(m.away_team.country),
          status,
          homeScore: m.home_team.goals || 0,
          awayScore: m.away_team.goals || 0,
        });
      }
    }
  }

  if (sourceUrl.includes("thesportsdb") && data?.events) {
    for (const e of data.events) {
      if (e.intHomeScore !== null) {
        matches.push({
          matchId: `m${e.idEvent}`,
          status: e.strStatus === "Match Finished" ? "finished" : "live",
          homeScore: parseInt(e.intHomeScore) || 0,
          awayScore: parseInt(e.intAwayScore) || 0,
        });
      }
    }
  }

  return matches;
}

function teamToId(name: string): string {
  // 简化映射
  const map: Record<string, string> = {
    Mexico: "mex", "South Africa": "rsa", Korea: "kor", Czech: "cze",
    Canada: "can", Bosnia: "bih", Qatar: "qat", Italy: "ita",
    Argentina: "arg", Spain: "esp", Brazil: "bra", Germany: "ger",
    France: "fra", England: "eng", Portugal: "por", Netherlands: "ned",
    USA: "usa", Japan: "jpn", Morocco: "mar", Senegal: "sen",
  };
  return map[name] || name.toLowerCase().slice(0, 3);
}
