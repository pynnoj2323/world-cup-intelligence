/**
 * 预测数据
 * 赛前预测——不含比分（比赛尚未开始），仅展示概率分析
 */

export interface Prediction {
  prediction_id: string;
  match_id: string;
  created_at: string;
  updated_at: string;
  home_win_probability: number;
  draw_probability: number;
  away_win_probability: number;
  predicted_home_score: number;
  predicted_away_score: number;
  over_2_5_probability: number;
  both_teams_score_probability: number;
  extra_time_probability?: number;
  penalty_probability?: number;
  confidence_score: number;
  confidence_label: "low" | "medium" | "medium_high" | "high";
  recommendation_type: string;
  recommendation_label: string;
  recommendation_reason: string;
  key_factors: { factor: string; impact: string; weight: number; explanation: string }[];
  risk_factors: { risk: string; severity: string; explanation: string }[];
  narrative_summary: string;
  disclaimer: string;
}

export const predictions: Prediction[] = [
  // 揭幕战：墨西哥 vs 南非
  {
    prediction_id: "p001",
    match_id: "m001",
    created_at: "2026-06-10T06:00:00+08:00",
    updated_at: "2026-06-10T10:00:00+08:00",
    home_win_probability: 0.58, draw_probability: 0.24, away_win_probability: 0.18,
    predicted_home_score: 2, predicted_away_score: 0,
    over_2_5_probability: 0.48, both_teams_score_probability: 0.38,
    confidence_score: 0.70, confidence_label: "medium_high",
    recommendation_type: "home_win",
    recommendation_label: "墨西哥胜",
    recommendation_reason: "揭幕战主场优势明显。墨西哥整体实力和历史战绩均远优于南非。",
    key_factors: [
      { factor: "主场优势", impact: "positive_home", weight: 0.26, explanation: "阿兹特克体育场 8.7 万观众，开幕式主场氛围是巨大加成。" },
      { factor: "实力差距", impact: "positive_home", weight: 0.22, explanation: "墨西哥 FIFA 排名 14 位 vs 南非 57 位，整体实力差距明显。" },
      { factor: "揭幕战压力", impact: "neutral", weight: 0.15, explanation: "揭幕战压力对双方都是未知因素，可能影响发挥。" },
    ],
    risk_factors: [
      { risk: "揭幕战冷门传统", severity: "medium", explanation: "历史上多次出现揭幕战东道主表现不及预期的情况。" },
      { risk: "南非防守反击", severity: "low", explanation: "南非可能采取深度防守策略，限制墨西哥进攻空间。" },
    ],
    narrative_summary: "2026 世界杯揭幕战，墨西哥坐镇阿兹特克体育场迎战南非。作为三届东道主，墨西哥拥有丰富的大赛经验。预计墨西哥将以控球主导比赛，南非更多依赖防守反击。历史数据支持东道主取得开门红。",
    disclaimer: "AI 预测基于当前可用数据生成，仅用于赛事分析和娱乐参考，不代表确定结果。",
  },
  // 巴西 vs 摩洛哥
  {
    prediction_id: "p002",
    match_id: "m013",
    created_at: "2026-06-10T06:00:00+08:00",
    updated_at: "2026-06-10T10:00:00+08:00",
    home_win_probability: 0.55, draw_probability: 0.26, away_win_probability: 0.19,
    predicted_home_score: 2, predicted_away_score: 1,
    over_2_5_probability: 0.55, both_teams_score_probability: 0.58,
    confidence_score: 0.65, confidence_label: "medium",
    recommendation_type: "home_win",
    recommendation_label: "巴西胜",
    recommendation_reason: "巴西攻击线深度世界顶级，摩洛哥虽有韧性但难以全程压制。",
    key_factors: [
      { factor: "进攻创造力", impact: "positive_home", weight: 0.25, explanation: "巴西前场四人组技术能力和个人突破均为世界顶级。" },
      { factor: "摩洛哥防守体系", impact: "positive_away", weight: 0.18, explanation: "摩洛哥在 2022 世界杯展现了一流的防守组织能力。" },
    ],
    risk_factors: [
      { risk: "摩洛哥反击效率", severity: "medium", explanation: "摩洛哥边路速度是巴西后防需要重点警惕的威胁。" },
      { risk: "阵容磨合", severity: "low", explanation: "巴西首场小组赛可能存在阵容磨合问题。" },
    ],
    narrative_summary: "C 组焦点战，五星巴西迎战 2022 世界杯四强摩洛哥。巴西拥有赛事最强攻击线之一，但摩洛哥的防守韧性和反击能力不容小觑。预计巴西掌控节奏但需警惕摩洛哥的反击。",
    disclaimer: "AI 预测基于当前可用数据生成，仅用于赛事分析和娱乐参考，不代表确定结果。",
  },
  // 美国 vs 巴拉圭
  {
    prediction_id: "p003",
    match_id: "m019",
    created_at: "2026-06-10T06:00:00+08:00",
    updated_at: "2026-06-10T10:00:00+08:00",
    home_win_probability: 0.52, draw_probability: 0.28, away_win_probability: 0.20,
    predicted_home_score: 2, predicted_away_score: 1,
    over_2_5_probability: 0.50, both_teams_score_probability: 0.55,
    confidence_score: 0.62, confidence_label: "medium",
    recommendation_type: "home_win_or_draw",
    recommendation_label: "美国不败",
    recommendation_reason: "美国主场作战，近年来实力稳步提升，巴拉圭实力下滑明显。",
    key_factors: [
      { factor: "主场优势", impact: "positive_home", weight: 0.22, explanation: "SoFi 体育场主场氛围将为美国队注入额外动力。" },
      { factor: "实力此消彼长", impact: "positive_home", weight: 0.20, explanation: "美国近两年足球水平显著提升，巴拉圭处于重建期。" },
    ],
    risk_factors: [
      { risk: "美国大赛经验", severity: "medium", explanation: "美国在世界杯大场面中的稳定性仍有待考验。" },
      { risk: "巴拉圭韧性", severity: "medium", explanation: "巴拉圭传统上在重大赛事中表现顽强，不易被打崩。" },
    ],
    narrative_summary: "D 组东道主美国队首战巴拉圭。美国队近年来在普利西奇等球员带领下实力提升明显，主场作战气势正盛。巴拉圭处于新老交替期，预计以防守为主。美国小胜概率较大，但不排除平局可能。",
    disclaimer: "AI 预测基于当前可用数据生成，仅用于赛事分析和娱乐参考，不代表确定结果。",
  },
  // 英格兰 vs 克罗地亚
  {
    prediction_id: "p004",
    match_id: "m067",
    created_at: "2026-06-10T06:00:00+08:00",
    updated_at: "2026-06-10T10:00:00+08:00",
    home_win_probability: 0.43, draw_probability: 0.30, away_win_probability: 0.27,
    predicted_home_score: 1, predicted_away_score: 1,
    over_2_5_probability: 0.45, both_teams_score_probability: 0.55,
    confidence_score: 0.58, confidence_label: "medium",
    recommendation_type: "home_win_or_draw",
    recommendation_label: "英格兰不败",
    recommendation_reason: "英格兰新生代天赋出众，克罗地亚黄金一代逐渐老去但经验丰富。",
    key_factors: [
      { factor: "英格兰青年军", impact: "positive_home", weight: 0.22, explanation: "贝林厄姆、福登等新生代已成长为世界级球员。" },
      { factor: "克罗地亚大赛经验", impact: "positive_away", weight: 0.20, explanation: "莫德里奇领衔的克罗地亚拥有顶级大赛经验和战术执行力。" },
    ],
    risk_factors: [
      { risk: "英克大战历史", severity: "medium", explanation: "两队近年交手记录接近，克罗地亚从不怕英格兰。" },
      { risk: "小组赛策略", severity: "low", explanation: "强强对话首轮可能双方都比较谨慎，平局概率不低。" },
    ],
    narrative_summary: "L 组强强对话，英格兰与克罗地亚上演小组赛焦点战。英格兰拥有赛事最令人羡慕的青年才俊阵容，但克罗地亚的大赛经验和战斗精神是其最大武器。这很可能是一场战术含量极高、比分胶着的比赛。",
    disclaimer: "AI 预测基于当前可用数据生成，仅用于赛事分析和娱乐参考，不代表确定结果。",
  },
];

export function getPredictionByMatchId(matchId: string): Prediction | undefined {
  return predictions.find(p => p.match_id === matchId);
}

export const championProbabilities = [
  { team_id: "fra", probability: 0.15, rank: 1 },
  { team_id: "arg", probability: 0.14, rank: 2 },
  { team_id: "bra", probability: 0.13, rank: 3 },
  { team_id: "eng", probability: 0.12, rank: 4 },
  { team_id: "esp", probability: 0.10, rank: 5 },
  { team_id: "ger", probability: 0.08, rank: 6 },
  { team_id: "por", probability: 0.07, rank: 7 },
  { team_id: "ned", probability: 0.06, rank: 8 },
  { team_id: "bel", probability: 0.05, rank: 9 },
  { team_id: "mex", probability: 0.04, rank: 10 },
];
