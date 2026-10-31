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

import ep1Data from "../data/territory/ep1.json";
import ep2Data from "../data/territory/ep2.json";
import ep3Data from "../data/territory/ep3.json";
import ep4Data from "../data/territory/ep4.json";
import ep5Data from "../data/territory/ep5.json";

const EPISODE_MAP: Record<number, any> = {
  1: ep1Data,
  2: ep2Data,
  3: ep3Data,
  4: ep4Data,
  5: ep5Data,
};

export interface TerritoryProps {
  episode?: number;
}

export const TerritoryComposition: React.FC<TerritoryProps> = ({ episode = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const data = EPISODE_MAP[episode] || ep1Data;
  const currentIdx = Math.min(frame, data.frames.length - 1);
  const frameData = data.frames[currentIdx];

  // Retrieve the latest available grid snapshot
  const activeGrid = useMemo(() => {
    for (let f = currentIdx; f >= 0; f--) {
      if (data.frames[f].grid) return data.frames[f].grid;
    }
    return data.frames[0].grid;
  }, [currentIdx, data.frames]);

  const conquestFrame = data.conquestFrame || data.totalFrames - 150;
  const isVictory = frame >= conquestFrame;

  const victorySpring = spring({
    frame: Math.max(0, frame - conquestFrame),
    fps,
    config: { damping: 13, stiffness: 100 },
  });

  const { pcts, spheres } = frameData;
  const audioSrc = staticFile(`sounds/territory/territory-ep${episode}.wav`);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070b14",
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
          opacity: 0.15,
          backgroundImage:
            "radial-gradient(circle, #334155 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top Header Card */}
      <div
        style={{
          position: "absolute",
          top: 45,
          left: 40,
          right: 40,
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(14px)",
          borderRadius: 24,
          padding: "18px 24px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 16px 36px rgba(0,0,0,0.5)",
          zIndex: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 2.5,
                color: "#38bdf8",
                textTransform: "uppercase",
              }}
            >
              100% Full Map Domination Challenge
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>
              TERRITORY CONQUEST
            </div>
          </div>
          <div
            style={{
              padding: "6px 14px",
              background: "rgba(56, 189, 248, 0.15)",
              borderRadius: 12,
              border: "1px solid #38bdf8",
              fontSize: 14,
              fontWeight: 800,
              color: "#38bdf8",
            }}
          >
            ROUND #{episode}
          </div>
        </div>

        {/* Dynamic Territory Percentage Bar */}
        <div
          style={{
            display: "flex",
            height: 18,
            borderRadius: 9,
            overflow: "hidden",
            background: "#1e293b",
            marginBottom: 10,
          }}
        >
          {data.factions.map((f: any, idx: number) => {
            const widthPct = pcts[idx] || 0;
            return (
              <div
                key={f.id}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: f.color,
                  transition: "width 0.1s linear",
                }}
              />
            );
          })}
        </div>

        {/* Faction Legend / Scores */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {data.factions.map((f: any, idx: number) => {
            const pct = pcts[idx] || 0;
            return (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    backgroundColor: f.color,
                    boxShadow: `0 0 8px ${f.glow}`,
                  }}
                />
                <span style={{ color: "#cbd5e1" }}>{f.name}:</span>
                <span style={{ color: f.color }}>{pct.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Battlefield */}
      <div
        style={{
          position: "absolute",
          left: data.gridX,
          top: data.gridY,
          width: data.gridW,
          height: data.gridH,
          borderRadius: 20,
          overflow: "hidden",
          border: "3px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          background: "#090d16",
        }}
      >
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {/* Render 600 Tiles */}
          {activeGrid &&
            activeGrid.map((owner: number, idx: number) => {
              const c = idx % data.cols;
              const r = Math.floor(idx / data.cols);
              const color = data.factions[owner].color;
              return (
                <rect
                  key={`tile-${idx}`}
                  x={c * data.cellW}
                  y={r * data.cellH}
                  width={data.cellW - 0.5}
                  height={data.cellH - 0.5}
                  fill={color}
                  opacity={0.88}
                />
              );
            })}
        </svg>

        {/* 4 Bouncing Energy Spheres */}
        {spheres.map((s: any, idx: number) => {
          const faction = data.factions[idx];
          return (
            <div
              key={`sphere-${idx}`}
              style={{
                position: "absolute",
                left: s.x - data.gridX,
                top: s.y - data.gridY,
                width: 52,
                height: 52,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, #ffffff, ${faction.color} 65%, #000000 100%)`,
                boxShadow: `0 0 28px ${faction.glow}, 0 4px 12px rgba(0,0,0,0.8)`,
                border: "2px solid #ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 900,
                color: "#ffffff",
                zIndex: 20,
              }}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>

      {/* Victory 100% Conquest Overlay */}
      {isVictory && (
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
            opacity: interpolate(victorySpring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(victorySpring, [0, 1], [0.92, 1])})`,
          }}
        >
          {/* Faction Victory Glow */}
          <div
            style={{
              position: "absolute",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${data.winner.glow} 0%, transparent 70%)`,
              opacity: 0.6,
              filter: "blur(50px)",
            }}
          />

          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: 6,
              color: "#ffd166",
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            CHALLENGE COMPLETED
          </div>

          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              letterSpacing: -1,
              marginBottom: 16,
              textAlign: "center",
              background: `linear-gradient(135deg, #ffffff 0%, ${data.winner.color} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            100% CONQUERED!
          </h1>

          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: data.winner.color,
              marginBottom: 30,
              textShadow: `0 0 20px ${data.winner.glow}`,
            }}
          >
            VICTORY: {data.winner.name.toUpperCase()}
          </div>

          <div
            style={{
              padding: "18px 40px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 24,
              border: `2px solid ${data.winner.color}`,
              fontSize: 22,
              fontWeight: 800,
              color: "#f8fafc",
            }}
          >
            ALL 600 TILES DOMINATED IN {data.conquestSec}s
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
