export interface Message {
  date: Date;
  author: string;
  content: string;
  isMedia: boolean;
}

export interface ParticipantStats {
  name: string;
  messageCount: number;
  wordCount: number;
  mediaCount: number;
  emojiCount: number;
  topEmojis: [string, number][];
  activeHour: number; // 0-23
  rank: number;
  // New metrics
  initiationScore: number; // How often they start conversations
  avgReplyTime: number; // Minutes (heuristic)
  sentiment?: 'positive' | 'neutral' | 'negative';
  chronotype?: {
    label: string;
    timeRange: string;
    icon: string;
  };
}

export interface ChatAnalytics {
  totalMessages: number;
  activeDays: number;
  dateRange: { start: Date; end: Date };
  participants: ParticipantStats[];
  messagesByHour: number[]; // Array of 24 integers
  messagesByDay: number[]; // Array of 7 integers (0=Sunday)
  messagesByMonth: number[]; // Array of 12 integers
  heatmap: number[][]; // 7 days x 24 hours grid
  topEmojis: [string, number][];
  topWords: { text: string; value: number }[]; // Word Cloud Data
  groupName?: string;
  // Network/Relationships
  interactionMatrix: { [author: string]: { [target: string]: number } }; // Who replies to whom
}

export interface AIGeneratedContent {
  groupDescription: string;
  badges: {
    memberName: string;
    badgeTitle: string;
    badgeDescription: string;
    emoji: string;
  }[];
  memorableMoments: {
    title: string;
    description: string;
  }[];
  // New AI Sections
  topics: {
    name: string;
    description: string;
    percentage: string; // e.g. "High", "Medium", "Low" or "30%"
  }[];
  predictions: string[]; // 3 predictions for next year
  participantQuotes: {
    name: string;
    quote: string;
  }[];
  groupPersonality: {
    vibe: string;
    values: string;
  };
  wordCloud: string[]; // List of AI-selected vocabulary
}

export interface WrappedData {
  analytics: ChatAnalytics;
  aiContent: AIGeneratedContent | null;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS',
}