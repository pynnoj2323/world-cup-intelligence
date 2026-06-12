// /api/matches/status — 统一比分管理（自动拉取 + 手动覆盖）
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

const DATA_FILE = "/tmp/match-scores.json";

// ===== 2026 世界杯球队名 → 内部 match_id 映射 =====
const TEAM_MAP: Record<string, string> = {
  Mexico: "mex", "South Africa": "rsa", Korea: "kor", Czech: "cze",
  Canada: "can", Bosnia: "bih", Qatar: "qat", Croatia: "cro",
  Argentina: "arg", Spain: "esp", Brazil: "bra", Germany: "ger",
  France: "fra", England: "eng", Portugal: "por", Netherlands: "ned",
  USA: "usa", Japan: "jpn", Morocco: "mar", Senegal: "sen",
  Italy: "ita", Uruguay: "uru", Belgium: "bel", Colombia: "col",
  Iran: "irn", Australia: "aus", Egypt: "egy", Nigeria: "nga",
  Denmark: "den", Serbia: "srb", Switzerland: "sui", Poland: "pol",
  Austria: "aut", Sweden: "swe", Norway: "nor", Scotland: "sco",
  Wales: "wal", Hungary: "hun", Turkey: "tur", Cameroon: "cmr",
  Chile: "chi", Peru: "per", Ecuador: "ecu", Paraguay: "par",
  "Costa Rica": "crc", Jamaica: "jam", "Saudi Arabia": "ksa",
  Ghana: "gha", Tunisia: "tun", Algeria: "alg",
};

// ===== 多数据源自动拉取 =====
async function fetchFromSources(): Promise<Map<string, { status: string; homeScore: number; awayScore: number; source: string }>> {
  const results = new Map<string, any>();

  // 数据源 1: worldcupjson.net（2026 版本，最近才开始更新）
  try {
    const urls = [
      "https://worldcupjson.net/matches/today",
      "https://worldcupjson.net/matches/current",
      "https://worldcupjson.net/matches?by_date=2026-06-11",
      "https://worldcupjson.net/matches?by_date=2026-06-12",
      "https://worldcupjson.net/matches?by_date=2026-06-13",
    ];
    for (const url of urls) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal }).catch(() => null);
      clearTimeout(timer);
      if (!res?.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) continue;
      for (const m of data) {
        if (m.home_team && m.away_team && m.home_team.goals !== undefined) {
          const hCountry = m.home_team.country || m.home_team.name;
          const aCountry = m.away_team.country || m.away_team.name;
          const hId = TEAM_MAP[hCountry] || hCountry?.toLowerCase().slice(0, 3);
          const aId = TEAM_MAP[aCountry] || aCountry?.toLowerCase().slice(0, 3);
          const matchId = `${hId}${aId}`;
          const status = m.status === "completed" ? "finished" : m.status === "in_progress" ? "live" : m.status || "scheduled";
          results.set(matchId, {
            status, homeScore: m.home_team.goals || 0, awayScore: m.away_team.goals || 0, source: url,
          });
        }
      }
      if (results.size > 0) break;
    }
  } catch {}

  // 数据源 2: thesportsdb（免费）
  if (results.size === 0) {
    try {
      const res = await fetch("https://www.thesportsdb.com/api/v1/json/3/eventsround.php?id=4424&r=1&s=2026");
      if (res.ok) {
        const data = await res.json();
        for (const e of data.events || []) {
          if (e.intHomeScore != null) {
            results.set(`m${e.idEvent}`, {
              status: e.strStatus?.includes("Finished") ? "finished" : "live",
              homeScore: parseInt(e.intHomeScore) || 0,
              awayScore: parseInt(e.intAwayScore) || 0,
              source: "thesportsdb",
            });
          }
        }
      }
    } catch {}
  }

  return results;
}

// ===== I/O =====
function readScores(): Record<string, any> {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {}
  return {};
}
function saveScores(data: Record<string, any>) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET — 获取比分（自动拉取 + 缓存）
export async function GET(req: NextRequest) {
  const matchId = new URL(req.url).searchParams.get("matchId");
  const forceRefresh = new URL(req.url).searchParams.get("refresh") === "1";

  let scores = readScores();

  // 自动拉取（首次或强制刷新）
  if (Object.keys(scores).length === 0 || forceRefresh) {
    const fresh = await fetchFromSources();
    if (fresh.size > 0) {
      fresh.forEach((v, k) => {
        scores[k] = { ...v, updatedAt: new Date().toISOString() };
      });
      saveScores(scores);
    }
  }

  if (matchId) return NextResponse.json(scores[matchId] ? [{ matchId, ...scores[matchId] }] : []);
  return NextResponse.json(Object.entries(scores).map(([k, v]) => ({ matchId: k, ...v })));
}

// POST — 手动更新比分
export async function POST(req: NextRequest) {
  try {
    const { matchId, status, homeScore, awayScore } = await req.json();
    if (!matchId) return NextResponse.json({ error: "缺少 matchId" }, { status: 400 });
    const scores = readScores();
    scores[matchId] = { status: status || "scheduled", homeScore: homeScore ?? 0, awayScore: awayScore ?? 0, updatedAt: new Date().toISOString(), manual: true };
    saveScores(scores);
    return NextResponse.json({ success: true, data: scores[matchId] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
