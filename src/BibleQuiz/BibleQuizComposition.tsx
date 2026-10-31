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
import { BibleQuizQuestion } from "./BibleQuizQuestion";
import { BIBLE_EPISODES } from "../data/bibleEpisodes";
import { getQuizTiming } from "../data/timelineUtils";

export const BibleQuizComposition: React.FC<{ episode?: number }> = ({
  episode = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentEpisode =
    BIBLE_EPISODES.find((e) => e.episodeNumber === episode) || BIBLE_EPISODES[0];
  const questions = currentEpisode.questions;
  const timing = getQuizTiming("bible", episode);

  const bgHue = interpolate(frame, [0, timing.totalDuration], [30, 45]);

  const outroSpring = spring({
    frame: frame - timing.outroStart,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 25%, hsl(${bgHue}, 50%, 12%), #090603 90%)`,
        overflow: "hidden",
      }}
    >
      
      {/* Background Music Loop */}
      <Audio src={staticFile("audio/bgm_loop.wav")} loop volume={0.15} />

      {/* Ancient golden background glowing orbs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, transparent 70%)",
          filter: "blur(70px)",
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
            "radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
          transform: `translateY(${Math.cos(frame / 35) * 50}px)`,
        }}
      />

      {/* Top Banner Hook */}
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
            background: "rgba(18, 12, 6, 0.75)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            backdropFilter: "blur(12px)",
            padding: "12px 32px",
            borderRadius: 50,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{ fontSize: 24 }}>✝️</span>
          <span
            style={{
              color: "#fef3c7",
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
            <BibleQuizQuestion
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
        <Audio src={staticFile("audio/celebrate.wav")} volume={0.85} />
        <Sequence from={12} durationInFrames={timing.outroAudioFrames + 5}>
          <Audio src={staticFile(`audio/bible/ep${episode}_outro.wav`)} volume={1.0} />
        </Sequence>

        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 60px",
            boxSizing: "border-box",
            background: "rgba(12, 8, 4, 0.95)",
            backdropFilter: "blur(30px)",
            transform: `scale(${outroSpring})`,
            opacity: outroSpring,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 100, marginBottom: 20 }}>🕊️</div>

          <h2
            style={{
              color: "#fbbf24",
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
              textShadow: "0 0 40px rgba(251, 191, 36, 0.5)",
            }}
          >
            CAN YOU SCORE <br />
            <span
              style={{
                background: "linear-gradient(90deg, #f59e0b, #fbbf24, #fde047)",
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
              background: "rgba(35, 25, 15, 0.8)",
              border: "2px solid rgba(251, 191, 36, 0.3)",
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
                color: "#fef3c7",
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
                color: "#d97706",
                fontSize: 26,
                fontWeight: 600,
                margin: "16px 0 0 0",
              }}
            >
              Share with your family & friends to test their Bible knowledge ✝️
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(90deg, #d97706, #f59e0b)",
              color: "#000000",
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: 2,
              padding: "20px 48px",
              borderRadius: 50,
              boxShadow: "0 0 35px rgba(245, 158, 11, 0.6)",
            }}
          >
            FOLLOW FOR DAILY SCRIPTURE 🔥
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

