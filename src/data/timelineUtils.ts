import audioDurations from "./audioDurations.json";
import { CHAT_DRAMA_EPISODES } from "./chatDramaEpisodes";

export type QuizTopic = "geography" | "bible" | "nostalgia" | "laws";

export interface QuestionTiming {
  questionIndex: number;
  audioDurationSec: number;
  audioFrames: number;
  countdownStart: number;
  countdownEnd: number;
  revealFrame: number;
  totalFrames: number;
  startFrame: number;
}

export interface QuizEpisodeTiming {
  questions: QuestionTiming[];
  outroStart: number;
  outroAudioFrames: number;
  outroDuration: number;
  totalDuration: number;
}

const FPS = 30;
const QUESTION_VO_START = 6;
const PAUSE_AFTER_VO = 10;
const COUNTDOWN_FRAMES = 300; // Exact 10.0s countdown (300 frames @ 30fps)
const REVEAL_FRAMES = 90; // Exact 3.0s answer reveal (90 frames @ 30fps)
const OUTRO_VO_START = 12;
const OUTRO_PAUSE_AFTER_VO = 45; // 1.5s visual pause after outro audio completes
const CTA_DURATION_CHAT = 210; // 7.0s CTA display

function getAudioDuration(topic: string, key: string): number {
  const value = (audioDurations as Record<string, Record<string, number>>)[topic]?.[key];
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid audio duration: ${topic}/${key}. Run npm run audio:measure after generating WAV files.`);
  }
  return value;
}

export function getQuizTiming(topic: QuizTopic, episodeNumber: number): QuizEpisodeTiming {
  const questions: QuestionTiming[] = [];
  let currentStart = 0;

  for (let q = 1; q <= 5; q++) {
    const key = `ep${episodeNumber}_q${q}`;
    const audioSec = getAudioDuration(topic, key);
    const audioFrames = Math.ceil(audioSec * FPS);
    const countdownStart = QUESTION_VO_START + audioFrames + PAUSE_AFTER_VO;
    const countdownEnd = countdownStart + COUNTDOWN_FRAMES;
    const revealFrame = countdownEnd;
    const totalFrames = revealFrame + REVEAL_FRAMES;

    questions.push({
      questionIndex: q - 1,
      audioDurationSec: audioSec,
      audioFrames,
      countdownStart,
      countdownEnd,
      revealFrame,
      totalFrames,
      startFrame: currentStart,
    });

    currentStart += totalFrames;
  }

  const outroKey = `ep${episodeNumber}_outro`;
  const outroAudioSec = getAudioDuration(topic, outroKey);
  const outroAudioFrames = Math.ceil(outroAudioSec * FPS);
  const outroDuration = OUTRO_VO_START + outroAudioFrames + OUTRO_PAUSE_AFTER_VO;
  const totalDuration = currentStart + outroDuration;

  return {
    questions,
    outroStart: currentStart,
    outroAudioFrames,
    outroDuration,
    totalDuration,
  };
}

export function getGeographyDuration(ep: number): number {
  return getQuizTiming("geography", ep).totalDuration;
}

export function getBibleDuration(ep: number): number {
  return getQuizTiming("bible", ep).totalDuration;
}

export function getNostalgiaDuration(ep: number): number {
  return getQuizTiming("nostalgia", ep).totalDuration;
}

export function getCrazyLawsDuration(ep: number): number {
  return getQuizTiming("laws", ep).totalDuration;
}

export interface ChatMessageTiming {
  id: number;
  sender: "incoming" | "outgoing";
  senderName: string;
  text: string;
  audioFile: string;
  typingStart: number;
  messageStart: number;
  duration: number; // WAV duration in frames
}

export interface ChatDramaTiming {
  messages: ChatMessageTiming[];
  ctaStartFrame: number;
  ctaDuration: number;
  totalDuration: number;
}

export function getChatDramaTiming(episodeNumber: number): ChatDramaTiming {
  const story =
    CHAT_DRAMA_EPISODES.find((e) => e.episodeNumber === episodeNumber) ||
    CHAT_DRAMA_EPISODES[0];

  let current = 25;
  const messages: ChatMessageTiming[] = story.messages.map((m) => {
    const typingStart = current;
    const messageStart = typingStart + m.typingDuration;
    const audioKey = `ep${story.episodeNumber}_m${m.id}`;
    const audioSec = getAudioDuration("chat", audioKey);
    const duration = Math.ceil(audioSec * FPS);
    current = messageStart + duration + m.pauseAfter;

    return {
      id: m.id,
      sender: m.sender,
      senderName: m.sender === "incoming" ? story.contactName : "Me",
      text: m.text,
      audioFile: `audio/chat/ep${story.episodeNumber}_m${m.id}.wav`,
      typingStart,
      messageStart,
      duration,
    };
  });

  const ctaStartFrame = current + 20; // Reasonable pause buffer after last message finished
  const ctaDuration = CTA_DURATION_CHAT;
  const totalDuration = ctaStartFrame + ctaDuration;

  return {
    messages,
    ctaStartFrame,
    ctaDuration,
    totalDuration,
  };
}

export function getChatDramaDuration(episodeNumber: number): number {
  return getChatDramaTiming(episodeNumber).totalDuration;
}


// Marble Race, Territory, Plinko, and Would You Rather durations
const MARBLE_DURATIONS: Record<number, number> = {
  1: 1209,
  2: 983,
  3: 938,
  4: 918,
  5: 1151,
};

export function getMarbleRaceDuration(episode: number): number {
  return MARBLE_DURATIONS[episode] || 1080;
}

export function getTerritoryDuration(episode: number): number {
  return 1080; // 36.0s @ 30fps
}

const PLINKO_DURATIONS: Record<number, number> = {
  1: 998,
  2: 920,
  3: 1034,
  4: 964,
  5: 994,
};

export function getPlinkoDuration(episode: number): number {
  return PLINKO_DURATIONS[episode] || 1050;
}

export function getWouldYouRatherDuration(episode: number): number {
  return 990; // 33.0s @ 30fps
}
