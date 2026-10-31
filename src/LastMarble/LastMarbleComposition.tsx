import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import simData from "../data/lastMarble/simulation.json";

export const LAST_MARBLE_DURATION = simData.manifest.totalFrames; // 1260 frames (42.0s)

interface AudioEvent {
  frame: number;
  sound: string;
  vol: number;
  type: string;
  note?: string;
}

export const LastMarbleComposition: React.FC<{ forcedFrame?: number }> = ({
  forcedFrame,
}) => {
  const currentFrame = useCurrentFrame();
  const frame = forcedFrame !== undefined ? forcedFrame : currentFrame;
  const { width, height } = useVideoConfig();

  // Get current frame state from precomputed simulation
  const frameIndex = Math.max(0, Math.min(frame, simData.frames.length - 1));
  const current = simData.frames[frameIndex];

  // Canvas drawing geometry
  const {
    staticTracks,
    chimePins,
    rightBumper,
    leftBumper,
    wheelCenter,
    seesawPivot,
    seesawHalfLen,
    gateX,
    bellCenter,
    cupCenter,
    audioEvents,
  } = simData;

  // Active acoustic pulses from recently struck chime pins
  const activePins = useMemo(() => {
    return chimePins.map((pin) => {
      const isStruck = frame >= pin.hitFrame && frame < pin.hitFrame + 30;
      const age = frame - pin.hitFrame;
      return { ...pin, isStruck, age };
    });
  }, [frame, chimePins]);

  // Golden Bell vibration and shockwave rings
  const isBellHit = current.bellHit;
  const bellAge = current.bellRingAge;
  const bellVibration = isBellHit
    ? Math.sin(bellAge * 0.8) * Math.exp(-bellAge * 0.04) * 4
    : 0;

  // Audio sequence length helper
  const getAudioFrames = (sound: string) => {
    if (sound.includes("golden_bell")) return 115; // 3.8s
    if (sound.includes("brass_pin")) return 25; // 0.8s
    if (sound.includes("elastic_bumper")) return 8;
    return 6;
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070b14",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Cinzel', 'Playfair Display', Georgia, serif",
        overflow: "hidden",
      }}
    >
      {/* ========================================================
          1. AUDIO SEQUENCES (Precisely Synced to Collisions)
         ======================================================== */}
      {(audioEvents as AudioEvent[]).map((ae, i) => (
        <Sequence
          key={`${ae.frame}-${ae.sound}-${i}`}
          from={ae.frame}
          durationInFrames={getAudioFrames(ae.sound)}
        >
          <Audio src={staticFile(ae.sound)} volume={ae.vol} />
        </Sequence>
      ))}

      {/* ========================================================
          2. SVG MECHANICAL STAGE & HIGH-END MODEL VISUALS
         ======================================================== */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          {/* Radial glow for ambient backdrop */}
          <radialGradient id="stageGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#131c31" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#080e1c" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#050811" stopOpacity="1" />
          </radialGradient>

          {/* Brushed Brass Gradient */}
          <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae19c" />
            <stop offset="35%" stopColor="#d4af37" />
            <stop offset="70%" stopColor="#aa8214" />
            <stop offset="100%" stopColor="#fdf0cd" />
          </linearGradient>

          {/* Matte Ivory Resin Gradient */}
          <linearGradient id="ivoryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#f7f2e7" />
            <stop offset="80%" stopColor="#e3d8c4" />
            <stop offset="100%" stopColor="#c5b79e" />
          </linearGradient>

          {/* Glass Marble Radial Gradient */}
          <radialGradient id="glassSphere" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#e0f2fe" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="85%" stopColor="#0284c7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
          </radialGradient>

          {/* Inner Swirl Caustic Gradient */}
          <linearGradient id="marbleSwirl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>

          {/* Drop Shadows */}
          <filter id="trackShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#000000" floodOpacity="0.6" />
          </filter>
          <filter id="marbleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="8" dy="16" stdDeviation="10" floodColor="#000000" floodOpacity="0.75" />
          </filter>
          <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- Background Ambient Glow --- */}
        <rect width="1080" height="1920" fill="url(#stageGlow)" />

        {/* --- Architectural Blueprint Grid --- */}
        <g stroke="#1e293b" strokeWidth="1" opacity="0.25">
          {Array.from({ length: 17 }).map((_, i) => (
            <line key={`gx-${i}`} x1={60 * (i + 1)} y1="120" x2={60 * (i + 1)} y2="1750" />
          ))}
          {Array.from({ length: 27 }).map((_, i) => (
            <line key={`gy-${i}`} x1="80" y1={120 + 60 * i} x2="1000" y2={120 + 60 * i} />
          ))}
        </g>

        {/* --- Outer Machine Frame & Brass Corner Rivets --- */}
        <rect
          x="90"
          y="130"
          width="900"
          height="1620"
          rx="24"
          fill="none"
          stroke="url(#brassGrad)"
          strokeWidth="6"
          filter="url(#trackShadow)"
        />
        <rect
          x="105"
          y="145"
          width="870"
          height="1590"
          rx="18"
          fill="none"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Corner Rivets */}
        {[
          [115, 155],
          [965, 155],
          [115, 1725],
          [965, 1725],
          [540, 155],
          [540, 1725],
        ].map(([rx, ry], i) => (
          <g key={`rivet-${i}`}>
            <circle cx={rx} cy={ry} r="8" fill="url(#brassGrad)" />
            <circle cx={rx} cy={ry} r="3" fill="#0f172a" />
          </g>
        ))}

        {/* Minimalist Top Plaque */}
        <g transform="translate(540, 155)">
          <text
            textAnchor="middle"
            y="-2"
            fill="#d4af37"
            fontSize="18"
            fontWeight="700"
            letterSpacing="6"
            style={{ textTransform: "uppercase" }}
          >
            THE LAST MARBLE
          </text>
          <text
            textAnchor="middle"
            y="16"
            fill="#94a3b8"
            fontSize="11"
            letterSpacing="3"
            fontWeight="500"
            style={{ textTransform: "uppercase" }}
          >
            RESONANCE AUTOMATON • 440 – 528 Hz
          </text>
        </g>

        {/* --- STATIC MATTE IVORY TRACKS --- */}
        {staticTracks.map((trk) => {
          const d = trk.curve
            .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
            .join(" ");
          return (
            <g key={trk.id} filter="url(#trackShadow)">
              {/* Lower Track Shadow Rail */}
              <path d={d} fill="none" stroke="#0a0f1d" strokeWidth="22" strokeLinecap="round" />
              {/* Outer Ivory Trough Base */}
              <path d={d} fill="none" stroke="url(#ivoryGrad)" strokeWidth="16" strokeLinecap="round" />
              {/* Inner Track Groove */}
              <path d={d} fill="none" stroke="#251f18" strokeWidth="5" strokeLinecap="round" />
              {/* Dual Brass Guide Rails */}
              <path
                d={d}
                fill="none"
                stroke="url(#brassGrad)"
                strokeWidth="2"
                strokeDasharray="4 16"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* --- TUNED BRASS CHIME PINS --- */}
        {activePins.map((pin) => {
          return (
            <g key={`pin-${pin.id}`} transform={`translate(${pin.x}, ${pin.y})`}>
              {/* Expanding Acoustic Wave Rings when struck */}
              {pin.isStruck && (
                <circle
                  cx="0"
                  cy="0"
                  r={pin.r + pin.age * 2.2}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={Math.max(1, 3 - pin.age * 0.1)}
                  opacity={Math.max(0, 1 - pin.age / 28)}
                />
              )}

              {/* Pin Base Shadow */}
              <circle cx="2" cy="5" r={pin.r} fill="#000000" opacity="0.6" />
              {/* Brass Cylinder Body */}
              <circle
                cx="0"
                cy="0"
                r={pin.r}
                fill="url(#brassGrad)"
                stroke="#fef08a"
                strokeWidth="1.5"
                filter={pin.isStruck ? "url(#goldGlow)" : undefined}
              />
              {/* Mirror Specular Highlight */}
              <circle cx="-3" cy="-3" r={pin.r * 0.35} fill="#ffffff" opacity="0.75" />
              {/* Note Inscription */}
              <text
                x="0"
                y="3"
                textAnchor="middle"
                fill="#0f172a"
                fontSize="9"
                fontWeight="900"
                fontFamily="monospace"
              >
                {pin.note}
              </text>
            </g>
          );
        })}

        {/* --- TIER 2: ESCAPEMENT WHEEL (Rotates in sync) --- */}
        <g transform={`translate(${wheelCenter.x}, ${wheelCenter.y})`}>
          {/* Wheel Shadow */}
          <circle cx="4" cy="8" r={wheelCenter.r} fill="#000000" opacity="0.4" />
          {/* Main Wheel Rim */}
          <circle
            cx="0"
            cy="0"
            r={wheelCenter.r}
            fill="none"
            stroke="url(#brassGrad)"
            strokeWidth="8"
          />
          <circle cx="0" cy="0" r={wheelCenter.r - 8} fill="#131b2e" stroke="#334155" strokeWidth="2" />

          {/* Rotating Mechanism with 3 Arms */}
          <g transform={`rotate(${(current.wheelAngle * 180) / Math.PI})`}>
            {[0, 120, 240].map((deg) => (
              <g key={`arm-${deg}`} transform={`rotate(${deg})`}>
                {/* Arm Beam */}
                <line x1="0" y1="0" x2={wheelCenter.r - 6} y2="0" stroke="url(#brassGrad)" strokeWidth="10" />
                {/* Scoop Cradle */}
                <circle
                  cx={wheelCenter.r - 8}
                  cy="0"
                  r="22"
                  fill="url(#ivoryGrad)"
                  stroke="#334155"
                  strokeWidth="2"
                />
                <circle cx={wheelCenter.r - 8} cy="0" r="16" fill="#0f172a" />
              </g>
            ))}
            {/* Center Axle Gear */}
            <circle cx="0" cy="0" r="24" fill="url(#brassGrad)" stroke="#fef08a" strokeWidth="2" />
            <circle cx="0" cy="0" r="8" fill="#0f172a" />
          </g>
        </g>

        {/* --- TIER 3: ELASTIC BUMPERS --- */}
        {/* Right Bumper */}
        <g filter="url(#trackShadow)">
          <line
            x1={rightBumper.x1}
            y1={rightBumper.y1}
            x2={rightBumper.x2}
            y2={rightBumper.y2}
            stroke="url(#brassGrad)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <line
            x1={rightBumper.x1 - 4}
            y1={rightBumper.y1 + 4}
            x2={rightBumper.x2 - 4}
            y2={rightBumper.y2 + 4}
            stroke="#1c1917"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </g>
        {/* Left Bumper */}
        <g filter="url(#trackShadow)">
          <line
            x1={leftBumper.x1}
            y1={leftBumper.y1}
            x2={leftBumper.x2}
            y2={leftBumper.y2}
            stroke="url(#brassGrad)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <line
            x1={leftBumper.x1 + 4}
            y1={leftBumper.y1 + 4}
            x2={leftBumper.x2 + 4}
            y2={leftBumper.y2 + 4}
            stroke="#1c1917"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </g>

        {/* --- TIER 4: SEESAW ROCKER (Tilts in sync) --- */}
        <g transform={`translate(${seesawPivot.x}, ${seesawPivot.y})`}>
          {/* Central Pivot Stand */}
          <polygon points="-16,40 16,40 0,0" fill="url(#brassGrad)" filter="url(#trackShadow)" />
          <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="url(#brassGrad)" strokeWidth="3" />

          {/* Tilting Beam */}
          <g transform={`rotate(${(current.seesawAngle * 180) / Math.PI})`} filter="url(#trackShadow)">
            {/* Rocker Bar */}
            <rect
              x={-seesawHalfLen}
              y="-10"
              width={seesawHalfLen * 2}
              height="20"
              rx="10"
              fill="url(#ivoryGrad)"
              stroke="#78716c"
              strokeWidth="2"
            />
            {/* Inner Marble Trough */}
            <rect
              x={-seesawHalfLen + 15}
              y="-4"
              width={seesawHalfLen * 2 - 30}
              height="8"
              rx="4"
              fill="#292524"
            />
            {/* Brass Counterweights */}
            <circle cx={-seesawHalfLen + 12} cy="0" r="14" fill="url(#brassGrad)" />
            <circle cx={seesawHalfLen - 12} cy="0" r="14" fill="url(#brassGrad)" />
          </g>
        </g>

        {/* --- TIER 5: SLIDING SHUTTER GATE --- */}
        <g transform={`translate(${gateX}, 0)`}>
          {/* Guide Rail Slots */}
          <line x1="-8" y1="1260" x2="-8" y2="1460" stroke="#334155" strokeWidth="4" />
          <line x1="8" y1="1260" x2="8" y2="1460" stroke="#334155" strokeWidth="4" />
          {/* Vertically Translating Brass Louvered Gate */}
          <g transform={`translate(0, ${current.gateY})`} filter="url(#trackShadow)">
            <rect x="-14" y="-40" width="28" height="80" rx="6" fill="url(#brassGrad)" stroke="#fef08a" strokeWidth="1.5" />
            <line x1="-8" y1="-20" x2="8" y2="-20" stroke="#713f12" strokeWidth="3" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#713f12" strokeWidth="3" />
            <line x1="-8" y1="20" x2="8" y2="20" stroke="#713f12" strokeWidth="3" />
          </g>
        </g>

        {/* --- TIER 6: THE GOLDEN BELL & CHALICE --- */}
        <g transform={`translate(${bellCenter.x}, ${bellCenter.y})`}>
          {/* Acoustic Concentric Shockwave Rings on Strike */}
          {isBellHit && (
            <>
              <circle
                cx="0"
                cy="0"
                r={bellCenter.r + bellAge * 2.8}
                fill="none"
                stroke="#fbbf24"
                strokeWidth={Math.max(1, 4 - bellAge * 0.05)}
                opacity={Math.max(0, 0.9 - bellAge / 90)}
              />
              <circle
                cx="0"
                cy="0"
                r={bellCenter.r + (bellAge * 2.8) / 2}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={Math.max(1, 3 - bellAge * 0.04)}
                opacity={Math.max(0, 0.7 - bellAge / 80)}
              />
            </>
          )}

          {/* Golden Bell Dome (Tilts subtly on impact) */}
          <g transform={`rotate(${bellVibration})`} filter="url(#trackShadow)">
            {/* Bell Flared Body Path */}
            <path
              d="M -48 35 C -44 10, -32 -25, 0 -36 C 32 -25, 44 10, 48 35 C 28 32, -28 32, -48 35 Z"
              fill="url(#brassGrad)"
              stroke="#fef08a"
              strokeWidth="2.5"
            />
            {/* Crown Loop */}
            <circle cx="0" cy="-42" r="8" fill="none" stroke="url(#brassGrad)" strokeWidth="4" />
            {/* Mirror Polish Gleam on Dome */}
            <ellipse cx="-12" cy="0" rx="14" ry="22" fill="#ffffff" opacity="0.35" transform="rotate(-15)" />
            {/* Clapper Ball Peeking Underneath */}
            <circle cx="0" cy="38" r="9" fill="#713f12" stroke="#d4af37" strokeWidth="2" />
          </g>
        </g>

        {/* Reception Chalice Cup underneath the Bell */}
        <g transform={`translate(${cupCenter.x}, ${cupCenter.y})`}>
          {/* Base Stand */}
          <polygon points="-24,35 24,35 0,15" fill="url(#brassGrad)" />
          {/* Velvet/Brass Padded Bowl */}
          <path
            d="M -44 -10 C -40 25, 40 25, 44 -10 Z"
            fill="url(#brassGrad)"
            stroke="#fef08a"
            strokeWidth="2"
            filter="url(#trackShadow)"
          />
          <ellipse cx="0" cy="-10" rx="42" ry="12" fill="#1c1917" stroke="#78716c" strokeWidth="2" />
        </g>

        {/* --- THE OPTICAL GLASS MARBLE --- */}
        <g transform={`translate(${current.x}, ${current.y})`}>
          {/* Dynamic Cast Drop Shadow */}
          <ellipse
            cx="10"
            cy="14"
            rx="18"
            ry="14"
            fill="#000000"
            opacity="0.65"
            filter="url(#marbleShadow)"
          />

          {/* Outer Glass Refraction Sphere */}
          <circle
            cx="0"
            cy="0"
            r={simData.manifest.marbleRadius}
            fill="url(#glassSphere)"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="1.5"
          />

          {/* Inner Rotating Swirl Caustic (Proves dynamic physical rolling rotation) */}
          <g transform={`rotate(${(current.rot * 180) / Math.PI})`}>
            <ellipse cx="-3" cy="1" rx="9" ry="5" fill="url(#marbleSwirl)" opacity="0.85" />
            <circle cx="2" cy="-2" r="3" fill="#ffffff" opacity="0.6" />
          </g>

          {/* Primary High-Gloss Studio Light Specular Gleam */}
          <ellipse cx="-6" cy="-6" rx="5" ry="3.5" fill="#ffffff" opacity="0.95" transform="rotate(-25)" />
          {/* Secondary Fill Rim Specular Highlight */}
          <ellipse cx="5" cy="6" rx="3" ry="2" fill="#bae6fd" opacity="0.75" />
        </g>

        {/* --- Minimalist Bottom Label --- */}
        <g transform="translate(540, 1750)">
          <text
            textAnchor="middle"
            fill="#64748b"
            fontSize="12"
            letterSpacing="4"
            fontWeight="600"
            style={{ textTransform: "uppercase" }}
          >
            {isBellHit ? "HARMONIC EQUILIBRIUM ACHIEVED" : "MECHANICAL ASMR RESONANCE LAB"}
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
