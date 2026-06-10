/**
 * 积分榜数据
 * 所有球队均 0 场 0 分——世界杯尚未开始
 */

export interface Standing {
  standing_id: string;
  team_id: string;
  group: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  rank: number;
  qualification_status: "qualified" | "likely" | "uncertain" | "at_risk" | "eliminated";
  qualification_probability: number;
}

export const qualificationLabels: Record<string, string> = {
  qualified: "已出线",
  likely: "大概率出线",
  uncertain: "形势不明",
  at_risk: "有出局风险",
  eliminated: "已出局",
};

export const qualificationColors: Record<string, string> = {
  qualified: "bg-green-500",
  likely: "bg-green-400",
  uncertain: "bg-yellow-500",
  at_risk: "bg-orange-500",
  eliminated: "bg-red-600",
};

import { teams, groups, getTeamsByGroup } from "./teams";

export const standings: Standing[] = groups.flatMap(g => {
  const groupTeams = getTeamsByGroup(g);
  return groupTeams.map((t, i) => ({
    standing_id: `s_${g}_${t.team_id}`,
    team_id: t.team_id, group: g,
    played: 0, wins: 0, draws: 0, losses: 0,
    goals_for: 0, goals_against: 0, goal_difference: 0, points: 0,
    rank: i + 1,
    qualification_status: "uncertain" as const,
    qualification_probability: 0.25, // 每组4队，基础概率25%
  }));
});

export function getStandingsByGroup(group: string): Standing[] {
  return standings.filter(s => s.group === group).sort((a, b) => a.rank - b.rank);
}
