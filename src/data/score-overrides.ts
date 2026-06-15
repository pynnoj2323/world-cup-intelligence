// 已知比分 — match_id 使用 m001, m002 等格式
export const KNOWN_SCORES: Record<string, { homeScore: number; awayScore: number; status: string }> = {
  // 6月11日 A组
  m001: { homeScore: 2, awayScore: 0, status: "finished" },   // 墨西哥 2-0 南非
  m002: { homeScore: 2, awayScore: 1, status: "finished" },   // 韩国 2-1 捷克
  // 6月12-13日 B组
  m007: { homeScore: 1, awayScore: 1, status: "finished" },   // 加拿大 1-1 波黑
  m008: { homeScore: 1, awayScore: 1, status: "finished" },   // 卡塔尔 1-1 瑞士（央视/新浪）
  // 6月13日 C组
  m013: { homeScore: 1, awayScore: 1, status: "finished" },   // 巴西 1-1 摩洛哥（新浪/光明网）
  m014: { homeScore: 0, awayScore: 1, status: "finished" },   // 海地 0-1 苏格兰（央视/中新网）
  // 6月12-13日 D组
  m019: { homeScore: 4, awayScore: 1, status: "finished" },   // 美国 4-1 巴拉圭
  m020: { homeScore: 2, awayScore: 0, status: "finished" },   // 澳大利亚 2-0 土耳其（新华社/新浪）
  // 6月14日 E组
  m025: { homeScore: 7, awayScore: 1, status: "finished" },   // 德国 7-1 库拉索（央视/新浪）
  m026: { homeScore: 1, awayScore: 0, status: "finished" },   // 科特迪瓦 1-0 厄瓜多尔（央视/央广网）
  // 6月14日 F组
  m031: { homeScore: 2, awayScore: 2, status: "finished" },   // 荷兰 2-2 日本（央视/新浪）
  m032: { homeScore: 1, awayScore: 5, status: "finished" },   // 突尼斯 1-5 瑞典（央视）
};

export function getKnownScore(matchId: string) {
  return KNOWN_SCORES[matchId] || null;
}
