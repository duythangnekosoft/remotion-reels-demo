import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import ep1Data from "../data/wouldYouRather/ep1.json";
import ep2Data from "../data/wouldYouRather/ep2.json";
import ep3Data from "../data/wouldYouRather/ep3.json";
import ep4Data from "../data/wouldYouRather/ep4.json";
import ep5Data from "../data/wouldYouRather/ep5.json";

const EPISODE_MAP: Record<number, any> = {
  1: ep1Data,
  2: ep2Data,
  3: ep3Data,
  4: ep4Data,
  5: ep5Data,
};

interface WYRTheme {
  title: string;
  category: string;
  bgColor: string;
  glowA: string;
  glowB: string;
  accent: string;
}

const WYR_THEMES: Record<number, WYRTheme> = {
  1: {
    title: "SUPERPOWERS DILEMMA",
    category: "HEROES VS REALITY",
    bgColor: "#050811",
    glowA: "rgba(14, 165, 233, 0.28)",
    glowB: "rgba(236, 72, 153, 0.28)",
    accent: "#38bdf8",
  },
  2: {
    title: "WEALTH & LIFESTYLE",
    category: "BILLIONS VS CURSES",
    bgColor: "#0c0a03",
    glowA: "rgba(234, 179, 8, 0.28)",
    glowB: "rgba(16, 185, 129, 0.28)",
    accent: "#facc15",
  },
  3: {
    title: "EXTREME SURVIVAL",
    category: "LIFE OR DEATH INSTINCTS",
    bgColor: "#140505",
    glowA: "rgba(239, 68, 68, 0.28)",
    glowB: "rgba(249, 115, 22, 0.28)",
    accent: "#f87171",
  },
  4: {
    title: "FUTURE & TECHNOLOGY",
    category: "CYBER AI VS HUMANITY",
    bgColor: "#020f14",
    glowA: "rgba(6, 182, 212, 0.28)",
    glowB: "rgba(139, 92, 246, 0.28)",
    accent: "#22d3ee",
  },
  5: {
    title: "IMPOSSIBLE PARADOXES",
    category: "MIND BENDING DILEMMAS",
    bgColor: "#0c0517",
    glowA: "rgba(168, 85, 247, 0.28)",
    glowB: "rgba(244, 63, 94, 0.28)",
    accent: "#c084fc",
  },
};

export interface WouldYouRatherProps {
  episode?: number;
}

export const WouldYouRatherComposition: React.FC<WouldYouRatherProps> = ({ episode = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const theme = WYR_THEMES[episode] || WYR_THEMES[1];
  const data = EPISODE_MAP[episode] || ep1Data;
  const framesPerDilemma = data.framesPerDilemma || 330; // 11.0s @ 30fps

  // Determine which dilemma is currently active (0, 1, or 2)
  const dIndex = Math.min(2, Math.floor(frame / framesPerDilemma));
  const localFrame = frame - dIndex * framesPerDilemma;
  const localTime = localFrame / 30; // 0.0 to 11.0s

  const currentDilemma = data.dilemmas[dIndex];

  // Stage: 
  // 0.0 - 2.0s: Intro slide-in
  // 2.0 - 7.5s: Countdown timer (5 down to 1)
  // 7.5 - 11.0s: Result reveal (percentage reveal)
  const isReveal = localTime >= 7.5;
  const countdownVal = Math.max(1, Math.min(5, Math.ceil(7.5 - localTime)));

  // Spring animation for card entrances
  const introSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // Spring animation for reveal burst
  const revealSpring = spring({
    frame: Math.max(0, localFrame - 7.5 * 30),
    fps,
    config: { damping: 12, stiffness: 110 },
  });

  const { optionA, optionB, question } = currentDilemma;
  const aWins = optionA.pct >= optionB.pct;

  // Percentage rollup calculation
  const revealProgress = interpolate(localTime, [7.5, 8.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const displayedPctA = Math.round(optionA.pct * revealProgress);
  const displayedPctB = Math.round(optionB.pct * revealProgress);

  const audioSrc = staticFile(`sounds/wouldYouRather/wyr-ep${episode}.wav`);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bgColor,
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
      }}
    >
      <Audio src={audioSrc} volume={0.88} />

      {/* Cyber Background Glows */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "20%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.glowA} 0%, transparent 70%)`,
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "20%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.glowB} 0%, transparent 70%)`,
          filter: "blur(70px)",
        }}
      />

      {/* Header Banner */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 40,
          right: 40,
          background: "rgba(15, 23, 42, 0.88)",
          backdropFilter: "blur(14px)",
          borderRadius: 24,
          padding: "18px 28px",
          border: `1px solid ${theme.accent}44`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: `0 16px 36px rgba(0,0,0,0.5), 0 0 20px ${theme.accent}22`,
          zIndex: 40,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 3,
              color: theme.accent,
              textTransform: "uppercase",
            }}
          >
            {theme.category} • EP #{episode} • Q{dIndex + 1}/3
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>
            {question}
          </div>
        </div>

        {/* Progress Dots (1, 2, 3) */}
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map((idx) => (
            <div
              key={`dot-${idx}`}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background:
                  idx === dIndex
                    ? "#ffd166"
                    : idx < dIndex
                    ? "#10b981"
                    : "rgba(255, 255, 255, 0.2)",
                boxShadow:
                  idx === dIndex ? "0 0 10px rgba(255, 209, 102, 0.8)" : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Card A (Top - Option A) */}
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 40,
          right: 40,
          height: 720,
          borderRadius: 32,
          padding: 40,
          background:
            isReveal && aWins
              ? "linear-gradient(145deg, #0284c7 0%, #0369a1 100%)"
              : "linear-gradient(145deg, rgba(14, 165, 233, 0.2) 0%, rgba(3, 105, 161, 0.4) 100%)",
          border:
            isReveal && aWins
              ? "4px solid #ffd166"
              : "2px solid rgba(56, 189, 248, 0.4)",
          boxShadow:
            isReveal && aWins
              ? "0 0 40px rgba(255, 209, 102, 0.4)"
              : "0 20px 40px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: isReveal && !aWins ? 0.65 : 1,
          transform: `translateY(${interpolate(introSpring, [0, 1], [-60, 0])}px)`,
          transition: "opacity 0.3s ease, border 0.3s ease",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              padding: "8px 20px",
              background: "#0284c7",
              borderRadius: 14,
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 2,
            }}
          >
            OPTION A
          </div>
          {isReveal && aWins && (
            <div
              style={{
                padding: "8px 20px",
                background: "#ffd166",
                color: "#0f172a",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              👑 MAJORITY VOTE
            </div>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 90, marginBottom: 16 }}>{optionA.emoji}</div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              lineHeight: 1.25,
              textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            }}
          >
            {optionA.text}
          </div>
        </div>

        {/* Reveal Percentage Bar A */}
        {isReveal ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: "#e0f2fe" }}>
                VOTES:
              </span>
              <span
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  color: "#ffffff",
                  textShadow: "0 0 16px rgba(255,255,255,0.6)",
                }}
              >
                {displayedPctA}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 18,
                background: "rgba(0,0,0,0.4)",
                borderRadius: 9,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${displayedPctA}%`,
                  height: "100%",
                  background: "#38bdf8",
                  borderRadius: 9,
                }}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              fontSize: 18,
              fontWeight: 800,
              color: "#7dd3fc",
              letterSpacing: 2,
            }}
          >
            WOULD YOU CHOOSE THIS?
          </div>
        )}
      </div>

      {/* Center Divider: Countdown or VS */}
      <div
        style={{
          position: "absolute",
          top: 915,
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 50,
        }}
      >
        {!isReveal ? (
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              border: "4px solid #ffd166",
              boxShadow: "0 0 30px rgba(255, 209, 102, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 900,
              color: "#ffd166",
            }}
          >
            {countdownVal}
          </div>
        ) : (
          <div
            style={{
              padding: "12px 28px",
              background: "#0f172a",
              border: "3px solid #ffffff",
              borderRadius: 24,
              boxShadow: "0 0 30px rgba(255, 255, 255, 0.4)",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: 3,
              color: "#ffffff",
              transform: `scale(${interpolate(revealSpring, [0, 1], [0.8, 1])})`,
            }}
          >
            VS
          </div>
        )}
      </div>

      {/* Card B (Bottom - Option B) */}
      <div
        style={{
          position: "absolute",
          top: 960,
          left: 40,
          right: 40,
          height: 720,
          borderRadius: 32,
          padding: 40,
          background:
            isReveal && !aWins
              ? "linear-gradient(145deg, #db2777 0%, #be185d 100%)"
              : "linear-gradient(145deg, rgba(236, 72, 153, 0.2) 0%, rgba(190, 24, 93, 0.4) 100%)",
          border:
            isReveal && !aWins
              ? "4px solid #ffd166"
              : "2px solid rgba(244, 114, 182, 0.4)",
          boxShadow:
            isReveal && !aWins
              ? "0 0 40px rgba(255, 209, 102, 0.4)"
              : "0 20px 40px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: isReveal && aWins ? 0.65 : 1,
          transform: `translateY(${interpolate(introSpring, [0, 1], [60, 0])}px)`,
          transition: "opacity 0.3s ease, border 0.3s ease",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div
            style={{
              padding: "8px 20px",
              background: "#db2777",
              borderRadius: 14,
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 2,
            }}
          >
            OPTION B
          </div>
          {isReveal && !aWins && (
            <div
              style={{
                padding: "8px 20px",
                background: "#ffd166",
                color: "#0f172a",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: 1,
              }}
            >
              👑 MAJORITY VOTE
            </div>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 90, marginBottom: 16 }}>{optionB.emoji}</div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              lineHeight: 1.25,
              textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            }}
          >
            {optionB.text}
          </div>
        </div>

        {/* Reveal Percentage Bar B */}
        {isReveal ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fce7f3" }}>
                VOTES:
              </span>
              <span
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  color: "#ffffff",
                  textShadow: "0 0 16px rgba(255,255,255,0.6)",
                }}
              >
                {displayedPctB}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 18,
                background: "rgba(0,0,0,0.4)",
                borderRadius: 9,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${displayedPctB}%`,
                  height: "100%",
                  background: "#f472b6",
                  borderRadius: 9,
                }}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              fontSize: 18,
              fontWeight: 800,
              color: "#fbcfe8",
              letterSpacing: 2,
            }}
          >
            OR WOULD YOU CHOOSE THIS?
          </div>
        )}
      </div>

      {/* Bottom Subtitle / Call To Action */}
      <div
        style={{
          position: "absolute",
          bottom: 35,
          left: 40,
          right: 40,
          textAlign: "center",
          fontSize: 16,
          fontWeight: 800,
          color: "#94a3b8",
          letterSpacing: 2,
        }}
      >
        {isReveal
          ? "COMMENT YOUR CHOICE BELOW! 👇"
          : `CHOICE LOCKS IN ${countdownVal}s...`}
      </div>
    </AbsoluteFill>
  );
};
