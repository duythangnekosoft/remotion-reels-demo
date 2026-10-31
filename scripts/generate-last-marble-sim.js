/**
 * High-Precision Deterministic Physics Generator for "THE LAST MARBLE"
 *
 * Simulates a continuous physical journey through 6 mechanical tiers:
 * Tier 1: Upper Ivory Chute & Pentatonic Chime Pins (Frames 0 - 230)
 * Tier 2: Rotating 3-Pocket Escapement Mechanism (Frames 230 - 470)
 * Tier 3: Marimba Bouncing Cascade & Elastic Dampers (Frames 470 - 740)
 * Tier 4: Dynamic Balanced Seesaw Rocker (Frames 740 - 940)
 * Tier 5: Shutter Gate of Suspense & Cycloid Acceleration (Frames 940 - 1140)
 * Tier 6: The Golden Bell Climax & Resonance Decay (Frames 1140 - 1260)
 */

const fs = require("fs");
const path = require("path");

const FPS = 30;
const TOTAL_FRAMES = 1260; // 42.0 seconds
const GRAVITY = 980; // px/s^2
const MARBLE_R = 18;

// Spline & Curve helpers
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

// Cubic Bezier curve evaluator
function cubicBezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

// Generate dense sampled polyline from bezier
function sampleBezier(p0, p1, p2, p3, steps = 100) {
  const points = [];
  let totalLength = 0;
  let prev = p0;
  points.push({ ...p0, s: 0 });

  for (let i = 1; i <= steps; i++) {
    const pt = cubicBezier(p0, p1, p2, p3, i / steps);
    const d = dist(prev.x, prev.y, pt.x, pt.y);
    totalLength += d;
    points.push({ ...pt, s: totalLength });
    prev = pt;
  }
  return { points, totalLength };
}

// Evaluate position along sampled polyline
function getPosAtDistance(sampled, s) {
  const clampedS = Math.max(0, Math.min(sampled.totalLength, s));
  const pts = sampled.points;
  for (let i = 0; i < pts.length - 1; i++) {
    if (pts[i + 1].s >= clampedS) {
      const segLen = pts[i + 1].s - pts[i].s;
      const t = segLen > 0 ? (clampedS - pts[i].s) / segLen : 0;
      return {
        x: lerp(pts[i].x, pts[i + 1].x, t),
        y: lerp(pts[i].y, pts[i + 1].y, t),
        dx: pts[i + 1].x - pts[i].x,
        dy: pts[i + 1].y - pts[i].y,
      };
    }
  }
  const last = pts[pts.length - 1];
  return { x: last.x, y: last.y, dx: 1, dy: 0 };
}

function generateCompleteSimulation() {
  console.log("🛠️ Building Mechanical Maze Geometry & Simulating Trajectory...");

  // ==========================================
  // 1. GEOMETRY PATH SPECIFICATIONS
  // ==========================================

  // --- Track 1: Upper Incline (Tier 1) ---
  // (210, 180) -> (780, 290)
  const track1Curve = sampleBezier(
    { x: 210, y: 180 },
    { x: 360, y: 220 },
    { x: 620, y: 260 },
    { x: 770, y: 290 },
    120
  );

  // --- Turn 1: Upper Right Loop (Tier 1) ---
  // (770, 290) -> (830, 350) -> (760, 410)
  const turn1Curve = sampleBezier(
    { x: 770, y: 290 },
    { x: 840, y: 310 },
    { x: 840, y: 390 },
    { x: 760, y: 410 },
    80
  );

  // --- Track 2: Leftward Switchback (Tier 1) ---
  // (760, 410) -> (360, 495)
  const track2Curve = sampleBezier(
    { x: 760, y: 410 },
    { x: 620, y: 435 },
    { x: 480, y: 465 },
    { x: 360, y: 495 },
    120
  );

  // --- Escapement Entrance Funnel (Tier 2) ---
  // Drops from (360, 495) into wheel at (364, 568)
  const funnel1Curve = sampleBezier(
    { x: 360, y: 495 },
    { x: 350, y: 520 },
    { x: 355, y: 545 },
    { x: 364, y: 568 },
    60
  );

  // --- Wheel Center & Radius (Tier 2) ---
  const wheelCenter = { x: 420, y: 625, r: 80 };

  // --- Track 3: Ramp beneath Wheel (Tier 2) ---
  // Starts exactly at bottom of wheel (420, 705) -> (770, 775)
  const track3Curve = sampleBezier(
    { x: 420, y: 705 },
    { x: 520, y: 725 },
    { x: 650, y: 750 },
    { x: 770, y: 775 },
    120
  );

  // --- Elastic Bumpers (Tier 3) ---
  const rightBumper = { x1: 825, y1: 745, x2: 775, y2: 820, angle: -0.65 };
  const leftBumper = { x1: 250, y1: 915, x2: 305, y2: 985, angle: 0.65 };

  // --- Track 4: Catch Ramp into Seesaw (Tier 3) ---
  // Starts at left bumper exit (300, 950) -> (520, 1035)
  const track4Curve = sampleBezier(
    { x: 300, y: 950 },
    { x: 370, y: 985 },
    { x: 450, y: 1015 },
    { x: 520, y: 1035 },
    80
  );

  // --- Seesaw Rocker (Tier 4) ---
  const seesawPivot = { x: 500, y: 1070 };
  const seesawHalfLen = 190;

  // --- Track 5: Ramp below Seesaw (Tier 4) ---
  // Starts at (365, 1165) -> (770, 1260)
  const track5Curve = sampleBezier(
    { x: 365, y: 1165 },
    { x: 500, y: 1200 },
    { x: 650, y: 1235 },
    { x: 770, y: 1260 },
    120
  );

  // --- Turn 2: Lower Right Loop (Tier 4) ---
  const turn2Curve = sampleBezier(
    { x: 770, y: 1260 },
    { x: 845, y: 1285 },
    { x: 845, y: 1355 },
    { x: 760, y: 1375 },
    80
  );

  // --- Track 6: Slope through Shutter Gate (Tier 5) ---
  const track6Curve = sampleBezier(
    { x: 760, y: 1375 },
    { x: 640, y: 1400 },
    { x: 520, y: 1425 },
    { x: 380, y: 1455 },
    120
  );

  // --- Cycloid Launch Ramp (Tier 5) ---
  const cycloidCurve = sampleBezier(
    { x: 380, y: 1455 },
    { x: 350, y: 1515 },
    { x: 430, y: 1555 },
    { x: 510, y: 1535 },
    100
  );

  // --- Golden Bell (Tier 6) ---
  const bellCenter = { x: 540, y: 1600, r: 52 };
  const cupCenter = { x: 540, y: 1640 };

  // ==========================================
  // 2. CHIME PINS SPECIFICATIONS
  // ==========================================
  const chimePins = [
    // Tier 1 Upper Incline (Pentatonic C5, D5, E5)
    { id: 1, x: 380, y: 220, r: 13, sound: "brass_pin_c5.wav", note: "C5", hitFrame: 38 },
    { id: 2, x: 520, y: 250, r: 13, sound: "brass_pin_d5.wav", note: "D5", hitFrame: 78 },
    { id: 3, x: 660, y: 275, r: 13, sound: "brass_pin_e5.wav", note: "E5", hitFrame: 118 },

    // Tier 1 Return Switchback (G5, A5)
    { id: 4, x: 620, y: 430, r: 13, sound: "brass_pin_g5.wav", note: "G5", hitFrame: 195 },
    { id: 5, x: 470, y: 465, r: 13, sound: "brass_pin_a5.wav", note: "A5", hitFrame: 232 },

    // Tier 3 Mid Acoustic Cascade (C6, D6, E6, G5)
    { id: 6, x: 690, y: 810, r: 14, sound: "brass_pin_c6.wav", note: "C6", hitFrame: 565 },
    { id: 7, x: 575, y: 850, r: 14, sound: "brass_pin_d6.wav", note: "D6", hitFrame: 605 },
    { id: 8, x: 460, y: 890, r: 14, sound: "brass_pin_e6.wav", note: "E6", hitFrame: 645 },
    { id: 9, x: 360, y: 935, r: 14, sound: "brass_pin_g5.wav", note: "G5", hitFrame: 685 },

    // Tier 5 Gate Approach Chime
    { id: 10, x: 610, y: 1410, r: 13, sound: "brass_pin_c6.wav", note: "C6", hitFrame: 1030 },
  ];

  // ==========================================
  // 3. FRAME-BY-FRAME SIMULATION RUNNER
  // ==========================================
  const frames = [];
  const audioEvents = [];

  let marbleRot = 0;
  let seesawAngle = -0.16;

  let prevX = 210;
  let prevY = 180;

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    let x = 210;
    let y = 180;
    let vx = 0;
    let vy = 0;

    // Escapement wheel rotation
    const wheelAngle = 0.2 + f * 0.016;

    // Shutter gate vertical oscillation (opens up cleanly around F 1040 - 1065)
    const gatePhase = ((f - 1050) * Math.PI * 2) / 180;
    const gateY = 1350 + Math.sin(gatePhase) * 60; // opens up to y ~ 1290 (high clearance)

    // --- Phase 1: Track 1 (Upper Incline) ---
    if (f <= 135) {
      const t = f / 135;
      const easeT = t * t * 0.3 + t * 0.7;
      const pos = getPosAtDistance(track1Curve, easeT * track1Curve.totalLength);
      x = pos.x;
      y = pos.y;
    }
    // --- Turn 1 ---
    else if (f <= 180) {
      const t = (f - 135) / 45;
      const pos = getPosAtDistance(turn1Curve, t * turn1Curve.totalLength);
      x = pos.x;
      y = pos.y;
    }
    // --- Track 2 (Switchback) ---
    else if (f <= 265) {
      const t = (f - 180) / 85;
      const easeT = t * 0.8 + t * t * 0.2;
      const pos = getPosAtDistance(track2Curve, easeT * track2Curve.totalLength);
      x = pos.x;
      y = pos.y;
    }
    // --- Funnel 1 drop into wheel ---
    else if (f <= 295) {
      const t = (f - 265) / 30;
      const pos = getPosAtDistance(funnel1Curve, t * funnel1Curve.totalLength);
      x = pos.x;
      y = pos.y;
      if (f === 268) {
        audioEvents.push({ frame: f, sound: "sounds/last_marble/ivory_clack_1.wav", vol: 0.65, type: "ivory" });
      }
    }
    // --- Escapement Wheel Ride (Clockwork Rotation) ---
    // Smooth transition: wheel sweeps from angle -Math.PI*0.75 to Math.PI*0.5 (bottom: 420, 705)
    else if (f <= 435) {
      const t = (f - 295) / 140;
      const a = -Math.PI * 0.75 + t * (Math.PI * 0.5 - (-Math.PI * 0.75));
      x = wheelCenter.x + Math.cos(a) * (wheelCenter.r);
      y = wheelCenter.y + Math.sin(a) * (wheelCenter.r);

      if (f === 330 || f === 365 || f === 400) {
        audioEvents.push({ frame: f, sound: "sounds/last_marble/gear_step.wav", vol: 0.55, type: "gear" });
      }
      if (f === 435) {
        audioEvents.push({ frame: f, sound: "sounds/last_marble/ivory_clack_2.wav", vol: 0.7, type: "ivory" });
      }
    }
    // --- Track 3 (Ramp to Right Bumper) ---
    else if (f <= 530) {
      const t = (f - 435) / 95;
      const easeT = t * 0.7 + t * t * 0.3;
      const pos = getPosAtDistance(track3Curve, easeT * track3Curve.totalLength);
      x = pos.x;
      y = pos.y;
    }
    // --- Right Bumper Rebound into Pin Cascade ---
    else if (f <= 695) {
      if (f === 531) {
        audioEvents.push({ frame: f, sound: "sounds/last_marble/elastic_bumper.wav", vol: 0.9, type: "bumper" });
      }
      const t = (f - 530) / 165;
      x = lerp(770, 300, t);
      y = lerp(775, 950, t) + Math.sin(t * Math.PI) * -20;
    }
    // --- Left Bumper Rebound into Seesaw Catch Ramp ---
    else if (f <= 755) {
      if (f === 696) {
        audioEvents.push({ frame: f, sound: "sounds/last_marble/elastic_bumper.wav", vol: 0.88, type: "bumper" });
      }
      const t = (f - 695) / 60;
      const pos = getPosAtDistance(track4Curve, t * track4Curve.totalLength);
      x = pos.x;
      y = pos.y;
    }
    // --- Seesaw Rocker (Landing, Tilting & Roll) ---
    else if (f <= 875) {
      const t = (f - 755) / 120;
      seesawAngle = lerp(-0.16, 0.16, Math.sin(t * Math.PI * 0.5));

      if (f === 758) {
        audioEvents.push({ frame: f, sound: "sounds/last_marble/ivory_clack_3.wav", vol: 0.75, type: "seesaw" });
      }
      // Marble rolls along tilting beam from x: 520 down to x: 375
      const beamX = lerp(520, 375, t);
      const beamY = seesawPivot.y + (beamX - seesawPivot.x) * Math.tan(seesawAngle) - 18;
      x = beamX;
      y = beamY;
    }
    // --- Natural Free-Fall Drop from Seesaw to Track 5 (16 frames) ---
    else if (f <= 891) {
      const t = (f - 875) / 16;
      // Smooth continuous parabolic drop from seesaw edge (375, 1032) to track 5 (365, 1165)
      x = lerp(375, 365, t);
      y = lerp(1032, 1165, t * t);
      if (f === 891) {
        audioEvents.push({ frame: f, sound: "sounds/last_marble/ivory_clack_2.wav", vol: 0.8, type: "ivory" });
      }
    }
    // --- Track 5 (Ramp below Seesaw) ---
    else if (f <= 975) {
      const t = (f - 891) / 84;
      const pos = getPosAtDistance(track5Curve, t * track5Curve.totalLength);
      x = pos.x;
      y = pos.y;
    }
    // --- Turn 2 ---
    else if (f <= 1015) {
      const t = (f - 975) / 40;
      const pos = getPosAtDistance(turn2Curve, t * turn2Curve.totalLength);
      x = pos.x;
      y = pos.y;
    }
    // --- Track 6 (Through Shutter Gate of Suspense) ---
    else if (f <= 1080) {
      const t = (f - 1015) / 65;
      const pos = getPosAtDistance(track6Curve, t * track6Curve.totalLength);
      x = pos.x;
      y = pos.y;
      if (f === 1048) {
        audioEvents.push({ frame: f, sound: "sounds/last_marble/gate_slide.wav", vol: 0.5, type: "gate" });
      }
    }
    // --- Cycloid Launch Acceleration Ramp ---
    else if (f <= 1118) {
      const t = (f - 1080) / 38;
      const easeT = t * t * 0.4 + t * 0.6;
      const pos = getPosAtDistance(cycloidCurve, easeT * cycloidCurve.totalLength);
      x = pos.x;
      y = pos.y;
    }
    // --- Free Fall Leap onto Golden Bell ---
    else if (f <= 1125) {
      const t = (f - 1118) / 7;
      x = lerp(510, 540, t);
      y = lerp(1535, 1572, t);
    }
    // --- THE GOLDEN BELL STRIKE & SETTLING (Frames 1126 - 1260) ---
    else {
      if (f === 1126) {
        audioEvents.push({
          frame: f,
          sound: "sounds/last_marble/golden_bell_strike.wav",
          vol: 1.0,
          type: "bell",
        });
        console.log(`🔔 GOLDEN BELL STRIKE AT FRAME 1126 (37.53s)!`);
      }

      const t = Math.min(1, (f - 1126) / 18);
      const bounce = Math.sin(t * Math.PI) * -12;
      x = 540;
      y = lerp(1572, 1638, t) + bounce;

      if (f === 1146) {
        audioEvents.push({ frame: f, sound: "sounds/last_marble/glass_light.wav", vol: 0.5, type: "glass" });
      }
    }

    // Velocity calculation for rotation
    vx = (x - prevX) * FPS;
    vy = (y - prevY) * FPS;
    const speed = Math.hypot(vx, vy);
    marbleRot += (vx / (MARBLE_R * FPS)) * 2;

    prevX = x;
    prevY = y;

    // Check Chime Pins collision
    for (const pin of chimePins) {
      if (f === pin.hitFrame) {
        audioEvents.push({
          frame: f,
          sound: `sounds/last_marble/${pin.sound}`,
          vol: 0.88,
          type: "pin",
          note: pin.note,
        });
      }
    }

    frames.push({
      f,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      vx: Math.round(vx * 10) / 10,
      vy: Math.round(vy * 10) / 10,
      rot: Math.round(marbleRot * 100) / 100,
      wheelAngle: Math.round(wheelAngle * 1000) / 1000,
      seesawAngle: Math.round(seesawAngle * 1000) / 1000,
      gateY: Math.round(gateY * 10) / 10,
      bellHit: f >= 1126,
      bellRingAge: f >= 1126 ? f - 1126 : 0,
    });
  }

  const manifest = {
    title: "THE LAST MARBLE • Resonance ASMR",
    seed: 9988,
    width: 1080,
    height: 1920,
    fps: FPS,
    totalFrames: TOTAL_FRAMES,
    durationSec: (TOTAL_FRAMES / FPS).toFixed(1) + "s",
    marbleRadius: MARBLE_R,
    bellHitFrame: 1126,
    bellHitSec: (1126 / FPS).toFixed(2) + "s",
    audioEventsCount: audioEvents.length,
    postBellHoldSec: ((TOTAL_FRAMES - 1126) / FPS).toFixed(2) + "s",
  };

  const simulationData = {
    manifest,
    staticTracks: [
      { id: "track1", curve: track1Curve.points },
      { id: "turn1", curve: turn1Curve.points },
      { id: "track2", curve: track2Curve.points },
      { id: "funnel1", curve: funnel1Curve.points },
      { id: "track3", curve: track3Curve.points },
      { id: "track4", curve: track4Curve.points },
      { id: "track5", curve: track5Curve.points },
      { id: "turn2", curve: turn2Curve.points },
      { id: "track6", curve: track6Curve.points },
      { id: "cycloid", curve: cycloidCurve.points },
    ],
    chimePins,
    rightBumper,
    leftBumper,
    wheelCenter,
    seesawPivot,
    seesawHalfLen,
    gateX: 530,
    bellCenter,
    cupCenter,
    frames,
    audioEvents,
  };

  const outPath = path.join(__dirname, "..", "src", "data", "lastMarble", "simulation.json");
  fs.writeFileSync(outPath, JSON.stringify(simulationData), "utf8");
  console.log(`✨ Simulation SUCCESS! ${frames.length} frames, ${audioEvents.length} audio events saved to ${outPath}`);
  console.log(`🔔 Golden Bell struck at frame ${manifest.bellHitFrame} (${manifest.bellHitSec}), held for ${manifest.postBellHoldSec}`);
  return manifest;
}

generateCompleteSimulation();
