"use client";

import { useState, useEffect } from "react";
import { matches } from "@/data/matches";
import { getTeamById } from "@/data/teams";

const STATUS_OPTIONS = [
  { value: "scheduled", label: "未开始" },
  { value: "live", label: "进行中" },
  { value: "halftime", label: "中场" },
  { value: "finished", label: "已结束" },
];

export default function AdminScoresPage() {
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/matches/status")
      .then(r => r.json())
      .then((data: any[]) => {
        const map: Record<string, any> = {};
        data.forEach((d: any) => { map[d.matchId] = d; });
        setUpdates(map);
      })
      .catch(() => {});
  }, []);

  const updateMatch = async (matchId: string) => {
    const u = updates[matchId] || { status: "scheduled", homeScore: 0, awayScore: 0 };
    setSaving(matchId);
    try {
      const res = await fetch("/api/matches/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, status: u.status, homeScore: u.homeScore, awayScore: u.awayScore }),
      });
      if (res.ok) {
        setMsg(`✅ ${matchId} 已更新`);
        setTimeout(() => setMsg(""), 2000);
      }
    } catch { setMsg("❌ 更新失败"); }
    setSaving(null);
  };

  const setVal = (matchId: string, field: string, value: string | number) => {
    setUpdates(prev => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || { status: "scheduled", homeScore: 0, awayScore: 0 }), [field]: field === "status" ? value : Number(value) },
    }));
  };

  const sorted = [...matches].sort((a, b) => {
    const sa = updates[a.match_id]?.status || a.status;
    const sb = updates[b.match_id]?.status || b.status;
    if (sa === "live" || sa === "halftime") return -1;
    if (sb === "live" || sb === "halftime") return 1;
    return new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime();
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">⚽ 比分管理</h1>
      {msg && <div className="bg-green-500/10 text-green-400 text-sm p-2 rounded">{msg}</div>}

      <div className="space-y-2">
        {sorted.map(m => {
          const home = getTeamById(m.home_team_id);
          const away = getTeamById(m.away_team_id);
          const u = updates[m.match_id] || { status: "scheduled", homeScore: 0, awayScore: 0 };
          return (
            <div key={m.match_id} className="bg-card rounded-lg p-3 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>{home?.name}</span><span className="text-muted-foreground">vs</span><span>{away?.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {m.group ? `${m.group}组` : m.stage} · {new Date(m.kickoff_time).toLocaleDateString("zh-CN")}
                </div>
              </div>
              <select value={u.status} onChange={e => setVal(m.match_id, "status", e.target.value)} className="bg-secondary border rounded px-2 py-1 text-xs">
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input type="number" min={0} max={15} value={u.homeScore} onChange={e => setVal(m.match_id, "homeScore", e.target.value)} className="w-12 bg-secondary border rounded px-2 py-1 text-xs text-center" />
              <span className="text-xs text-muted-foreground">-</span>
              <input type="number" min={0} max={15} value={u.awayScore} onChange={e => setVal(m.match_id, "awayScore", e.target.value)} className="w-12 bg-secondary border rounded px-2 py-1 text-xs text-center" />
              <button disabled={saving === m.match_id} onClick={() => updateMatch(m.match_id)} className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded">
                {saving === m.match_id ? "..." : "更新"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
