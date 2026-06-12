// 简单比分管理 — 使用 JSON 文件持久化（Vercel 可写 /tmp）
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = "/tmp/match-scores.json";

function readScores(): Record<string, any> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function saveScores(data: Record<string, any>) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET — 获取所有比分
export async function GET(req: NextRequest) {
  const matchId = new URL(req.url).searchParams.get("matchId");
  const scores = readScores();

  if (matchId) {
    return NextResponse.json(scores[matchId] ? [scores[matchId]] : []);
  }
  return NextResponse.json(Object.entries(scores).map(([k, v]) => ({ matchId: k, ...v })));
}

// POST — 更新比分
export async function POST(req: NextRequest) {
  try {
    const { matchId, status, homeScore, awayScore } = await req.json();
    if (!matchId) return NextResponse.json({ error: "缺少 matchId" }, { status: 400 });

    const scores = readScores();
    scores[matchId] = {
      status: status || "scheduled",
      homeScore: homeScore ?? 0,
      awayScore: awayScore ?? 0,
      updatedAt: new Date().toISOString(),
    };
    saveScores(scores);
    return NextResponse.json({ success: true, data: scores[matchId] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
