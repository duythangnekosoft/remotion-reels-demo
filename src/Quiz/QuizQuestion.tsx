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

interface QuizQuestionProps {
  item: QuizItem;
  questionIndex: number;
  totalQuestions: number;
  episodeNumber?: number;
  timing?: QuestionTiming;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
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
    getQuizTiming("geography", episodeNumber).questions[questionIndex];
  const { countdownStart, countdownEnd, revealFrame, audioFrames } = qTiming;

  // Question Card Entrance Spring
  const questionSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Countdown timer progress (1 -> 0)
  const timerProgress = interpolate(
    frame,
    [countdownStart, countdownEnd],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Time left in seconds (e.g., 10, 9, ..., 0)
  const secondsLeft = Math.max(
    0,
    Math.ceil((countdownEnd - Math.max(countdownStart, frame)) / fps)
  );

  const isRevealed = frame >= revealFrame;

  // Reveal Pop Animation for the correct answer
  const revealSpring = spring({
    frame: frame - revealFrame,
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  // Fun fact slide up
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
      {/* Sound Effects & Voiceover for this Question */}
      <Sequence from={0} durationInFrames={15}>
        <Audio src={staticFile("audio/whoosh.wav")} volume={0.6} />
      </Sequence>

      <Sequence from={6} durationInFrames={audioFrames + 2}>
        <Audio src={staticFile(`audio/geography/ep${episodeNumber}_q${questionIndex + 1}.wav`)} volume={1.0} />
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

      {/* Top Tag & Progress */}
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
            background: "linear-gradient(90deg, #ff007a, #7928ca)",
            padding: "14px 28px",
            borderRadius: 40,
            color: "#ffffff",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 2,
            boxShadow: "0 0 25px rgba(255, 0, 122, 0.4)",
          }}
        >
          {item.category}
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.12)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            padding: "14px 28px",
            borderRadius: 40,
            color: "#ffffff",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 1,
            backdropFilter: "blur(10px)",
          }}
        >
          QUESTION {questionIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* Main Question Box */}
      <div
        style={{
          width: "100%",
          background: "rgba(18, 22, 40, 0.85)",
          border: "2px solid rgba(120, 140, 255, 0.3)",
          borderRadius: 36,
          padding: "50px 45px",
          boxSizing: "border-box",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(99, 102, 241, 0.15)",
          backdropFilter: "blur(20px)",
          transform: `scale(${questionSpring}) translateY(${(1 - questionSpring) * 60}px)`,
          opacity: questionSpring,
          marginBottom: 45,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: 4,
            background:
              "linear-gradient(90deg, transparent, #38bdf8, transparent)",
          }}
        />

        <div
          style={{
            color: "#94a3b8",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Challenge #{questionIndex + 1}
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
              color: "#e2e8f0",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            ⏱️ {isRevealed ? "TIME IS UP!" : "LOCK IN YOUR ANSWER"}
          </span>

          <span
            style={{
              color: isRevealed
                ? "#10b981"
                : secondsLeft <= 1
                ? "#ef4444"
                : "#38bdf8",
              fontSize: 32,
              fontWeight: 900,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {isRevealed ? "ANSWER" : `${secondsLeft}s`}
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
            border: "1px solid rgba(255, 255, 255, 0.15)",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${timerProgress * 100}%`,
              background:
                secondsLeft <= 1 && !isRevealed
                  ? "linear-gradient(90deg, #f97316, #ef4444)"
                  : "linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)",
              borderRadius: 20,
              boxShadow: "0 0 15px rgba(59, 130, 246, 0.8)",
              transition: "background 0.2s",
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
          // Staggered option entrance
          const optionSpring = spring({
            frame: frame - (15 + idx * 6),
            fps,
            config: { damping: 13, stiffness: 130 },
          });

          const isCorrect = option.key === item.correctKey;

          // Background, border, and glow logic on reveal
          let bg = "rgba(25, 30, 56, 0.8)";
          let border = "2px solid rgba(255, 255, 255, 0.15)";
          let shadow = "0 8px 24px rgba(0,0,0,0.3)";
          let badgeBg = "rgba(255, 255, 255, 0.15)";
          let badgeColor = "#ffffff";
          let scale = 1;
          let opacity = 1;

          if (isRevealed) {
            if (isCorrect) {
              bg = "linear-gradient(95deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))";
              border = "3px solid #34d399";
              shadow = "0 0 40px rgba(16, 185, 129, 0.6), 0 10px 30px rgba(0,0,0,0.4)";
              badgeBg = "#ffffff";
              badgeColor = "#059669";
              scale = 1 + (revealSpring * 0.05); // slight pop pulse
            } else {
              opacity = 0.45;
              border = "2px solid rgba(239, 68, 68, 0.4)";
              bg = "rgba(20, 20, 35, 0.6)";
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
                {/* Option Letter Badge */}
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
                    letterSpacing: 0.5,
                  }}
                >
                  {option.text}
                </span>
              </div>

              {/* Reveal Icon */}
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

      {/* Fun Fact / Explanation Popover */}
      {isRevealed && (
        <div
          style={{
            width: "100%",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))",
            border: "2px solid #38bdf8",
            borderRadius: 24,
            padding: "24px 30px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 25px rgba(56, 189, 248, 0.25)",
            transform: `translateY(${(1 - funFactSpring) * 50}px)`,
            opacity: funFactSpring,
          }}
        >
          <div style={{ fontSize: 36 }}>💡</div>
          <div>
            <div
              style={{
                color: "#38bdf8",
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Did You Know?
            </div>
            <div
              style={{
                color: "#f8fafc",
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

