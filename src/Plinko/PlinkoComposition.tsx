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

import ep1Data from "../data/plinko/ep1.json";
import ep2Data from "../data/plinko/ep2.json";
import ep3Data from "../data/plinko/ep3.json";
import ep4Data from "../data/plinko/ep4.json";
import ep5Data from "../data/plinko/ep5.json";

const EPISODE_MAP: Record<number, any> = {
  1: ep1Data,
  2: ep2Data,
  3: ep3Data,
  4: ep4Data,
  5: ep5Data,
};

interface PlinkoTheme {
  title: string;
  subtitle: string;
  bgColor: string;
  pegColor: string;
  ballColor: string;
  ballGlow: string;
  accent: string;
}

const PLINKO_THEMES: Record<number, PlinkoTheme> = {
  1: {
    title: "LUCKY PLINKO $1M DROP",
    subtitle: "THE $1,000,000 GOLDEN BALL RUN",
    bgColor: "#080c18",
    pegColor: "#475569",
    ballColor: "#ffd700",
    ballGlow: "rgba(255, 215, 0, 0.9)",
    accent: "#ffd166",
  },
  2: {
    title: "MIDNIGHT NEON DIAMOND",
    subtitle: "CYBERPUNK HIGH STAKES RUN",
    bgColor: "#0a0418",
    pegColor: "#9333ea",
    ballColor: "#00f5d4",
    ballGlow: "rgba(0, 245, 212, 0.9)",
    accent: "#a855f7",
  },
  3: {
    title: "HIGH ROLLER PYRAMID",
    subtitle: "VEGAS EXTREME SUSPENSE DROP",
    bgColor: "#16050b",
    pegColor: "#e11d48",
    ballColor: "#ff0055",
    ballGlow: "rgba(255, 0, 85, 0.9)",
    accent: "#fb7185",
  },
  4: {
    title: "MEGA MULTIPLIER PINBALL",
    subtitle: "HIGH VELOCITY BOUNCE CASCADE",
    bgColor: "#04151a",
    pegColor: "#0284c7",
    ballColor: "#38bdf8",
    ballGlow: "rgba(56, 189, 248, 0.9)",
    accent: "#38bdf8",
  },
  5: {
    title: "THE IMPOSSIBLE CORNER",
    subtitle: "NEAR ZERO SURVIVAL DEFLECTION",
    bgColor: "#04140c",
    pegColor: "#059669",
    ballColor: "#10b981",
    ballGlow: "rgba(16, 185, 129, 0.9)",
    accent: "#34d399",
  },
};

export interface PlinkoProps {
  episode?: number;
}

export const PlinkoComposition: React.FC<PlinkoProps> = ({ episode = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const theme = PLINKO_THEMES[episode] || PLINKO_THEMES[1];
  const data = EPISODE_MAP[episode] || ep1Data;
  const currentIdx = Math.min(frame, data.frames.length - 1);
  const frameData = data.frames[currentIdx];

  const targetReachedFrame = data.targetReachedFrame || data.totalFrames - 180;
  const isJackpot = frame >= targetReachedFrame;

  const celebrationSpring = spring({
    frame: Math.max(0, frame - targetReachedFrame),
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  const { balls, score, pct } = frameData;
  const audioSrc = staticFile(`sounds/plinko/plinko-ep${episode}.wav`);

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

      {/* Cyber Grid Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            `radial-gradient(circle, ${theme.accent} 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Top Header Card */}
      <div
        style={{
          position: "absolute",
          top: 45,
          left: 40,
          right: 40,
          background: "rgba(15, 23, 42, 0.88)",
          backdropFilter: "blur(14px)",
          borderRadius: 24,
          padding: "18px 26px",
          border: `1px solid ${theme.accent}44`,
          boxShadow: `0 16px 36px rgba(0,0,0,0.5), 0 0 20px ${theme.accent}22`,
          zIndex: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 2.5,
                color: theme.accent,
                textTransform: "uppercase",
              }}
            >
              {theme.subtitle} • EP #{episode}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>
              {theme.title}
            </div>
          </div>
          <div
            style={{
              padding: "8px 18px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              border: `1px solid ${theme.accent}`,
              fontSize: 16,
              fontWeight: 900,
              color: theme.accent,
            }}
          >
            TARGET: $1,000,000
          </div>
        </div>

        {/* Cash Ticker */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8" }}>
            TOTAL ACCUMULATED:
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#00f5d4",
              textShadow: "0 0 16px rgba(0, 245, 212, 0.5)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ${score.toLocaleString()}
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: "100%",
            height: 16,
            background: "#1e293b",
            borderRadius: 8,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "linear-gradient(90deg, #00f5d4 0%, #ffd166 100%)",
              boxShadow: "0 0 12px rgba(255, 209, 102, 0.8)",
              transition: "width 0.1s linear",
            }}
          />
        </div>
      </div>

      {/* Plinko Board Playfield */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 1920,
        }}
      >
        <defs>
          <linearGradient id="pegGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* Funnel drop chutes at top */}
        <polygon
          points="460,220 500,320 580,320 620,220"
          fill="none"
          stroke="#475569"
          strokeWidth="3"
        />

        {/* Pegs */}
        {data.pegs.map((p: any) => (
          <g key={p.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.r + 4}
              fill="rgba(56, 189, 248, 0.15)"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill="url(#pegGlow)"
              stroke="#64748b"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* Side Guide Rails */}
        <line
          x1="80"
          y1="340"
          x2="80"
          y2="1520"
          stroke="#334155"
          strokeWidth="6"
        />
        <line
          x1="1000"
          y1="340"
          x2="1000"
          y2="1520"
          stroke="#334155"
          strokeWidth="6"
        />
      </svg>

      {/* Multiplier Buckets at Bottom */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 1520,
          width: 880,
          height: 180,
          display: "flex",
          gap: 6,
          zIndex: 20,
        }}
      >
        {data.buckets.map((b: any, idx: number) => {
          const isJp = b.isJackpot;
          return (
            <div
              key={`bucket-${idx}`}
              style={{
                flex: 1,
                height: "100%",
                background: isJp
                  ? "linear-gradient(180deg, rgba(255, 209, 102, 0.25) 0%, rgba(247, 37, 133, 0.3) 100%)"
                  : "rgba(15, 23, 42, 0.8)",
                border: isJp ? "2px solid #ffd166" : `1.5px solid ${b.color}`,
                borderRadius: "12px 12px 16px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 2px",
                boxShadow: isJp
                  ? "0 0 24px rgba(255, 209, 102, 0.5)"
                  : `0 0 10px ${b.color}40`,
              }}
            >
              <div
                style={{
                  fontSize: isJp ? 12 : 14,
                  fontWeight: 900,
                  color: isJp ? "#ffd166" : b.color,
                  textAlign: "center",
                  letterSpacing: -0.5,
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#94a3b8",
                  marginTop: 4,
                }}
              >
                ${(b.baseVal / 1000).toFixed(0)}k
              </div>
            </div>
          );
        })}
      </div>

      {/* Falling Balls */}
      {balls.map((b: any) => (
        <div
          key={`ball-${b.id}`}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: 32,
            height: 32,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, #ffffff, ${theme.ballColor} 65%, #000000 100%)`,
            boxShadow: `0 0 24px ${theme.ballGlow}, 0 4px 10px rgba(0,0,0,0.6)`,
            border: `2px solid ${theme.ballColor}`,
            zIndex: 30,
          }}
        />
      ))}

      {/* Mega Jackpot Win Overlay */}
      {isJackpot && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(7, 11, 20, 0.88)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            opacity: interpolate(celebrationSpring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(celebrationSpring, [0, 1], [0.92, 1])})`,
          }}
        >
          {/* Golden Flare */}
          <div
            style={{
              position: "absolute",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255, 209, 102, 0.6) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 6,
              color: "#00f5d4",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            CHALLENGE ACCOMPLISHED
          </div>

          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: -1,
              marginBottom: 16,
              textAlign: "center",
              background: "linear-gradient(135deg, #ffffff 0%, #ffd166 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            $1,000,000 JACKPOT!
          </h1>

          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: "#ffd166",
              marginBottom: 30,
              textShadow: "0 0 24px rgba(255, 209, 102, 0.8)",
            }}
          >
            FULL CHALLENGE TARGET UNLOCKED!
          </div>

          <div
            style={{
              padding: "18px 40px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 24,
              border: "2px solid #ffd166",
              fontSize: 22,
              fontWeight: 800,
              color: "#f8fafc",
            }}
          >
            JACKPOT STRUCK IN {data.targetReachedSec}s
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
