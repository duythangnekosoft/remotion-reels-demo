import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import ep1Data from "../data/marbleRace/ep1.json";
import ep2Data from "../data/marbleRace/ep2.json";
import ep3Data from "../data/marbleRace/ep3.json";
import ep4Data from "../data/marbleRace/ep4.json";
import ep5Data from "../data/marbleRace/ep5.json";

const EPISODE_MAP: Record<number, any> = {
  1: ep1Data,
  2: ep2Data,
  3: ep3Data,
  4: ep4Data,
  5: ep5Data,
};

export interface MarbleRaceProps {
  episode?: number;
}

export const MarbleRaceComposition: React.FC<MarbleRaceProps> = ({ episode = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const data = EPISODE_MAP[episode] || ep1Data;
  const currentFrameIdx = Math.min(frame, data.frames.length - 1);
  const frameData = data.frames[currentFrameIdx];
  const { cameraY, marbles, leaderboard } = frameData;

  const winnerFinishFrame = data.winnerFinishFrame || data.totalFrames - 150;
  const isPodiumTime = frame >= winnerFinishFrame;

  // Podium animation spring
  const podiumProgress = spring({
    frame: Math.max(0, frame - winnerFinishFrame),
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const competitorsById = useMemo(() => {
    const map = new Map<string, any>();
    data.competitors.forEach((c: any) => map.set(c.id, c));
    return map;
  }, [data]);

  const currentLeader = competitorsById.get(leaderboard[0]);

  // Audio track
  const audioSrc = staticFile(`sounds/marbleRace/marble-race-ep${episode}.wav`);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070b14",
        color: "#ffffff",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
      }}
    >
      <Audio src={audioSrc} volume={0.9} />

      {/* Cyber Grid Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            "linear-gradient(#203a43 1px, transparent 1px), linear-gradient(90deg, #203a43 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          backgroundPosition: `0px ${-cameraY % 60}px`,
        }}
      />

      {/* Track Viewport */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1080,
          height: 6400,
          transform: `translateY(${-cameraY}px)`,
          transition: "none",
        }}
      >
        {/* Track Borders */}
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 6400 }}
        >
          <defs>
            <linearGradient id="wallGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#9b5de5" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id="vortexGlow">
              <stop offset="0%" stopColor="#9b5de5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#9b5de5" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Vortex Zone Backplate */}
          <circle cx="540" cy="2850" r="450" fill="url(#vortexGlow)" />
          <circle
            cx="540"
            cy="2850"
            r="380"
            fill="none"
            stroke="#9b5de5"
            strokeWidth="3"
            strokeDasharray="16 12"
            opacity="0.4"
            transform={`rotate(${frame * 1.5} 540 2850)`}
          />

          {/* Bumpers */}
          {data.bumpers.map((b: any, idx: number) => {
            const pulse = Math.sin(frame * 0.15 + idx) * 4;
            return (
              <g key={`bumper-${idx}`}>
                <circle
                  cx={b.x}
                  cy={b.y}
                  r={b.r + pulse}
                  fill="none"
                  stroke={b.color}
                  strokeWidth="6"
                  opacity="0.8"
                />
                <circle
                  cx={b.x}
                  cy={b.y}
                  r={b.r - 8}
                  fill={b.color}
                  opacity="0.25"
                />
                <circle
                  cx={b.x}
                  cy={b.y}
                  r="8"
                  fill="#ffffff"
                  opacity="0.9"
                />
              </g>
            );
          })}

          {/* Pegs */}
          {data.pegs.map((p: any, idx: number) => (
            <circle
              key={`peg-${idx}`}
              cx={p.x}
              cy={p.y}
              r={p.r}
              fill="#e2e8f0"
              stroke="#64748b"
              strokeWidth="2"
            />
          ))}

          {/* Finish Line Gate */}
          <g transform={`translate(0, ${data.finishLineY})`}>
            <rect
              x="120"
              y="-15"
              width="840"
              height="30"
              fill="#ffffff"
              opacity="0.95"
            />
            {/* Checkered pattern */}
            {Array.from({ length: 28 }).map((_, i) => (
              <rect
                key={`check-${i}`}
                x={120 + i * 30}
                y={i % 2 === 0 ? -15 : 0}
                width="30"
                height="15"
                fill="#000000"
              />
            ))}
            <text
              x="540"
              y="-30"
              textAnchor="middle"
              fill="#ffd166"
              fontSize="32"
              fontWeight="900"
              letterSpacing="6"
            >
              FINISH LINE
            </text>
          </g>
        </svg>

        {/* Marbles */}
        {marbles.map((m: any) => {
          const comp = competitorsById.get(m.id);
          if (!comp) return null;
          return (
            <div
              key={m.id}
              style={{
                position: "absolute",
                left: m.x,
                top: m.y,
                width: 38,
                height: 38,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, #ffffff, ${comp.color} 60%, #000000 100%)`,
                boxShadow: `0 0 24px ${comp.glow}, 0 6px 12px rgba(0,0,0,0.6)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 900,
                color: "#ffffff",
                textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                zIndex: 10,
              }}
            >
              {comp.number}
            </div>
          );
        })}
      </div>

      {/* Top Header Banner */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 40,
          right: 40,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 28px",
          background: "rgba(10, 16, 30, 0.85)",
          backdropFilter: "blur(14px)",
          borderRadius: 24,
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 16px 36px rgba(0,0,0,0.5)",
          zIndex: 40,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 3,
              color: "#00d2ff",
              textTransform: "uppercase",
            }}
          >
            Championship Cup • Race #{episode}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5 }}>
            MARBLE GRAND PRIX
          </div>
        </div>

        {/* Leader Pill */}
        {currentLeader && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              background: "rgba(255, 255, 255, 0.06)",
              borderRadius: 16,
              border: `2px solid ${currentLeader.color}`,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: currentLeader.color,
                boxShadow: `0 0 10px ${currentLeader.glow}`,
              }}
            />
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              LEADER: {currentLeader.name.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Left Leaderboard Overlay */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 170,
          width: 260,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 40,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
            color: "#94a3b8",
            marginBottom: 4,
          }}
        >
          LIVE STANDINGS
        </div>
        {leaderboard.map((id: string, idx: number) => {
          const comp = competitorsById.get(id);
          const marble = marbles.find((m: any) => m.id === id);
          if (!comp) return null;
          return (
            <div
              key={id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 14px",
                background:
                  idx === 0
                    ? "rgba(255, 183, 3, 0.22)"
                    : "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(8px)",
                borderRadius: 12,
                border:
                  idx === 0
                    ? "1px solid #ffb703"
                    : "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: idx === 0 ? "#ffd166" : "#64748b",
                    width: 22,
                  }}
                >
                  P{idx + 1}
                </span>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: comp.color,
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#f8fafc",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 130,
                  }}
                >
                  {comp.name}
                </span>
              </div>
              {marble?.finished && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    padding: "2px 6px",
                    background: "#10b981",
                    borderRadius: 6,
                  }}
                >
                  FIN
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Podium Celebration Overlay */}
      {isPodiumTime && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(7, 11, 20, 0.88)",
            backdropFilter: "blur(18px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            opacity: interpolate(podiumProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(podiumProgress, [0, 1], [0.92, 1])})`,
          }}
        >
          {/* Confetti & Glow */}
          <div
            style={{
              position: "absolute",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${data.winner.glow} 0%, transparent 70%)`,
              opacity: 0.5,
              filter: "blur(40px)",
            }}
          />

          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 6,
              color: "#ffd166",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            OFFICIAL RESULTS
          </div>

          <h1
            style={{
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: -1,
              marginBottom: 40,
              textAlign: "center",
              background: "linear-gradient(135deg, #ffffff 0%, #ffd166 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CHAMPIONSHIP PODIUM
          </h1>

          {/* 3-Tier Podium */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 20,
              width: "100%",
              maxWidth: 880,
              marginBottom: 50,
            }}
          >
            {/* 2nd Place */}
            {data.podium[1] && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 35%, #ffffff, ${data.podium[1].color} 70%)`,
                    boxShadow: `0 0 30px ${data.podium[1].glow}`,
                    marginBottom: 16,
                  }}
                />
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                  {data.podium[1].name}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 190,
                    background: "linear-gradient(180deg, #64748b 0%, #334155 100%)",
                    borderRadius: "16px 16px 0 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #94a3b8",
                  }}
                >
                  <span style={{ fontSize: 44, fontWeight: 900, color: "#e2e8f0" }}>
                    2ND
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#cbd5e1" }}>
                    SILVER
                  </span>
                </div>
              </div>
            )}

            {/* 1st Place Champion */}
            {data.podium[0] && (
              <div
                style={{
                  flex: 1.2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                    marginBottom: 8,
                    animation: "bounce 1s infinite alternate",
                  }}
                >
                  👑
                </div>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 35%, #ffffff, ${data.podium[0].color} 70%)`,
                    boxShadow: `0 0 50px ${data.podium[0].glow}`,
                    marginBottom: 16,
                  }}
                />
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 900,
                    color: "#ffd166",
                    marginBottom: 6,
                  }}
                >
                  {data.podium[0].name}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 270,
                    background:
                      "linear-gradient(180deg, #ffb703 0%, #fb8500 100%)",
                    borderRadius: "20px 20px 0 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "3px solid #ffe6a7",
                    boxShadow: "0 0 40px rgba(255, 183, 3, 0.4)",
                  }}
                >
                  <span style={{ fontSize: 62, fontWeight: 900, color: "#ffffff" }}>
                    1ST
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: "#ffffff",
                      letterSpacing: 2,
                    }}
                  >
                    CHAMPION
                  </span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {data.podium[2] && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 35%, #ffffff, ${data.podium[2].color} 70%)`,
                    boxShadow: `0 0 30px ${data.podium[2].glow}`,
                    marginBottom: 16,
                  }}
                />
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                  {data.podium[2].name}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: 140,
                    background: "linear-gradient(180deg, #b45309 0%, #78350f 100%)",
                    borderRadius: "16px 16px 0 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #d97706",
                  }}
                >
                  <span style={{ fontSize: 44, fontWeight: 900, color: "#fef3c7" }}>
                    3RD
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#fde68a" }}>
                    BRONZE
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Victory Subtitle */}
          <div
            style={{
              padding: "16px 36px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 20,
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: 20,
              fontWeight: 800,
              color: "#f8fafc",
              letterSpacing: 1,
            }}
          >
            WINNER COMPLETED CHALLENGE IN {data.winnerFinishSec}s!
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
