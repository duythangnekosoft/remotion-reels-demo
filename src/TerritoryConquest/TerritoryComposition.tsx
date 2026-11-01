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

interface TerritoryTheme {
  title: string;
  subtitle: string;
  bgColor: string;
  gridBorder: string;
  accent: string;
  factions: Record<string, { name: string; color: string; glow: string }>;
}

const TERRITORY_THEMES: Record<number, TerritoryTheme> = {
  1: {
    title: "NEON CYBER MATRIX",
    subtitle: "100% FULL MAP DOMINATION",
    bgColor: "#080c18",
    gridBorder: "#38bdf8",
    accent: "#38bdf8",
    factions: {
      red: { name: "CRIMSON EMPIRE", color: "#ff0055", glow: "rgba(255, 0, 85, 0.8)" },
      cyan: { name: "NEON CYAN", color: "#00f5d4", glow: "rgba(0, 245, 212, 0.8)" },
      gold: { name: "SOLAR GOLD", color: "#ffd166", glow: "rgba(255, 209, 102, 0.8)" },
      purple: { name: "CYBER VIOLET", color: "#9d4edd", glow: "rgba(157, 78, 221, 0.8)" },
    },
  },
  2: {
    title: "FOUR CORNERS SIEGE",
    subtitle: "EXTREME FACTION WARFARE",
    bgColor: "#0a0614",
    gridBorder: "#a855f7",
    accent: "#c084fc",
    factions: {
      red: { name: "ROYAL PURPLE", color: "#a855f7", glow: "rgba(168, 85, 247, 0.8)" },
      cyan: { name: "ARCTIC FROST", color: "#06b6d4", glow: "rgba(6, 182, 212, 0.8)" },
      gold: { name: "NEON ORANGE", color: "#ea580c", glow: "rgba(234, 88, 12, 0.8)" },
      purple: { name: "ELECTRIC LIME", color: "#84cc16", glow: "rgba(132, 204, 22, 0.8)" },
    },
  },
  3: {
    title: "CENTER FORTRESS KING",
    subtitle: "MEDIEVAL CASTLE CITADEL",
    bgColor: "#04120f",
    gridBorder: "#10b981",
    accent: "#34d399",
    factions: {
      red: { name: "RUBY RED", color: "#e11d48", glow: "rgba(225, 29, 72, 0.8)" },
      cyan: { name: "SAPPHIRE SHIELD", color: "#2563eb", glow: "rgba(37, 99, 235, 0.8)" },
      gold: { name: "JADE EMERALD", color: "#059669", glow: "rgba(5, 150, 105, 0.8)" },
      purple: { name: "SOLAR AMBER", color: "#d97706", glow: "rgba(217, 119, 6, 0.8)" },
    },
  },
  4: {
    title: "CROSSFIRE MATRIX",
    subtitle: "TACTICAL BOUNDARY INVASION",
    bgColor: "#020c1b",
    gridBorder: "#6366f1",
    accent: "#818cf8",
    factions: {
      red: { name: "COBALT NAVY", color: "#1d4ed8", glow: "rgba(29, 78, 216, 0.8)" },
      cyan: { name: "SUNSET BLAZE", color: "#f97316", glow: "rgba(249, 115, 22, 0.8)" },
      gold: { name: "TOXIC VIOLET", color: "#c026d3", glow: "rgba(192, 38, 211, 0.8)" },
      purple: { name: "PURE GOLD", color: "#eab308", glow: "rgba(234, 179, 8, 0.8)" },
    },
  },
  5: {
    title: "ELEMENTAL WARZONE",
    subtitle: "NATURE FORCES 100% COLLAPSE",
    bgColor: "#140808",
    gridBorder: "#ef4444",
    accent: "#f87171",
    factions: {
      red: { name: "VOLCANIC FIRE", color: "#dc2626", glow: "rgba(220, 38, 38, 0.8)" },
      cyan: { name: "DEEP OCEAN", color: "#0d9488", glow: "rgba(13, 148, 136, 0.8)" },
      gold: { name: "EARTH BRONZE", color: "#ca8a04", glow: "rgba(202, 138, 4, 0.8)" },
      purple: { name: "LIGHTNING SPARKS", color: "#facc15", glow: "rgba(250, 204, 21, 0.8)" },
    },
  },
};

export interface TerritoryProps {
  episode?: number;
}

export const TerritoryComposition: React.FC<TerritoryProps> = ({ episode = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const theme = TERRITORY_THEMES[episode] || TERRITORY_THEMES[1];
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
            `radial-gradient(circle, ${theme.gridBorder} 1px, transparent 1px)`,
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
          border: `1px solid ${theme.gridBorder}44`,
          boxShadow: `0 16px 36px rgba(0,0,0,0.5), 0 0 20px ${theme.gridBorder}22`,
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
                color: theme.accent,
                textTransform: "uppercase",
              }}
            >
              {theme.subtitle}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>
              {theme.title}
            </div>
          </div>
          <div
            style={{
              padding: "6px 14px",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 12,
              border: `1px solid ${theme.accent}`,
              fontSize: 14,
              fontWeight: 800,
              color: theme.accent,
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
