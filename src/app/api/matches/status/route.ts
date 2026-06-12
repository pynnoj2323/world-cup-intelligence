// /api/matches/status — 可靠比分管理
import { NextRequest, NextResponse } from "next/server";
import { matches } from "@/data/matches";

// 从静态数据初始化
function seedStore() {
  const s: Record<string, any> = {};
  for (const m of matches) {
    s[m.match_id] = {
      status: m.status || "scheduled",
      homeScore: m.home_score || 0,
      awayScore: m.away_score || 0,
    };
  }
  return s;
}

let store: Record<string, any> | null = null;
function getStore() {
  if (!store) store = seedStore();
  if (typeof globalThis !== "undefined" && (globalThis as any).__scores) {
    store = { ...store, ...(globalThis as any).__scores };
  }
  return store;
}

export async function GET(req: NextRequest) {
  const matchId = new URL(req.url).searchParams.get("matchId");
  const entries = Object.entries(store).map(([k, v]) => ({ matchId: k, ...v }));
  if (matchId) return NextResponse.json(entries.filter(e => e.matchId === matchId));
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const { matchId, status, homeScore, awayScore } = await req.json();
  if (!matchId) return NextResponse.json({ error: "需要 matchId" }, { status: 400 });

  store[matchId] = {
    status: status || "scheduled",
    homeScore: Number(homeScore) || 0,
    awayScore: Number(awayScore) || 0,
    updatedAt: new Date().toISOString(),
  };

  // 同时写一份到全局（跨请求共享）
  if (typeof globalThis !== "undefined") {
    (globalThis as any).__scores = store;
  }

  return NextResponse.json({ success: true, total: Object.keys(store).length });
}
