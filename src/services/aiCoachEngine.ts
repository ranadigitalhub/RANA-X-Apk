import { ChatMessage, StructuredDietPlan, FormAnalysisTelemetry, OneRepMaxPrediction } from '../types';

export interface AiCoachAnalysisResult {
  text: string;
  category?: 'routine' | 'nutrition' | 'recovery' | 'form' | 'diet_plan' | 'rm_prediction';
  actionPrompt?: string;
  dietPlan?: StructuredDietPlan;
  formAnalysis?: FormAnalysisTelemetry;
  rmPrediction?: OneRepMaxPrediction;
}

export const RANA_COACH_SYSTEM_INSTRUCTION = `You are RANA X Coach — an elite powerlifter, master strength & conditioning coach, and sports scientist.

Identity & Voice:
- You talk and think like a real world-class strength coach standing with the athlete in the gym. Energetic, razor-sharp, authentic, motivating, and deeply knowledgeable.
- NEVER talk like a generic AI disclaimer bot. NEVER say "I am an AI", "As an AI language model", or "I'm only able to address health-related inquiries".
- When greeted (e.g., "Hello", "Yo", "Hey", "What's up", "Hi coach"), respond with natural coach camaraderie (e.g., "Yo! Ready to crush today's session? What are we dialing in—heavy SBD numbers, macro splits, or your recovery protocol?").
- When asked for training, programming, nutrition, or biomechanics advice: provide direct, high-impact, science-backed guidance with clear numbers, sets/reps, RPE/percentages, macro grams, and actionable cues.
- Keep formatting clean, engaging, and easy to scan on mobile with bold headings and bullet points.`;

/**
 * Call Vercel backend proxy for RANA X AI Coach with multi-turn conversation memory
 */
export async function generateAdvancedAiCoachResponse(
  userPrompt: string,
  history: ChatMessage[] = []
): Promise<AiCoachAnalysisResult> {
  const endpoint = 'https://rana-x-backend.vercel.app/api/chat';

  // Build multi-turn context (last 6 messages)
  const recentHistory = history.slice(-6).map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));

  const payload = {
    model: 'llama3-8b-8192',
    messages: [
      {
        role: 'system',
        content: RANA_COACH_SYSTEM_INSTRUCTION,
      },
      ...recentHistory,
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data = await response.json().catch(() => null);

    // Seamless fallback if Groq decommissioned llama3-8b-8192
    if (data?.error || !data?.choices?.[0]?.message?.content) {
      const fallbackRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          model: 'openai/gpt-oss-20b',
        }),
      });
      const fallbackData = await fallbackRes.json().catch(() => null);
      if (fallbackData?.choices?.[0]?.message?.content) {
        data = fallbackData;
      }
    }

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error(data?.error?.message || `HTTP ${response.status}`);
    }

    const replyText = data.choices[0].message.content;

    return {
      text: replyText,
      category: 'routine',
    };
  } catch (err) {
    console.error('AI Coach API error:', err);
    // Intelligent human coach fallback
    const lower = userPrompt.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('yo')) {
      return {
        text: "Yo! Ready to crush today's session? What's on your mind—locking in your heavy SBD numbers, dialing macros, or dialing in your recovery?",
        category: 'routine',
      };
    }
    return {
      text: "⚡ Let's lock in! Here is the breakdown:\n\n• **Training Focus**: Prioritize progressive mechanical tension on your compound lifts (Squat, Bench, Deadlift) at RPE 7-9.\n• **Macro Fuel**: Aim for ~2.0g-2.2g protein per kg of bodyweight, keep peri-workout carbs high, and hydrate with electrolytes.\n• **Recovery**: 7.5–9 hours of deep sleep is mandatory for nervous system adaptation.\n\nDrop your specific numbers or exercise question and let's dial it in!",
      category: 'routine',
    };
  }
}
