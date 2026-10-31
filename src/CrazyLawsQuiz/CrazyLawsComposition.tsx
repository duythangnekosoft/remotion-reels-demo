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
import { CrazyLawsQuestion } from "./CrazyLawsQuestion";
import { CRAZY_LAWS_EPISODES } from "../data/crazyLawsEpisodes";
import { getQuizTiming } from "../data/timelineUtils";

export const CrazyLawsComposition: React.FC<{ episode?: number }> = ({
  episode = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentEpisode =
    CRAZY_LAWS_EPISODES.find((e) => e.episodeNumber === episode) || CRAZY_LAWS_EPISODES[0];
  const questions = currentEpisode.questions;
  const timing = getQuizTiming("laws", episode);

  const outroSpring = spring({
    frame: frame - timing.outroStart,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #070b12 0%, #0d1527 50%, #090e18 100%)",
        overflow: "hidden",
      }}
    >
      
      {/* Background Music Loop */}
      <Audio src={staticFile("audio/bgm_loop.wav")} loop volume={0.16} />

      {/* Amber & Police Blue Radial Glows */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217, 119, 6, 0.22) 0%, transparent 70%)",
          filter: "blur(80px)",
          transform: `translateY(${Math.sin(frame / 32) * 35}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "-15%",
          width: 750,
          height: 750,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(30, 58, 138, 0.3) 0%, transparent 70%)",
          filter: "blur(90px)",
          transform: `translateY(${Math.cos(frame / 36) * 45}px)`,
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
            background: "rgba(15, 23, 42, 0.85)",
            border: "1px solid rgba(251, 191, 36, 0.4)",
            backdropFilter: "blur(12px)",
            padding: "12px 36px",
            borderRadius: 50,
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{ fontSize: 26 }}>🇺🇸</span>
          <span
            style={{
              color: "#fbbf24",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {currentEpisode.title} • {currentEpisode.theme}
          </span>
          <span style={{ fontSize: 26 }}>⚖️</span>
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
            <CrazyLawsQuestion
              item={item}
              questionIndex={index}
              totalQuestions={questions.length}
              episodeNumber={episode}
              timing={qTiming}
            />
          </Sequence>
        );
      })}

      {/* Outro Call-To-Action (Plays full outro audio and stays visible) */}
      {frame >= timing.outroStart && (
        <Sequence from={timing.outroStart} durationInFrames={timing.outroDuration}>
          <Sequence from={12} durationInFrames={timing.outroAudioFrames + 5}>
            <Audio src={staticFile(`audio/laws/ep${episode}_outro.wav`)} volume={1.0} />
          </Sequence>
          <Audio src={staticFile("audio/celebrate.wav")} volume={0.8} />

          <AbsoluteFill
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(7, 11, 18, 0.94)",
              backdropFilter: "blur(20px)",
              padding: 60,
              zIndex: 100,
              opacity: outroSpring,
              transform: `scale(${interpolate(outroSpring, [0, 1], [0.85, 1])})`,
            }}
          >
            <div
              style={{
                fontSize: 90,
                marginBottom: 20,
                filter: "drop-shadow(0 0 25px rgba(251, 191, 36, 0.8))",
                transform: `rotate(${Math.sin(frame / 10) * 8}deg)`,
              }}
            >
              🏛️⚖️
            </div>

            <div
              style={{
                color: "#fbbf24",
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: 4,
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              INVESTIGATION CLOSED!
            </div>

            <h1
              style={{
                color: "#ffffff",
                fontSize: 64,
                fontWeight: 900,
                textAlign: "center",
                lineHeight: 1.2,
                margin: "0 0 24px 0",
              }}
            >
              Did You Know Any Of These
              <br />
              <span style={{ color: "#fbbf24" }}>Crazy State Laws?</span>
            </h1>

            <p
              style={{
                color: "#cbd5e1",
                fontSize: 34,
                textAlign: "center",
                maxWidth: 800,
                lineHeight: 1.4,
                margin: "0 0 45px 0",
                fontWeight: 600,
              }}
            >
              What was your score out of 5? Drop your home state in the comments below! 👇
            </p>

            <div
              style={{
                background: "linear-gradient(90deg, #d97706 0%, #b45309 100%)",
                color: "#ffffff",
                padding: "22px 55px",
                borderRadius: 50,
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: 2,
                boxShadow: "0 10px 30px rgba(217, 119, 6, 0.6)",
                border: "2px solid rgba(251, 191, 36, 0.6)",
                textTransform: "uppercase",
              }}
            >
              Follow For Daily US Trivia 🇺🇸
            </div>
          </AbsoluteFill>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

