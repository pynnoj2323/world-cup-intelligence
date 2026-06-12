// 已知比分 — 每天更新
// 格式：match_id → { homeScore, awayScore, status }
export const KNOWN_SCORES: Record<string, { homeScore: number; awayScore: number; status: string }> = {
  // 6月11日 A组
  mexrsa: { homeScore: 2, awayScore: 0, status: "finished" },   // 墨西哥 2-0 南非
  korcze: { homeScore: 2, awayScore: 1, status: "finished" },   // 韩国 2-1 捷克
  // 6月12日 B组  
  // canbih: { homeScore: 1, awayScore: 0, status: "finished" }, // 加拿大 vs 波黑
};

export function getKnownScore(matchId: string) {
  return KNOWN_SCORES[matchId] || null;
}
