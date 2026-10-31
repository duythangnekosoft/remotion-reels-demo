import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BILLIONAIRES,
  BILLIONAIRE_MILESTONES,
} from "./billionairesData";
import { BillionairesAvatar } from "./BillionairesAvatar";

function getNetWorthAtYear(
  history: { year: number; netWorth: number }[],
  targetYear: number
): number {
  if (targetYear <= history[0].year) return history[0].netWorth;
  if (targetYear >= history[history.length - 1].year) {
    return history[history.length - 1].netWorth;
  }

  for (let i = 0; i < history.length - 1; i++) {
    const p1 = history[i];
    const p2 = history[i + 1];
    if (targetYear >= p1.year && targetYear <= p2.year) {
      const progress = (targetYear - p1.year) / (p2.year - p1.year);
      return p1.netWorth + progress * (p2.netWorth - p1.netWorth);
    }
  }
  return 0;
}

export const BillionairesRaceComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const START_FRAME = 30;
  const END_FRAME = durationInFrames - 45;

  const currentYear = interpolate(
    frame,
    [START_FRAME, END_FRAME],
    [2000, 2026],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const liveStats = BILLIONAIRES.map((person) => {
    const val = getNetWorthAtYear(person.history, currentYear);
    return {
      ...person,
      currentVal: Math.round(val),
    };
  });

  liveStats.sort((a, b) => b.currentVal - a.currentVal);

  const maxVal = Math.max(100, liveStats[0].currentVal * 1.15);

  const activeMilestone = [...BILLIONAIRE_MILESTONES]
    .reverse()
    .find((m) => currentYear >= m.year);

  const BAR_ROW_HEIGHT = 145;
  const START_Y = 620;
  const MAX_BAR_WIDTH = 560;

  const introSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #06110d 0%, #061e14 45%, #050b08 100%)",
        color: "#ffffff",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      
      {/* Audio Layer */}
      <Audio src={staticFile("audio/bgm_loop.wav")} loop volume={0.2} />

      <Sequence from={6} durationInFrames={115}>
        <Audio src={staticFile("audio/billionaires_intro.wav")} volume={1.0} />
      </Sequence>

      {[170, 260, 390, 480, 520].map((f) => (
        <Sequence key={f} from={f} durationInFrames={12}>
          <Audio src={staticFile("audio/pop.wav")} volume={0.65} />
        </Sequence>
      ))}

      <Sequence from={540} durationInFrames={60}>
        <Audio src={staticFile("audio/celebrate.wav")} volume={0.75} />
      </Sequence>

      {/* Luxury gold & emerald background aura */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234, 179, 8, 0.2) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Header Container */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 50,
          right: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          transform: `scale(${introSpring}) translateY(${(1 - introSpring) * -40}px)`,
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, #10b981, #eab308)",
            padding: "10px 28px",
            borderRadius: 30,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: "uppercase",
            boxShadow: "0 0 25px rgba(234, 179, 8, 0.5)",
            color: "#000000",
            marginBottom: 20,
          }}
        >
          💰 WEALTH CLASH • 2000 - 2026
        </div>

        <h1
          style={{
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 1.2,
            margin: "0 0 10px 0",
            textTransform: "uppercase",
            letterSpacing: 1,
            background: "linear-gradient(180deg, #ffffff 40%, #cbd5e1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Richest People In The World
        </h1>

        <p
          style={{
            color: "#6ee7b7",
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            letterSpacing: 1,
          }}
        >
          Estimated Net Worth in Billions USD ($B)
        </p>
      </div>

      {/* Floating Big Year Counter */}
      <div
        style={{
          position: "absolute",
          top: 340,
          left: 50,
          right: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(10, 25, 18, 0.8)",
          border: "2px solid rgba(110, 231, 183, 0.25)",
          borderRadius: 28,
          padding: "24px 40px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "#34d399",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            TIMELINE
          </span>
          <span
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: "#ffffff",
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
              marginTop: 6,
              textShadow: "0 0 30px rgba(52, 211, 153, 0.4)",
            }}
          >
            {Math.floor(currentYear)}
          </span>
        </div>

        <div style={{ maxWidth: 500, textAlign: "right" }}>
          <div
            style={{
              color: "#facc15",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Milestone
          </div>
          <div
            style={{
              color: "#e2e8f0",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {activeMilestone ? activeMilestone.title : "The 2000s Tech Titans"}
          </div>
        </div>
      </div>

      {/* Racing Bars */}
      <div
        style={{
          position: "absolute",
          top: START_Y,
          left: 50,
          right: 50,
          height: BAR_ROW_HEIGHT * liveStats.length,
        }}
      >
        {liveStats.map((person, rank) => {
          const barWidth = Math.max(
            35,
            (person.currentVal / maxVal) * MAX_BAR_WIDTH
          );
          const targetY = rank * BAR_ROW_HEIGHT;

          return (
            <div
              key={person.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 115,
                transform: `translateY(${targetY}px)`,
                transition: "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Rank */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background:
                    rank === 0
                      ? "#eab308"
                      : rank === 1
                      ? "#cbd5e1"
                      : rank === 2
                      ? "#b45309"
                      : "rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 900,
                  color: rank < 3 ? "#000000" : "#ffffff",
                  boxShadow:
                    rank === 0 ? "0 0 20px rgba(234, 179, 8, 0.6)" : "none",
                }}
              >
                #{rank + 1}
              </div>

              {/* Avatar & Name */}
              <div
                style={{
                  width: 250,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <BillionairesAvatar
                  id={person.id}
                  initials={person.initials}
                  color={person.color}
                  size={50}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {person.name}
                  </span>
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#94a3b8",
                    }}
                  >
                    {person.company}
                  </span>
                </div>
              </div>

              {/* Bar */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    height: 54,
                    width: barWidth,
                    background: person.gradient,
                    borderRadius: 14,
                    boxShadow: `0 0 25px ${person.color}55`,
                    position: "relative",
                    overflow: "hidden",
                    transition: "width 0.1s linear",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "40%",
                      background: "rgba(255, 255, 255, 0.25)",
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: person.currentVal >= 200 ? "#34d399" : "#f1f5f9",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                    textShadow: "0 2px 10px rgba(0,0,0,0.7)",
                  }}
                >
                  ${person.currentVal.toLocaleString()} B
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Engagement CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 50,
          right: 50,
          background: "rgba(10, 25, 18, 0.85)",
          border: "1px solid rgba(110, 231, 183, 0.25)",
          borderRadius: 30,
          padding: "24px 35px",
          backdropFilter: "blur(15px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 36 }}>🚀</div>
          <div>
            <div
              style={{
                color: "#f8fafc",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              Who will become the world's FIRST Trillionaire?
            </div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 18,
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              Elon Musk, Jeff Bezos, or Mark Zuckerberg? Comment below! 👇
            </div>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(90deg, #10b981, #059669)",
            color: "#ffffff",
            fontSize: 20,
            fontWeight: 800,
            padding: "12px 28px",
            borderRadius: 40,
            letterSpacing: 1,
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
          }}
        >
          FOLLOW 💎
        </div>
      </div>
    </AbsoluteFill>
  );
};

