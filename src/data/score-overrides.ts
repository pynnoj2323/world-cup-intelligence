// 已知比分 — match_id 使用 m001, m002 等格式
export const KNOWN_SCORES: Record<string, { homeScore: number; awayScore: number; status: string }> = {
  // 6月11日 A组 第1轮
  m001: { homeScore: 2, awayScore: 0, status: "finished" },   // 墨西哥 2-0 南非
  m002: { homeScore: 2, awayScore: 1, status: "finished" },   // 韩国 2-1 捷克
  // 6月18日 A组 第2轮
  m003: { homeScore: 1, awayScore: 0, status: "finished" },   // 墨西哥 1-0 韩国
  m004: { homeScore: 1, awayScore: 1, status: "finished" },   // 捷克 1-1 南非

  // 6月12日 B组 第1轮
  m007: { homeScore: 1, awayScore: 1, status: "finished" },   // 加拿大 1-1 波黑
  m008: { homeScore: 1, awayScore: 1, status: "finished" },   // 卡塔尔 1-1 瑞士
  // 6月18日 B组 第2轮
  m009: { homeScore: 6, awayScore: 0, status: "finished" },   // 加拿大 6-0 卡塔尔
  m010: { homeScore: 4, awayScore: 1, status: "finished" },   // 瑞士 4-1 波黑

  // 6月13日 C组 第1轮
  m013: { homeScore: 1, awayScore: 1, status: "finished" },   // 巴西 1-1 摩洛哥
  m014: { homeScore: 0, awayScore: 1, status: "finished" },   // 海地 0-1 苏格兰
  // 6月19日 C组 第2轮
  m015: { homeScore: 3, awayScore: 0, status: "finished" },   // 巴西 3-0 海地
  m016: { homeScore: 0, awayScore: 1, status: "finished" },   // 苏格兰 0-1 摩洛哥

  // 6月12日 D组 第1轮
  m019: { homeScore: 4, awayScore: 1, status: "finished" },   // 美国 4-1 巴拉圭
  m020: { homeScore: 2, awayScore: 0, status: "finished" },   // 澳大利亚 2-0 土耳其
  // 6月19日 D组 第2轮
  m021: { homeScore: 2, awayScore: 0, status: "finished" },   // 美国 2-0 澳大利亚
  m022: { homeScore: 0, awayScore: 1, status: "finished" },   // 土耳其 0-1 巴拉圭

  // 6月14日 E组 第1轮
  m025: { homeScore: 7, awayScore: 1, status: "finished" },   // 德国 7-1 库拉索
  m026: { homeScore: 1, awayScore: 0, status: "finished" },   // 科特迪瓦 1-0 厄瓜多尔
  // 6月20日 E组 第2轮
  m027: { homeScore: 0, awayScore: 0, status: "finished" },   // 厄瓜多尔 0-0 库拉索
  m028: { homeScore: 2, awayScore: 1, status: "finished" },   // 德国 2-1 科特迪瓦

  // 6月14日 F组 第1轮
  m031: { homeScore: 2, awayScore: 2, status: "finished" },   // 荷兰 2-2 日本
  m032: { homeScore: 1, awayScore: 5, status: "finished" },   // 突尼斯 1-5 瑞典
  // 6月20日 F组 第2轮
  m033: { homeScore: 5, awayScore: 1, status: "finished" },   // 荷兰 5-1 瑞典
  m034: { homeScore: 0, awayScore: 4, status: "finished" },   // 突尼斯 0-4 日本

  // 6月15日 G组 第1轮
  m037: { homeScore: 1, awayScore: 1, status: "finished" },   // 比利时 1-1 埃及
  m038: { homeScore: 2, awayScore: 2, status: "finished" },   // 伊朗 2-2 新西兰
  // 6月21日 G组 第2轮
  m039: { homeScore: 0, awayScore: 0, status: "finished" },   // 比利时 0-0 伊朗（新浪）
  m040: { homeScore: 1, awayScore: 3, status: "finished" },   // 新西兰 1-3 埃及（新浪/萨拉赫传射建功）

  // 6月15日 H组 第1轮
  m043: { homeScore: 0, awayScore: 0, status: "finished" },   // 西班牙 0-0 佛得角
  m044: { homeScore: 1, awayScore: 1, status: "finished" },   // 沙特 1-1 乌拉圭
  // 6月21日 H组 第2轮
  m045: { homeScore: 4, awayScore: 0, status: "finished" },   // 西班牙 4-0 沙特（新浪/亚马尔首球+奥亚萨瓦尔双响）
  m046: { homeScore: 2, awayScore: 2, status: "finished" },   // 乌拉圭 2-2 佛得角（新浪/佛得角皮纳世界波）

  // 6月16日 I组 第1轮
  m049: { homeScore: 3, awayScore: 1, status: "finished" },   // 法国 3-1 塞内加尔
  m050: { homeScore: 1, awayScore: 4, status: "finished" },   // 伊拉克 1-4 挪威

  // 6月16日 J组 第1轮
  m055: { homeScore: 3, awayScore: 0, status: "finished" },   // 阿根廷 3-0 阿尔及利亚
  m056: { homeScore: 3, awayScore: 1, status: "finished" },   // 奥地利 3-1 约旦

  // 6月17日 K组 第1轮
  m061: { homeScore: 1, awayScore: 1, status: "finished" },   // 葡萄牙 1-1 刚果(金)
  m062: { homeScore: 1, awayScore: 3, status: "finished" },   // 乌兹别克斯坦 1-3 哥伦比亚

  // 6月17日 L组 第1轮
  m067: { homeScore: 4, awayScore: 2, status: "finished" },   // 英格兰 4-2 克罗地亚
  m068: { homeScore: 1, awayScore: 0, status: "finished" },   // 加纳 1-0 巴拿马
};

export function getKnownScore(matchId: string) {
  return KNOWN_SCORES[matchId] || null;
}
