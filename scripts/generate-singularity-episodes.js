const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'src', 'data', 'singularity');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function createPRNG(seedNum) {
  let s = Math.abs(Math.floor(seedNum)) % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function runFullSimulation(seed = 10031, episode = 1) {
  const rand = createPRNG(seed);
  const width = 1080;
  const height = 1920;
  const cx = 540;
  const cy = 960;
  const arenaR = 470;
  const ballR = 11;
  const nodeR = 15;
  const introFrames = 0; // ZERO INTRO for instant hook

  // 108 nodes in 4 concentric rings
  const staticNodes = [];
  const rings = [
    { r: 410, count: 36, color: "#00F0FF", tier: 1, name: "Outer Barrier" },
    { r: 330, count: 30, color: "#39FF14", tier: 2, name: "Kinetic Lattice" },
    { r: 250, count: 24, color: "#FFD700", tier: 3, name: "Plasma Shield" },
    { r: 170, count: 18, color: "#FF007F", tier: 4, name: "Core Resonator" },
  ];

  let idCounter = 0;
  rings.forEach((ring, ringIdx) => {
    const angleOffset = ringIdx * 0.15;
    for (let i = 0; i < ring.count; i++) {
      const angle = angleOffset + (i / ring.count) * Math.PI * 2;
      staticNodes.push({
        id: idCounter++,
        x: Math.round((cx + Math.cos(angle) * ring.r) * 10) / 10,
        y: Math.round((cy + Math.sin(angle) * ring.r) * 10) / 10,
        color: ring.color,
        tier: ring.tier,
        ringR: ring.r,
      });
    }
  });

  const totalNodes = staticNodes.length; // 108
  const nodeAliveState = new Array(totalNodes).fill(true);
  const destroyedAtFrame = new Array(totalNodes).fill(-1);

  // Balls array: start with 1 ball
  const launchAngle = rand() * Math.PI * 2;
  const launchSpeed = 15.5 + rand() * 2.5;
  const launchDist = 200 + rand() * 60;
  const balls = [
    {
      id: 0,
      x: cx + Math.cos(launchAngle) * launchDist,
      y: cy + Math.sin(launchAngle) * launchDist,
      vx: -Math.sin(launchAngle) * launchSpeed,
      vy: Math.cos(launchAngle) * launchSpeed,
      color: "#00F0FF",
      active: true,
    },
  ];

  let remainingNodes = totalNodes;
  let simEndFrame = -1;
  const maxFrames = 3000;
  const substeps = 4;

  const audioEvents = [];
  const frames = [];

  let splitAt54Done = false;
  let splitAt27Done = false;
  let lastWallBounceFrame = -10;
  let lastCoreBounceFrame = -10;
  let maxVelocityRecorded = 0;

  // PINNED PACING FORMULA: 165 post-completion frames
  const observeFrames = 60; // 2.0s physics settling
  const modalEntranceFrames = 15; // 0.5s modal ease-in
  const modalHoldFrames = 90; // 3.0s modal hold & CTA
  const postSimFrames = observeFrames + modalEntranceFrames + modalHoldFrames; // 165 frames

  for (let frame = 0; frame < maxFrames; frame++) {
    // Record true completion frame
    if (remainingNodes === 0 && simEndFrame === -1) {
      simEndFrame = frame;
      audioEvents.push({
        frame: introFrames + simEndFrame,
        sound: "sounds/singularity_collapse.wav",
        vol: 0.85,
        type: "collapse",
      });
      audioEvents.push({
        frame: introFrames + simEndFrame + observeFrames,
        sound: "sounds/milestone.wav",
        vol: 0.55,
        type: "modal_reveal",
      });
    }

    if (simEndFrame !== -1 && frame >= simEndFrame + postSimFrames) {
      break;
    }

    // Trigger Multi-Ball Milestones
    if (remainingNodes <= 54 && !splitAt54Done && balls.length === 1) {
      splitAt54Done = true;
      const b0 = balls[0];
      balls.push({
        id: 1,
        x: b0.x,
        y: b0.y,
        vx: -b0.vy * 0.95,
        vy: b0.vx * 0.95,
        color: "#FF007F",
        active: true,
      });
      audioEvents.push({
        frame: introFrames + frame,
        sound: "sounds/milestone.wav",
        vol: 0.8,
        type: "milestone",
      });
    }

    if (remainingNodes <= 27 && !splitAt27Done && balls.length === 2) {
      splitAt27Done = true;
      const b0 = balls[0];
      balls.push({
        id: 2,
        x: b0.x,
        y: b0.y,
        vx: (b0.vx + b0.vy) * 0.7,
        vy: (b0.vy - b0.vx) * 0.7,
        color: "#FFD700",
        active: true,
      });
      audioEvents.push({
        frame: introFrames + frame,
        sound: "sounds/milestone.wav",
        vol: 0.8,
        type: "milestone",
      });
    }

    // Physics sub-stepping
    for (let step = 0; step < substeps; step++) {
      const dt = 1.0 / substeps;

      for (const b of balls) {
        if (!b.active) continue;

        // Central gravity well
        const dx = cx - b.x;
        const dy = cy - b.y;
        const dist = Math.hypot(dx, dy);

        const gConst = 44.0;
        const eps = 40.0;
        const gMag = gConst / Math.pow(dist + eps, 1.3);
        const gx = (dx / (dist + 0.001)) * gMag;
        const gy = (dy / (dist + 0.001)) * gMag;

        b.vx += gx * dt;
        b.vy += gy * dt;

        // Central core bounce / slingshot deflector
        const coreR = 48;
        if (dist < coreR + ballR) {
          const nx = (b.x - cx) / dist;
          const ny = (b.y - cy) / dist;
          const dot = b.vx * nx + b.vy * ny;
          if (dot < 0) {
            b.vx = (b.vx - 2 * dot * nx) * 1.06;
            b.vy = (b.vy - 2 * dot * ny) * 1.06;
            b.x = cx + nx * (coreR + ballR + 0.5);
            b.y = cy + ny * (coreR + ballR + 0.5);

            if (frame - lastCoreBounceFrame >= 6) {
              lastCoreBounceFrame = frame;
              audioEvents.push({
                frame: introFrames + frame,
                sound: "sounds/slingshot.wav",
                vol: 0.45,
                type: "core",
              });
            }
          }
        }

        // Weak homing guidance when <= 8 nodes remain
        if (remainingNodes <= 8) {
          let closestNode = null;
          let minDist = 999999;
          for (let ni = 0; ni < totalNodes; ni++) {
            if (!nodeAliveState[ni]) continue;
            const n = staticNodes[ni];
            const ndx = n.x - b.x;
            const ndy = n.y - b.y;
            const d = Math.hypot(ndx, ndy);
            if (d < minDist) {
              minDist = d;
              closestNode = n;
            }
          }
          if (closestNode && minDist < 320) {
            const hx = (closestNode.x - b.x) / minDist;
            const hy = (closestNode.y - b.y) / minDist;
            b.vx += hx * 0.15 * dt;
            b.vy += hy * 0.15 * dt;
          }
        }

        // Speed cap/floor
        const curSpeed = Math.hypot(b.vx, b.vy);
        const minSpeed = 13.5;
        const maxSpeed = 22.0;
        if (curSpeed < minSpeed) {
          b.vx = (b.vx / curSpeed) * minSpeed;
          b.vy = (b.vy / curSpeed) * minSpeed;
        } else if (curSpeed > maxSpeed) {
          b.vx = (b.vx / curSpeed) * maxSpeed;
          b.vy = (b.vy / curSpeed) * maxSpeed;
        }

        if (curSpeed > maxVelocityRecorded) {
          maxVelocityRecorded = curSpeed;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Arena boundary collision
        const distFromCenter = Math.hypot(b.x - cx, b.y - cy);
        if (distFromCenter + ballR >= arenaR) {
          const nx = (b.x - cx) / distFromCenter;
          const ny = (b.y - cy) / distFromCenter;
          const dot = b.vx * nx + b.vy * ny;
          if (dot > 0) {
            b.vx = (b.vx - 2 * dot * nx) * 0.995;
            b.vy = (b.vy - 2 * dot * ny) * 0.995;
            b.x = cx + nx * (arenaR - ballR - 0.5);
            b.y = cy + ny * (arenaR - ballR - 0.5);

            if (frame - lastWallBounceFrame >= 4) {
              lastWallBounceFrame = frame;
              audioEvents.push({
                frame: introFrames + frame,
                sound: "sounds/wall_bounce.wav",
                vol: 0.35,
                type: "wall",
              });
            }
          }
        }

        // Node collisions
        for (let ni = 0; ni < totalNodes; ni++) {
          if (!nodeAliveState[ni]) continue;
          const n = staticNodes[ni];
          const ndx = b.x - n.x;
          const ndy = b.y - n.y;
          const ndist = Math.hypot(ndx, ndy);
          if (ndist < ballR + nodeR) {
            nodeAliveState[ni] = false;
            destroyedAtFrame[ni] = frame;
            remainingNodes--;

            const noteIdx = Math.min(9, Math.floor((1 - remainingNodes / totalNodes) * 10));
            audioEvents.push({
              frame: introFrames + frame,
              sound: `sounds/crystal_${noteIdx}.wav`,
              vol: 0.65,
              type: "node",
            });

            const nx = ndx / (ndist || 1);
            const ny = ndy / (ndist || 1);
            const dot = b.vx * nx + b.vy * ny;
            if (dot < 0) {
              b.vx = b.vx - 2 * dot * nx;
              b.vy = b.vy - 2 * dot * ny;
            }
            break;
          }
        }
      }
    }

    frames.push({
      f: frame,
      r: remainingNodes,
      balls: balls.map((b) => ({
        id: b.id,
        x: Math.round(b.x * 10) / 10,
        y: Math.round(b.y * 10) / 10,
        vx: Math.round(b.vx * 10) / 10,
        vy: Math.round(b.vy * 10) / 10,
        c: b.color,
      })),
    });
  }

  // Safety fallback if sim didn't finish within maxFrames
  if (simEndFrame === -1) {
    simEndFrame = frames.length - 1;
  }

  const totalVideoFrames = introFrames + simEndFrame + postSimFrames;
  const simulationDurationSec = (simEndFrame / 30).toFixed(2);
  const totalVideoDurationSec = (totalVideoFrames / 30).toFixed(2);

  const manifest = {
    title: `SINGULARITY SIEGE • EPISODE #${episode}`,
    theme: "Dark Neon Cosmic Void (#07090e) with Hexagonal Crystal Resonators",
    episode,
    seed,
    width,
    height,
    fps: 30,
    introFrames,
    simulationFrames: simEndFrame,
    observeResultFrames: observeFrames,
    modalEntranceFrames,
    modalHoldFrames,
    totalPostFrames: postSimFrames,
    totalFrames: totalVideoFrames,
    simulationDurationSec: `${simulationDurationSec}s`,
    totalVideoDurationSec: `${totalVideoDurationSec}s`,
    initialNodes: totalNodes,
    remainingNodesAtEnd: remainingNodes,
    endCondition: "All 108 orbital resonance cores destroyed naturally by kinetic comets under gravity",
    audioEventsCount: audioEvents.length,
    maxVelocityPxS: Math.round(maxVelocityRecorded * 30),
  };

  const outputData = {
    manifest,
    staticNodes,
    destroyedAtFrame,
    frames,
    audioEvents,
  };

  const outPath = path.join(OUT_DIR, `ep${episode}.json`);
  fs.writeFileSync(outPath, JSON.stringify(outputData), 'utf-8');
  console.log(`[Episode ${episode}] Seed ${seed} -> ${totalVideoFrames} frames (${totalVideoDurationSec}s) -> saved to ${outPath}`);
  return manifest;
}

// Generate 10 distinct simulation episodes
console.log("🌌 PRECOMPUTING 10 KINETIC SINGULARITY ASMR EPISODES...");
const seeds = [10031, 10042, 10055, 10068, 10077, 10083, 10091, 10104, 10118, 10129];
seeds.forEach((seed, idx) => {
  runFullSimulation(seed, idx + 1);
});
console.log("🎉 All 10 Singularity episodes successfully precomputed!");
