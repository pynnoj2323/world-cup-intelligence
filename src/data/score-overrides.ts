// 已知比分 — match_id 使用 m001, m002 等格式
export const KNOWN_SCORES: Record<string, { homeScore: number; awayScore: number; status: string }> = {
  // 6月11日 A组
  m001: { homeScore: 2, awayScore: 0, status: "finished" },   // 墨西哥 2-0 南非
  m002: { homeScore: 2, awayScore: 1, status: "finished" },   // 韩国 2-1 捷克
  // 6月13日 B组/D组
  m007: { homeScore: 1, awayScore: 1, status: "finished" },   // 加拿大 1-1 波黑（央视体育/新浪）
  m019: { homeScore: 4, awayScore: 1, status: "finished" },   // 美国 4-1 巴拉圭（新浪/澎湃）
};

export function getKnownScore(matchId: string) {
  return KNOWN_SCORES[matchId] || null;
}
