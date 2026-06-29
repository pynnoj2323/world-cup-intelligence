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
  // 6月23日 I组 第2轮
  m051: { homeScore: 3, awayScore: 0, status: "finished" },   // 法国 3-0 伊拉克（央视/姆巴佩双响后全胜领跑）
  m052: { homeScore: 3, awayScore: 2, status: "finished" },   // 挪威 3-2 塞内加尔（腾讯/哈兰德双响，挪威法国携手出线）

  // 6月16日 J组 第1轮
  m055: { homeScore: 3, awayScore: 0, status: "finished" },   // 阿根廷 3-0 阿尔及利亚
  m056: { homeScore: 3, awayScore: 1, status: "finished" },   // 奥地利 3-1 约旦
  // 6月23日 J组 第2轮
  m057: { homeScore: 2, awayScore: 0, status: "finished" },   // 阿根廷 2-0 奥地利（新浪/阿根廷6分锁定小组第一）
  m058: { homeScore: 2, awayScore: 1, status: "finished" },   // 阿尔及利亚 2-1 约旦（新浪/约旦两连败首支出局亚足联球队）

  // 6月17日 K组 第1轮
  m061: { homeScore: 1, awayScore: 1, status: "finished" },   // 葡萄牙 1-1 刚果(金)
  m062: { homeScore: 1, awayScore: 3, status: "finished" },   // 乌兹别克斯坦 1-3 哥伦比亚
  // 6月24日 K组 第2轮
  m063: { homeScore: 5, awayScore: 0, status: "finished" },   // 葡萄牙 5-0 乌兹别克斯坦（新浪/央视/C罗双响六届破门）
  m064: { homeScore: 1, awayScore: 0, status: "finished" },   // 哥伦比亚 1-0 刚果(金)（央视/穆尼奥斯76分钟制胜）

  // 6月17日 L组 第1轮
  m067: { homeScore: 4, awayScore: 2, status: "finished" },   // 英格兰 4-2 克罗地亚
  m068: { homeScore: 1, awayScore: 0, status: "finished" },   // 加纳 1-0 巴拿马
  // 6月24日 L组 第2轮
  m069: { homeScore: 0, awayScore: 0, status: "finished" },   // 英格兰 0-0 加纳（央视/闷平握手言和）
  m070: { homeScore: 1, awayScore: 0, status: "finished" },   // 克罗地亚 1-0 巴拿马（每经/布迪米尔破门，巴拿马出局）

  // 6月24日 A组 第3轮
  m005: { homeScore: 3, awayScore: 0, status: "finished" },   // 墨西哥 3-0 捷克（央视/三战全胜头名出线）
  m006: { homeScore: 0, awayScore: 1, status: "finished" },   // 韩国 0-1 南非（央视/马塞科63分钟制胜，南非小组第二出线）

  // 6月24日 B组 第3轮
  m011: { homeScore: 1, awayScore: 2, status: "finished" },   // 加拿大 1-2 瑞士（央视/瑞士B组头名，加拿大第二出线）
  m012: { homeScore: 1, awayScore: 3, status: "finished" },   // 卡塔尔 1-3 波黑（央视/波黑4分小组第三，卡塔尔垫底出局）

  // 6月24日 C组 第3轮
  m017: { homeScore: 0, awayScore: 3, status: "finished" },   // 苏格兰 0-3 巴西（央视/维尼修斯双响，巴西头名晋级）
  m018: { homeScore: 4, awayScore: 2, status: "finished" },   // 摩洛哥 4-2 海地（央视/摩洛哥小组第2，海地三战全负出局）

  // 6月26日 D组 第3轮
  m023: { homeScore: 3, awayScore: 2, status: "finished" },   // 土耳其 3-2 美国（央视/每经/绝杀，美国仍头名出线）
  m024: { homeScore: 0, awayScore: 0, status: "finished" },   // 巴拉圭 0-0 澳大利亚（央视/澳大利亚凭净胜球锁定小组第二）

  // 6月26日 E组 第3轮
  m029: { homeScore: 0, awayScore: 2, status: "finished" },   // 库拉索 0-2 科特迪瓦（新浪/搜狐/科特迪瓦两连胜，库拉索垫底出局）
  m030: { homeScore: 2, awayScore: 1, status: "finished" },   // 厄瓜多尔 2-1 德国（新浪/央视/安古洛建功，德国仍小组头名出线）

  // 6月26日 F组 第3轮
  m035: { homeScore: 1, awayScore: 3, status: "finished" },   // 突尼斯 1-3 荷兰（央视/每经/荷兰头名出线，突尼斯两连败出局）
  m036: { homeScore: 1, awayScore: 1, status: "finished" },   // 日本 1-1 瑞典（央视/每经/前田大然破门，日本小组第二出线）

  // 6月27日 G组 第3轮
  m041: { homeScore: 5, awayScore: 1, status: "finished" },   // 比利时 5-1 新西兰（羊城晚报/新华社/比利时头名，新西兰垫底出局）
  m042: { homeScore: 1, awayScore: 1, status: "finished" },   // 埃及 1-1 伊朗（羊城晚报/埃及小组第二，伊朗3分待定）

  // 6月27日 H组 第3轮
  m047: { homeScore: 0, awayScore: 1, status: "finished" },   // 乌拉圭 0-1 西班牙（百度百科/央视/西班牙头名出线）
  m048: { homeScore: 0, awayScore: 0, status: "finished" },   // 佛得角 0-0 沙特（百度百科/央视/佛得角3平小组第二创历史）

  // 6月27日 I组 第3轮
  m053: { homeScore: 1, awayScore: 4, status: "finished" },   // 挪威 1-4 法国（央视/搜狐/法国全胜头名，挪威第二）
  m054: { homeScore: 5, awayScore: 0, status: "finished" },   // 塞内加尔 5-0 伊拉克（央视/搜狐/塞内加尔3分小组第三晋级）

  // 6月28日 J组 第3轮
  m059: { homeScore: 3, awayScore: 1, status: "finished" },   // 阿根廷 3-1 约旦（腾讯/央视/阿根廷三战全胜头名出线）
  m060: { homeScore: 3, awayScore: 3, status: "finished" },   // 奥地利 3-3 阿尔及利亚（腾讯/央视/补时读秒绝平，奥地利小组第二）

  // 6月28日 K组 第3轮
  m065: { homeScore: 0, awayScore: 0, status: "finished" },   // 葡萄牙 0-0 哥伦比亚（央视/百度百科/哥伦比亚头名出线）
  m066: { homeScore: 3, awayScore: 1, status: "finished" },   // 刚果(金) 3-1 乌兹别克斯坦（百度百科/民主刚果逆转取首胜）

  // 6月28日 L组 第3轮
  m071: { homeScore: 2, awayScore: 0, status: "finished" },   // 英格兰 2-0 巴拿马（央视/英格兰锁定小组第一）
  m072: { homeScore: 2, awayScore: 1, status: "finished" },   // 克罗地亚 2-1 加纳（央视/克罗地亚小组第二出线）

  // ===== 淘汰赛 1/16决赛 =====
  // 6月29日 1/16决赛 第1场（洛杉矶SoFi体育场）
  m073: { homeScore: 0, awayScore: 1, status: "finished" },   // 南非 0-1 加拿大（央视/新华社/补时绝杀，加拿大队史首进16强）
};

export function getKnownScore(matchId: string) {
  return KNOWN_SCORES[matchId] || null;
}
