import React from "react";
import {
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { QuizItem } from "../types";
import { getQuizTiming, QuestionTiming } from "../data/timelineUtils";

interface NostalgiaQuizQuestionProps {
  item: QuizItem;
  questionIndex: number;
  totalQuestions: number;
  episodeNumber?: number;
  timing?: QuestionTiming;
}

export const NostalgiaQuizQuestion: React.FC<NostalgiaQuizQuestionProps> = ({
  item,
  questionIndex,
  totalQuestions,
  episodeNumber = 1,
  timing,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dynamic timing computed from real WAV duration
  const qTiming =
    timing ||
    getQuizTiming("nostalgia", episodeNumber).questions[questionIndex];
  const { countdownStart, countdownEnd, revealFrame, audioFrames } = qTiming;

  const questionSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const timerProgress = interpolate(
    frame,
    [countdownStart, countdownEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const secondsLeft = Math.max(
    0,
    Math.ceil((countdownEnd - Math.max(countdownStart, frame)) / fps)
  );

  const isRevealed = frame >= revealFrame;

  const revealSpring = spring({
    frame: frame - revealFrame,
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  const funFactSpring = spring({
    frame: frame - (revealFrame + 10),
    fps,
    config: { damping: 13, stiffness: 110 },
  });

  // 10 ticks for the 10-second countdown (1 per second)
  const tickFrames = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270].map(
    (offset) => countdownStart + offset
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "120px 60px 80px 60px",
        boxSizing: "border-box",
        position: "relative",
        fontFamily:
          "'Montserrat', 'Arial Black', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Audio Layer */}
      <Sequence from={0} durationInFrames={15}>
        <Audio src={staticFile("audio/whoosh.wav")} volume={0.6} />
      </Sequence>

      <Sequence from={6} durationInFrames={audioFrames + 2}>
        <Audio src={staticFile(`audio/nostalgia/ep${episodeNumber}_q${questionIndex + 1}.wav`)} volume={1.0} />
      </Sequence>

      {/* 10-Second Ticking Clock tension */}
      {tickFrames.map((tickFrame, i) => (
        <Sequence key={tickFrame} from={tickFrame} durationInFrames={6}>
          <Audio
            src={staticFile("audio/tick.wav")}
            volume={0.35 + i * 0.05}
          />
        </Sequence>
      ))}

      <Sequence from={revealFrame} durationInFrames={60}>
        <Audio src={staticFile("audio/ding.wav")} volume={0.9} />
      </Sequence>

      {/* Progress & Category Pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 960,
          marginBottom: 35,
          opacity: questionSpring,
          transform: `translateY(${(1 - questionSpring) * -30}px)`,
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, #ff007f 0%, #aa00ff 100%)",
            color: "#ffffff",
            padding: "10px 24px",
            borderRadius: 8,
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
            boxShadow: "0 0 20px rgba(255, 0, 127, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
          }}
        >
          {item.category}
        </div>

        <div
          style={{
            background: "rgba(0, 240, 255, 0.15)",
            border: "2px solid #00f0ff",
            color: "#00f0ff",
            padding: "8px 24px",
            borderRadius: 8,
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 1,
            boxShadow: "0 0 15px rgba(0, 240, 255, 0.4)",
          }}
        >
          QUESTION {questionIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* Retro Question Box */}
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          background: "rgba(13, 2, 33, 0.85)",
          border: "2px solid rgba(0, 240, 255, 0.4)",
          boxShadow: "0 0 35px rgba(255, 0, 127, 0.25), inset 0 0 20px rgba(0, 240, 255, 0.15)",
          borderRadius: 24,
          padding: "45px 40px",
          textAlign: "center",
          marginBottom: 40,
          backdropFilter: "blur(16px)",
          opacity: questionSpring,
          transform: `scale(${interpolate(questionSpring, [0, 1], [0.92, 1])})`,
        }}
      >
        <h2
          style={{
            color: "#ffffff",
            fontSize: 44,
            fontWeight: 900,
            lineHeight: 1.28,
            margin: 0,
            textShadow: "0 0 20px rgba(0, 240, 255, 0.5), 0 4px 10px rgba(0,0,0,0.8)",
            letterSpacing: "-0.5px",
          }}
        >
          {item.question}
        </h2>
      </div>

      {/* 10s Retro Timer Arc Bar */}
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 40,
        }}
      >
        {/* Countdown Badge */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background:
              secondsLeft <= 3
                ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                : "linear-gradient(135deg, #00f0ff, #0077ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: 34,
            boxShadow:
              secondsLeft <= 3
                ? "0 0 25px rgba(239, 68, 68, 0.8)"
                : "0 0 25px rgba(0, 240, 255, 0.6)",
            transform: secondsLeft <= 3 ? `scale(${1 + Math.sin(frame * 0.8) * 0.08})` : "scale(1)",
          }}
        >
          {secondsLeft}s
        </div>

        {/* Outer Bar */}
        <div
          style={{
            flex: 1,
            height: 22,
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: 12,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            overflow: "hidden",
            padding: 3,
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.6)",
          }}
        >
          {/* Inner Fill */}
          <div
            style={{
              width: `${timerProgress * 100}%`,
              height: "100%",
              borderRadius: 8,
              background:
                secondsLeft <= 3
                  ? "linear-gradient(90deg, #ff007f, #ef4444)"
                  : "linear-gradient(90deg, #00f0ff, #ffe600)",
              boxShadow:
                secondsLeft <= 3
                  ? "0 0 15px #ef4444"
                  : "0 0 15px #00f0ff",
              transition: "width 0.1s linear",
            }}
          />
        </div>
      </div>

      {/* Options List */}
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginBottom: 35,
        }}
      >
        {item.options.map((opt, idx) => {
          const optSpring = spring({
            frame: frame - idx * 6,
            fps,
            config: { damping: 14, stiffness: 130 },
          });

          const isCorrect = opt.key === item.correctKey;
          let optBg = "rgba(13, 2, 33, 0.75)";
          let optBorder = "2px solid rgba(255, 255, 255, 0.15)";
          let optColor = "#ffffff";
          let optGlow = "none";
          let optScale = 1;

          if (isRevealed) {
            if (isCorrect) {
              optBg = "linear-gradient(90deg, rgba(57, 255, 20, 0.25) 0%, rgba(0, 240, 255, 0.2) 100%)";
              optBorder = "3px solid #39ff14";
              optColor = "#ffffff";
              optGlow = "0 0 35px rgba(57, 255, 20, 0.6), inset 0 0 20px rgba(57, 255, 20, 0.25)";
              optScale = interpolate(revealSpring, [0, 1], [0.95, 1.04]);
            } else {
              optBg = "rgba(10, 5, 20, 0.35)";
              optBorder = "1px solid rgba(255, 255, 255, 0.08)";
              optColor = "rgba(255, 255, 255, 0.35)";
              optScale = 0.98;
            }
          }

          return (
            <div
              key={opt.key}
              style={{
                width: "100%",
                background: optBg,
                border: optBorder,
                borderRadius: 20,
                padding: "24px 30px",
                display: "flex",
                alignItems: "center",
                boxSizing: "border-box",
                boxShadow: optGlow,
                opacity: optSpring,
                transform: `translateX(${(1 - optSpring) * -40}px) scale(${optScale})`,
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Option Key Badge */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: isRevealed && isCorrect ? "#39ff14" : "rgba(255, 255, 255, 0.1)",
                  color: isRevealed && isCorrect ? "#000000" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 900,
                  marginRight: 24,
                  border: isRevealed && isCorrect ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: isRevealed && isCorrect ? "0 0 20px #39ff14" : "none",
                }}
              >
                {opt.key}
              </div>

              {/* Option Text */}
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  color: optColor,
                  flex: 1,
                  letterSpacing: "0.2px",
                }}
              >
                {opt.text}
              </div>

              {/* Correct Check Icon */}
              {isRevealed && isCorrect && (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#39ff14",
                    color: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 900,
                    boxShadow: "0 0 20px #39ff14",
                    transform: `scale(${revealSpring})`,
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Memory Fact Reveal Card */}
      {isRevealed && (
        <div
          style={{
            width: "100%",
            maxWidth: 960,
            background: "linear-gradient(135deg, rgba(255, 0, 127, 0.2) 0%, rgba(0, 240, 255, 0.2) 100%)",
            border: "2px solid #00f0ff",
            borderRadius: 20,
            padding: "24px 30px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 0 30px rgba(0, 240, 255, 0.35)",
            opacity: funFactSpring,
            transform: `translateY(${(1 - funFactSpring) * 30}px)`,
          }}
        >
          <div style={{ fontSize: 40 }}>📼</div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#ffe600",
                fontSize: 20,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 6,
                textShadow: "0 0 10px rgba(255, 230, 0, 0.6)",
              }}
            >
              RETRO MEMORY UNLOCKED
            </div>
            <div
              style={{
                color: "#ffffff",
                fontSize: 26,
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              {item.funFact}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

