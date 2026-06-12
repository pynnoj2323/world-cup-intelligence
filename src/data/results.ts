// 静态比赛数据 + 补充分数（实际会随比赛进行更新）
// 格式：match_id → { home_score, away_score, status }
// 管理员可通过 /admin/scores 页面更新

export const MATCH_RESULTS: Record<string, { home: number; away: number; status: string }> = {
  // === 已确定比分（赛后会更新）===
  // m001: { home: 1, away: 0, status: "finished" },  // 示例
};

export function getMatchResult(matchId: string) {
  return MATCH_RESULTS[matchId] || null;
}

export function getAllResults() {
  return MATCH_RESULTS;
}
