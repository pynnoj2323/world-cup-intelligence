"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { championProbabilities } from "@/data/predictions";
import { getTeamById } from "@/data/teams";
import { Swords, Trophy, Clock, AlertTriangle } from "lucide-react";

function BracketSlot({ team, prob, label }: { team?: ReturnType<typeof getTeamById>; prob?: number; label?: string }) {
  return (
    <div className="bg-secondary rounded-lg p-2.5 flex items-center justify-between min-w-[160px]">
      <div className="flex items-center gap-2">
        <span className="text-lg">{team?.flag_url || "❓"}</span>
        <span className="text-xs font-medium">{team?.name || "待定"}</span>
      </div>
      {prob !== undefined && (
        <span className="text-xs text-muted-foreground">{Math.round(prob * 100)}%</span>
      )}
    </div>
  );
}

export default function BracketPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Swords className="w-5 h-5 text-[#F5C542]" /> 淘汰赛</h1>
        <p className="text-muted-foreground text-sm mt-1">对阵路线 · 晋级概率 · 冠军预测</p>
      </div>

      {/* Bracket */}
      <Card>
        <CardHeader><CardTitle className="text-base">完整对阵图</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-[900px]">
              {/* 16 强 上半区 */}
              <div className="flex flex-col gap-2 justify-center">
                <div className="text-xs text-muted-foreground text-center mb-1 font-bold">16 强</div>
                <div className="space-y-1">
                  <BracketSlot team={getTeamById("usa")} prob={0.58} />
                  <BracketSlot team={getTeamById("ned")} prob={0.42} />
                </div>
                <div className="h-2" />
                <div className="space-y-1">
                  <BracketSlot team={getTeamById("arg")} prob={0.70} />
                  <BracketSlot team={getTeamById("sen")} prob={0.30} />
                </div>
                <div className="h-2" />
                <div className="space-y-1">
                  <BracketSlot team={getTeamById("fra")} prob={0.65} />
                  <BracketSlot team={getTeamById("aus")} prob={0.35} />
                </div>
                <div className="h-2" />
                <div className="space-y-1">
                  <BracketSlot team={getTeamById("bra")} prob={0.75} />
                  <BracketSlot team={getTeamById("den")} prob={0.25} />
                </div>
              </div>

              {/* 8 强 */}
              <div className="flex flex-col gap-3 justify-center">
                <div className="text-xs text-muted-foreground text-center mb-1 font-bold">8 强</div>
                <div className="space-y-1">
                  <BracketSlot team={getTeamById("arg")} prob={0.60} />
                  <BracketSlot team={getTeamById("usa")} prob={0.40} />
                </div>
                <div className="h-6" />
                <div className="space-y-1">
                  <BracketSlot team={getTeamById("fra")} prob={0.55} />
                  <BracketSlot team={getTeamById("bra")} prob={0.45} />
                </div>
              </div>

              {/* 半决赛 */}
              <div className="flex flex-col justify-center gap-3">
                <div className="text-xs text-muted-foreground text-center mb-1 font-bold">半决赛</div>
                <div className="space-y-1">
                  <BracketSlot team={getTeamById("arg")} prob={0.52} />
                  <BracketSlot team={getTeamById("fra")} prob={0.48} />
                </div>
              </div>

              {/* 决赛 */}
              <div className="flex flex-col justify-center gap-3">
                <div className="text-xs text-[#F5C542] text-center mb-1 font-bold">🏆 决赛</div>
                <div className="space-y-1">
                  <BracketSlot team={getTeamById("arg")} prob={0.48} />
                  <BracketSlot team={getTeamById("bra")} prob={0.38} />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">* 对阵依据当前小组排名预测，晋级概率随比赛推进动态更新</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 冠军概率榜 */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-[#F5C542]" /> 冠军概率榜</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {championProbabilities.map(cp => {
              const team = getTeamById(cp.team_id);
              if (!team) return null;
              return (
                <div key={cp.team_id} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-right tabular-nums">#{cp.rank}</span>
                  <span className="text-lg">{team.flag_url}</span>
                  <span className="text-sm font-medium w-20">{team.name}</span>
                  <Progress value={cp.probability * 100} className="flex-1 h-2" />
                  <span className="text-sm tabular-nums w-12 text-right font-semibold">{Math.round(cp.probability * 100)}%</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 晋级概率说明 */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> 淘汰赛预测说明</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground mb-1">每场淘汰赛展示指标</div>
              <ul className="space-y-1.5 ml-4">
                <li>• 90 分钟胜率</li>
                <li>• 晋级概率（含加时和点球）</li>
                <li>• 加时赛概率</li>
                <li>• 点球大战概率</li>
                <li>• 预测比分</li>
                <li>• 关键对位分析</li>
              </ul>
            </div>
            <div className="flex items-start gap-2 bg-yellow-400/10 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs">淘汰赛预测基于小组赛表现和球队整体实力模型，随比赛推进和阵容确认后自动刷新。</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
