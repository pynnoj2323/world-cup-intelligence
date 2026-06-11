// Video Insight Agent — 从视频转写文本中提取观点
import type { VideoInsightInput, VideoInsightOutput, ExtractedOpinion } from "./types";

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

export async function runVideoAgent(input: VideoInsightInput): Promise<VideoInsightOutput> {
  const { transcript, matchContext } = input;

  if (!transcript || transcript.length < 10) {
    return {
      opinions: [],
      overallTendency: "neutral",
      credibilityScore: 0,
      contradictions: [],
    };
  }

  const prompt = `分析以下关于足球比赛的解说/评论文本，提取其中的观点和倾向。

## 比赛背景
${matchContext.homeTeam.name} vs ${matchContext.awayTeam.name}
（${matchContext.group ? matchContext.group + "组" : matchContext.stage || "比赛"}）

## 文本内容
${transcript.slice(0, 3000)}

## 任务
1. 提取所有明确的观点（如"XX队防守很好"、"YY球员状态不佳"）
2. 判断每条观点的倾向（home/away/draw/neutral）
3. 评估每条观点的可信度（有据可依=高，情绪化判断=低）
4. 标注需要核实的信息（如"据说XX受伤了"）
5. 检查观点之间是否有矛盾

返回JSON：
{
  "opinions": [
    {"claim":"观点内容","tendency":"home|away|draw|neutral","evidence":"依据","confidence":0.xx,"needsVerification":true|false,"verificationNote":"核实建议"}
  ],
  "overall_tendency": "home|away|draw|neutral",
  "credibility_score": 0.xx,
  "contradictions": ["矛盾1","矛盾2"]
}`;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是足球赛事观点分析Agent。提取视频文本中的关键观点，保持客观。只输出JSON。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Video Agent API错误(${res.status}): ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      opinions: (parsed.opinions || []).map((o: any) => ({
        claim: o.claim,
        tendency: o.tendency,
        evidence: o.evidence || "",
        confidence: o.confidence || 0.5,
        needsVerification: o.needsVerification || false,
        verificationNote: o.verificationNote || "",
      })),
      overallTendency: parsed.overall_tendency || "neutral",
      credibilityScore: parsed.credibility_score || 0.5,
      contradictions: parsed.contradictions || [],
    };
  } catch {
    return { opinions: [], overallTendency: "neutral", credibilityScore: 0, contradictions: [] };
  }
}
