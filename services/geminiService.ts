import { GoogleGenAI, Type } from "@google/genai";
import { ChatAnalytics, Message, AIGeneratedContent } from '../types';

export const generateAIInsights = async (
  analytics: ChatAnalytics,
  messages: Message[]
): Promise<AIGeneratedContent | null> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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
    4. "Topics": Identify 4-5 main discussion themes (e.g. "Weekend Plans", "Politics", "Roasting X") with a frequency label (High/Medium).
    5. "Predictions": 3 fun, pattern-based predictions for next year (e.g. "X will finally buy a new phone", "Activity will drop in Feb").
    6. "Quotes": Extract one short, distinct "signature quote" (max 10 words) for each of the top 5 participants listed in Group Stats. It should be something they actually said or characteristic of them.
    7. "Word Cloud": Curate a list of 30-40 specific words or short phrases that represent this group's unique vocabulary, slang, inside jokes, or recurrent topics. Use the "Raw frequent words" list as a hint but prioritise finding slang/names in the timeline. Filter out common English stop words (like 'the', 'is', 'message', 'omitted') and generic verbs/adverbs. Returns strings only.
    
    Output strictly in JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
                  percentage: { type: Type.STRING }
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
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIGeneratedContent;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};