import { GoogleGenAI, Type } from "@google/genai";
import { ChatAnalytics, Message, AIGeneratedContent } from '../types';

export const generateAIInsights = async (
  analytics: ChatAnalytics,
  messages: Message[]
): Promise<AIGeneratedContent | null> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  // 1. Context Preparation
  const topParticipants = analytics.participants.slice(0, 5).map(p => ({
    name: p.name,
    count: p.messageCount,
    favHour: p.activeHour
  }));

  // 2. Full Timeline Preparation (capped)
  const timeline = messages
    .slice(-30000)
    .map(m => `[${m.date.toDateString()}] ${m.author}: ${m.content}`)
    .join('\n');

  // 3. Raw frequent words (top 100) for AI filtering
  const rawFreqWords = analytics.topWords.slice(0, 100).map(w => w.text).join(", ");

  const prompt = `
    Analyze this WhatsApp group chat timeline from 2025.
    
    Group Stats:
    - Total Messages: ${analytics.totalMessages}
    - Top Participants: ${JSON.stringify(topParticipants)}
    - Most frequent raw words detected (may include noise): ${rawFreqWords}
    
    Chat Timeline:
    ${timeline}
    
    Task (Provide JSON output):
    1. "Group Personality": A creative 'Vibe' description (2 sentences) and a list of 'Core Values' (e.g. "Humor, Tech Support").
    2. "Awards": Assign a creative "Badge" to 3-5 top members. 
    3. "Moments": Identify 3 distinct memorable events, arguments, or inside jokes. Crucial: Ensure these moments involve *different* key participants to maximize coverage.
    4. "Topics": Identify 4-5 main discussion themes (e.g. "Weekend Plans", "Politics", "Roasting X") with a frequency label (High/Medium) and the name of the participant who most leads/initiates it ("ledBy").
    5. "Predictions": 3 fun, pattern-based predictions for next year (e.g. "X will finally buy a new phone", "Activity will drop in Feb").
    6. "Quotes": Extract one short, distinct "signature quote" (max 10 words) for each of the top 5 participants listed in Group Stats. It should be something they actually said or characteristic of them.
    7. "Word Cloud": Curate a list of 30-40 specific words or short phrases that represent this group's unique vocabulary, slang, inside jokes, or recurrent topics. Use the "Raw frequent words" list as a hint but prioritise finding slang/names in the timeline. Filter out common English stop words (like 'the', 'is', 'message', 'omitted') and generic verbs/adverbs. Returns strings only.
    8. "Sign Off Message": Write a single, punchy, friendly/humorous/satirical goodbye message (1-2 sentences) for the end of the Wrapped presentation. It should feel like a natural ending that acknowledges the year of chatting. Examples: "See you in 2026 — may your notifications be fewer and your memes be danker." or "Another year of questionable life advice and even more questionable memes. You survived."
    
    Output strictly in JSON matching the schema.
  `;

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const PRIMARY_MODEL = 'gemini-3-flash-preview';
  const FALLBACK_MODEL = 'gemini-2.5-flash';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // Use primary model for first attempt, fallback for retries
    const model = attempt === 1 ? PRIMARY_MODEL : FALLBACK_MODEL;

    try {
      console.log(`AI Analysis attempt ${attempt}/${MAX_RETRIES} using ${model}...`);

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              groupDescription: { type: Type.STRING },
              groupPersonality: {
                type: Type.OBJECT,
                properties: {
                  vibe: { type: Type.STRING },
                  values: { type: Type.STRING }
                }
              },
              memorableMoments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                  }
                }
              },
              badges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    memberName: { type: Type.STRING },
                    badgeTitle: { type: Type.STRING },
                    badgeDescription: { type: Type.STRING },
                    emoji: { type: Type.STRING }
                  }
                }
              },
              topics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    percentage: { type: Type.STRING },
                    ledBy: { type: Type.STRING }
                  }
                }
              },
              predictions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              participantQuotes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    quote: { type: Type.STRING }
                  }
                }
              },
              wordCloud: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              signOffMessage: { type: Type.STRING }
            }
          }
        }
      });

      if (response.text) {
        console.log('AI Analysis successful!');

        // Parse and validate the response
        let parsed: AIGeneratedContent;
        try {
          parsed = JSON.parse(response.text) as AIGeneratedContent;
        } catch (parseError) {
          console.error('JSON parse error - response may be truncated:', parseError);
          throw new Error('Invalid JSON response from AI');
        }

        // Validate required fields exist
        const requiredFields = ['badges', 'memorableMoments', 'predictions', 'wordCloud'];
        const missingFields = requiredFields.filter(f => !parsed[f as keyof AIGeneratedContent]);

        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          throw new Error(`Incomplete AI response: missing ${missingFields.join(', ')}`);
        }

        return parsed;
      }

      // If no text, treat as failure and retry
      throw new Error('Empty response from AI');

    } catch (error) {
      console.error(`AI attempt ${attempt} failed:`, error);

      if (attempt < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  console.error('All AI attempts failed');
  return null;
};