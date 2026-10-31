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
import { NostalgiaQuizQuestion } from "./NostalgiaQuizQuestion";
import { NOSTALGIA_EPISODES } from "../data/nostalgiaEpisodes";
import { getQuizTiming } from "../data/timelineUtils";

export const NostalgiaQuizComposition: React.FC<{ episode?: number }> = ({
  episode = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentEpisode =
    NOSTALGIA_EPISODES.find((e) => e.episodeNumber === episode) || NOSTALGIA_EPISODES[0];
  const questions = currentEpisode.questions;
  const timing = getQuizTiming("nostalgia", episode);

  const outroSpring = spring({
    frame: frame - timing.outroStart,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #090014 0%, #17002b 45%, #2a0845 75%, #0f051d 100%)",
        overflow: "hidden",
      }}
    >
      
      {/* Background Music Loop */}
      <Audio src={staticFile("audio/bgm_loop.wav")} loop volume={0.16} />

      {/* Retro Synthwave Sun */}
      <div
        style={{
          position: "absolute",
          top: "14%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "linear-gradient(180deg, #ff007f 0%, #ffe600 100%)",
          boxShadow: "0 0 100px rgba(255, 0, 127, 0.7)",
          opacity: 0.35,
          filter: "blur(20px)",
        }}
      />

      {/* Perspective Wireframe Grid at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "35%",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0, 240, 255, 0.08) 100%), " +
            "repeating-linear-gradient(0deg, rgba(0, 240, 255, 0.25) 0px, rgba(0, 240, 255, 0.25) 2px, transparent 2px, transparent 40px), " +
            "repeating-linear-gradient(90deg, rgba(255, 0, 127, 0.25) 0px, rgba(255, 0, 127, 0.25) 2px, transparent 2px, transparent 60px)",
          transform: "perspective(400px) rotateX(60deg)",
          transformOrigin: "bottom",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 100%)",
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
            background: "rgba(13, 2, 33, 0.8)",
            border: "1px solid rgba(0, 240, 255, 0.5)",
            backdropFilter: "blur(12px)",
            padding: "12px 36px",
            borderRadius: 50,
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 0 25px rgba(0, 240, 255, 0.4)",
          }}
        >
          <span style={{ fontSize: 26 }}>📼</span>
          <span
            style={{
              color: "#00f0ff",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 2.5,
              textTransform: "uppercase",
              textShadow: "0 0 10px rgba(0, 240, 255, 0.7)",
            }}
          >
            {currentEpisode.title} • {currentEpisode.theme}
          </span>
          <span style={{ fontSize: 26 }}>🕹️</span>
        </div>
      </div>

      {/* Question Sequences with dynamic timing based on real WAV length */}
      {questions.map((item, index) => {
        const qTiming = timing.questions[index];
        return (
          <Sequence
            key={item.id}
            from={qTiming.startFrame}
            durationInFrames={qTiming.totalFrames}
          >
            <NostalgiaQuizQuestion
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
            <Audio src={staticFile(`audio/nostalgia/ep${episode}_outro.wav`)} volume={1.0} />
          </Sequence>
          <Audio src={staticFile("audio/celebrate.wav")} volume={0.8} />

          <AbsoluteFill
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(9, 0, 20, 0.94)",
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
                filter: "drop-shadow(0 0 25px #ffe600)",
                transform: `rotate(${Math.sin(frame / 10) * 8}deg)`,
              }}
            >
              🕹️✨
            </div>

            <div
              style={{
                color: "#ff007f",
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: 4,
                textTransform: "uppercase",
                marginBottom: 16,
                textShadow: "0 0 20px rgba(255, 0, 127, 0.8)",
              }}
            >
              LEVEL COMPLETED!
            </div>

            <h1
              style={{
                color: "#ffffff",
                fontSize: 64,
                fontWeight: 900,
                textAlign: "center",
                lineHeight: 1.2,
                margin: "0 0 24px 0",
                textShadow: "0 0 30px rgba(0, 240, 255, 0.8)",
              }}
            >
              What Was Your Score
              <br />
              <span style={{ color: "#00f0ff" }}>Out of 5?</span>
            </h1>

            <p
              style={{
                color: "#f0abfc",
                fontSize: 34,
                textAlign: "center",
                maxWidth: 800,
                lineHeight: 1.4,
                margin: "0 0 45px 0",
                fontWeight: 700,
              }}
            >
              Only true 80s & 90s kids remember all of these! Drop your score in the comments! 👇
            </p>

            <div
              style={{
                background: "linear-gradient(90deg, #ff007f 0%, #00f0ff 100%)",
                color: "#ffffff",
                padding: "22px 55px",
                borderRadius: 50,
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: 2,
                boxShadow: "0 0 40px rgba(255, 0, 127, 0.8)",
                border: "2px solid rgba(255, 255, 255, 0.8)",
                textTransform: "uppercase",
              }}
            >
              Follow For Daily Retro Reels 🔥
            </div>
          </AbsoluteFill>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

