"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { matches, getLiveMatches, getMatchById, stageLabels } from "@/data/matches";
import { teams, getTeamById } from "@/data/teams";
import { standings, getStandingsByGroup } from "@/data/standings";
import { championProbabilities, predictions, getPredictionByMatchId, type Prediction } from "@/data/predictions";
import { useStore } from "@/store";
import Link from "next/link";
import { Trophy, Circle, Star, Target, Zap, ChevronRight, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold animate-pulse">
      <Circle className="w-2 h-2 fill-white" /> LIVE
    </span>
  );
}

function MatchCard({ matchId }: { matchId: string }) {
  const match = getMatchById(matchId);
  const [overrides, setOverrides] = useState<Record<string, any>>({});
  if (!match) return null;
  const home = getTeamById(match.home_team_id);
  const away = getTeamById(match.away_team_id);
  if (!home || !away) return null;

  const override = overrides[matchId];
  const displayStatus = override?.status || match.status;
  const displayHome = override?.homeScore ?? match.home_score ?? 0;
  const displayAway = override?.awayScore ?? match.away_score ?? 0;
  const isLive = displayStatus === "live" || displayStatus === "halftime";
  const isFinished = displayStatus === "finished";
  const hasScore = displayHome > 0 || displayAway > 0;

  useEffect(() => {
    fetch("/api/matches/status")
      .then(r => r.json())
      .then((data: any[]) => {
        const map: Record<string, any> = {};
        data.forEach((d: any) => map[d.matchId] = d);
        setOverrides(map);
      })
      .catch(() => {});
  }, []);

  return (
    <Link href={`/matches/${matchId}`}>
      <div className="bg-card rounded-xl p-4 hover:ring-1 hover:ring-primary/30 transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">
            {new Date(match.kickoff_time).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })} · {match.group ? `${match.group} 组` : "淘汰赛"}
          </span>
          {isLive ? <LiveBadge /> : isFinished ? (
            <Badge variant="secondary" className="text-xs">已结束</Badge>
          ) : (
            <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
              {new Date(match.kickoff_time).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center flex-1 gap-1">
            <span className="text-2xl">{home.flag_url}</span>
            <span className="font-semibold text-sm">{home.name}</span>
          </div>
          <div className="flex flex-col items-center px-4">
            {!hasScore && displayStatus === "scheduled" ? (
              <span className="text-xl font-bold text-muted-foreground">VS</span>
            ) : (
              <div className="text-center">
                <span className="text-2xl font-bold tabular-nums tracking-wider">
                  {displayHome} - {displayAway}
                </span>
                {isLive && (
                  <div className="text-xs text-red-400 mt-0.5">
                    {match.home_score! > (match.away_score || 0) ? "领先" :
                     match.home_score! < (match.away_score || 0) ? "落后" : "平局"}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center flex-1 gap-1">
            <span className="text-2xl">{away.flag_url}</span>
            <span className="font-semibold text-sm">{away.name}</span>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-muted-foreground">
          {match.group ? `${match.group} 组` : stageLabels[match.stage]} · {match.city}
        </div>
      </div>
    </Link>
  );
}

function MiniPredictionCard({ matchId }: { matchId: string }) {
  const p = getPredictionByMatchId(matchId);
  if (!p) return null;
  const match = getMatchById(matchId);
  if (!match) return null;
  const home = getTeamById(match.home_team_id);
  const away = getTeamById(match.away_team_id);
  if (!home || !away) return null;

  return (
    <Link href={`/matches/${matchId}`}>
      <div className="bg-card rounded-xl p-3 hover:ring-1 hover:ring-primary/30 transition-all">
        <div className="flex items-center justify-between text-xs mb-2">
          <span>{new Date(match.kickoff_time).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })} {home.flag_url} {home.name} vs {away.name} {away.flag_url}</span>
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
            置信度{p.confidence_label === "high" ? "高" : p.confidence_label === "medium_high" ? "中高" : "中"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs mb-1.5">
          <span className="text-primary font-medium">主胜 {Math.round(p.home_win_probability * 100)}%</span>
          <span className="text-muted-foreground">平 {Math.round(p.draw_probability * 100)}%</span>
          <span className="text-muted-foreground">客胜 {Math.round(p.away_win_probability * 100)}%</span>
        </div>
        <div className="flex items-center gap-1 h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full" style={{ width: `${p.home_win_probability * 100}%` }} />
          <div className="bg-muted-foreground/30 h-full" style={{ width: `${p.draw_probability * 100}%` }} />
          <div className="bg-muted-foreground/40 h-full" style={{ width: `${p.away_win_probability * 100}%` }} />
        </div>
        <div className="text-xs mt-1.5 text-muted-foreground">
          预测比分 {p.predicted_home_score}-{p.predicted_away_score} · 大2.5球 {Math.round(p.over_2_5_probability * 100)}%
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { favorites } = useStore();
  const liveMatches = getLiveMatches();

  // 揭幕战倒计时
  const openerDate = new Date("2026-06-11T15:00:00-06:00");
  const now = new Date();
  const daysToOpener = Math.ceil((openerDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const hoursToOpener = Math.floor((openerDate.getTime() - now.getTime()) / (1000 * 60 * 60));

  // 显示近期待比赛
  const upcoming = matches.filter(m => m.status === "scheduled").slice(0, 12);
  // 找有预测数据的比赛
  const predictedMatchIds = upcoming.map(m => m.match_id).filter(id => getPredictionByMatchId(id));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">赛事中心</h1>
          <p className="text-muted-foreground text-sm mt-1">2026 世界杯 · 距揭幕战还有 {daysToOpener} 天</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <span className="text-sm text-primary font-medium">🏟️ 明日开赛</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* === 左栏：今日比赛 + AI预测 === */}
        <div className="lg:col-span-8 space-y-6">
          {/* 焦点比赛 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F5C542]" /> 焦点比赛
              </h2>
              <Link href="/matches" className="text-xs text-primary hover:underline flex items-center gap-1">
                全部赛程 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcoming.slice(0, 6).map(m => <MatchCard key={m.match_id} matchId={m.match_id} />)}
            </div>
          </div>

          {/* AI 赛前预测 */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> AI 赛前预测
            </h2>
            <div className="space-y-2">
              {predictedMatchIds.length > 0 ? predictedMatchIds.map(id => (
                <MiniPredictionCard key={id} matchId={id} />
              )) : (
                <div className="bg-card rounded-xl p-6 text-center text-muted-foreground text-sm">
                  赛事尚未开始，AI 预测将在开赛前 24 小时陆续发布
                </div>
              )}
            </div>
          </div>

          {/* 小组出线形势 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">小组出线形势</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(group => {
                const gs = getStandingsByGroup(group);
                return (
                  <Link key={group} href={`/standings?group=${group}`}>
                    <div className="bg-card rounded-xl p-3 hover:ring-1 hover:ring-primary/30 transition-all">
                      <div className="text-xs text-muted-foreground mb-2 font-mono">{group} 组</div>
                      {gs.slice(0, 2).map(s => {
                        const t = getTeamById(s.team_id);
                        return t ? (
                          <div key={s.standing_id} className="flex items-center justify-between text-sm py-0.5">
                            <span className="flex items-center gap-1.5">
                              <span className="text-xs text-primary w-3">{s.rank}</span>
                              <span>{t.flag_url}</span>
                              <span>{t.name}</span>
                            </span>
                            <span className="text-xs tabular-nums">{s.points}分</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* === 右栏：冠军概率 + 关注球队 === */}
        <div className="lg:col-span-4 space-y-4">
          {/* 冠军概率榜 */}
          <Card className="border-0 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#F5C542]" /> 冠军概率榜
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {championProbabilities.slice(0, 8).map(cp => {
                const team = getTeamById(cp.team_id);
                if (!team) return null;
                return (
                  <div key={cp.team_id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs w-4 text-right tabular-nums text-muted-foreground">#{cp.rank}</span>
                    <span>{team.flag_url}</span>
                    <span className="flex-1">{team.name}</span>
                    <div className="w-14 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-[#F5C542] rounded-full" style={{ width: `${cp.probability * 100}%` }} />
                    </div>
                    <span className="text-xs w-10 text-right tabular-nums">{Math.round(cp.probability * 100)}%</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 关注球队下一场 */}
          <Card className="border-0 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-[#F5C542]" /> 关注球队
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">前往「我的」页面关注球队</p>
              ) : (
                <div className="space-y-2">
                  {favorites.map(tid => {
                    const t = getTeamById(tid);
                    if (!t) return null;
                    const s = standings.find(st => st.team_id === tid);
                    const nextMatch = matches.find(m =>
                      (m.home_team_id === tid || m.away_team_id === tid) &&
                      m.status === "scheduled"
                    );
                    return (
                      <div key={tid} className="p-2 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{t.flag_url}</span>
                          <span className="text-sm font-medium">{t.name}</span>
                          {s && <span className="text-xs text-muted-foreground ml-auto">{s.points}分</span>}
                        </div>
                        {nextMatch && (
                          <div className="text-xs text-muted-foreground mt-1 ml-7">
                            下一场 vs {getTeamById(nextMatch.home_team_id === tid ? nextMatch.away_team_id : nextMatch.home_team_id)?.name}
                            {" · "}{new Date(nextMatch.kickoff_time).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
