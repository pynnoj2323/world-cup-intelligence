/**
 * 球队数据 — 2026 世界杯官方抽签结果
 * 来源：FIFA 官方抽签（2025年12月，华盛顿DC）
 * 
 * 注意：A、B、D、F、I、K 组各有一个附加赛胜者席位尚未确定，
 * 暂用最可能的晋级球队作为占位（标注"待定"）
 */

export interface Team {
  team_id: string;
  name: string;
  short_name: string;
  flag_url: string;
  group: string;
  coach: string;
  fifa_ranking: number;
  primary_color: string;
  is_placeholder?: boolean;
}

export const teams: Team[] = [
  // === Group A ===
  { team_id: "mex", name: "墨西哥", short_name: "MEX", flag_url: "🇲🇽", group: "A", coach: "海梅·洛萨诺", fifa_ranking: 14, primary_color: "#006341" },
  { team_id: "rsa", name: "南非", short_name: "RSA", flag_url: "🇿🇦", group: "A", coach: "雨果·布鲁斯", fifa_ranking: 57, primary_color: "#007A4D" },
  { team_id: "kor", name: "韩国", short_name: "KOR", flag_url: "🇰🇷", group: "A", coach: "洪明甫", fifa_ranking: 22, primary_color: "#CD2E3A" },
  { team_id: "cze", name: "捷克", short_name: "CZE", flag_url: "🇨🇿", group: "A", coach: "伊万·哈谢克", fifa_ranking: 36, primary_color: "#D7141A" },
  // === Group B ===
  { team_id: "can", name: "加拿大", short_name: "CAN", flag_url: "🇨🇦", group: "B", coach: "杰西·马什", fifa_ranking: 35, primary_color: "#FF0000" },
  { team_id: "bih", name: "波黑", short_name: "BIH", flag_url: "🇧🇦", group: "B", coach: "谢尔盖·巴尔巴雷斯", fifa_ranking: 62, primary_color: "#002395" },
  { team_id: "qat", name: "卡塔尔", short_name: "QAT", flag_url: "🇶🇦", group: "B", coach: "巴托洛梅·马尔克斯", fifa_ranking: 47, primary_color: "#8D1B3D" },
  { team_id: "sui", name: "瑞士", short_name: "SUI", flag_url: "🇨🇭", group: "B", coach: "穆拉特·雅金", fifa_ranking: 15, primary_color: "#FF0000" },
  // === Group C ===
  { team_id: "bra", name: "巴西", short_name: "BRA", flag_url: "🇧🇷", group: "C", coach: "多里瓦尔·儒尼奥尔", fifa_ranking: 5, primary_color: "#FEDF00" },
  { team_id: "mar", name: "摩洛哥", short_name: "MAR", flag_url: "🇲🇦", group: "C", coach: "瓦利德·雷格拉吉", fifa_ranking: 13, primary_color: "#C1272D" },
  { team_id: "hai", name: "海地", short_name: "HAI", flag_url: "🇭🇹", group: "C", coach: "塞巴斯蒂安·米涅", fifa_ranking: 86, primary_color: "#00209F" },
  { team_id: "sco", name: "苏格兰", short_name: "SCO", flag_url: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", coach: "史蒂夫·克拉克", fifa_ranking: 39, primary_color: "#003399" },
  // === Group D ===
  { team_id: "usa", name: "美国", short_name: "USA", flag_url: "🇺🇸", group: "D", coach: "格雷格·贝尔哈特", fifa_ranking: 16, primary_color: "#B31942" },
  { team_id: "par", name: "巴拉圭", short_name: "PAR", flag_url: "🇵🇾", group: "D", coach: "吉列尔莫·巴罗斯", fifa_ranking: 53, primary_color: "#D52B1E" },
  { team_id: "aus", name: "澳大利亚", short_name: "AUS", flag_url: "🇦🇺", group: "D", coach: "格拉汉姆·阿诺德", fifa_ranking: 24, primary_color: "#FFCC00" },
  { team_id: "tur", name: "土耳其", short_name: "TUR", flag_url: "🇹🇷", group: "D", coach: "文森佐·蒙特拉", fifa_ranking: 28, primary_color: "#E30A17" },
  // === Group E ===
  { team_id: "ger", name: "德国", short_name: "GER", flag_url: "🇩🇪", group: "E", coach: "尤利安·纳格尔斯曼", fifa_ranking: 12, primary_color: "#000000" },
  { team_id: "cuw", name: "库拉索", short_name: "CUW", flag_url: "🇨🇼", group: "E", coach: "迪克·阿德沃卡特", fifa_ranking: 91, primary_color: "#002B7F" },
  { team_id: "civ", name: "科特迪瓦", short_name: "CIV", flag_url: "🇨🇮", group: "E", coach: "埃默斯·法埃", fifa_ranking: 38, primary_color: "#FF8200" },
  { team_id: "ecu", name: "厄瓜多尔", short_name: "ECU", flag_url: "🇪🇨", group: "E", coach: "费利克斯·桑切斯", fifa_ranking: 30, primary_color: "#FFDD00" },
  // === Group F ===
  { team_id: "ned", name: "荷兰", short_name: "NED", flag_url: "🇳🇱", group: "F", coach: "罗纳德·科曼", fifa_ranking: 7, primary_color: "#FF6600" },
  { team_id: "jpn", name: "日本", short_name: "JPN", flag_url: "🇯🇵", group: "F", coach: "森保一", fifa_ranking: 17, primary_color: "#BC002D" },
  { team_id: "swe", name: "瑞典", short_name: "SWE", flag_url: "🇸🇪", group: "F", coach: "容·达尔·托马森", fifa_ranking: 27, primary_color: "#006AA7" },
  { team_id: "tun", name: "突尼斯", short_name: "TUN", flag_url: "🇹🇳", group: "F", coach: "贾勒尔·卡德里", fifa_ranking: 41, primary_color: "#E70013" },
  // === Group G ===
  { team_id: "bel", name: "比利时", short_name: "BEL", flag_url: "🇧🇪", group: "G", coach: "多梅尼科·特德斯科", fifa_ranking: 4, primary_color: "#FF0000" },
  { team_id: "egy", name: "埃及", short_name: "EGY", flag_url: "🇪🇬", group: "G", coach: "霍萨姆·哈桑", fifa_ranking: 33, primary_color: "#CE1126" },
  { team_id: "irn", name: "伊朗", short_name: "IRN", flag_url: "🇮🇷", group: "G", coach: "阿米尔·加莱诺埃", fifa_ranking: 19, primary_color: "#239F40" },
  { team_id: "nzl", name: "新西兰", short_name: "NZL", flag_url: "🇳🇿", group: "G", coach: "达伦·巴兹利", fifa_ranking: 103, primary_color: "#000000" },
  // === Group H ===
  { team_id: "esp", name: "西班牙", short_name: "ESP", flag_url: "🇪🇸", group: "H", coach: "路易斯·德拉富恩特", fifa_ranking: 8, primary_color: "#C60B1E" },
  { team_id: "cpv", name: "佛得角", short_name: "CPV", flag_url: "🇨🇻", group: "H", coach: "布比斯塔", fifa_ranking: 65, primary_color: "#003893" },
  { team_id: "ksa", name: "沙特阿拉伯", short_name: "KSA", flag_url: "🇸🇦", group: "H", coach: "罗伯托·曼奇尼", fifa_ranking: 56, primary_color: "#165C30" },
  { team_id: "uru", name: "乌拉圭", short_name: "URU", flag_url: "🇺🇾", group: "H", coach: "马塞洛·贝尔萨", fifa_ranking: 11, primary_color: "#0038A8" },
  // === Group I ===
  { team_id: "fra", name: "法国", short_name: "FRA", flag_url: "🇫🇷", group: "I", coach: "迪迪埃·德尚", fifa_ranking: 2, primary_color: "#1B4EA0" },
  { team_id: "sen", name: "塞内加尔", short_name: "SEN", flag_url: "🇸🇳", group: "I", coach: "帕普·蒂奥", fifa_ranking: 18, primary_color: "#00853F" },
  { team_id: "irq", name: "伊拉克", short_name: "IRQ", flag_url: "🇮🇶", group: "I", coach: "赫苏斯·卡萨斯", fifa_ranking: 55, primary_color: "#CE1126" },
  { team_id: "nor", name: "挪威", short_name: "NOR", flag_url: "🇳🇴", group: "I", coach: "斯托尔·索尔巴肯", fifa_ranking: 43, primary_color: "#EF2B2D" },
  // === Group J ===
  { team_id: "arg", name: "阿根廷", short_name: "ARG", flag_url: "🇦🇷", group: "J", coach: "莱昂内尔·斯卡洛尼", fifa_ranking: 1, primary_color: "#75AADB" },
  { team_id: "alg", name: "阿尔及利亚", short_name: "ALG", flag_url: "🇩🇿", group: "J", coach: "弗拉基米尔·佩特科维奇", fifa_ranking: 40, primary_color: "#006633" },
  { team_id: "aut", name: "奥地利", short_name: "AUT", flag_url: "🇦🇹", group: "J", coach: "拉尔夫·朗尼克", fifa_ranking: 23, primary_color: "#ED2939" },
  { team_id: "jor", name: "约旦", short_name: "JOR", flag_url: "🇯🇴", group: "J", coach: "侯赛因·阿穆塔", fifa_ranking: 68, primary_color: "#CE1126" },
  // === Group K ===
  { team_id: "por", name: "葡萄牙", short_name: "POR", flag_url: "🇵🇹", group: "K", coach: "罗伯托·马丁内斯", fifa_ranking: 6, primary_color: "#900020" },
  { team_id: "cod", name: "刚果民主共和国", short_name: "COD", flag_url: "🇨🇩", group: "K", coach: "塞巴斯蒂安·德萨布雷", fifa_ranking: 61, primary_color: "#007FFF" },
  { team_id: "uzb", name: "乌兹别克斯坦", short_name: "UZB", flag_url: "🇺🇿", group: "K", coach: "斯雷奇科·卡塔内茨", fifa_ranking: 58, primary_color: "#0099B5" },
  { team_id: "col", name: "哥伦比亚", short_name: "COL", flag_url: "🇨🇴", group: "K", coach: "内斯托尔·洛伦佐", fifa_ranking: 9, primary_color: "#FCD116" },
  // === Group L ===
  { team_id: "eng", name: "英格兰", short_name: "ENG", flag_url: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", coach: "加雷斯·索斯盖特", fifa_ranking: 3, primary_color: "#CF081F" },
  { team_id: "cro", name: "克罗地亚", short_name: "CRO", flag_url: "🇭🇷", group: "L", coach: "兹拉特科·达利奇", fifa_ranking: 10, primary_color: "#FF0000" },
  { team_id: "gha", name: "加纳", short_name: "GHA", flag_url: "🇬🇭", group: "L", coach: "奥托·阿多", fifa_ranking: 60, primary_color: "#CE1126" },
  { team_id: "pan", name: "巴拿马", short_name: "PAN", flag_url: "🇵🇦", group: "L", coach: "托马斯·克里斯蒂安森", fifa_ranking: 43, primary_color: "#DA121A" },
];

export function getTeamById(id: string): Team | undefined {
  if (id === "tbd") return { team_id: "tbd", name: "待定", short_name: "TBD", flag_url: "❓", group: "-", coach: "-", fifa_ranking: 0, primary_color: "#555555" };
  return teams.find(t => t.team_id === id);
}

export const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
export const groupLabels: Record<string, string> = Object.fromEntries(
  groups.map(g => [g, `${g} 组`])
);

export function getTeamsByGroup(group: string): Team[] {
  return teams.filter(t => t.group === group);
}
