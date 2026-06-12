// 比赛状态覆盖 — 从DB拉取实时比分并与静态数据合并
import type { Match } from "@/data/matches";

export interface MatchOverride {
  matchId: string;
  status?: string;
  homeScore?: number;
  awayScore?: number;
}

let statusCache: MatchOverride[] | null = null;
let lastFetch = 0;

export async function fetchAllMatchStatuses(): Promise<MatchOverride[]> {
  // 缓存30秒
  if (statusCache && Date.now() - lastFetch < 30000) {
    return statusCache;
  }

  try {
    const res = await fetch("/api/matches/status");
    if (res.ok) {
      const data = await res.json();
      statusCache = data;
      lastFetch = Date.now();
      return data;
    }
  } catch {}
  return statusCache || [];
}

export function applyStatusOverride(match: Match, overrides: MatchOverride[]): {
  status: string;
  homeScore: number;
  awayScore: number;
} {
  const override = overrides.find(o => o.matchId === match.match_id);
  return {
    status: override?.status || match.status,
    homeScore: override?.homeScore ?? match.home_score ?? 0,
    awayScore: override?.awayScore ?? match.away_score ?? 0,
  };
}

export function getDisplayMatch(match: Match, overrides: MatchOverride[]) {
  const display = applyStatusOverride(match, overrides);
  const isLive = display.status === "live" || display.status === "halftime";
  const isFinished = display.status === "finished";
  const hasScore = display.homeScore > 0 || display.awayScore > 0;

  return {
    ...match,
    displayStatus: display.status,
    displayHomeScore: display.homeScore,
    displayAwayScore: display.awayScore,
    isLive,
    isFinished,
    hasScore,
  };
}
