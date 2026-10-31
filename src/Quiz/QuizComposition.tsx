import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { QuizQuestion } from "./QuizQuestion";
import { GEOGRAPHY_EPISODES } from "../data/geographyEpisodes";
import { getQuizTiming } from "../data/timelineUtils";

export const QuizComposition: React.FC<{ episode?: number }> = ({
  episode = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentEpisode =
    GEOGRAPHY_EPISODES.find((e) => e.episodeNumber === episode) || GEOGRAPHY_EPISODES[0];
  const questions = currentEpisode.questions;
  const timing = getQuizTiming("geography", episode);

  // Subtle animated background gradient pulse based on total duration
  const bgHue = interpolate(frame, [0, timing.totalDuration], [225, 260]);

  // Outro spring animation
  const outroSpring = spring({
    frame: frame - timing.outroStart,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 25%, hsl(${bgHue}, 60%, 15%), #070913 90%)`,
        overflow: "hidden",
      }}
    >
      
      {/* Background Music Loop */}
      <Audio src={staticFile("audio/bgm_loop.wav")} loop volume={0.16} />
      {/* Ambient background glowing orbs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
          transform: `translateY(${Math.sin(frame / 30) * 40}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          right: "-10%",
          width: "800px",
          height: "800px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
          transform: `translateY(${Math.cos(frame / 35) * 50}px)`,
        }}
      />

      {/* Top Banner Hook (Always visible) */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 50,
        }}
      >
        <div
          style={{
            background: "rgba(0, 0, 0, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            padding: "12px 32px",
            borderRadius: 50,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
          }}
        >
          <span style={{ fontSize: 24 }}>🇺🇸</span>
          <span
            style={{
              color: "#f8fafc",
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {currentEpisode.title} • {currentEpisode.theme}
          </span>
        </div>
      </div>

      {/* Questions Sequence with dynamic timing based on real WAV length */}
      {questions.map((item, index) => {
        const qTiming = timing.questions[index];
        return (
          <Sequence
            key={item.id}
            from={qTiming.startFrame}
            durationInFrames={qTiming.totalFrames}
          >
            <QuizQuestion
              item={item}
              questionIndex={index}
              totalQuestions={questions.length}
              episodeNumber={episode}
              timing={qTiming}
            />
          </Sequence>
        );
      })}

      {/* Outro Screen: Plays full outro audio and stays visible */}
      <Sequence from={timing.outroStart} durationInFrames={timing.outroDuration}>
        {/* Outro Sound Effects */}
        <Audio src={staticFile("audio/celebrate.wav")} volume={0.85} />
        <Sequence from={12} durationInFrames={timing.outroAudioFrames + 5}>
          <Audio src={staticFile(`audio/geography/ep${episode}_outro.wav`)} volume={1.0} />
        </Sequence>

        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            boxSizing: "border-box",
            background: "rgba(7, 9, 19, 0.95)",
            backdropFilter: "blur(30px)",
            transform: `scale(${outroSpring})`,
            opacity: outroSpring,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 100, marginBottom: 20 }}>🏆</div>

          <h2
            style={{
              color: "#38bdf8",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
              margin: "0 0 16px 0",
            }}
          >
            Challenge Completed!
          </h2>

          <h1
            style={{
              color: "#ffffff",
              fontSize: 68,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.15,
              margin: "0 0 30px 0",
              textShadow: "0 0 40px rgba(56, 189, 248, 0.5)",
            }}
          >
            DID YOU GET <br />
            <span
              style={{
                background: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              5 OUT OF 5?
            </span>
          </h1>

          <div
            style={{
              width: "100%",
              maxWidth: 750,
              background: "rgba(30, 41, 59, 0.7)",
              border: "2px solid rgba(255, 255, 255, 0.15)",
              borderRadius: 30,
              padding: "40px",
              boxSizing: "border-box",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              marginBottom: 40,
            }}
          >
            <p
              style={{
                color: "#e2e8f0",
                fontSize: 34,
                fontWeight: 700,
                lineHeight: 1.4,
                margin: 0,
              }}
            >
              👇 Drop your score in the comments below!
            </p>
            <p
              style={{
                color: "#94a3b8",
                fontSize: 26,
                fontWeight: 500,
                margin: "16px 0 0 0",
              }}
            >
              Tag a friend to test their US geography knowledge 🇺🇸
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
              color: "#ffffff",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 2,
              padding: "20px 48px",
              borderRadius: 50,
              boxShadow: "0 0 35px rgba(236, 72, 153, 0.5)",
            }}
          >
            FOLLOW FOR DAILY QUIZZES 🔥
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

