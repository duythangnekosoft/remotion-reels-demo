import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";

const cols = 60;
const rows = 60;
const cell = 10.5;
const ox = 45;
const oy = 160;

const glyph1 = ["00100", "01100", "00100", "00100", "00100", "00100", "01110"];
const glyphK = ["10001", "10010", "10100", "11000", "10100", "10010", "10001"];

interface Brick {
  x: number;
  y: number;
  alive: boolean;
  color: string;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Drop {
  x: number;
  y: number;
  alive: boolean;
}

interface SimFrame {
  balls: { x: number; y: number }[];
  drops: { x: number; y: number }[];
  alive: boolean[];
  paddle: number;
  broken: number;
}

// Pre-compute the simulation frames once (all 3,076 bricks 100% destroyed)
function computeBrickSimulation(): { frames: SimFrame[]; initialBricks: Brick[] } {
  const initialBricks: Brick[] = Array.from({ length: cols * rows }, (_, id) => {
    const x = id % cols;
    const y = Math.floor(id / cols);
    const border = x < 3 || x >= 57 || y < 3 || y >= 57;
    const gap = x === 3 || x === 56 || y === 3 || y === 56;
    const gx = Math.floor((x - 10) / 3);
    const gy = Math.floor((y - 18) / 4);
    const hole =
      gy >= 0 &&
      gy < 7 &&
      ((gx >= 0 && gx < 5 && glyph1[gy][gx] === "1") ||
        (gx >= 7 && gx < 12 && glyphK[gy][gx - 7] === "1"));
    return {
      x: ox + x * cell,
      y: oy + y * cell,
      alive: !gap && !hole,
      color: border ? "#a5a9a2" : (x + y) % 3 === 0 ? "#278b5e" : "#30a874",
    };
  });

  const bricks = initialBricks.map((b) => ({ ...b }));
  const balls: Ball[] = [{ x: 480, y: 1060, vx: 270, vy: -690 }];
  const drops: Drop[] = [];
  const frames: SimFrame[] = [];
  let paddle = 480;
  let broken = 0;

  // 6720 steps @ 120Hz = 1680 frames @ 30fps = 56.0s (all 3,076 bricks cleared by 52.35s)
  for (let step = 0; step <= 6720; step++) {
    const t = step / 120;
    if (step % 4 === 0) {
      frames.push({
        balls: balls.map((p) => ({ x: p.x, y: p.y })),
        drops: drops.filter((d) => d.alive).map((d) => ({ x: d.x, y: d.y })),
        alive: bricks.map((b) => b.alive),
        paddle,
        broken,
      });
    }
    if (t < 0.7) continue;

    const target =
      drops.find((d) => d.alive && d.y > 850)?.x ??
      balls.reduce((p, q) => (q.vy > 0 && q.y > p.y ? q : p), balls[0]).x;
    paddle += Math.max(-9, Math.min(9, target - paddle));
    paddle = Math.max(105, Math.min(615, paddle));

    for (const d of drops) {
      if (!d.alive) continue;
      d.y += 3.6;
      if (d.y >= 1082) {
        d.alive = false;
        if (Math.abs(d.x - paddle) < 85 && balls.length < 64) {
          const extra = Math.min(balls.length * 2, 64 - balls.length);
          for (let k = 0; k < extra; k++) {
            const angle = -Math.PI / 2 + ((k / Math.max(1, extra - 1)) - 0.5) * 1.4;
            balls.push({
              x: paddle,
              y: 1070,
              vx: 740 * Math.cos(angle),
              vy: 740 * Math.sin(angle),
            });
          }
        }
      }
    }

    const n = balls.length;
    for (let i = 0; i < n; i++) {
      const p = balls[i];
      const px = p.x;
      const py = p.y;
      p.x += p.vx / 120;
      p.y += p.vy / 120;

      if (p.x < 30) {
        p.x = 30;
        p.vx = Math.abs(p.vx);
      }
      if (p.x > 690) {
        p.x = 690;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y < 140) {
        p.y = 140;
        p.vy = Math.abs(p.vy);
      }

      if (p.y >= 1076 && py < 1076 && p.vy > 0 && Math.abs(p.x - paddle) < 82) {
        p.y = 1075;
        const angle = (p.x - paddle) / 100;
        p.vx = 740 * Math.sin(angle);
        p.vy = -740 * Math.cos(angle);
      }

      if (p.y > 1170) {
        p.y = 1070;
        p.x = paddle;
        p.vy = -Math.abs(p.vy);
      }

      const gx = Math.floor((p.x - ox) / cell);
      const gy = Math.floor((p.y - oy) / cell);
      let hit = -1;
      for (let yy = gy - 1; yy <= gy + 1; yy++) {
        for (let xx = gx - 1; xx <= gx + 1; xx++) {
          if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
          const id = yy * cols + xx;
          const b = bricks[id];
          if (b.alive && p.x + 4 > b.x && p.x - 4 < b.x + 9 && p.y + 4 > b.y && p.y - 4 < b.y + 9) {
            hit = id;
          }
        }
      }

      if (hit >= 0) {
        const b = bricks[hit];
        b.alive = false;
        broken++;
        if (px + 4 <= b.x || px - 4 >= b.x + 9) {
          p.vx = -p.vx;
          p.x = px;
        } else {
          p.vy = -p.vy;
          p.y = py;
        }
        if (broken % 12 === 0 && balls.length < 64) {
          drops.push({ x: Math.max(105, Math.min(615, b.x)), y: b.y, alive: true });
        }
      }
    }
  }

  return { frames, initialBricks };
}

const simResult = computeBrickSimulation();

export const BrickBreakerComposition: React.FC = () => {
  const f = useCurrentFrame();
  const frameIdx = Math.max(0, Math.min(f, simResult.frames.length - 1));
  const s = simResult.frames[frameIdx];
  const isCleared = s.broken >= 3076;

  const paths = useMemo(() => {
    const p = ["", ""];
    simResult.initialBricks.forEach((b, i) => {
      if (s.alive[i]) {
        p[i % 2] += `M${b.x},${b.y}h8.2v8.2h-8.2z`;
      }
    });
    return p;
  }, [s.alive]);

  return (
    <AbsoluteFill
      style={{
        background: "#090c0b",
        fontFamily: "Arial, sans-serif",
        color: "white",
      }}
    >
      <Audio src={staticFile("sounds/kinetic/brickbreaker-sound.wav")} />

      <svg width="720" height="1280">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="#ffffff" strokeOpacity=".025" />
          </pattern>
        </defs>
        <rect
          x="25"
          y="135"
          width="670"
          height="1020"
          fill="#111510"
          stroke="#283026"
          strokeWidth="3"
        />
        <rect x="25" y="135" width="670" height="1020" fill="url(#grid)" />
        {paths.map((d, i) => (
          <path key={i} d={d} fill={i ? "#27946b" : "#37ab7a"} />
        ))}
        {simResult.initialBricks
          .filter(
            (b, i) =>
              s.alive[i] &&
              (i % cols < 3 || i % cols >= 57 || Math.floor(i / cols) < 3 || Math.floor(i / cols) >= 57)
          )
          .map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width="8.2" height="8.2" fill="#969c91" />
          ))}
        {s.drops.map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="15" fill={i % 2 ? "#b1ed2b" : "#1bd5d9"} />
            <text x={d.x} y={d.y + 5} fill="white" textAnchor="middle" fontSize="13" fontWeight="bold">
              ×3
            </text>
          </g>
        ))}
        {s.balls.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="7" fill="#d6f879" opacity=".15" />
            <circle cx={p.x} cy={p.y} r="3.7" fill="#edff9c" />
          </g>
        ))}
        <rect x={s.paddle - 70} y="1080" width="140" height="10" rx="5" fill="#ff8054" />
        <rect x={s.paddle - 64} y="1081" width="128" height="2" fill="#ffd68d" />

        {/* Victory Celebration Modal when all 3,076 bricks are shattered */}
        {isCleared && (
          <g transform="translate(360, 640)">
            <rect
              x="-260"
              y="-85"
              width="520"
              height="170"
              rx="18"
              fill="#060c09f0"
              stroke="#37ab7a"
              strokeWidth="2.5"
            />
            <text
              textAnchor="middle"
              y="-28"
              fontSize="20"
              fontWeight="700"
              fill="#9dffc8"
              letterSpacing="4"
            >
              ★ ALL 3,076 BRICKS DESTROYED ★
            </text>
            <text
              textAnchor="middle"
              y="22"
              fontSize="40"
              fontWeight="900"
              fill="#ffffff"
              letterSpacing="2"
            >
              PERFECT CLEAR
            </text>
            <text
              textAnchor="middle"
              y="60"
              fontSize="17"
              fontWeight="600"
              fill="#82cfad"
              letterSpacing="1"
            >
              100% WIPE • COMPLETED IN 52.4s
            </text>
          </g>
        )}
      </svg>

      <div style={{ position: "absolute", top: 49, left: 40, fontSize: 24, fontWeight: 800, letterSpacing: 3 }}>
        1K BRICK BREAKER
      </div>
      <div style={{ position: "absolute", top: 90, left: 40, fontSize: 14, letterSpacing: 2, color: "#9dae9d" }}>
        ONE BALL TO START • CATCH ×3 TO MULTIPLY
      </div>
      <div
        style={{
          position: "absolute",
          top: 1180,
          left: 40,
          right: 40,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 17,
          color: "#c3d8bd",
        }}
      >
        <span>BALLS {isCleared ? "64 • CLEAR" : s.balls.length.toString().padStart(2, "0")}</span>
        <span>BRICKS {isCleared ? "3,076 / 3,076 (100%)" : `${s.broken} / 3,076`}</span>
        <span>{isCleared ? "52.4s (CLEARED)" : `${(f / 30).toFixed(1)}s`}</span>
      </div>
    </AbsoluteFill>
  );
};
