// /api/matches/seed-status — 一键初始化所有比赛状态
import { NextResponse } from "next/server";
import { matches } from "@/data/matches";
import { db } from "@/lib/db";

export async function POST() {
  try {
    let count = 0;
    for (const m of matches) {
      const existing = await db.matchStatus.findUnique({ where: { matchId: m.match_id } });
      if (!existing) {
        await db.matchStatus.create({
          data: {
            matchId: m.match_id,
            status: m.status || "scheduled",
            homeScore: m.home_score || 0,
            awayScore: m.away_score || 0,
            updatedBy: "seed",
          },
        });
        count++;
      }
    }
    const total = await db.matchStatus.count();
    return NextResponse.json({ seeded: count, total, message: `数据库共有 ${total} 条比赛状态记录` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
