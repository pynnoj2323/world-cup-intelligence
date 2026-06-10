/**
 * 比赛数据 — 2026 世界杯官方赛程（完整版）
 * 来源：FIFA 官方发布（2025年12月）
 * 小组赛 72 场 + 淘汰赛 32 场 = 104 场
 * 所有比赛均为「未开始」状态
 * 时间转换：ET (UTC-4) → 北京时间 (UTC+8)
 */

export interface Match {
  match_id: string;
  stage: "group" | "round32" | "round16" | "quarter" | "semi" | "third_place" | "final";
  group: string | null;
  home_team_id: string;
  away_team_id: string;
  kickoff_time: string;
  venue: string;
  city: string;
  status: "scheduled" | "live" | "halftime" | "finished" | "postponed" | "cancelled";
  home_score: number | null;
  away_score: number | null;
}

export const stageLabels: Record<string, string> = {
  group: "小组赛", round32: "32 强", round16: "16 强",
  quarter: "8 强", semi: "半决赛", third_place: "三四名决赛", final: "决赛",
};

export const statusLabels: Record<string, string> = {
  scheduled: "未开始", live: "直播中", halftime: "中场",
  finished: "已结束", postponed: "延期", cancelled: "取消",
};

function et2cn(date: string, time: string): string {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return `${date}T12:00:00+08:00`;
  let hour = parseInt(match[1]);
  const min = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  const totalHours = hour + 12;
  const bjHour = totalHours % 24;
  const dayOffset = Math.floor(totalHours / 24);
  let result = date;
  if (dayOffset > 0) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + dayOffset);
    result = d.toISOString().slice(0, 10);
  }
  return `${result}T${String(bjHour).padStart(2, "0")}:${min.padStart(2, "0")}:00+08:00`;
}

// ===================================================================
// 完整 104 场比赛
// ===================================================================

// 小组赛配对定义：[日期, 时间ET, 主队, 客队, 场馆, 城市]
type Fixture = [string, string, string, string, string, string];

const groupFixtures: Record<string, Fixture[]> = {
  A: [
    ["2026-06-11", "3:00 PM", "mex", "rsa", "阿兹特克体育场", "墨西哥城"],
    ["2026-06-11", "10:00 PM", "kor", "cze", "阿克伦体育场", "瓜达拉哈拉"],
    ["2026-06-18", "12:00 PM", "rsa", "cze", "梅赛德斯-奔驰体育场", "亚特兰大"],
    ["2026-06-18", "9:00 PM", "mex", "kor", "阿克伦体育场", "瓜达拉哈拉"],
    ["2026-06-24", "9:00 PM", "mex", "cze", "阿兹特克体育场", "墨西哥城"],
    ["2026-06-24", "9:00 PM", "kor", "rsa", "BBVA 体育场", "蒙特雷"],
  ],
  B: [
    ["2026-06-12", "3:00 PM", "can", "bih", "BMO 体育场", "多伦多"],
    ["2026-06-13", "3:00 PM", "qat", "sui", "李维斯体育场", "旧金山湾区"],
    ["2026-06-18", "3:00 PM", "sui", "bih", "SoFi 体育场", "洛杉矶"],
    ["2026-06-18", "6:00 PM", "can", "qat", "BC 体育场", "温哥华"],
    ["2026-06-24", "3:00 PM", "can", "sui", "BC 体育场", "温哥华"],
    ["2026-06-24", "3:00 PM", "qat", "bih", "流明球场", "西雅图"],
  ],
  C: [
    ["2026-06-13", "6:00 PM", "bra", "mar", "大都会人寿体育场", "纽约"],
    ["2026-06-13", "9:00 PM", "hai", "sco", "吉列体育场", "波士顿"],
    ["2026-06-19", "3:00 PM", "sco", "mar", "吉列体育场", "波士顿"],
    ["2026-06-19", "9:00 PM", "bra", "hai", "林肯金融体育场", "费城"],
    ["2026-06-24", "6:00 PM", "sco", "bra", "硬石体育场", "迈阿密"],
    ["2026-06-24", "6:00 PM", "mar", "hai", "梅赛德斯-奔驰体育场", "亚特兰大"],
  ],
  D: [
    ["2026-06-12", "9:00 PM", "usa", "par", "SoFi 体育场", "洛杉矶"],
    ["2026-06-13", "12:00 AM", "aus", "tur", "BC 体育场", "温哥华"],
    ["2026-06-19", "3:00 PM", "usa", "aus", "流明球场", "西雅图"],
    ["2026-06-19", "12:00 AM", "par", "tur", "李维斯体育场", "旧金山湾区"],
    ["2026-06-25", "10:00 PM", "usa", "tur", "SoFi 体育场", "洛杉矶"],
    ["2026-06-25", "10:00 PM", "par", "aus", "李维斯体育场", "旧金山湾区"],
  ],
  E: [
    ["2026-06-14", "1:00 PM", "ger", "cuw", "NRG 体育场", "休斯顿"],
    ["2026-06-14", "7:00 PM", "civ", "ecu", "林肯金融体育场", "费城"],
    ["2026-06-20", "4:00 PM", "ger", "civ", "BMO 体育场", "多伦多"],
    ["2026-06-20", "8:00 PM", "ecu", "cuw", "箭头体育场", "堪萨斯城"],
    ["2026-06-25", "4:00 PM", "ecu", "ger", "大都会人寿体育场", "纽约"],
    ["2026-06-25", "4:00 PM", "cuw", "civ", "林肯金融体育场", "费城"],
  ],
  F: [
    ["2026-06-14", "4:00 PM", "ned", "jpn", "AT&T 体育场", "达拉斯"],
    ["2026-06-14", "10:00 PM", "tun", "swe", "BBVA 体育场", "蒙特雷"],
    ["2026-06-20", "1:00 PM", "ned", "swe", "NRG 体育场", "休斯顿"],
    ["2026-06-20", "12:00 AM", "tun", "jpn", "BBVA 体育场", "蒙特雷"],
    ["2026-06-25", "7:00 PM", "tun", "ned", "箭头体育场", "堪萨斯城"],
    ["2026-06-25", "7:00 PM", "jpn", "swe", "AT&T 体育场", "达拉斯"],
  ],
  G: [
    ["2026-06-15", "3:00 PM", "bel", "egy", "流明球场", "西雅图"],
    ["2026-06-15", "9:00 PM", "irn", "nzl", "SoFi 体育场", "洛杉矶"],
    ["2026-06-21", "3:00 PM", "bel", "irn", "SoFi 体育场", "洛杉矶"],
    ["2026-06-21", "9:00 PM", "nzl", "egy", "BC 体育场", "温哥华"],
    ["2026-06-26", "11:00 PM", "nzl", "bel", "BC 体育场", "温哥华"],
    ["2026-06-26", "11:00 PM", "egy", "irn", "流明球场", "西雅图"],
  ],
  H: [
    ["2026-06-15", "12:00 PM", "esp", "cpv", "梅赛德斯-奔驰体育场", "亚特兰大"],
    ["2026-06-15", "6:00 PM", "ksa", "uru", "硬石体育场", "迈阿密"],
    ["2026-06-21", "12:00 PM", "esp", "ksa", "梅赛德斯-奔驰体育场", "亚特兰大"],
    ["2026-06-21", "6:00 PM", "uru", "cpv", "硬石体育场", "迈阿密"],
    ["2026-06-26", "8:00 PM", "uru", "esp", "阿克伦体育场", "瓜达拉哈拉"],
    ["2026-06-26", "8:00 PM", "cpv", "ksa", "NRG 体育场", "休斯顿"],
  ],
  I: [
    ["2026-06-16", "3:00 PM", "fra", "sen", "大都会人寿体育场", "纽约"],
    ["2026-06-16", "6:00 PM", "nor", "irq", "吉列体育场", "波士顿"],
    ["2026-06-22", "5:00 PM", "fra", "irq", "林肯金融体育场", "费城"],
    ["2026-06-22", "8:00 PM", "nor", "sen", "大都会人寿体育场", "纽约"],
    ["2026-06-26", "3:00 PM", "nor", "fra", "吉列体育场", "波士顿"],
    ["2026-06-26", "3:00 PM", "sen", "irq", "BMO 体育场", "多伦多"],
  ],
  J: [
    ["2026-06-16", "9:00 PM", "arg", "alg", "箭头体育场", "堪萨斯城"],
    ["2026-06-17", "12:00 AM", "aut", "jor", "李维斯体育场", "旧金山湾区"],
    ["2026-06-22", "1:00 PM", "arg", "aut", "AT&T 体育场", "达拉斯"],
    ["2026-06-22", "11:00 PM", "jor", "alg", "李维斯体育场", "旧金山湾区"],
    ["2026-06-27", "10:00 PM", "jor", "arg", "AT&T 体育场", "达拉斯"],
    ["2026-06-27", "10:00 PM", "alg", "aut", "箭头体育场", "堪萨斯城"],
  ],
  K: [
    ["2026-06-17", "1:00 PM", "por", "cod", "NRG 体育场", "休斯顿"],
    ["2026-06-17", "10:00 PM", "uzb", "col", "阿兹特克体育场", "墨西哥城"],
    ["2026-06-23", "1:00 PM", "por", "uzb", "NRG 体育场", "休斯顿"],
    ["2026-06-23", "10:00 PM", "col", "cod", "阿克伦体育场", "瓜达拉哈拉"],
    ["2026-06-27", "7:30 PM", "col", "por", "硬石体育场", "迈阿密"],
    ["2026-06-27", "7:30 PM", "uzb", "cod", "梅赛德斯-奔驰体育场", "亚特兰大"],
  ],
  L: [
    ["2026-06-17", "4:00 PM", "eng", "cro", "AT&T 体育场", "达拉斯"],
    ["2026-06-17", "7:00 PM", "gha", "pan", "BMO 体育场", "多伦多"],
    ["2026-06-23", "4:00 PM", "eng", "gha", "吉列体育场", "波士顿"],
    ["2026-06-23", "7:00 PM", "pan", "cro", "BMO 体育场", "多伦多"],
    ["2026-06-27", "5:00 PM", "pan", "eng", "大都会人寿体育场", "纽约"],
    ["2026-06-27", "5:00 PM", "cro", "gha", "林肯金融体育场", "费城"],
  ],
};

const knockoutFixtures: Fixture[] = [
  // R32
  ["2026-06-28", "3:00 PM", "tbd", "tbd", "SoFi 体育场", "洛杉矶"],
  ["2026-06-29", "4:30 PM", "tbd", "tbd", "吉列体育场", "波士顿"],
  ["2026-06-29", "9:00 PM", "tbd", "tbd", "BBVA 体育场", "蒙特雷"],
  ["2026-06-29", "1:00 PM", "tbd", "tbd", "NRG 体育场", "休斯顿"],
  ["2026-06-30", "5:00 PM", "tbd", "tbd", "大都会人寿体育场", "纽约"],
  ["2026-06-30", "1:00 PM", "tbd", "tbd", "AT&T 体育场", "达拉斯"],
  ["2026-06-30", "9:00 PM", "tbd", "tbd", "阿兹特克体育场", "墨西哥城"],
  ["2026-07-01", "12:00 PM", "tbd", "tbd", "梅赛德斯-奔驰体育场", "亚特兰大"],
  ["2026-07-01", "8:00 PM", "tbd", "tbd", "李维斯体育场", "旧金山湾区"],
  ["2026-07-01", "4:00 PM", "tbd", "tbd", "流明球场", "西雅图"],
  ["2026-07-02", "7:00 PM", "tbd", "tbd", "BMO 体育场", "多伦多"],
  ["2026-07-02", "3:00 PM", "tbd", "tbd", "SoFi 体育场", "洛杉矶"],
  ["2026-07-02", "11:00 PM", "tbd", "tbd", "BC 体育场", "温哥华"],
  ["2026-07-03", "6:00 PM", "tbd", "tbd", "硬石体育场", "迈阿密"],
  ["2026-07-03", "9:30 PM", "tbd", "tbd", "箭头体育场", "堪萨斯城"],
  ["2026-07-03", "2:00 PM", "tbd", "tbd", "AT&T 体育场", "达拉斯"],
  // R16
  ["2026-07-04", "5:00 PM", "tbd", "tbd", "林肯金融体育场", "费城"],
  ["2026-07-04", "1:00 PM", "tbd", "tbd", "NRG 体育场", "休斯顿"],
  ["2026-07-05", "4:00 PM", "tbd", "tbd", "大都会人寿体育场", "纽约"],
  ["2026-07-05", "8:00 PM", "tbd", "tbd", "阿兹特克体育场", "墨西哥城"],
  ["2026-07-06", "3:00 PM", "tbd", "tbd", "AT&T 体育场", "达拉斯"],
  ["2026-07-06", "8:00 PM", "tbd", "tbd", "流明球场", "西雅图"],
  ["2026-07-07", "12:00 PM", "tbd", "tbd", "梅赛德斯-奔驰体育场", "亚特兰大"],
  ["2026-07-07", "4:00 PM", "tbd", "tbd", "BC 体育场", "温哥华"],
  // QF
  ["2026-07-09", "4:00 PM", "tbd", "tbd", "吉列体育场", "波士顿"],
  ["2026-07-10", "3:00 PM", "tbd", "tbd", "SoFi 体育场", "洛杉矶"],
  ["2026-07-11", "5:00 PM", "tbd", "tbd", "硬石体育场", "迈阿密"],
  ["2026-07-11", "9:00 PM", "tbd", "tbd", "箭头体育场", "堪萨斯城"],
  // SF
  ["2026-07-14", "3:00 PM", "tbd", "tbd", "AT&T 体育场", "达拉斯"],
  ["2026-07-15", "3:00 PM", "tbd", "tbd", "梅赛德斯-奔驰体育场", "亚特兰大"],
  // 3rd place
  ["2026-07-18", "5:00 PM", "tbd", "tbd", "硬石体育场", "迈阿密"],
  // Final
  ["2026-07-19", "3:00 PM", "tbd", "tbd", "大都会人寿体育场", "纽约"],
];

// 构建完整比赛数组
let matchCounter = 0;
function mid() { matchCounter++; return `m${String(matchCounter).padStart(3, "0")}`; }

export const matches: Match[] = [];

// 小组赛 72 场
const groupOrder = ["A","B","C","D","E","F","G","H","I","J","K","L"];
for (const g of groupOrder) {
  const fixtures = groupFixtures[g];
  for (const [date, time, home, away, venue, city] of fixtures) {
    matches.push({
      match_id: mid(), stage: "group", group: g,
      home_team_id: home, away_team_id: away,
      kickoff_time: et2cn(date, time),
      venue, city,
      status: "scheduled", home_score: null, away_score: null,
    });
  }
}

// 淘汰赛 32 场
const koStages = [
  ...Array(16).fill("round32"),
  ...Array(8).fill("round16"),
  ...Array(4).fill("quarter"),
  "semi", "semi",
  "third_place",
  "final",
] as Match["stage"][];

for (let i = 0; i < knockoutFixtures.length; i++) {
  const [date, time, home, away, venue, city] = knockoutFixtures[i];
  matches.push({
    match_id: mid(), stage: koStages[i], group: null,
    home_team_id: home, away_team_id: away,
    kickoff_time: et2cn(date, time),
    venue, city,
    status: "scheduled", home_score: null, away_score: null,
  });
}

// ===================================================================
// 查询函数
// ===================================================================

export function getMatchById(id: string): Match | undefined {
  return matches.find(m => m.match_id === id);
}

export function getTodayMatches(): Match[] {
  return matches.filter(m => m.stage === "group").slice(0, 12);
}

export function getUpcomingMatches(): Match[] {
  return matches.filter(m => m.status === "scheduled").sort((a, b) => a.kickoff_time.localeCompare(b.kickoff_time));
}

export function getLiveMatches(): Match[] {
  return [];
}

export function getMatchesByGroup(group: string): Match[] {
  return matches.filter(m => m.group === group);
}
