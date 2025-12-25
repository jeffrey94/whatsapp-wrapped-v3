import { Message } from '../types';

// Regex for iOS: [DD/MM/YY, HH:MM:SS] Name: Message
// Note: Date format varies by locale, so we try to be flexible with the date part.
const IOS_REGEX = /^\[(\d{1,4}[-./]\d{1,2}[-./]\d{1,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s+([^:]+):\s+(.*)/i;

// Regex for Android: DD/MM/YY, HH:MM - Name: Message
const ANDROID_REGEX = /^(\d{1,4}[-./]\d{1,2}[-./]\d{1,4}),?\s+(\d{1,2}:\d{2}(?:\s?[AP]M)?)\s+-\s+([^:]+):\s+(.*)/i;

const SYSTEM_MESSAGE_KEYWORDS = [
  'Messages and calls are end-to-end encrypted',
  'created group',
  'added',
  'left',
  'removed',
  'changed the subject',
  'changed this group\'s icon',
  'security code changed',
  'waiting for this message',
  'joined using this group\'s invite link',
  'This message was deleted',
  'You deleted this message',
  'changed the group description',
  'started a call',
  'missed voice call',
  'missed video call',
  'video call ended',
  'voice call ended'
];

const parseDate = (dateStr: string, timeStr: string): Date | null => {
  try {
    // Normalize date separators
    const normalizedDate = dateStr.replace(/[-.]/g, '/');
    const dateParts = normalizedDate.split('/');
    
    // Heuristic: If first part > 12, it's definitely Day. If last part is 4 digits, it's Year.
    // Standard formats: DD/MM/YYYY or MM/DD/YYYY or YYYY/MM/DD
    let year, month, day;

    if (dateParts[0].length === 4) {
       // YYYY/MM/DD
       year = parseInt(dateParts[0]);
       month = parseInt(dateParts[1]) - 1;
       day = parseInt(dateParts[2]);
    } else {
       // DD/MM/YYYY or MM/DD/YYYY
       // This is ambiguous. We'll assume DD/MM/YYYY for most WhatsApp exports unless MM > 12
       let p1 = parseInt(dateParts[0]);
       let p2 = parseInt(dateParts[1]);
       let p3 = parseInt(dateParts[2]);

       // Year correction for 2-digit years
       if (p3 < 100) p3 += 2000;

       if (p1 > 12) {
         // Must be DD/MM
         day = p1;
         month = p2 - 1;
       } else if (p2 > 12) {
         // Must be MM/DD (US style) where p2 is actually day? No, if p2 > 12, p2 is Day.
         // So if p1 is <= 12 and p2 > 12, then p1 is Month, p2 is Day.
         month = p1 - 1;
         day = p2;
       } else {
         // Ambiguous. Default to DD/MM/YY as it's more common globally for WhatsApp
         day = p1;
         month = p2 - 1;
       }
       year = p3;
    }

    // Time parsing
    // Handle 12hr/24hr
    const timeParts = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s?([AP]M))?/i);
    if (!timeParts) return new Date();

    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const seconds = timeParts[3] ? parseInt(timeParts[3]) : 0;
    const meridian = timeParts[4] ? timeParts[4].toUpperCase() : null;

    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    return new Date(year, month, day, hours, minutes, seconds);
  } catch (e) {
    console.error("Date parsing error", e);
    return null;
  }
};

export const parseChatFile = async (file: File): Promise<Message[]> => {
  const text = await file.text();
  const lines = text.split('\n');
  const messages: Message[] = [];
  
  let currentMessage: Message | null = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    // Check for Android match
    let match = line.match(ANDROID_REGEX);
    let format = 'android';

    if (!match) {
      match = line.match(IOS_REGEX);
      format = 'ios';
    }

    if (match) {
      // New message found
      const dateStr = match[1];
      const timeStr = match[2];
      const author = match[3].trim();
      const content = match[4].trim();

      // Filter system messages
      if (SYSTEM_MESSAGE_KEYWORDS.some(k => content.includes(k))) {
        continue;
      }

      const date = parseDate(dateStr, timeStr);
      if (!date) continue;

      const isMedia = content === '<Media omitted>' || content.includes('image omitted') || content.includes('video omitted') || content.includes('sticker omitted');

      currentMessage = {
        date,
        author,
        content,
        isMedia
      };
      messages.push(currentMessage);
    } else {
      // Continuation of previous message
      if (currentMessage) {
        currentMessage.content += '\n' + line;
      }
    }
  }

  return messages;
};