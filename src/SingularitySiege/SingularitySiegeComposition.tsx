import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, useVideoConfig, Audio, Sequence, staticFile } from "remotion";
import { StudioBilingualBadge } from "../components/StudioBilingualBadge";

import ep1Data from "../data/singularity/ep1.json";
import ep2Data from "../data/singularity/ep2.json";
import ep3Data from "../data/singularity/ep3.json";
import ep4Data from "../data/singularity/ep4.json";
import ep5Data from "../data/singularity/ep5.json";
import ep6Data from "../data/singularity/ep6.json";
import ep7Data from "../data/singularity/ep7.json";
import ep8Data from "../data/singularity/ep8.json";
import ep9Data from "../data/singularity/ep9.json";
import ep10Data from "../data/singularity/ep10.json";

export const singularityEpisodeMap: Record<number, any> = {
  1: ep1Data,
  2: ep2Data,
  3: ep3Data,
  4: ep4Data,
  5: ep5Data,
  6: ep6Data,
  7: ep7Data,
  8: ep8Data,
  9: ep9Data,
  10: ep10Data,
};

export function getSingularityDuration(episode: number): number {
  const data = singularityEpisodeMap[episode] || ep1Data;
  return data.manifest.totalFrames;
}

interface BallState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  c: string;
}

export interface SingularitySiegeProps {
  episode?: number;
}

export const SingularitySiegeComposition: React.FC<SingularitySiegeProps> = ({ episode = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const simData = singularityEpisodeMap[episode] || ep1Data;
  const { manifest, staticNodes, destroyedAtFrame, frames, audioEvents } = simData;

  const introFrames = manifest.introFrames || 0;
  const simFrames = manifest.simulationFrames;
  const endSimFrame = introFrames + simFrames;
  const observeFrames = manifest.observeResultFrames || 60; // 2.0s observation
  const modalEntranceFrames = manifest.modalEntranceFrames || 15; // 0.5s modal entrance
  const modalStartFrame = endSimFrame + observeFrames;
  const modalFullFrame = modalStartFrame + modalEntranceFrames;

  // Clamped simulation frame index
  const simIndex = Math.max(0, Math.min(frame - introFrames, frames.length - 1));
  const isIntro = introFrames > 0 && frame < introFrames;
  const isWon = frame >= endSimFrame;
  const isObserving = frame >= endSimFrame && frame < modalStartFrame;
  const isModalVisible = frame >= modalStartFrame;
  const currentSimState = frames[simIndex];

  // History buffer for smooth comet trails (last 16 frames)
  const ballTrails = useMemo(() => {
    const trails: Record<number, Array<{ x: number; y: number }>> = { 0: [], 1: [], 2: [] };
    const startIdx = Math.max(0, simIndex - 16);
    for (let i = startIdx; i <= simIndex; i++) {
      const fData = frames[i];
      if (!fData) continue;
      fData.balls.forEach((b: BallState) => {
        if (!trails[b.id]) trails[b.id] = [];
        trails[b.id].push({ x: b.x, y: b.y });
      });
    }
    return trails;
  }, [simIndex, frames]);

  // Canvas 2D render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = 540;
    const cy = 960;
    const arenaR = 470;

    // 1. Deep Cosmic Background (#07090e)
    ctx.fillStyle = "#07090e";
    ctx.fillRect(0, 0, width, height);

    // Subtle cosmic starfield / grid
    ctx.save();
    ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
    ctx.lineWidth = 1;
    const gridSize = 80;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Radial background nebula glow
    const bgGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, 600);
    bgGlow.addColorStop(0, "rgba(120, 20, 180, 0.16)");
    bgGlow.addColorStop(0.5, "rgba(0, 80, 160, 0.08)");
    bgGlow.addColorStop(1, "rgba(7, 9, 14, 0)");
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // 2. Outer Containment Arena Boundary (Radius 470)
    ctx.save();
    // Outer ambient glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, arenaR, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
    ctx.lineWidth = 14;
    ctx.shadowColor = "#00F0FF";
    ctx.shadowBlur = 25;
    ctx.stroke();

    // Sharp containment circle
    ctx.beginPath();
    ctx.arc(cx, cy, arenaR, 0, Math.PI * 2);
    ctx.strokeStyle = "#00F0FF";
    ctx.lineWidth = 3.5;
    ctx.shadowColor = "#00F0FF";
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Rotating perimeter ticks
    const numTicks = 36;
    const tickRot = frame * 0.005;
    ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
    ctx.lineWidth = 2;
    for (let i = 0; i < numTicks; i++) {
      const ang = tickRot + (i / numTicks) * Math.PI * 2;
      const r1 = arenaR - 6;
      const r2 = arenaR + 6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
      ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
      ctx.stroke();
    }
    ctx.restore();

    // Concentric guide tracks
    [410, 330, 250, 170].forEach((r) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.restore();
    });

    // 3. Central Gravitational Singularity & Accretion Disk (Radius 48)
    const coreR = 48;
    const pulseFactor = 1 + 0.05 * Math.sin(frame * 0.15);

    // Expanding gravity wave pulses
    const waveProgress = (frame % 45) / 45;
    const waveR = coreR + waveProgress * 220;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, waveR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(180, 0, 255, ${0.4 * (1 - waveProgress)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Accretion disk glow
    ctx.save();
    const diskGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, coreR * 1.8 * pulseFactor);
    diskGrad.addColorStop(0, "#000000");
    diskGrad.addColorStop(0.5, "#B026FF");
    diskGrad.addColorStop(0.85, "#FF007F");
    diskGrad.addColorStop(1, "rgba(255, 0, 127, 0)");
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 1.8 * pulseFactor, 0, Math.PI * 2);
    ctx.fill();

    // Black Hole Event Horizon
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fillStyle = "#040508";
    ctx.fill();
    ctx.strokeStyle = "#B026FF";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#B026FF";
    ctx.shadowBlur = 18;
    ctx.stroke();

    // Rotating 4-blade deflector cross
    const crossAng = frame * 0.04;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(crossAng);
    for (let a = 0; a < 4; a++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, coreR - 2);
      ctx.strokeStyle = "#00F0FF";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00F0FF";
      ctx.shadowBlur = 12;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, coreR - 4, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();

    // 4. Draw 108 Target Hexagonal Crystal Nodes
    staticNodes.forEach((node: any) => {
      const hitFrame = destroyedAtFrame[node.id];
      const isAlive = hitFrame === -1 || (frame - introFrames) < hitFrame;

      if (isAlive) {
        const hexR = 14;
        ctx.save();
        ctx.translate(node.x, node.y);
        ctx.rotate(frame * 0.02 + node.id * 0.1);

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const hx = Math.cos(a) * hexR;
          const hy = Math.sin(a) * hexR;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();

        ctx.fillStyle = node.color + "33";
        ctx.fill();

        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.restore();
      } else {
        const age = (frame - introFrames) - hitFrame;
        if (age >= 0 && age < 24) {
          const progress = age / 24;
          const particleCount = 8;
          ctx.save();
          ctx.fillStyle = node.color;
          ctx.globalAlpha = 1 - progress;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 10;

          for (let p = 0; p < particleCount; p++) {
            const pAng = (p / particleCount) * Math.PI * 2 + node.id;
            const pDist = progress * 45;
            const px = node.x + Math.cos(pAng) * pDist;
            const py = node.y + Math.sin(pAng) * pDist;
            const pSize = Math.max(1, (1 - progress) * 4);

            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(node.x, node.y, progress * 30, 0, Math.PI * 2);
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 1.5 * (1 - progress);
          ctx.stroke();
          ctx.restore();
        }
      }
    });

    // 5. Draw Kinetic Comets and Motion Trails
    if (!isIntro && currentSimState) {
      currentSimState.balls.forEach((ball: BallState) => {
        const trail = ballTrails[ball.id] || [];
        if (trail.length > 1) {
          ctx.save();
          for (let t = 0; t < trail.length - 1; t++) {
            const p1 = trail[t];
            const p2 = trail[t + 1];
            const alpha = ((t + 1) / trail.length) * 0.65;
            const widthScale = ((t + 1) / trail.length) * 9;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = ball.c;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = widthScale;
            ctx.lineCap = "round";
            ctx.shadowColor = ball.c;
            ctx.shadowBlur = 15;
            ctx.stroke();
          }
          ctx.restore();
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = ball.c;
        ctx.shadowBlur = 24;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 11, 0, Math.PI * 2);
        ctx.strokeStyle = ball.c;
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.restore();
      });
    }

    // 6. Victory Supernova Effect during postSimFrames (165 frames)
    if (isWon) {
      const endAge = frame - endSimFrame;
      const endProgress = Math.min(1, endAge / 165);

      ctx.save();
      const boomR = 50 + endProgress * 820;
      ctx.beginPath();
      ctx.arc(cx, cy, boomR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 215, 0, ${Math.max(0, 1 - endProgress * 1.1)})`;
      ctx.lineWidth = 8 * (1 - endProgress * 0.7);
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 35;
      ctx.stroke();

      const numRays = 16;
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 0.8 * (1 - endProgress))})`;
      ctx.lineWidth = 2.5;
      for (let r = 0; r < numRays; r++) {
        const rayAng = (r / numRays) * Math.PI * 2 + endAge * 0.02;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rayAng) * boomR * 0.9, cy + Math.sin(rayAng) * boomR * 0.9);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [frame, introFrames, endSimFrame, isIntro, isWon, currentSimState, ballTrails, staticNodes, destroyedAtFrame, frames, width, height]);

  // HUD calculation data
  const remainingCount = currentSimState ? currentSimState.r : 108;
  const initialNodes = manifest.initialNodes || 108;
  const destroyedCount = initialNodes - remainingCount;
  const progressPct = Math.min(100, Math.round((destroyedCount / initialNodes) * 100));
  const activeBallsCount = currentSimState ? currentSimState.balls.length : 1;

  const primaryBall = currentSimState?.balls[0];
  const currentSpeedPxS = primaryBall
    ? Math.round(Math.hypot(primaryBall.vx, primaryBall.vy) * 30)
    : 450;

  const elapsedSimSec = isIntro ? 0 : Math.min(simFrames / 30, (frame - introFrames) / 30);
  const minStr = String(Math.floor(elapsedSimSec / 60)).padStart(2, "0");
  const secStr = String(Math.floor(elapsedSimSec % 60)).padStart(2, "0");
  const msStr = String(Math.floor((elapsedSimSec % 1) * 10));
  const timeFormatted = `${minStr}:${secStr}.${msStr}`;

  // Dynamic Phase Title
  let phaseText = "PHASE 1: SINGLE COMET IGNITION";
  let phaseColor = "#00F0FF";
  if (remainingCount <= 27) {
    phaseText = "PHASE 3: HYPERDRIVE TRI-COMET OVERDRIVE ⚡";
    phaseColor = "#FFD700";
  } else if (remainingCount <= 54) {
    phaseText = "PHASE 2: BINARY RESONANCE SPLIT (2X) 🔥";
    phaseColor = "#FF007F";
  }
  if (isObserving) {
    phaseText = "✨ SINGULARITY COLLAPSED! ALL CORES PURGED ✨";
    phaseColor = "#39FF14";
  } else if (isModalVisible) {
    phaseText = "SINGULARITY PURGED: 100% COMPLETE 🏆";
    phaseColor = "#FFD700";
  }

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#07090e",
        position: "relative",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <StudioBilingualBadge
        topicEn="Kinetic ASMR Singularity Siege"
        topicVn="Vật Lý Hấp Dẫn ASMR Singularity Siege"
        epNumber={episode}
        epTitleEn={`Seed #${simData.manifest.seed} (108 Cores Purge)`}
      />

      {/* 2D Canvas Layer */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* TOP HUD HEADER */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
          padding: "0 40px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 46,
            fontWeight: 900,
            letterSpacing: "2px",
            color: "#FFFFFF",
            textAlign: "center",
            textTransform: "uppercase",
            textShadow: "0 0 25px rgba(0, 240, 255, 0.7), 0 4px 12px rgba(0,0,0,0.9)",
          }}
        >
          SINGULARITY SIEGE
        </h1>

        <div
          style={{
            marginTop: 6,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "3px",
            color: "#00F0FF",
            textShadow: "0 0 14px rgba(0, 240, 255, 0.8)",
            textTransform: "uppercase",
          }}
        >
          EPISODE #{episode} • PURGE ALL 108 ORBITAL CORES
        </div>

        {/* Real-time Progress Bar */}
        <div
          style={{
            marginTop: 22,
            width: 720,
            height: 22,
            borderRadius: 11,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            border: "1.5px solid rgba(0, 240, 255, 0.4)",
            boxShadow: "0 0 20px rgba(0, 240, 255, 0.25)",
            padding: 2,
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              borderRadius: 9,
              background: "linear-gradient(90deg, #00F0FF, #39FF14, #FFD700, #FF007F)",
              boxShadow: "0 0 16px rgba(255, 215, 0, 0.8)",
            }}
          />
        </div>

        {/* 3 Metric Cards */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            width: 720,
          }}
        >
          {/* Card 1: Cores Left */}
          <div
            style={{
              flex: 1,
              margin: "0 8px",
              padding: "10px 14px",
              borderRadius: 14,
              backgroundColor: "rgba(10, 16, 28, 0.85)",
              border: `1.5px solid ${remainingCount <= 27 ? "#FF007F" : "#00F0FF"}`,
              boxShadow: `0 0 18px ${remainingCount <= 27 ? "rgba(255, 0, 127, 0.3)" : "rgba(0, 240, 255, 0.2)"}`,
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#8E9EBC", letterSpacing: "1px" }}>
              CORES LEFT
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: remainingCount <= 10 ? "#FF1744" : remainingCount <= 30 ? "#FFD700" : "#FFFFFF",
                textShadow: "0 0 12px currentColor",
              }}
            >
              {remainingCount}
              <span style={{ fontSize: 16, color: "#8E9EBC", fontWeight: 600 }}> / {initialNodes}</span>
            </div>
          </div>

          {/* Card 2: Comet Speed */}
          <div
            style={{
              flex: 1,
              margin: "0 8px",
              padding: "10px 14px",
              borderRadius: 14,
              backgroundColor: "rgba(10, 16, 28, 0.85)",
              border: "1.5px solid rgba(57, 255, 20, 0.6)",
              boxShadow: "0 0 18px rgba(57, 255, 20, 0.2)",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#8E9EBC", letterSpacing: "1px" }}>
              ORBIT VELOCITY
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#39FF14", textShadow: "0 0 12px #39FF14" }}>
              {currentSpeedPxS}
              <span style={{ fontSize: 16, color: "#8E9EBC", fontWeight: 600 }}> px/s</span>
            </div>
          </div>

          {/* Card 3: Active Comets */}
          <div
            style={{
              flex: 1,
              margin: "0 8px",
              padding: "10px 14px",
              borderRadius: 14,
              backgroundColor: "rgba(10, 16, 28, 0.85)",
              border: "1.5px solid rgba(255, 215, 0, 0.6)",
              boxShadow: "0 0 18px rgba(255, 215, 0, 0.2)",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#8E9EBC", letterSpacing: "1px" }}>
              ACTIVE COMETS
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#FFD700", textShadow: "0 0 12px #FFD700" }}>
              {activeBallsCount}x
              <span style={{ fontSize: 16, color: "#8E9EBC", fontWeight: 600 }}> ORBS</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "12px 32px",
            borderRadius: 30,
            backgroundColor: "rgba(12, 18, 32, 0.9)",
            border: `2px solid ${phaseColor}`,
            boxShadow: `0 0 28px ${phaseColor}55`,
            color: phaseColor,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "1.5px",
            textAlign: "center",
            textTransform: "uppercase",
            backdropFilter: "blur(12px)",
          }}
        >
          {phaseText}
        </div>

        <div
          style={{
            marginTop: 14,
            fontSize: 20,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "2px",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span>
            TIME: <span style={{ color: "#00F0FF", fontWeight: 900 }}>{timeFormatted}</span>
          </span>
          <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>•</span>
          <span>
            PURGED: <span style={{ color: "#39FF14", fontWeight: 900 }}>{progressPct}%</span>
          </span>
          <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>•</span>
          <span>
            SEED: <span style={{ color: "#FFD700", fontWeight: 900 }}>{manifest.seed}</span>
          </span>
        </div>
      </div>

      {/* FINAL VICTORY MODAL (Strict 3-stage pacing formula: 60f observe + 15f entrance + 90f hold) */}
      {isModalVisible && (() => {
        let modalOpacity = 1;
        let modalScale = 1;
        let modalTranslateY = 0;
        if (frame < modalFullFrame) {
          const t = Math.max(0, Math.min(1, (frame - modalStartFrame) / modalEntranceFrames));
          const easeOut = 1 - Math.pow(1 - t, 3); // Cubic ease out
          modalOpacity = easeOut;
          modalScale = 0.82 + 0.18 * easeOut;
          modalTranslateY = (1 - easeOut) * 35;
        }

        return (
          <div
            style={{
              position: "absolute",
              top: 560 + modalTranslateY,
              left: 140,
              width: 800,
              borderRadius: 28,
              backgroundColor: "rgba(6, 10, 20, 0.94)",
              border: "3px solid #FFD700",
              boxShadow: "0 0 60px rgba(255, 215, 0, 0.5), 0 0 120px rgba(255, 215, 0, 0.2)",
              padding: "44px 30px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              zIndex: 40,
              backdropFilter: "blur(20px)",
              opacity: modalOpacity,
              transform: `scale(${modalScale})`,
              transformOrigin: "center center",
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: "#FFD700",
                letterSpacing: "3px",
                textShadow: "0 0 30px rgba(255, 215, 0, 0.8)",
              }}
            >
              SINGULARITY PURGED! 🏆
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 24,
                fontWeight: 700,
                color: "#39FF14",
                letterSpacing: "2px",
                textShadow: "0 0 15px rgba(57, 255, 20, 0.7)",
              }}
            >
              ALL 108 ORBITAL CORES DESTROYED
            </div>

            {/* Result details table */}
            <div
              style={{
                marginTop: 28,
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  padding: "16px 20px",
                  borderRadius: 16,
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                }}
              >
                <div style={{ fontSize: 16, color: "#8E9EBC", fontWeight: 600 }}>SIMULATION TIME</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#FFFFFF", marginTop: 4 }}>
                  {manifest.simulationDurationSec}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  padding: "16px 20px",
                  borderRadius: 16,
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                }}
              >
                <div style={{ fontSize: 16, color: "#8E9EBC", fontWeight: 600 }}>TOTAL PURGED</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#39FF14", marginTop: 4 }}>
                  108 / 108 (100%)
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  padding: "16px 20px",
                  borderRadius: 16,
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                }}
              >
                <div style={{ fontSize: 16, color: "#8E9EBC", fontWeight: 600 }}>PEAK VELOCITY</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#00F0FF", marginTop: 4 }}>
                  {manifest.maxVelocityPxS} px/s
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  padding: "16px 20px",
                  borderRadius: 16,
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                }}
              >
                <div style={{ fontSize: 16, color: "#8E9EBC", fontWeight: 600 }}>STATUS</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#FFD700", marginTop: 4 }}>
                  SSS+ RANK ✅
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SYNCHRONIZED AUDIO EVENTS */}
      {audioEvents.map((evt: { frame: number; sound: string; vol: number }, idx: number) => (
        <Sequence key={idx} from={evt.frame} durationInFrames={30}>
          <Audio src={staticFile(evt.sound)} volume={evt.vol} />
        </Sequence>
      ))}
    </div>
  );
};
