"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { matches, statusLabels, stageLabels } from "@/data/matches";
import { getTeamById, groups, groupLabels } from "@/data/teams";
import Link from "next/link";
import { Trophy, Circle } from "lucide-react";

const stages = ["全部", "小组赛", "16 强", "8 强", "半决赛", "三四名决赛", "决赛"];
const statuses = ["全部", "未开始", "直播中", "已结束"];

export default function MatchesPage() {
  const [stage, setStage] = useState("全部");
  const [group, setGroup] = useState("全部");
  const [status, setStatus] = useState("全部");

  const stageMap: Record<string, string> = {
    "小组赛": "group", "16 强": "round16", "8 强": "quarter",
    "半决赛": "semi", "三四名决赛": "third_place", "决赛": "final",
  };
  const statusMap: Record<string, string> = { "未开始": "scheduled", "直播中": "live", "中场": "halftime", "已结束": "finished" };

  const filtered = matches.filter(m => {
    if (stage !== "全部" && m.stage !== stageMap[stage]) return false;
    if (group !== "全部" && m.group !== group) return false;
    if (status !== "全部" && m.status !== statusMap[status]) return false;
    return true;
  }).sort((a, b) => a.kickoff_time.localeCompare(b.kickoff_time));

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-[#F5C542]" /> 赛程</h1>
        <p className="text-muted-foreground text-sm mt-1">全部 64 场比赛 · 筛选浏览</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {stages.map(s => (
              <button key={s} onClick={() => setStage(s)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${stage === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{s}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {["全部", ...groups].map(g => (
              <button key={g} onClick={() => setGroup(g)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${group === g ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{g === "全部" ? "全部小组" : groupLabels[g]}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {statuses.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{s}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Match List */}
      <div className="space-y-2">
        {filtered.map(m => {
          const home = getTeamById(m.home_team_id), away = getTeamById(m.away_team_id);
          if (!home || !away) return null;
          const isLive = m.status === "live" || m.status === "halftime";
          const d = new Date(m.kickoff_time);

          return (
            <Link key={m.match_id} href={`/matches/${m.match_id}`}>
              <div className="bg-card rounded-xl p-4 hover:ring-1 hover:ring-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center min-w-[72px]">
                    <div className="text-xs text-muted-foreground">{d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}</div>
                    <div className="text-sm font-medium">{d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</div>
                    {isLive && <Badge variant="destructive" className="mt-1 animate-pulse text-xs">LIVE</Badge>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="font-semibold text-sm">{home.name}</span>
                        <span className="text-xl">{home.flag_url}</span>
                      </div>
                      <div className="text-center min-w-[60px]">
                        {m.status === "scheduled" ? <span className="text-lg font-bold text-muted-foreground">VS</span> :
                         <span className="text-xl font-bold tabular-nums">{m.home_score} - {m.away_score}</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xl">{away.flag_url}</span>
                        <span className="font-semibold text-sm">{away.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{m.group ? `${m.group} 组` : stageLabels[m.stage]}</span>
                  <span>·</span>
                  <span>{m.venue}</span>
                </div>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">没有匹配的比赛</p>}
      </div>
    </div>
  );
}
