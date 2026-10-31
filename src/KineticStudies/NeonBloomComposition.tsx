import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import neon from "../data/kinetic/neon-data.json";

const colors = Array.from(
  { length: 900 },
  (_, i) => `hsl(${(i * 137.508 + 160) % 360},90%,64%)`
);

const Base: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      fontFamily: "Arial, sans-serif",
      background: "#090d16",
      color: "#f5f6ff",
    }}
  >
    {children}
  </AbsoluteFill>
);

const Text: React.FC<{
  children: React.ReactNode;
  top: number;
  size?: number;
  color?: string;
}> = ({ children, top, size = 20, color = "#a0afc5" }) => (
  <div
    style={{
      position: "absolute",
      top,
      width: "100%",
      textAlign: "center",
      fontSize: size,
      color,
      letterSpacing: size < 22 ? 2 : 0,
      fontWeight: size > 28 ? 800 : 500,
    }}
  >
    {children}
  </div>
);

export const NeonBloomComposition: React.FC = () => {
  const f = useCurrentFrame();
  const frameIdx = Math.max(0, Math.min(f, neon.frames.length - 1));
  const p = neon.frames[frameIdx] as Array<[number, number]>;
  const end = f > 980;
  const scale = end
    ? interpolate(f, [980, 1025], [1, 0.65], { extrapolateRight: "clamp" })
    : 1;

  return (
    <Base>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 54%,#302040 0%,#170f26 55%,#100e1d 100%)",
        }}
      />
      <Text top={125} size={15} color="#90b6a5">
        BOUNDARY BLOOM / 01
      </Text>
      <Text top={187} size={39}>
        One ball. A neon cascade.
      </Text>
      <Text top={251} size={17}>
        EACH WALL HIT CREATES ONE NEW BALL
      </Text>

      <svg width="720" height="1280" style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <filter id="neon-bloom">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <linearGradient id="neon-edge">
            <stop stopColor="#b6ff90" />
            <stop offset="1" stopColor="#48efc0" />
          </linearGradient>
        </defs>
        <g transform={`translate(360 815) scale(${scale})`}>
          <path
            d="M-276 0 A276 276 0 0 1 276 0 Z"
            fill="#0c1020"
            stroke="#93eaa6"
            strokeWidth="12"
            opacity=".3"
            filter="url(#neon-bloom)"
          />
          <path
            d="M-276 0 A276 276 0 0 1 276 0 Z"
            fill="#141427"
            stroke="url(#neon-edge)"
            strokeWidth="2"
          />
          {p.map((b, i) => (
            <circle
              key={i}
              cx={b[0]}
              cy={b[1]}
              r="5.8"
              fill={colors[i]}
              opacity=".2"
            />
          ))}
          {p.map((b, i) => (
            <circle key={i} cx={b[0]} cy={b[1]} r="3.9" fill={colors[i]} />
          ))}
        </g>
      </svg>

      <Text top={925} size={57} color="#adffd6">
        {p.length.toString().padStart(3, "0")}
      </Text>
      <Text top={1000} size={15}>
        {p.length < 900 ? `BALLS IN MOTION • GOAL: 900 BALLS` : "★ 900-BALL LIMIT REACHED ★"}
      </Text>
      <Text top={1130} size={19}>
        {end ? "Challenge Complete. 900 from one." : "Small beginnings. Rapid exponential growth."}
      </Text>

      <div
        style={{
          position: "absolute",
          bottom: 65,
          left: 60,
          right: 60,
          height: 2,
          background: "#39414c",
        }}
      >
        <div
          style={{
            height: 2,
            width: `${(f / 1049) * 100}%`,
            background: "#8be7ba",
          }}
        />
      </div>

      <Audio src={staticFile("sounds/kinetic/neon-sound.wav")} />

          </Base>
  );
};

