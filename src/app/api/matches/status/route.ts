// /api/matches/status — 比分管理（静态已知数据 + 手动更新）
import { NextRequest, NextResponse } from "next/server";
import { matches } from "@/data/matches";
import { KNOWN_SCORES } from "@/data/score-overrides";

let store: Record<string, any> = {};

function initStore() {
  if (Object.keys(store).length === 0) {
    for (const m of matches) {
      const known = KNOWN_SCORES[m.match_id];
      store[m.match_id] = {
        status: known?.status || m.status || "scheduled",
        homeScore: known?.homeScore ?? m.home_score ?? 0,
        awayScore: known?.awayScore ?? m.away_score ?? 0,
      };
    }
  }
  return store;
}

export async function GET(req: NextRequest) {
  initStore();
  const matchId = new URL(req.url).searchParams.get("matchId");
  const entries = Object.entries(store).map(([k, v]) => ({ matchId: k, ...v }));
  if (matchId) return NextResponse.json(entries.filter(e => e.matchId === matchId));
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  initStore();
  const { matchId, status, homeScore, awayScore } = await req.json();
  if (!matchId) return NextResponse.json({ error: "需要 matchId" }, { status: 400 });
  store[matchId] = {
    status: status || "scheduled",
    homeScore: Number(homeScore) || 0,
    awayScore: Number(awayScore) || 0,
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json({ success: true, total: Object.keys(store).length });
}
