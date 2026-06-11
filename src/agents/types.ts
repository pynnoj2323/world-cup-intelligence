// Agent 系统类型定义

export interface MatchContext {
  matchId: string;
  homeTeam: TeamProfile;
  awayTeam: TeamProfile;
  group?: string;
  stage?: string;
  venue?: string;
}

export interface TeamProfile {
  name: string;
  fifaRanking: number;
  group: string;
  recentForm?: string;
  keyPlayers?: string[];
  injuries?: InjuryReport[];
  tacticalStyle?: string;
}

export interface InjuryReport {
  player: string;
  status: "out" | "doubtful" | "fit";
  detail: string;
}

export interface MatchData {
  context: MatchContext;
  stats: MatchStats | null;
  standings: GroupStandings | null;
  odds: OddsData | null;
  news: NewsItem[];
  videoInsights: VideoInsight[];
  dataFreshness: string;
}

export interface MatchStats {
  possession?: [number, number];
  shots?: [number, number];
  corners?: [number, number];
  cards?: [number, number];
}

export interface GroupStandings {
  homeTeam: StandingEntry;
  awayTeam: StandingEntry;
  groupTable: StandingEntry[];
}

export interface StandingEntry {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface OddsData {
  provider: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
}

export interface NewsItem {
  title: string;
  source: string;
  summary: string;
  relevance: "high" | "medium" | "low";
  timestamp: string;
}

export interface VideoInsight {
  source: string;
  opinion: string;
  tendency: "home" | "draw" | "away" | "neutral";
  confidence: number;
  keyPoints: string[];
  needsVerification: string[];
}

// ===== Agent 输入输出 =====

export interface DataAgentInput {
  match: MatchContext;
  includeStats?: boolean;
  includeOdds?: boolean;
  includeNews?: boolean;
}

export interface DataAgentOutput {
  matchData: MatchData;
  summary: string;
  keyFindings: string[];
}

export interface PredictionAgentInput {
  matchData: MatchData;
  userDims?: string[];
}

export interface PredictionAgentOutput {
  homeWin: number;
  draw: number;
  awayWin: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  scorePredictions: ScoreScenario[];
  scoreReasoning: string;
  over25Prob: number;
  bttsProb: number;
  correctScoreProb: number;
  asianHandicap: string;
  confidence: number;
  confidenceLabel: string;
  recommendationType: string;
  recommendationLabel: string;
  recommendationReason: string;
  tacticalAnalysis: TacticalView;
  keyFactors: Factor[];
  riskFactors: RiskFactor[];
  narrativeSummary: string;
  chainOfThought: string[];
}

export interface ScoreScenario {
  home: number;
  away: number;
  probability: number;
  scenario: string;
}

export interface TacticalView {
  homeTactics: string;
  awayTactics: string;
  keyBattle: string;
}

export interface Factor {
  factor: string;
  impact: "positive_home" | "positive_away" | "neutral";
  weight: number;
  explanation: string;
}

export interface RiskFactor {
  risk: string;
  severity: "low" | "medium" | "high";
  probability: number;
  explanation: string;
}

// ===== Video Agent =====

export interface VideoInsightInput {
  transcript: string;
  matchContext: MatchContext;
  source?: string;
}

export interface VideoInsightOutput {
  opinions: ExtractedOpinion[];
  overallTendency: "home" | "draw" | "away" | "neutral";
  credibilityScore: number;
  contradictions: string[];
}

export interface ExtractedOpinion {
  speaker?: string;
  claim: string;
  tendency: "home" | "draw" | "away" | "neutral";
  evidence: string;
  confidence: number;
  needsVerification: boolean;
  verificationNote?: string;
}

// ===== Review Agent =====

export interface ReviewAgentInput {
  prediction: PredictionAgentOutput;
  actualHomeScore: number;
  actualAwayScore: number;
  actualResult: "home_win" | "draw" | "away_win";
}

export interface ReviewAgentOutput {
  predictionAccuracy: AccuracyReport;
  biasAnalysis: string[];
  optimizationSuggestions: OptimizationSuggestion[];
  learningPoints: string[];
}

export interface AccuracyReport {
  resultCorrect: boolean;
  scoreCorrect: boolean;
  scoreDiff: number;
  probError: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  overallScore: number;
}

export interface OptimizationSuggestion {
  area: string;
  issue: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

// ===== Pipeline =====

export interface AgentPipelineResult {
  dataAgent: DataAgentOutput;
  prediction: PredictionAgentOutput;
  videoInsights: VideoInsight[];
  pipelineMetadata: {
    agentsUsed: string[];
    totalDuration: number;
    dataFreshness: string;
  };
}
