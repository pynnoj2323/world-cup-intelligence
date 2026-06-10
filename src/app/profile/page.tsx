"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { teams, getTeamById } from "@/data/teams";
import { standings } from "@/data/standings";
import { useStore } from "@/store";
import { User, Star, Trophy, BarChart3 } from "lucide-react";

export default function ProfilePage() {
  const { favorites, toggleFavorite, userPredictions } = useStore();
  const scored = userPredictions.filter(p => p.score_awarded !== null);
  const correct = scored.filter(p => (p.score_awarded || 0) > 0).length;
  const totalPoints = scored.reduce((s, p) => s + (p.score_awarded || 0), 0);
  const accuracy = userPredictions.length > 0 ? Math.round((correct / Math.max(scored.length, 1)) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      {/* Profile */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">球迷用户</h1>
              <p className="text-muted-foreground text-sm">世界杯预测玩家</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-[#F5C542]">{totalPoints}</div>
              <div className="text-xs text-muted-foreground">总积分</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><Trophy className="w-5 h-5 text-[#F5C542] mx-auto mb-1" /><div className="text-xl font-bold">{userPredictions.length}</div><div className="text-xs text-muted-foreground">预测次数</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><BarChart3 className="w-5 h-5 text-primary mx-auto mb-1" /><div className="text-xl font-bold">{accuracy}%</div><div className="text-xs text-muted-foreground">准确率</div></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Star className="w-5 h-5 text-yellow-400 mx-auto mb-1" /><div className="text-xl font-bold">{correct}</div><div className="text-xs text-muted-foreground">命中</div></CardContent></Card>
      </div>

      {/* Favorites */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="w-4 h-4 text-[#F5C542]" /> 关注球队</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {teams.map(team => {
            const isFav = favorites.includes(team.team_id);
            const s = standings.find(st => st.team_id === team.team_id);
            return (
              <div key={team.team_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleFavorite(team.team_id)}
                    className={`p-1 rounded ${isFav ? "text-[#F5C542]" : "text-muted-foreground/30"}`}>
                    <Star className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                  </button>
                  <span className="text-lg">{team.flag_url}</span>
                  <span className="text-sm font-medium">{team.name}</span>
                  <span className="text-xs text-muted-foreground">{team.group} 组</span>
                </div>
                {s && <span className="text-xs text-muted-foreground">{s.played}场 {s.points}分 #{team.fifa_ranking}</span>}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Prediction History */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> 预测历史</CardTitle></CardHeader>
        <CardContent>
          {userPredictions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">暂无预测记录</p>
          ) : (
            <div className="space-y-2">
              {userPredictions.slice().reverse().map(p => {
                const home = p.predicted_result === "home_win" ? "胜" : "";
                return (
                  <div key={p.user_prediction_id} className="p-3 bg-secondary rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-sm font-mono text-xs text-muted-foreground">{p.match_id}</div>
                      <div className="text-sm mt-0.5">
                        预测：{p.predicted_result === "home_win" ? "主胜" : p.predicted_result === "draw" ? "平局" : "客胜"} {p.predicted_home_score}-{p.predicted_away_score}
                      </div>
                      {p.comment && <div className="text-xs text-muted-foreground mt-0.5">{p.comment}</div>}
                    </div>
                    <div className="text-right">
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">信心 {p.confidence}/5</Badge>
                      {p.score_awarded !== null && <div className="text-xs text-green-400 mt-1">+{p.score_awarded} 分</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
