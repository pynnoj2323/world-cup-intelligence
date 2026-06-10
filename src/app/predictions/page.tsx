"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { predictions, championProbabilities } from "@/data/predictions";
import { getMatchById } from "@/data/matches";
import { getTeamById } from "@/data/teams";
import { useStore } from "@/store";
import { Target, Zap, Trophy, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function PredictionsPage() {
  const { userPredictions } = useStore();
  const scored = userPredictions.filter(p => p.score_awarded !== null);
  const correct = scored.filter(p => (p.score_awarded || 0) > 0).length;
  const totalPoints = scored.reduce((s, p) => s + (p.score_awarded || 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> 预测中心</h1>
        <p className="text-muted-foreground text-sm mt-1">AI 赛事预测 · 我的预测 · 冠军概率</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-primary tabular-nums">{userPredictions.length}</div><div className="text-xs text-muted-foreground mt-1">我的预测</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-[#F5C542] tabular-nums">{correct}</div><div className="text-xs text-muted-foreground mt-1">命中</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-green-400 tabular-nums">{totalPoints}</div><div className="text-xs text-muted-foreground mt-1">总积分</div></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> AI 赛事预测</h2>
          {predictions.map(p => {
            const match = getMatchById(p.match_id);
            if (!match) return null;
            const home = getTeamById(match.home_team_id), away = getTeamById(match.away_team_id);
            if (!home || !away) return null;

            return (
              <Link key={p.prediction_id} href={`/matches/${p.match_id}`}>
                <Card className="hover:ring-1 hover:ring-primary/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{home.flag_url}</span><span className="font-semibold">{home.name}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-semibold">{away.name}</span><span>{away.flag_url}</span>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">推荐：{p.recommendation_label}</Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>主胜 {Math.round(p.home_win_probability * 100)}%</span>
                      <span>平 {Math.round(p.draw_probability * 100)}%</span>
                      <span>客胜 {Math.round(p.away_win_probability * 100)}%</span>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden mb-3">
                      <div className="bg-primary" style={{ width: `${p.home_win_probability * 100}%` }} />
                      <div className="bg-muted-foreground/30" style={{ width: `${p.draw_probability * 100}%` }} />
                      <div className="bg-muted-foreground/40" style={{ width: `${p.away_win_probability * 100}%` }} />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <span>预测比分 {p.predicted_home_score}-{p.predicted_away_score}</span>
                      <span>大2.5球 {Math.round(p.over_2_5_probability * 100)}%</span>
                      <span>双方进球 {Math.round(p.both_teams_score_probability * 100)}%</span>
                      <span className="text-primary">置信度{p.confidence_label === "medium_high" ? "中高" : "中"}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-[#F5C542]" /> 冠军概率</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {championProbabilities.slice(0, 6).map(cp => {
                const team = getTeamById(cp.team_id);
                if (!team) return null;
                return (
                  <div key={cp.team_id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs w-4 text-muted-foreground">#{cp.rank}</span>
                    <span>{team.flag_url}</span>
                    <span className="flex-1">{team.name}</span>
                    <Progress value={cp.probability * 100} className="w-12 h-1.5" />
                    <span className="text-xs w-10 text-right">{Math.round(cp.probability * 100)}%</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
