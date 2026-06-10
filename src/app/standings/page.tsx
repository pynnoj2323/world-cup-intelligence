"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { standings, getStandingsByGroup, qualificationLabels, qualificationColors } from "@/data/standings";
import { getTeamById, groups, groupLabels } from "@/data/teams";
import { matches } from "@/data/matches";
import { BarChart3, Calculator, Play } from "lucide-react";

export default function StandingsPage() {
  const [selectedGroup, setSelectedGroup] = useState("A");
  const [showSimulator, setShowSimulator] = useState(false);
  const [simResults, setSimResults] = useState<Record<string, number>>({});

  const groupStandings = getStandingsByGroup(selectedGroup);
  const groupMatches = matches.filter(m => m.group === selectedGroup && m.status === "scheduled");

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const results: Record<string, number> = {};
    for (const m of groupMatches) {
      const h = Number(data.get(`${m.match_id}_home`)) || 0;
      const a = Number(data.get(`${m.match_id}_away`)) || 0;
      const diff = h - a;
      results[m.match_id] = diff;
    }
    setSimResults(results);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> 积分榜</h1>
          <p className="text-muted-foreground text-sm mt-1">小组排名 · 出线形势 · 模拟器</p>
        </div>
        <button onClick={() => setShowSimulator(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          <Calculator className="w-4 h-4" /> 出线模拟器
        </button>
      </div>

      {/* Group Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {groups.map(g => (
          <button key={g} onClick={() => setSelectedGroup(g)}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shrink-0 ${selectedGroup === g ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{groupLabels[g]}</button>
        ))}
      </div>

      {/* Standings Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-2">球队</th>
                <th className="text-center py-3 px-2">场</th>
                <th className="text-center py-3 px-1 hidden sm:table-cell">胜</th>
                <th className="text-center py-3 px-1 hidden sm:table-cell">平</th>
                <th className="text-center py-3 px-1 hidden sm:table-cell">负</th>
                <th className="text-center py-3 px-2">进球</th>
                <th className="text-center py-3 px-2 hidden sm:table-cell">失球</th>
                <th className="text-center py-3 px-2 hidden md:table-cell">净胜</th>
                <th className="text-center py-3 px-3 font-bold">积分</th>
                <th className="text-center py-3 px-3 hidden md:table-cell">出线形势</th>
              </tr>
            </thead>
            <tbody>
              {groupStandings.map(s => {
                const team = getTeamById(s.team_id);
                if (!team) return null;
                return (
                  <tr key={s.standing_id} className={`border-b border-border/50 text-sm ${s.qualification_status === "qualified" ? "bg-primary/5" : ""}`}>
                    <td className="py-3 px-4"><span className={`font-mono text-xs ${s.rank <= 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{s.rank}</span></td>
                    <td className="py-3 px-2"><div className="flex items-center gap-2"><span className="text-lg">{team.flag_url}</span><span className="font-medium">{team.name}</span></div></td>
                    <td className="text-center py-3 px-2 tabular-nums">{s.played}</td>
                    <td className="text-center py-3 px-1 tabular-nums hidden sm:table-cell">{s.wins}</td>
                    <td className="text-center py-3 px-1 tabular-nums hidden sm:table-cell">{s.draws}</td>
                    <td className="text-center py-3 px-1 tabular-nums hidden sm:table-cell">{s.losses}</td>
                    <td className="text-center py-3 px-2 tabular-nums font-medium">{s.goals_for}</td>
                    <td className="text-center py-3 px-2 tabular-nums hidden sm:table-cell">{s.goals_against}</td>
                    <td className="text-center py-3 px-2 tabular-nums hidden md:table-cell">
                      <span className={s.goal_difference > 0 ? "text-green-400" : s.goal_difference < 0 ? "text-red-400" : ""}>{s.goal_difference > 0 ? "+" : ""}{s.goal_difference}</span>
                    </td>
                    <td className="text-center py-3 px-3"><span className="font-bold text-base tabular-nums">{s.points}</span></td>
                    <td className="text-center py-3 px-3 hidden md:table-cell">
                      <div className="flex flex-col items-center gap-1">
                        <Badge className={`${qualificationColors[s.qualification_status]} text-white text-xs`}>{qualificationLabels[s.qualification_status]}</Badge>
                        <Progress value={s.qualification_probability * 100} className="h-1 w-16" />
                        <span className="text-xs text-muted-foreground">{Math.round(s.qualification_probability * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Simulator Dialog */}
      <Dialog open={showSimulator} onOpenChange={setShowSimulator}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Calculator className="w-4 h-4 text-primary" /> {groupLabels[selectedGroup]} 出线模拟器</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {groupMatches.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">该小组无待比赛程</p>
            ) : (
              <form onSubmit={handleSimulate} className="space-y-4">
                <p className="text-sm text-muted-foreground">输入剩余比赛的预测比分，模拟最终积分榜</p>
                {groupMatches.map(m => {
                  const home = getTeamById(m.home_team_id);
                  const away = getTeamById(m.away_team_id);
                  if (!home || !away) return null;
                  return (
                    <div key={m.match_id} className="bg-secondary rounded-lg p-3">
                      <div className="flex items-center justify-center gap-3 text-sm mb-2">
                        <span>{home.flag_url} {home.name}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span>{away.name} {away.flag_url}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <input type="number" name={`${m.match_id}_home`} min={0} max={20} defaultValue={0}
                          className="w-14 px-2 py-1.5 bg-background rounded-lg text-center text-sm border border-border" />
                        <span className="text-muted-foreground font-bold">-</span>
                        <input type="number" name={`${m.match_id}_away`} min={0} max={20} defaultValue={0}
                          className="w-14 px-2 py-1.5 bg-background rounded-lg text-center text-sm border border-border" />
                      </div>
                    </div>
                  );
                })}
                <button type="submit"
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90">
                  <Play className="w-4 h-4" /> 运行模拟
                </button>
              </form>
            )}
            {Object.keys(simResults).length > 0 && (
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-2">模拟结果</h4>
                <div className="space-y-2">
                  {groupStandings.map(s => {
                    const team = getTeamById(s.team_id);
                    if (!team) return null;
                    return (
                      <div key={s.standing_id} className="flex items-center justify-between text-sm p-2 bg-secondary rounded-lg">
                        <span>{team.flag_url} {team.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums font-medium">{s.points} 分</span>
                          <Progress value={s.qualification_probability * 100} className="w-20 h-1.5" />
                          <span className="text-xs text-muted-foreground w-10 text-right">{Math.round(s.qualification_probability * 100)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">* 模拟基于当前积分和输入比分重新计算</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
