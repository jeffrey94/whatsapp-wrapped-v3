import { Message, ChatAnalytics, ParticipantStats } from '../types';

// Simple emoji regex
const EMOJI_REGEX = /\p{Emoji_Presentation}/gu;

// Common English stop words to filter out from word cloud
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
  'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well',
  'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'has', 'had',
  'been', 'omitted', 'media', 'image', 'video', 'audio', 'sticker', 'gif', 'deleted', 'message', 'edited', 'null', 'undefined',
  'yes', 'yeah', 'ok', 'okay', 'lol', 'lmao', 'haha', 'hahaha', 'can', 'cant', 'did', 'didnt', 'dont', 'does', 'really', 'too', 'very'
]);

export const analyzeChat = (messages: Message[]): ChatAnalytics => {
  if (messages.length === 0) {
    throw new Error("No messages found to analyze");
  }

  const messagesByHour = new Array(24).fill(0);
  const messagesByDay = new Array(7).fill(0);
  const messagesByMonth = new Array(12).fill(0);
  
  // Heatmap: 7 days (rows) x 24 hours (cols)
  const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));

  const participantMap = new Map<string, ParticipantStats>();
  const participantHourCounts = new Map<string, number[]>(); // Track hourly activity per user for chronotypes

  const allEmojis = new Map<string, number>();
  const wordFrequency = new Map<string, number>();
  
  // Interaction Matrix for Relationship Mapping
  const interactionMatrix: { [key: string]: { [key: string]: number } } = {};

  const sortedMessages = [...messages].sort((a, b) => a.date.getTime() - b.date.getTime());
  const startDate = sortedMessages[0].date;
  const endDate = sortedMessages[sortedMessages.length - 1].date;

  const activeDates = new Set<string>();

  // Helper variables for loop
  let prevMessage: Message | null = null;

  sortedMessages.forEach(msg => {
    // Temporal stats
    const hour = msg.date.getHours();
    const day = msg.date.getDay();
    const month = msg.date.getMonth();

    messagesByHour[hour]++;
    messagesByDay[day]++;
    messagesByMonth[month]++;
    heatmap[day][hour]++;
    
    activeDates.add(msg.date.toDateString());

    // Init Participant in Map
    if (!participantMap.has(msg.author)) {
      participantMap.set(msg.author, {
        name: msg.author,
        messageCount: 0,
        wordCount: 0,
        mediaCount: 0,
        emojiCount: 0,
        topEmojis: [],
        activeHour: 0,
        rank: 0,
        initiationScore: 0,
        avgReplyTime: 0,
      });
      participantHourCounts.set(msg.author, new Array(24).fill(0));
      interactionMatrix[msg.author] = {};
    }

    const stats = participantMap.get(msg.author)!;
    stats.messageCount++;
    if (msg.isMedia) stats.mediaCount++;

    // Word Analysis
    // Filter common punctuation but keep hyphens or apostrophes inside words if needed
    const words = msg.content.toLowerCase().split(/[\s,.!?"'()\[\]{}|\\\/~`*<>]+/).filter(Boolean);
    stats.wordCount += words.length;

    words.forEach(word => {
        // Must be at least 3 chars, not a stop word, and not just numbers
        if (word.length > 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word)) {
            wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
    });

    // Track user specific hour
    participantHourCounts.get(msg.author)![hour]++;

    // Emojis
    const emojis = msg.content.match(EMOJI_REGEX) || [];
    stats.emojiCount += emojis.length;
    emojis.forEach(e => {
        allEmojis.set(e, (allEmojis.get(e) || 0) + 1);
    });

    // --- Advanced Interaction Logic ---
    if (prevMessage) {
      const timeDiffMs = msg.date.getTime() - prevMessage.date.getTime();
      const timeDiffMinutes = timeDiffMs / (1000 * 60);

      // 1. Initiation Score: If message sent after > 60 mins of silence, it's an initiation
      if (timeDiffMinutes > 60) {
        stats.initiationScore++;
      }

      // 2. Interaction Matrix: If different author and < 5 mins, count as reply
      if (prevMessage.author !== msg.author && timeDiffMinutes < 5) {
         if (!interactionMatrix[msg.author][prevMessage.author]) {
           interactionMatrix[msg.author][prevMessage.author] = 0;
         }
         interactionMatrix[msg.author][prevMessage.author]++;
      }
    } else {
      // First message is an initiation
      stats.initiationScore++;
    }

    prevMessage = msg;
  });

  // Calculate active hours for everyone
  const participants: ParticipantStats[] = Array.from(participantMap.values()).map(p => {
    const hours = participantHourCounts.get(p.name) || new Array(24).fill(0);
    const maxHour = hours.indexOf(Math.max(...hours));
    return { ...p, activeHour: maxHour }; // Score calculated later
  });

  // --- Deterministic Chronotype Assignment ---
  // We want to ensure one Night Owl and one Early Bird based on absolute max counts in those timeframes.
  
  let nightOwlName = '';
  let maxNightCount = -1;

  let earlyBirdName = '';
  let maxEarlyCount = -1;

  participants.forEach(p => {
    const hours = participantHourCounts.get(p.name) || [];
    // Night Owl: 11 PM to 4 AM (Hrs: 23, 0, 1, 2, 3, 4)
    const nightCount = (hours[23] || 0) + (hours[0] || 0) + (hours[1] || 0) + (hours[2] || 0) + (hours[3] || 0) + (hours[4] || 0);
    
    // Early Bird: 5 AM to 9 AM (Hrs: 5, 6, 7, 8, 9)
    const earlyCount = (hours[5] || 0) + (hours[6] || 0) + (hours[7] || 0) + (hours[8] || 0) + (hours[9] || 0);

    if (nightCount > maxNightCount) {
        maxNightCount = nightCount;
        nightOwlName = p.name;
    }

    if (earlyCount > maxEarlyCount) {
        maxEarlyCount = earlyCount;
        earlyBirdName = p.name;
    }
  });

  // Assign labels
  participants.forEach(p => {
    if (p.name === nightOwlName && maxNightCount > 0) {
        p.chronotype = { label: 'Night Owl', timeRange: '11PM - 5AM', icon: '🦉' };
    } else if (p.name === earlyBirdName && maxEarlyCount > 0) {
        p.chronotype = { label: 'Early Bird', timeRange: '5AM - 10AM', icon: '🌅' };
    } else {
        // Default or leave undefined
        // If they are not the top night or top early, we don't label them in this pass
    }
  });

  // Rank participants
  participants.sort((a, b) => b.messageCount - a.messageCount);
  participants.forEach((p, index) => p.rank = index + 1);

  // Top Emojis Global
  const sortedEmojis = Array.from(allEmojis.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Top Words Global
  const sortedWords = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([text, value]) => ({ text, value }));

  return {
    totalMessages: messages.length,
    activeDays: activeDates.size,
    dateRange: { start: startDate, end: endDate },
    participants,
    messagesByHour,
    messagesByDay,
    messagesByMonth,
    heatmap,
    topEmojis: sortedEmojis,
    topWords: sortedWords,
    interactionMatrix
  };
};