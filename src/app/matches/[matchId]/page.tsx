"use client";

// v2: DeepSeek AI 实时预测引擎
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { matches, getMatchById, statusLabels, stageLabels } from "@/data/matches";
import { getTeamById } from "@/data/teams";
import { getPredictionByMatchId } from "@/data/predictions";
import { useStore } from "@/store";
import { useState, useCallback, useRef, useEffect } from "react";
import { Clock, MapPin, TrendingUp, AlertTriangle, Target, Star, RefreshCw, Play, Zap, Check } from "lucide-react";
import Link from "next/link";

const DIMENSIONS = [
  { id: "form", label: "近期状态", desc: "近 5 场战绩与进球趋势", icon: "📊" },
  { id: "h2h", label: "历史交锋", desc: "两队过往交手记录", icon: "⚔️" },
  { id: "injuries", label: "伤病停赛", desc: "关键球员伤病与停赛影响", icon: "🏥" },
  { id: "lineup", label: "首发阵容", desc: "预测首发与战术阵型", icon: "📋" },
  { id: "weather", label: "天气场地", desc: "比赛日天气与草皮状况", icon: "🌤️" },
  { id: "standings", label: "积分形势", desc: "小组出线压力与积分权重", icon: "📈" },
  { id: "fatigue", label: "赛程密度", desc: "近期比赛频率与体力消耗", icon: "⏱️" },
];

type DimensionId = typeof DIMENSIONS[number]["id"];

interface RunResult {
  home_win: number;
  draw: number;
  away_win: number;
  predicted_home_score: number;
  predicted_away_score: number;
  score_min_home: number;
  score_max_home: number;
  score_min_away: number;
  score_max_away: number;
  over_25: number;
  btts: number;
  confidence: number;
  confidence_label: string;
  insights: string[];
  narrative_summary: string;
  key_factors: { factor: string; impact: string; explanation: string }[];
  risk_factors: { risk: string; severity: string; explanation: string; probability: number }[];
  recommendation_label: string;
  recommendation_reason: string;
  score_predictions: { home: number; away: number; probability: number; scenario: string }[];
  tactical_analysis: { home_tactics: string; away_tactics: string; key_battle: string };
  score_reasoning: string;
  asian_handicap_analysis: string;
  correct_score_probability: number;
  chain_of_thought: string[];
  data_summary: string;
  data_key_findings: string[];
  pipeline_metadata: { agents_used: string[] };
}


export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const match = getMatchById(matchId);
  const staticPrediction = getPredictionByMatchId(matchId);
  const { addPrediction, getUserPrediction } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [predResult, setPredResult] = useState<"home_win" | "draw" | "away_win">("home_win");
  const [predHome, setPredHome] = useState(1);
  const [predAway, setPredAway] = useState(0);
  const [predConfidence, setPredConfidence] = useState(3);
  const [predComment, setPredComment] = useState("");

  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [selectedDims, setSelectedDims] = useState<DimensionId[]>(["form", "h2h", "injuries", "lineup", "standings"]);
  const [runHistory, setRunHistory] = useState<{ dims: DimensionId[]; result: RunResult; time: string }[]>([]);

  // Review Agent state
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [reviewError, setReviewError] = useState("");

  // Video Agent state
  const [videoMode, setVideoMode] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoResult, setVideoResult] = useState<any>(null);

  // 从DB拉取比赛状态覆盖（每30分钟自动刷新 + 手动刷新）
  const [matchOverride, setMatchOverride] = useState<{ status?: string; homeScore?: number; awayScore?: number } | null>(null);
  const [lastRefresh, setLastRefresh] = useState("");
  const fetchMatchStatus = async () => {
    try {
      const res = await fetch(`/api/matches/status?matchId=${matchId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const r = data[0];
          setMatchOverride({ status: r.status, homeScore: r.homeScore, awayScore: r.awayScore });
        }
      }
    } catch {}
  };
  const handleRefresh = async () => {
    await fetchMatchStatus();
    setLastRefresh(new Date().toLocaleTimeString("zh-CN"));
  };
  useEffect(() => {
    fetchMatchStatus();
    const timer = setInterval(fetchMatchStatus, 30 * 60 * 1000); // 30分钟
    return () => clearInterval(timer);
  }, [matchId]);

  // 合并静态数据+DB覆盖
  const displayStatus = matchOverride?.status || match?.status || "scheduled";
  const displayHomeScore = matchOverride?.homeScore ?? match?.home_score ?? 0;
  const displayAwayScore = matchOverride?.awayScore ?? match?.away_score ?? 0;

  const toggleDim = (id: DimensionId) => {
    setSelectedDims(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };
  const allDims = selectedDims.length === DIMENSIONS.length;

  // 用 ref 存储最新值，避免 useCallback 闭包和 TS 声明顺序问题
  const homeRef = useRef(match ? getTeamById(match.home_team_id) : undefined);
  const awayRef = useRef(match ? getTeamById(match.away_team_id) : undefined);
  const matchRef = useRef(match);
  // 始终更新 ref
  homeRef.current = match ? getTeamById(match.home_team_id) : undefined;
  awayRef.current = match ? getTeamById(match.away_team_id) : undefined;
  matchRef.current = match;

  async function runPrediction() {
    setIsRunning(true);
    try {
      const h = homeRef.current!;
      const a = awayRef.current!;
      const m = matchRef.current!;

      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeTeam: { name: h.name, rank: h.fifa_ranking, group: h.group },
          awayTeam: { name: a.name, rank: a.fifa_ranking, group: a.group },
          group: m.group || undefined,
          stage: m.stage,
          venue: m.venue,
          dimensions: selectedDims,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "AI 服务异常");
      }

      const data = await res.json();
      const result: RunResult = {
        home_win: data.home_win_probability,
        draw: data.draw_probability,
        away_win: data.away_win_probability,
        predicted_home_score: data.predicted_home_score,
        predicted_away_score: data.predicted_away_score,
        score_min_home: Math.max(0, data.predicted_home_score - 1),
        score_max_home: data.predicted_home_score + 1,
        score_min_away: Math.max(0, data.predicted_away_score - 1),
        score_max_away: data.predicted_away_score + 1,
        over_25: data.over_25_probability,
        btts: data.both_teams_score_probability,
        confidence: data.confidence,
        confidence_label: data.confidence_label === "high" ? "高" : data.confidence_label === "medium_high" ? "中高" : data.confidence_label === "medium" ? "中" : "低",
        insights: selectedDims.map(d => {
          const found = DIMENSIONS.find(dd => dd.id === d);
          return found ? `${found.icon} ${found.label}数据已纳入分析` : "";
        }).filter(Boolean),
        narrative_summary: data.narrative_summary || "",
        key_factors: data.key_factors || [],
        risk_factors: (data.risk_factors || []).map((r: any) => ({ ...r, probability: r.probability || 0.15 })),
        recommendation_label: data.recommendation_label || "",
        recommendation_reason: data.recommendation_reason || "",
        score_predictions: data.score_predictions || [],
        tactical_analysis: data.tactical_analysis || { home_tactics: "", away_tactics: "", key_battle: "" },
        score_reasoning: data.score_reasoning || "",
        asian_handicap_analysis: data.asian_handicap_analysis || "",
        correct_score_probability: data.correct_score_probability || 0,
        chain_of_thought: data.chain_of_thought || [],
        data_summary: data.data_summary || "",
        data_key_findings: data.data_key_findings || [],
        pipeline_metadata: data.pipeline_metadata || { agents_used: ["AI"] },
      };

      setRunResult(result);
      setRunHistory(prev => [{ dims: selectedDims, result, time: new Date().toLocaleTimeString("zh-CN") }, ...prev].slice(0, 5));

      // 自动保存预测记录到数据库（用于复盘校准）
      fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          homeTeam: home.name, awayTeam: away.name,
          group: match?.group || null, stage: match?.stage || null,
          predictedHomeWin: data.home_win_probability,
          predictedDraw: data.draw_probability,
          predictedAwayWin: data.away_win_probability,
          predictedHomeScore: data.predicted_home_score,
          predictedAwayScore: data.predicted_away_score,
          confidence: data.confidence,
          confidenceLabel: data.confidence_label,
          recommendationLabel: data.recommendation_label,
          recommendationReason: data.recommendation_reason,
          scorePredictionsJson: JSON.stringify(data.score_predictions),
          keyFactorsJson: JSON.stringify(data.key_factors),
          riskFactorsJson: JSON.stringify(data.risk_factors),
          narrativeSummary: data.narrative_summary,
          ensembleRuns: data.ensemble_info?.runs || 3,
          voteAgreement: data.ensemble_info?.vote_agreement || null,
        }),
      }).catch(() => {/* 静默失败，不影响主流程 */});
    } catch (error: any) {
      alert(error.message || "AI 预测请求失败");
    } finally {
      setIsRunning(false);
    }
  }

  if (!match || !homeRef.current || !awayRef.current) {
    return <div className="max-w-3xl mx-auto p-6 text-center py-20"><p className="text-muted-foreground">比赛未找到</p><Link href="/matches" className="text-primary hover:underline mt-2 block">返回赛程</Link></div>;
  }

  const home = homeRef.current;
  const away = awayRef.current;

  const existing = getUserPrediction(matchId);
  const isLive = displayStatus === "live" || displayStatus === "halftime";

  const handleSubmit = () => {
    addPrediction({
      user_prediction_id: `up_${matchId}_${Date.now()}`,
      match_id: matchId,
      predicted_result: predResult,
      predicted_home_score: predHome,
      predicted_away_score: predAway,
      confidence: predConfidence,
      comment: predComment,
      locked: displayStatus !== "scheduled",
      score_awarded: null,
      created_at: new Date().toISOString(),
    });
    setShowForm(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* 比分板 */}
      <div className="bg-gradient-to-b from-card to-background rounded-2xl p-6 md:p-8 text-center border border-border/50">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
          <span>{match.group ? `${match.group} 组` : stageLabels[match.stage]}</span>
          <span>·</span>
          <span>{new Date(match.kickoff_time).toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" })}</span>
          <span>{new Date(match.kickoff_time).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
          <MapPin className="w-3 h-3" /> {match.venue}
          <span className="mx-2">|</span>
          <button onClick={handleRefresh} className="flex items-center gap-1 text-xs text-primary hover:underline" title="手动刷新比分">
            <RefreshCw className="w-3 h-3" /> {lastRefresh ? `已刷新 ${lastRefresh}` : "刷新比分"}
          </button>
        </div>
        <div className="flex items-center justify-center gap-6 md:gap-16">
          <div className="flex flex-col items-center"><span className="text-5xl md:text-6xl mb-3">{home.flag_url}</span><span className="text-xl font-bold">{home.name}</span></div>
          <div className="text-center">
            {displayStatus === "scheduled" ? <span className="text-3xl md:text-4xl font-bold text-muted-foreground">VS</span> : <div><span className="text-4xl md:text-5xl font-bold tabular-nums tracking-wider">{displayHomeScore} - {displayAwayScore}</span></div>}
            <div className="mt-2">{isLive ? <Badge variant="destructive" className="animate-pulse">LIVE</Badge> : <Badge variant="secondary">{displayStatus === "finished" ? "已结束" : displayStatus === "scheduled" ? "未开始" : displayStatus}</Badge>}</div>
          </div>
          <div className="flex flex-col items-center"><span className="text-5xl md:text-6xl mb-3">{away.flag_url}</span><span className="text-xl font-bold">{away.name}</span></div>
        </div>
      </div>

      {/* ===== AI 预测引擎（可勾选维度 + 启动预测）===== */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Zap className="w-4 h-4 text-[#F5C542]" /> AI 预测引擎</CardTitle>
            {runHistory.length > 0 && <span className="text-xs text-muted-foreground">已运行 {runHistory.length} 次</span>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 数据维度选择 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">参考数据维度（可多选）</span>
              <button onClick={() => setSelectedDims(allDims ? [] : DIMENSIONS.map(d => d.id))} className="text-xs text-primary hover:underline">{allDims ? "取消全选" : "全选"}</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIMENSIONS.map(d => {
                const checked = selectedDims.includes(d.id);
                return (
                  <button key={d.id} onClick={() => toggleDim(d.id)} className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all text-sm ${checked ? "bg-primary/15 border border-primary/40 text-foreground" : "bg-secondary border border-transparent text-muted-foreground hover:text-foreground"}`}>
                    <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs shrink-0 ${checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"}`}>{checked ? "✓" : ""}</span>
                    <div className="min-w-0"><div className="font-medium text-xs">{d.icon} {d.label}</div><div className="text-[10px] text-muted-foreground/60 truncate">{d.desc}</div></div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={runPrediction} disabled={isRunning || selectedDims.length === 0} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {isRunning ? <><RefreshCw className="w-4 h-4 animate-spin" /> DeepSeek 分析中...</> : <><Zap className="w-4 h-4" /> 🤖 DeepSeek AI 预测</>}
            </button>
            <span className="text-xs text-muted-foreground">{selectedDims.length === 0 ? "请至少选择一个数据维度" : `已选 ${selectedDims.length}/${DIMENSIONS.length} 个维度`}</span>
          </div>

          {/* 运行中动画 */}
          {isRunning && !runResult && (
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-primary"><RefreshCw className="w-4 h-4 animate-spin" />正在加载数据并执行分析...</div>
              {selectedDims.map(d => <div key={d} className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded-full bg-primary/30 animate-pulse" /><span>读取{DIMENSIONS.find(dd => dd.id === d)?.label}数据中...</span></div>)}
            </div>
          )}

          {/* 运行结果 */}
          {runResult && (
            <div className="border-t border-border pt-4 space-y-4">
              {/* 胜平负 + 置信区间 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{home.name} 胜</div>
                  <div className="text-xl font-bold text-primary">{Math.round(runResult.home_win * 100)}%</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{Math.max(0, Math.round((runResult.home_win - 0.08) * 100))}% – {Math.round((runResult.home_win + 0.08) * 100)}%</div>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">平局</div>
                  <div className="text-xl font-bold text-muted-foreground">{Math.round(runResult.draw * 100)}%</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{Math.max(0, Math.round((runResult.draw - 0.05) * 100))}% – {Math.round((runResult.draw + 0.05) * 100)}%</div>
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{away.name} 胜</div>
                  <div className="text-xl font-bold">{Math.round(runResult.away_win * 100)}%</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{Math.max(0, Math.round((runResult.away_win - 0.05) * 100))}% – {Math.round((runResult.away_win + 0.05) * 100)}%</div>
                </div>
              </div>

              {/* 概率条 */}
              <div className="flex h-2 rounded-full overflow-hidden">
                <div className="bg-primary" style={{ width: `${runResult.home_win * 100}%` }} />
                <div className="bg-muted-foreground/30" style={{ width: `${runResult.draw * 100}%` }} />
                <div className="bg-muted-foreground/40" style={{ width: `${runResult.away_win * 100}%` }} />
              </div>

              {/* 预测比分 + 范围 */}
              <div className="bg-gradient-to-r from-primary/10 to-card rounded-lg p-4 text-center">
                <div className="text-xs text-muted-foreground mb-2">AI 预测比分</div>
                <div className="flex items-center justify-center gap-4">
                  <span className="font-bold text-lg">{home.name}</span>
                  <span className="text-3xl font-bold tabular-nums text-primary">{runResult.predicted_home_score} - {runResult.predicted_away_score}</span>
                  <span className="font-bold text-lg">{away.name}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  比分范围：{home.name} {runResult.score_min_home}–{runResult.score_max_home} 球，{away.name} {runResult.score_min_away}–{runResult.score_max_away} 球
                </div>
              </div>

              {/* 大小球 & 双方进球 */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-secondary rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground">大 2.5 球</div>
                  <div className="text-sm font-bold">{Math.round(runResult.over_25 * 100)}%</div>
                </div>
                <div className="bg-secondary rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground">双方进球</div>
                  <div className="text-sm font-bold">{Math.round(runResult.btts * 100)}%</div>
                </div>
                <div className="bg-secondary rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground">准确比分</div>
                  <div className="text-sm font-bold">{Math.round(runResult.correct_score_probability * 100)}%</div>
                </div>
                <div className="bg-secondary rounded-lg p-2.5 text-center">
                  <div className="text-[10px] text-muted-foreground">置信度</div>
                  <div className="text-sm font-bold text-primary">{runResult.confidence_label}</div>
                </div>
              </div>

              {/* 推荐 */}
              <div className="bg-gradient-to-r from-primary/20 to-card rounded-lg p-3 border border-primary/30">
                <span className="text-primary font-bold text-sm">{runResult.recommendation_label}</span>
                <span className="text-xs text-muted-foreground mx-2">—</span>
                <span className="text-xs text-muted-foreground">{runResult.recommendation_reason}</span>
                {runResult.asian_handicap_analysis && (
                  <div className="text-xs text-muted-foreground mt-1 border-t border-border/50 pt-1">{runResult.asian_handicap_analysis}</div>
                )}
              </div>

              {/* 多比分预测 */}
              {runResult.score_predictions.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">比分可能性排行</div>
                  <div className="space-y-1.5">
                    {runResult.score_predictions.map((sp, i) => (
                      <div key={i} className="flex items-center justify-between bg-secondary rounded-lg p-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold w-8 text-center ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{sp.home}-{sp.away}</span>
                          <span className="text-primary font-medium">{Math.round(sp.probability * 100)}%</span>
                        </div>
                        <span className="text-muted-foreground truncate ml-2 text-right">{sp.scenario}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 比分推理 */}
              {runResult.score_reasoning && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">比分预测依据</div>
                  <p className="text-xs text-muted-foreground">{runResult.score_reasoning}</p>
                </div>
              )}

              {/* 战术分析 */}
              {runResult.tactical_analysis && (runResult.tactical_analysis.home_tactics || runResult.tactical_analysis.key_battle) && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary rounded-lg p-2.5">
                    <div className="text-[10px] text-muted-foreground mb-1">{home.name} 战术</div>
                    <div className="text-xs">{runResult.tactical_analysis.home_tactics}</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-2.5">
                    <div className="text-[10px] text-muted-foreground mb-1">{away.name} 战术</div>
                    <div className="text-xs">{runResult.tactical_analysis.away_tactics}</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-2.5">
                    <div className="text-[10px] text-muted-foreground mb-1">关键对决</div>
                    <div className="text-xs">{runResult.tactical_analysis.key_battle}</div>
                  </div>
                </div>
              )}

              {/* 风险因素 */}
              {runResult.risk_factors.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-yellow-400" /> 风险提示</div>
                  <div className="space-y-1.5">
                    {runResult.risk_factors.map((rf, i) => (
                      <div key={i} className="flex items-start gap-2 bg-secondary rounded-lg p-2 text-xs">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${rf.severity === "high" ? "bg-red-400" : rf.severity === "medium" ? "bg-yellow-400" : "bg-muted-foreground"}`} />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{rf.risk}</span>
                          <span className="text-muted-foreground">（{Math.round(rf.probability * 100)}%）— {rf.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 数据Agent */}
              {runResult.data_summary && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="text-xs font-medium text-blue-400 mb-1.5">📊 Data Agent 分析</div>
                  <p className="text-xs text-muted-foreground">{runResult.data_summary}</p>
                  {runResult.data_key_findings.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {runResult.data_key_findings.map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] py-0 bg-blue-500/10 text-blue-400 border-blue-500/20">{f}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 思维链 */}
              {runResult.chain_of_thought.length > 0 && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                  <div className="text-xs font-medium text-purple-400 mb-1.5">🧠 Prediction Agent 推理链</div>
                  <div className="space-y-1">
                    {runResult.chain_of_thought.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="text-purple-400 font-mono shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 数据来源标注 */}
              <div className="flex flex-wrap gap-1.5">
                {runResult.insights.map((insight, i) => <Badge key={i} variant="secondary" className="text-[10px] py-0">{insight}</Badge>)}
                {runResult.pipeline_metadata?.agents_used.map((a: string) => (
                  <Badge key={a} variant="secondary" className="text-[10px] py-0 bg-purple-500/10 text-purple-400 border-purple-500/20">🤖 {a}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI 赛前预测 */}
        {staticPrediction && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> AI 赛前预测</CardTitle>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {new Date(staticPrediction.updated_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2"><span className="font-medium">{home.name} 胜</span><span className="text-muted-foreground">平局</span><span className="font-medium">{away.name} 胜</span></div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span className="text-primary font-medium">{Math.round(staticPrediction.home_win_probability * 100)}%</span><span>{Math.round(staticPrediction.draw_probability * 100)}%</span><span>{Math.round(staticPrediction.away_win_probability * 100)}%</span></div>
                <div className="flex h-2 rounded-full overflow-hidden"><div className="bg-primary" style={{ width: `${staticPrediction.home_win_probability * 100}%` }} /><div className="bg-muted-foreground/30" style={{ width: `${staticPrediction.draw_probability * 100}%` }} /><div className="bg-muted-foreground/40" style={{ width: `${staticPrediction.away_win_probability * 100}%` }} /></div>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground mb-1">预测比分</div><div className="text-2xl font-bold">{staticPrediction.predicted_home_score} - {staticPrediction.predicted_away_score}</div></div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-secondary rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground mb-1">大于 2.5 球</div><div className="font-bold text-lg">{Math.round(staticPrediction.over_2_5_probability * 100)}%</div></div>
                <div className="bg-secondary rounded-lg p-3 text-center"><div className="text-xs text-muted-foreground mb-1">双方进球</div><div className="font-bold text-lg">{Math.round(staticPrediction.both_teams_score_probability * 100)}%</div></div>
              </div>
              <div className="flex items-center gap-3 text-sm"><Badge className="bg-primary/20 text-primary border-primary/30">置信度：{staticPrediction.confidence_label === "high" ? "高" : staticPrediction.confidence_label === "medium_high" ? "中高" : "中"}</Badge><span className="text-primary font-medium">推荐：{staticPrediction.recommendation_label}</span></div>
              <p className="text-xs text-muted-foreground">{staticPrediction.recommendation_reason}</p>
            </CardContent>
          </Card>
        )}

        {staticPrediction && (
          <div className="space-y-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> 关键因素</CardTitle></CardHeader><CardContent><ul className="space-y-2 text-sm">{staticPrediction.key_factors.map((f, i) => <li key={i} className="flex items-start gap-2"><span className="text-primary mt-1">•</span><span>{f.explanation}</span></li>)}</ul></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" /> 风险因素</CardTitle></CardHeader><CardContent><ul className="space-y-2 text-sm">{staticPrediction.risk_factors.map((f, i) => <li key={i} className="flex items-start gap-2"><span className={`mt-1 ${f.severity === "high" ? "text-red-400" : f.severity === "medium" ? "text-yellow-400" : "text-muted-foreground"}`}>•</span><div><span className="font-medium">{f.risk}</span><span className="text-muted-foreground"> — {f.explanation}</span></div></li>)}</ul></CardContent></Card>
          </div>
        )}
      </div>

      {/* 运行历史 */}
      {runHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> 预测运行历史</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {runHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-secondary rounded-lg text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{h.time}</span>
                    <span className="text-primary font-medium">{Math.round(h.result.home_win * 100)}% / {Math.round(h.result.draw * 100)}% / {Math.round(h.result.away_win * 100)}%</span>
                    <span className="text-xs text-muted-foreground">预测 {h.result.predicted_home_score}-{h.result.predicted_away_score}</span>
                  </div>
                  <div className="flex gap-1">{h.dims.map(d => <Badge key={d} variant="secondary" className="text-[10px] py-0 px-1.5">{DIMENSIONS.find(dd => dd.id === d)?.label}</Badge>)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 综述 + 免责 */}
      {staticPrediction && (
        <Card><CardContent className="p-4 space-y-2"><p className="text-sm text-muted-foreground leading-relaxed">{staticPrediction.narrative_summary}</p><p className="text-xs text-muted-foreground/60 italic border-t border-border pt-2 mt-2">{staticPrediction.disclaimer}</p></CardContent></Card>
      )}

      {/* 用户预测 */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="w-4 h-4 text-[#F5C542]" /> 我的预测</CardTitle></CardHeader>
        <CardContent>
          {existing ? (
            <div className="bg-secondary rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">预测：{existing.predicted_result === "home_win" ? `${home.name} 胜` : existing.predicted_result === "draw" ? "平局" : `${away.name} 胜`}</span><Badge className="bg-primary/20 text-primary border-primary/30 text-xs">信心 {existing.confidence}/5</Badge></div>
              <div className="text-xl font-bold">{existing.predicted_home_score} - {existing.predicted_away_score}</div>
              {existing.comment && <p className="text-xs text-muted-foreground">{existing.comment}</p>}
              {existing.locked && <Badge variant="secondary" className="text-xs">已锁定</Badge>}
              {existing.score_awarded !== null && <p className="text-sm text-green-400">+{existing.score_awarded} 分</p>}
            </div>
          ) : showForm ? (
            <div className="space-y-4">
              <div><div className="text-sm text-muted-foreground mb-2">选择结果</div><div className="flex gap-2">{[{ key: "home_win" as const, label: `${home.name} 胜` }, { key: "draw" as const, label: "平局" }, { key: "away_win" as const, label: `${away.name} 胜` }].map(opt => <button key={opt.key} onClick={() => setPredResult(opt.key)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${predResult === opt.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>{opt.label}</button>)}</div></div>
              <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">预测比分</span><input type="number" value={predHome} onChange={e => setPredHome(Math.max(0, Number(e.target.value)))} className="w-14 px-2 py-1.5 bg-secondary rounded-lg text-center text-sm border border-border" min={0} /><span className="text-muted-foreground font-bold">-</span><input type="number" value={predAway} onChange={e => setPredAway(Math.max(0, Number(e.target.value)))} className="w-14 px-2 py-1.5 bg-secondary rounded-lg text-center text-sm border border-border" min={0} /></div>
              <div><div className="text-sm text-muted-foreground mb-2">信心值</div><div className="flex gap-1">{[1,2,3,4,5].map(v => <button key={v} onClick={() => setPredConfidence(v)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${predConfidence >= v ? "bg-[#F5C542] text-black" : "bg-secondary text-muted-foreground"}`}>{v}</button>)}</div></div>
              <input type="text" placeholder="预测理由（可选）" value={predComment} onChange={e => setPredComment(e.target.value)} className="w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border placeholder:text-muted-foreground" />
              <div className="flex gap-2"><button onClick={handleSubmit} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90">提交预测</button><button onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-secondary text-muted-foreground rounded-lg text-sm">取消</button></div>
            </div>
          ) : displayStatus !== "finished" ? (
            <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-lg text-sm border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors bg-secondary/50">+ 我要预测</button>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">比赛已结束</p>
          )}
        </CardContent>
      </Card>

      {/* Video Insight Agent */}
      <Card className="border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-blue-400">🎬</span> Video Insight Agent
            <Badge variant="secondary" className="text-[10px] py-0 bg-blue-500/10 text-blue-400 border-blue-500/20 ml-2">Beta</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!videoMode ? (
            <button
              onClick={() => setVideoMode(true)}
              className="w-full py-3 rounded-lg text-sm border border-dashed border-border text-muted-foreground hover:text-blue-400 hover:border-blue-500/50 transition-colors bg-secondary/50"
            >
              🎥 粘贴解说文本，AI 提取观点
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                placeholder="粘贴比赛解说/评论的文字稿..."
                value={transcriptText}
                onChange={e => setTranscriptText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none"
              />
              <div className="flex gap-2">
                <button
                  disabled={isAnalyzingVideo || transcriptText.length < 10}
                  onClick={async () => {
                    setIsAnalyzingVideo(true);
                    setVideoResult(null);
                    try {
                      const res = await fetch("/api/video-insight", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          transcript: transcriptText,
                          homeTeam: { name: home.name, rank: home.fifa_ranking },
                          awayTeam: { name: away.name, rank: away.fifa_ranking },
                        }),
                      });
                      const data = await res.json();
                      setVideoResult(data);
                    } catch {
                      setVideoResult({ error: "分析失败" });
                    } finally {
                      setIsAnalyzingVideo(false);
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                >
                  {isAnalyzingVideo ? "分析中..." : "启动 Video Agent"}
                </button>
                <button onClick={() => { setVideoMode(false); setTranscriptText(""); }} className="px-3 py-2 text-sm text-muted-foreground">取消</button>
              </div>
              {videoResult && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] ${videoResult.overall_tendency === "home" ? "bg-green-500/20 text-green-400" : videoResult.overall_tendency === "away" ? "bg-red-500/20 text-red-400" : "bg-muted/20"}`}>
                      综合倾向：{videoResult.overall_tendency === "home" ? home.name : videoResult.overall_tendency === "away" ? away.name : "中立"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">可信度 {Math.round((videoResult.credibility_score || 0) * 100)}%</span>
                  </div>
                  {(videoResult.opinions || []).map((o: any, i: number) => (
                    <div key={i} className="bg-secondary rounded-lg p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{o.claim}</span>
                        <Badge className={`text-[10px] py-0 ${o.tendency === "home" ? "bg-green-500/10 text-green-400" : o.tendency === "away" ? "bg-red-500/10 text-red-400" : "bg-muted/20"}`}>{o.tendency}</Badge>
                      </div>
                      <div className="text-muted-foreground">依据：{o.evidence}</div>
                      {o.needsVerification && <div className="text-yellow-400 text-[10px]">⚠ 需核实：{o.verificationNote}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Agent — 赛后复盘（仅已完成比赛） */}
      {displayStatus === "finished" && runHistory.length > 0 && (
        <Card className="border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-yellow-400">🔍</span> Review Agent 赛后复盘
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!reviewResult ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">使用最近一次AI预测与真实比分对比，分析预测偏差。</p>
                <button
                  disabled={isReviewing}
                  onClick={async () => {
                    const last = runHistory[0];
                    if (!last) return;
                    setIsReviewing(true);
                    setReviewError("");
                    try {
                      const res = await fetch("/api/review", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          predictedHomeWin: last.result.home_win,
                          predictedDraw: last.result.draw,
                          predictedAwayWin: last.result.away_win,
                          predictedHomeScore: last.result.predicted_home_score,
                          predictedAwayScore: last.result.predicted_away_score,
                          confidence: last.result.confidence,
                          confidenceLabel: last.result.confidence_label,
                          recommendationLabel: last.result.recommendation_label,
                          actualHomeScore: displayHomeScore,
                          actualAwayScore: displayAwayScore,
                          actualResult: displayHomeScore > displayAwayScore ? "home_win" : displayHomeScore < displayAwayScore ? "away_win" : "draw",
                        }),
                      });
                      const data = await res.json();
                      setReviewResult(data);
                    } catch (e: any) {
                      setReviewError(e.message || "复盘失败");
                    } finally {
                      setIsReviewing(false);
                    }
                  }}
                  className="w-full bg-yellow-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-500 disabled:opacity-50"
                >
                  {isReviewing ? "Review Agent 分析中..." : "🔍 启动赛后复盘"}
                </button>
                {reviewError && <p className="text-xs text-red-400">{reviewError}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {/* 准确度 */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-secondary rounded-lg p-3 text-center">
                    <div className="text-[10px] text-muted-foreground mb-1">胜负预测</div>
                    <div className={`text-lg font-bold ${reviewResult.predictionAccuracy?.resultCorrect ? "text-green-400" : "text-red-400"}`}>
                      {reviewResult.predictionAccuracy?.resultCorrect ? "✅ 正确" : "❌ 错误"}
                    </div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3 text-center">
                    <div className="text-[10px] text-muted-foreground mb-1">比分差</div>
                    <div className="text-lg font-bold">{reviewResult.predictionAccuracy?.scoreDiff} 球</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3 text-center">
                    <div className="text-[10px] text-muted-foreground mb-1">综合评分</div>
                    <div className="text-lg font-bold text-primary">{reviewResult.predictionAccuracy?.overallScore}分</div>
                  </div>
                </div>

                {/* 偏差分析 */}
                {reviewResult.biasAnalysis?.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">偏差分析</div>
                    <div className="space-y-1.5">
                      {reviewResult.biasAnalysis.map((b: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 bg-secondary rounded-lg p-2.5 text-xs">
                          <span className="text-yellow-400 shrink-0">•</span>
                          <span className="text-muted-foreground">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 优化建议 */}
                {reviewResult.optimizationSuggestions?.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">优化建议</div>
                    <div className="space-y-1.5">
                      {reviewResult.optimizationSuggestions.map((s: any, i: number) => (
                        <div key={i} className="bg-secondary rounded-lg p-2.5 text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-[10px] py-0 ${s.priority === "high" ? "bg-red-500/20 text-red-400" : s.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-muted/20"}`}>
                              {s.priority === "high" ? "高优" : s.priority === "medium" ? "中优" : "低优"}
                            </Badge>
                            <span className="font-medium">{s.area}</span>
                          </div>
                          <p className="text-muted-foreground">{s.issue} → {s.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setReviewResult(null)} className="text-xs text-primary hover:underline">重新复盘</button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
