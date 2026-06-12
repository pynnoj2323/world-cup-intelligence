// 已知比分 — match_id 使用 m001, m002 等格式
export const KNOWN_SCORES: Record<string, { homeScore: number; awayScore: number; status: string }> = {
  // 6月11日 A组
  m001: { homeScore: 2, awayScore: 0, status: "finished" },   // 墨西哥 2-0 南非
  m002: { homeScore: 2, awayScore: 1, status: "finished" },   // 韩国 2-1 捷克
  // 6月12日 — B组/D组比赛尚未开赛（m007 加拿大vs波黑 6月13日03:00 BJT；m019 美国vs巴拉圭 6月13日09:00 BJT）
};

export function getKnownScore(matchId: string) {
  return KNOWN_SCORES[matchId] || null;
}
