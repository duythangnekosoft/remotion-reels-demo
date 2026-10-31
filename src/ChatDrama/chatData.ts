export interface ChatMessage {
  id: number;
  sender: "incoming" | "outgoing";
  senderName: string;
  text: string;
  audioFile: string;
  typingStart: number;
  messageStart: number;
  duration: number; // approximate duration in frames for audio
}

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    sender: "incoming",
    senderName: "Mother-in-law 🐍",
    text: "Hey! You need to drop off the spare keys to your new house tonight.",
    audioFile: "audio/chat1.wav",
    typingStart: 20,
    messageStart: 50,
    duration: 80,
  },
  {
    id: 2,
    sender: "outgoing",
    senderName: "Me",
    text: "Excuse me? Why would you need keys to our private home?",
    audioFile: "audio/chat2.wav",
    typingStart: 150,
    messageStart: 180,
    duration: 75,
  },
  {
    id: 3,
    sender: "incoming",
    senderName: "Mother-in-law 🐍",
    text: "Because my son lives there, and as his mother, I have every right to inspect the property whenever I please.",
    audioFile: "audio/chat3.wav",
    typingStart: 280,
    messageStart: 310,
    duration: 110,
  },
  {
    id: 4,
    sender: "outgoing",
    senderName: "Me",
    text: "First of all, your son doesn't own this house. My parents bought it for me, and only my name is on the deed.",
    audioFile: "audio/chat4.wav",
    typingStart: 450,
    messageStart: 480,
    duration: 120,
  },
  {
    id: 5,
    sender: "incoming",
    senderName: "Mother-in-law 🐍",
    text: "That doesn't matter! Once you marry him next month, it's half his, and you will learn to respect my authority in this family!",
    audioFile: "audio/chat5.wav",
    typingStart: 630,
    messageStart: 660,
    duration: 130,
  },
  {
    id: 6,
    sender: "outgoing",
    senderName: "Me",
    text: "Well, thanks to this text, the wedding is officially cancelled. Tell your son to pack his bags by tomorrow morning.",
    audioFile: "audio/chat6.wav",
    typingStart: 820,
    messageStart: 850,
    duration: 130,
  },
  {
    id: 7,
    sender: "incoming",
    senderName: "Mother-in-law 🐍",
    text: "Wait, what?! You cannot be serious! Answer the phone right now!!",
    audioFile: "audio/chat7.wav",
    typingStart: 1010,
    messageStart: 1040,
    duration: 100,
  },
];

