import React, { useRef, useLayoutEffect } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { KINETIC_FIVE_ITEMS } from "./kineticManifest";

import heartBloomData from "../data/kinetic/HeartBloom.json";
import orbitBloomData from "../data/kinetic/OrbitBloom.json";
import ringRivalsData from "../data/kinetic/RingRivals.json";
import squareRivalsData from "../data/kinetic/SquareRivals.json";
import prismCollapseData from "../data/kinetic/PrismCollapse.json";

const dataMap: Record<string, any> = {
  HeartBloom: heartBloomData,
  OrbitBloom: orbitBloomData,
  RingRivals: ringRivalsData,
  SquareRivals: squareRivalsData,
  PrismCollapse: prismCollapseData,
};

const W = 720;
const H = 1280;

export interface KineticFiveProps {
  id?: string;
}

export const KineticFiveComposition: React.FC<KineticFiveProps> = ({ id = "HeartBloom" }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const data = dataMap[id];
  const itemMeta = KINETIC_FIVE_ITEMS.find((it) => it.id === id);

  useLayoutEffect(() => {
    if (!data || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const d = data;
    const currentFrameIdx = Math.max(0, Math.min(frame, d.frames.length - 1));
    const s = d.frames[currentFrameIdx];
    const done = frame >= d.finishFrame;

    const fill = d.kind === "heart" || d.kind === "orbit";
    const duel = d.kind === "rings" || d.kind === "square";
    const accent =
      d.kind === "heart"
        ? "#ff70b5"
        : d.kind === "orbit"
        ? "#52efd3"
        : d.kind === "square"
        ? "#ffce69"
        : "#7cc5ff";
    const red = d.kind === "square" ? "#ffc563" : "#ff577c";
    const blue = d.kind === "square" ? "#b398ff" : "#53b5ff";

    // Background gradient
    const bg = ctx.createRadialGradient(360, 650, 20, 360, 650, 850);
    bg.addColorStop(0, d.kind === "heart" ? "#27112d" : d.kind === "orbit" ? "#092c31" : "#111a31");
    bg.addColorStop(1, "#060912");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle background grid
    ctx.strokeStyle = "#ffffff05";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    const text = (
      str: string,
      x: number,
      y: number,
      size: number,
      color = "#f5f7ff",
      weight = 500,
      align: CanvasTextAlign = "center"
    ) => {
      ctx.textAlign = align;
      ctx.font = `${weight} ${size}px Arial, sans-serif`;
      ctx.fillStyle = color;
      ctx.fillText(str, x, y);
    };

    const idxNumber = KINETIC_FIVE_ITEMS.findIndex((m) => m.id === id) + 1;
    text(`KINETIC STUDIES  /  ${String(idxNumber).padStart(2, "0")}`, 360, 88, 14, accent, 600);
    text(d.title, 360, 151, 40, "#f7f5ff", 800);

    const rule = fill
      ? "One bounce. One new spark."
      : duel
      ? "Every bounce builds a new layer."
      : "Every broken brick releases a ball.";
    text(rule, 360, 195, 19, "#9facc1");

    if (fill) {
      ctx.save();
      ctx.translate(360, 665);
      const scale = done ? 1 - Math.min(1, (frame - d.finishFrame) / 50) * 0.12 : 1;
      ctx.scale(scale, scale);
      ctx.beginPath();
      if (d.kind === "orbit") {
        ctx.arc(0, 0, 274, 0, 2 * Math.PI);
        ctx.moveTo(90, 0);
        ctx.arc(0, 0, 90, 0, 2 * Math.PI, true);
      } else {
        d.poly!.forEach((p: number[], i: number) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.closePath();
      }
      ctx.fillStyle = "#0b1120";
      ctx.fill("evenodd");
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      const palettes = Array.from(
        { length: 18 },
        (_, i) => `hsl(${d.kind === "heart" ? 280 + i * 8 : 135 + i * 11},92%,65%)`
      );
      for (const c of d.cells!) {
        if (c.on <= frame) {
          ctx.fillStyle = palettes[c.color];
          ctx.globalAlpha = 0.75;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 5.0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      for (let i = 0; i < s.balls.length; i++) {
        const p = s.balls[i];
        ctx.fillStyle = palettes[i % 18];
        ctx.beginPath();
        ctx.arc(p[0], p[1], 3.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const pct = Math.floor((s.lit / d.cells!.length) * 100);
      text(done ? "EVERY CELL IS ALIGHT" : `${pct}% ILLUMINATED`, 360, 1032, 25, accent, 700);
      text(`${s.balls.length} SPARKS  /  STARTED WITH ONE`, 360, 1074, 14, "#9caec1");
      text(done ? "One spark changed everything." : "Can one spark light the whole shape?", 360, 1160, 19, "#dce5ef");
    } else if (duel) {
      text(d.kind === "square" ? "GOLD" : "RED", 170, 273, 15, red, 700);
      text(d.kind === "square" ? "VIOLET" : "BLUE", 550, 273, 15, blue, 700);
      text(String(s.score[0]), 170, 331, 54, red, 800);
      text(String(s.score[1]), 550, 331, 54, blue, 800);

      ctx.save();
      ctx.translate(360, 680);
      ctx.fillStyle = "#060a13";
      ctx.strokeStyle = "#ffffff25";
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (d.kind === "square") ctx.rect(-266, -266, 532, 532);
      else ctx.arc(0, 0, 266, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      for (const r of d.rings!.slice(0, s.rings)) {
        ctx.fillStyle = r.id === 0 ? red : blue;
        ctx.strokeStyle = "#0c1125";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        if (d.kind === "square") {
          ctx.rect(-r.outer, -r.outer, r.outer * 2, r.outer * 2);
          ctx.rect(-r.inner, -r.inner, r.inner * 2, r.inner * 2);
        } else {
          ctx.arc(0, 0, r.outer, 0, 2 * Math.PI);
          ctx.moveTo(r.inner, 0);
          ctx.arc(0, 0, r.inner, 0, 2 * Math.PI, true);
        }
        ctx.fill("evenodd");
        ctx.stroke();
      }

      if (!done) {
        s.balls.forEach((p: number[], i: number) => {
          const old = d.frames[Math.max(0, frame - 2)].balls[i];
          ctx.strokeStyle = i ? blue : red;
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.moveTo(old[0], old[1]);
          ctx.lineTo(p[0], p[1]);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.shadowColor = i ? blue : red;
          ctx.shadowBlur = 14;
          ctx.fillStyle = i ? blue : red;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      if (done) {
        ctx.fillStyle = "#070c18e8";
        ctx.fillRect(-254, -42, 508, 84);
        const win =
          s.score[0] === s.score[1]
            ? "A PERFECT TIE"
            : s.score[0] > s.score[1]
            ? d.kind === "square"
              ? "GOLD WINS"
              : "RED WINS"
            : d.kind === "square"
            ? "VIOLET WINS"
            : "BLUE WINS";
        text(win, 0, 14, 36, s.score[0] > s.score[1] ? red : blue, 800);
      }
      ctx.restore();

      text(done ? "ARENA CLOSED" : "THE SPACE IS RUNNING OUT", 360, 1030, 22, accent, 700);
      text(`${s.rings} LAYERS BUILT`, 360, 1073, 15, "#9cabc2");
      text(done ? "Final score. No time limit." : "Two balls. One shrinking arena.", 360, 1160, 19, "#dbe5f3");
    } else {
      ctx.strokeStyle = "#739cb736";
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 257, 656, 802);
      for (const b of d.bricks!) {
        if (b.dead < 0 || b.dead > frame) {
          ctx.fillStyle = `hsl(${b.hue},78%,61%)`;
          ctx.fillRect(b.x, b.y, 11.8, 11.8);
        } else if (frame - b.dead < 10) {
          ctx.globalAlpha = (1 - (frame - b.dead) / 10) * 0.7;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(b.x, b.y, 11.8, 11.8);
          ctx.globalAlpha = 1;
        }
      }

      if (!done) {
        s.balls.forEach((p: number[], i: number) => {
          ctx.fillStyle = i % 4 === 0 ? "#b6ffe7" : "#fff4b4";
          ctx.beginPath();
          ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (done) {
        ctx.fillStyle = "#080e1ce0";
        ctx.fillRect(65, 610, 590, 120);
        text("PRISM CLEARED", 360, 664, 38, "#b4ffe6", 800);
        text("Every single brick.", 360, 704, 21, "#b1c3d6");
      }
      text(`${s.remaining} BRICKS LEFT`, 360, 1130, 25, accent, 700);
      text(`${s.balls.length} BALLS IN PLAY`, 360, 1172, 15, "#a6b9cb");
    }

    // Bottom progress bar
    ctx.strokeStyle = "#ffffff1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(55, 1220);
    ctx.lineTo(665, 1220);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.moveTo(55, 1220);
    ctx.lineTo(55 + 610 * Math.min(1, frame / d.finishFrame), 1220);
    ctx.stroke();
  }, [data, frame, id]);

  return (
    <AbsoluteFill style={{ background: "#060912" }}>
      <canvas ref={canvasRef} width={W} height={H} style={{ width: "100%", height: "100%" }} />
      <Audio src={staticFile(`sounds/kinetic/${id}-sound.wav`)} />
          </AbsoluteFill>
  );
};
