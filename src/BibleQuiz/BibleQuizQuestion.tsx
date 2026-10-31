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

interface BibleQuizQuestionProps {
  item: QuizItem;
  questionIndex: number;
  totalQuestions: number;
  episodeNumber?: number;
  timing?: QuestionTiming;
}

export const BibleQuizQuestion: React.FC<BibleQuizQuestionProps> = ({
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
    getQuizTiming("bible", episodeNumber).questions[questionIndex];
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
        <Audio src={staticFile(`audio/bible/ep${episodeNumber}_q${questionIndex + 1}.wav`)} volume={1.0} />
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

      <Sequence from={revealFrame + 10} durationInFrames={20}>
        <Audio src={staticFile("audio/pop.wav")} volume={0.6} />
      </Sequence>

      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, #d97706, #fbbf24)",
            padding: "14px 28px",
            borderRadius: 40,
            color: "#000000",
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 2,
            boxShadow: "0 0 25px rgba(251, 191, 36, 0.5)",
          }}
        >
          {item.category}
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            padding: "14px 28px",
            borderRadius: 40,
            color: "#fbbf24",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 1,
            backdropFilter: "blur(10px)",
          }}
        >
          QUESTION {questionIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* Question Card */}
      <div
        style={{
          width: "100%",
          background: "rgba(28, 20, 10, 0.85)",
          border: "2px solid rgba(251, 191, 36, 0.4)",
          borderRadius: 36,
          padding: "50px 45px",
          boxSizing: "border-box",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.7), inset 0 0 30px rgba(217, 119, 6, 0.15)",
          backdropFilter: "blur(20px)",
          transform: `scale(${questionSpring}) translateY(${(1 - questionSpring) * 60}px)`,
          opacity: questionSpring,
          marginBottom: 45,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 4,
            background:
              "linear-gradient(90deg, transparent, #fbbf24, transparent)",
          }}
        />

        <div
          style={{
            color: "#d97706",
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Holy Scripture Test #{questionIndex + 1}
        </div>

        <h1
          style={{
            color: "#ffffff",
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.25,
            margin: 0,
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {item.question}
        </h1>
      </div>

      {/* Countdown Progress Section */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 45,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginBottom: 16,
            padding: "0 10px",
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              color: "#fef3c7",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            ⏳ {isRevealed ? "REVEALED!" : "CHOOSE YOUR ANSWER (10s)"}
          </span>

          <span
            style={{
              color: isRevealed
                ? "#10b981"
                : secondsLeft <= 2
                ? "#ef4444"
                : "#fbbf24",
              fontSize: 34,
              fontWeight: 900,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {isRevealed ? "CORRECT" : `${secondsLeft}s`}
          </span>
        </div>

        {/* Progress Bar Track */}
        <div
          style={{
            width: "100%",
            height: 18,
            background: "rgba(255, 255, 255, 0.12)",
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid rgba(251, 191, 36, 0.3)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${timerProgress * 100}%`,
              background:
                secondsLeft <= 2 && !isRevealed
                  ? "linear-gradient(90deg, #f97316, #ef4444)"
                  : "linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)",
              borderRadius: 20,
              boxShadow: "0 0 15px rgba(251, 191, 36, 0.8)",
            }}
          />
        </div>
      </div>

      {/* 4 Answer Options */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          marginBottom: 35,
        }}
      >
        {item.options.map((option, idx) => {
          const optionSpring = spring({
            frame: frame - (15 + idx * 6),
            fps,
            config: { damping: 13, stiffness: 130 },
          });

          const isCorrect = option.key === item.correctKey;

          let bg = "rgba(32, 24, 15, 0.8)";
          let border = "2px solid rgba(251, 191, 36, 0.25)";
          let shadow = "0 8px 24px rgba(0,0,0,0.3)";
          let badgeBg = "rgba(251, 191, 36, 0.15)";
          let badgeColor = "#fbbf24";
          let scale = 1;
          let opacity = 1;

          if (isRevealed) {
            if (isCorrect) {
              bg = "linear-gradient(95deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))";
              border = "3px solid #34d399";
              shadow = "0 0 40px rgba(16, 185, 129, 0.7), 0 10px 30px rgba(0,0,0,0.4)";
              badgeBg = "#ffffff";
              badgeColor = "#059669";
              scale = 1 + revealSpring * 0.05;
            } else {
              opacity = 0.4;
              border = "2px solid rgba(239, 68, 68, 0.35)";
              bg = "rgba(20, 15, 12, 0.6)";
            }
          }

          return (
            <div
              key={option.key}
              style={{
                width: "100%",
                background: bg,
                border,
                borderRadius: 26,
                padding: "24px 30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
                boxShadow: shadow,
                transform: `scale(${optionSpring * scale}) translateY(${(1 - optionSpring) * 40}px)`,
                opacity: optionSpring * opacity,
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    background: badgeBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: badgeColor,
                    fontSize: 28,
                    fontWeight: 900,
                  }}
                >
                  {option.key}
                </div>

                <span
                  style={{
                    color: "#ffffff",
                    fontSize: 34,
                    fontWeight: 700,
                  }}
                >
                  {option.text}
                </span>
              </div>

              {isRevealed && isCorrect && (
                <div
                  style={{
                    background: "#ffffff",
                    color: "#059669",
                    borderRadius: "50%",
                    width: 46,
                    height: 46,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 900,
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fun Fact / Scripture Verse Popover */}
      {isRevealed && (
        <div
          style={{
            width: "100%",
            background: "linear-gradient(135deg, rgba(38, 25, 12, 0.95), rgba(18, 12, 6, 0.95))",
            border: "2px solid #fbbf24",
            borderRadius: 24,
            padding: "24px 30px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 25px rgba(251, 191, 36, 0.3)",
            transform: `translateY(${(1 - funFactSpring) * 50}px)`,
            opacity: funFactSpring,
          }}
        >
          <div style={{ fontSize: 36 }}>📜</div>
          <div>
            <div
              style={{
                color: "#fbbf24",
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Biblical Fact
            </div>
            <div
              style={{
                color: "#fef3c7",
                fontSize: 24,
                fontWeight: 600,
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

