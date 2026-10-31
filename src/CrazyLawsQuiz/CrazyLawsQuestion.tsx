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

interface CrazyLawsQuestionProps {
  item: QuizItem;
  questionIndex: number;
  totalQuestions: number;
  episodeNumber?: number;
  timing?: QuestionTiming;
}

export const CrazyLawsQuestion: React.FC<CrazyLawsQuestionProps> = ({
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
    getQuizTiming("laws", episodeNumber).questions[questionIndex];
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
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Audio Layer */}
      <Sequence from={0} durationInFrames={15}>
        <Audio src={staticFile("audio/whoosh.wav")} volume={0.6} />
      </Sequence>

      <Sequence from={6} durationInFrames={audioFrames + 2}>
        <Audio src={staticFile(`audio/laws/ep${episodeNumber}_q${questionIndex + 1}.wav`)} volume={1.0} />
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

      {/* Progress & Category Banner */}
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
            background: "linear-gradient(90deg, #d97706 0%, #b45309 100%)",
            color: "#ffffff",
            padding: "10px 24px",
            borderRadius: 8,
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
            boxShadow: "0 4px 15px rgba(217, 119, 6, 0.4)",
            border: "1px solid rgba(251, 191, 36, 0.5)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>⚖️</span>
          <span>{item.category}</span>
        </div>

        <div
          style={{
            background: "rgba(251, 191, 36, 0.12)",
            border: "2px solid #fbbf24",
            color: "#fbbf24",
            padding: "8px 24px",
            borderRadius: 8,
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 1,
            boxShadow: "0 0 15px rgba(251, 191, 36, 0.2)",
          }}
        >
          CASE FILE {questionIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* Legal Question Box */}
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          background: "rgba(15, 23, 42, 0.88)",
          border: "2px solid rgba(251, 191, 36, 0.35)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset 0 0 25px rgba(251, 191, 36, 0.08)",
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
            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            letterSpacing: "-0.5px",
          }}
        >
          {item.question}
        </h2>
      </div>

      {/* 10s Timer Bar */}
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
        {/* Seconds Badge */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            background:
              secondsLeft <= 3
                ? "linear-gradient(135deg, #ef4444, #991b1b)"
                : "linear-gradient(135deg, #d97706, #78350f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: 34,
            boxShadow:
              secondsLeft <= 3
                ? "0 0 25px rgba(239, 68, 68, 0.8)"
                : "0 0 25px rgba(217, 119, 6, 0.6)",
            transform: secondsLeft <= 3 ? `scale(${1 + Math.sin(frame * 0.8) * 0.08})` : "scale(1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          {secondsLeft}s
        </div>

        {/* Progress Track */}
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
          <div
            style={{
              width: `${timerProgress * 100}%`,
              height: "100%",
              borderRadius: 8,
              background:
                secondsLeft <= 3
                  ? "linear-gradient(90deg, #f97316, #ef4444)"
                  : "linear-gradient(90deg, #fbbf24, #f59e0b)",
              boxShadow:
                secondsLeft <= 3
                  ? "0 0 15px #ef4444"
                  : "0 0 15px #fbbf24",
              transition: "width 0.1s linear",
            }}
          />
        </div>
      </div>

      {/* Options Grid */}
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
          let optBg = "rgba(15, 23, 42, 0.75)";
          let optBorder = "2px solid rgba(255, 255, 255, 0.12)";
          let optColor = "#ffffff";
          let optGlow = "none";
          let optScale = 1;

          if (isRevealed) {
            if (isCorrect) {
              optBg = "linear-gradient(90deg, rgba(34, 197, 94, 0.25) 0%, rgba(16, 185, 129, 0.2) 100%)";
              optBorder = "3px solid #22c55e";
              optColor = "#ffffff";
              optGlow = "0 0 35px rgba(34, 197, 94, 0.5), inset 0 0 20px rgba(34, 197, 94, 0.2)";
              optScale = interpolate(revealSpring, [0, 1], [0.95, 1.04]);
            } else {
              optBg = "rgba(15, 23, 42, 0.3)";
              optBorder = "1px solid rgba(255, 255, 255, 0.06)";
              optColor = "rgba(255, 255, 255, 0.3)";
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
                  background: isRevealed && isCorrect ? "#22c55e" : "rgba(255, 255, 255, 0.1)",
                  color: isRevealed && isCorrect ? "#000000" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 900,
                  marginRight: 24,
                  border: isRevealed && isCorrect ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: isRevealed && isCorrect ? "0 0 20px #22c55e" : "none",
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

              {/* Checkmark */}
              {isRevealed && isCorrect && (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#22c55e",
                    color: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 900,
                    boxShadow: "0 0 20px #22c55e",
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

      {/* Legal Fact Reveal Card */}
      {isRevealed && (
        <div
          style={{
            width: "100%",
            maxWidth: 960,
            background: "linear-gradient(135deg, rgba(217, 119, 6, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "2px solid #fbbf24",
            borderRadius: 20,
            padding: "24px 30px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 25px rgba(251, 191, 36, 0.3)",
            opacity: funFactSpring,
            transform: `translateY(${(1 - funFactSpring) * 30}px)`,
          }}
        >
          <div style={{ fontSize: 40 }}>📜</div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#fbbf24",
                fontSize: 20,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginBottom: 6,
              }}
            >
              STATE STATUTE ARCHIVE
            </div>
            <div
              style={{
                color: "#f8fafc",
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

