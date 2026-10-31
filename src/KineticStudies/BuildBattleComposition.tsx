import React from "react";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
} from "remotion";
import duel from "../data/kinetic/duel-data.json";

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

function sector(inner: number, outer: number, bin: number) {
  const a = (bin * 2 * Math.PI) / 72;
  const b = ((bin + 1) * 2 * Math.PI) / 72;
  return `M${outer * Math.cos(a)},${outer * Math.sin(a)}A${outer} ${outer} 0 0 1 ${outer * Math.cos(b)},${outer * Math.sin(b)}L${inner * Math.cos(b)},${inner * Math.sin(b)}A${inner} ${inner} 0 0 0 ${inner * Math.cos(a)},${inner * Math.sin(a)}Z`;
}

export const BuildBattleComposition: React.FC = () => {
  const f = useCurrentFrame();
  const frameIdx = Math.max(0, Math.min(f, duel.frames.length - 1));
  const s = duel.frames[frameIdx] as any;
  const finishFrame = (duel as any).finishFrame || 925;
  const done = f >= finishFrame;
  const visible = duel.bricks.slice(0, s.brickCount);
  const result =
    s.score[0] === s.score[1]
      ? "A PERFECT TIE"
      : s.score[0] > s.score[1]
      ? "RED WINS"
      : "BLUE WINS";

  return (
    <Base>
      <Text top={90} size={15}>
        BUILD BATTLE / 02
      </Text>
      <Text top={150} size={36}>
        Conquer the Arena
      </Text>
      <Text top={206} size={16}>
        EVERY BOUNCE BUILDS TOWARD 100% CONQUEST
      </Text>

      <div
        style={{
          position: "absolute",
          top: 285,
          left: 142,
          color: "#ff536e",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 15, letterSpacing: 3 }}>RED</div>
        <div style={{ fontSize: 60, fontWeight: 800 }}>{s.score[0]}</div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 285,
          right: 142,
          color: "#4ea9ff",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 15, letterSpacing: 3 }}>BLUE</div>
        <div style={{ fontSize: 60, fontWeight: 800 }}>{s.score[1]}</div>
      </div>

      <svg width="720" height="1280" style={{ position: "absolute", top: 0, left: 0 }}>
        <defs>
          <filter id="battle-glow">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <g transform="translate(360 690)">
          <circle r="268" fill="#060a12" stroke="#333b50" strokeWidth="5" />
          {visible.flatMap((b: any, i: number) =>
            b.cells.map((c: any, j: number) => (
              <path
                key={`${i}-${j}`}
                d={sector(c.inner, c.outer, c.bin)}
                fill={b.id === 0 ? "#fb526d" : "#409aff"}
                stroke="#141a2c"
                strokeWidth=".9"
              />
            ))
          )}
          {s.balls.map((p: number[], i: number) => {
            const prev = duel.frames[Math.max(0, f - 3)].balls[i];
            return (
              <g key={i}>
                <path
                  d={`M${prev[0]} ${prev[1]} L${p[0]} ${p[1]}`}
                  stroke={i ? "#49aaff" : "#ff5475"}
                  strokeWidth="3"
                  opacity=".45"
                />
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r="11"
                  fill={i ? "#49aaff" : "#ff5475"}
                  filter="url(#battle-glow)"
                />
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r="5"
                  fill={i ? "#6fc4ff" : "#ff6d85"}
                />
              </g>
            );
          })}
          {done && (
            <g>
              <rect
                x="-251"
                y="-42"
                width="502"
                height="84"
                rx="12"
                fill="#090d16"
                stroke="#6db9ff"
                strokeWidth="1.5"
                opacity=".95"
              />
              <text
                textAnchor="middle"
                y="2"
                fontSize="38"
                fontWeight="800"
                fill={s.score[0] > s.score[1] ? "#ff6c80" : "#6db9ff"}
              >
                {result}
              </text>
              <text
                textAnchor="middle"
                y="30"
                fontSize="15"
                fontWeight="700"
                fill="#8eb4d7"
                letterSpacing="2"
              >
                ARENA 100% CONQUERED
              </text>
            </g>
          )}
        </g>
      </svg>

      <Text top={1010} size={26} color="#dbe3ef">
        {done ? "ARENA 100% CONQUERED" : `${Math.round(s.fill * 100)}% OF ARENA BUILT`}
      </Text>
      <Text top={1060} size={15}>
        {done
          ? `COMPLETED IN ${((duel as any).finishTime || 30.8).toFixed(1)}s`
          : "BUILDING TOWARD CENTER TO FILL 100%"}
      </Text>
      <Text top={1155} size={16}>
        RED: {s.score[0]} BRICKS • BLUE: {s.score[1]} BRICKS
      </Text>

      <Audio src={staticFile("sounds/kinetic/duel-sound.wav")} />
    </Base>
  );
};
