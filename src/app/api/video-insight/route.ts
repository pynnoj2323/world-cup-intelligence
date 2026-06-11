// /api/video-insight — Video Agent 入口
import { NextRequest, NextResponse } from "next/server";
import { runVideoAgent } from "@/agents/video-agent";

export async function POST(req: NextRequest) {
  try {
    const { transcript, homeTeam, awayTeam, group, stage } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "缺少视频文本" }, { status: 400 });
    }

    const result = await runVideoAgent({
      transcript,
      matchContext: {
        matchId: `${homeTeam?.name || "?"}-${awayTeam?.name || "?"}`,
        homeTeam: { name: homeTeam?.name || "主队", fifaRanking: homeTeam?.rank || 0, group: homeTeam?.group || "" },
        awayTeam: { name: awayTeam?.name || "客队", fifaRanking: awayTeam?.rank || 0, group: awayTeam?.group || "" },
        group, stage,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
