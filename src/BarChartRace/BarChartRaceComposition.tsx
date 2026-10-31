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
import { COMPANIES, MILESTONES } from "./raceData";
import { CompanyLogo } from "./CompanyLogo";


// Helper: Linear interpolation between historical data points
function getMarketCapAtYear(
  history: { year: number; marketCap: number }[],
  targetYear: number
): number {
  if (targetYear <= history[0].year) return history[0].marketCap;
  if (targetYear >= history[history.length - 1].year) {
    return history[history.length - 1].marketCap;
  }

  for (let i = 0; i < history.length - 1; i++) {
    const p1 = history[i];
    const p2 = history[i + 1];
    if (targetYear >= p1.year && targetYear <= p2.year) {
      const progress = (targetYear - p1.year) / (p2.year - p1.year);
      return p1.marketCap + progress * (p2.marketCap - p1.marketCap);
    }
  }
  return 0;
}

export const BarChartRaceComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Interpolate year smoothly from 2000 to 2026
  // Give 30 frames at start to view intro, and 45 frames at the end to view final standings
  const START_FRAME = 30;
  const END_FRAME = durationInFrames - 45;

  const currentYear = interpolate(
    frame,
    [START_FRAME, END_FRAME],
    [2000, 2026],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Compute live market cap for all companies at current fractional year
  const liveStats = COMPANIES.map((company) => {
    const val = getMarketCapAtYear(company.history, currentYear);
    return {
      ...company,
      currentVal: Math.round(val),
    };
  });

  // Sort by market cap descending to get rank
  liveStats.sort((a, b) => b.currentVal - a.currentVal);

  // Top market cap for scale
  const maxVal = Math.max(700, liveStats[0].currentVal * 1.12);

  // Find active milestone for current year
  const activeMilestone = [...MILESTONES]
    .reverse()
    .find((m) => currentYear >= m.year);

  // Layout constants for 1080x1920 vertical canvas
  const BAR_ROW_HEIGHT = 135;
  const START_Y = 600;
  const MAX_BAR_WIDTH = 580;

  // Intro card entrance
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #070913 0%, #0d1224 50%, #050711 100%)",
        color: "#ffffff",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
            {/* Audio Layer */}
      <Audio src={staticFile("audio/bgm_loop.wav")} loop volume={0.22} />

      <Sequence from={6} durationInFrames={110}>
        <Audio src={staticFile("audio/race_intro.wav")} volume={1.0} />
      </Sequence>

      {MILESTONES.map((m) => {
        const mFrame = Math.round(interpolate(m.year, [2000, 2026], [START_FRAME, END_FRAME]));
        return (
          <Sequence key={m.year} from={mFrame} durationInFrames={12}>
            <Audio src={staticFile("audio/pop.wav")} volume={0.65} />
          </Sequence>
        );
      })}

      <Sequence from={END_FRAME - 15} durationInFrames={60}>
        <Audio src={staticFile("audio/celebrate.wav")} volume={0.7} />
      </Sequence>

      {/* Background grid lines */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
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
        {/* Category Pill */}
        <div
          style={{
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            padding: "10px 28px",
            borderRadius: 30,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: "uppercase",
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
            marginBottom: 20,
          }}
        >
          🌐 Global Market Cap Race (2000 - 2026)
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 48,
            fontWeight: 900,
            lineHeight: 1.2,
            margin: "0 0 10px 0",
            background: "linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Most Valuable Companies
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: 22,
            fontWeight: 600,
            margin: 0,
            letterSpacing: 1,
          }}
        >
          Market Capitalization in Billions USD ($B)
        </p>
      </div>

      {/* Floating Big Year Display */}
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 50,
          right: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(15, 23, 42, 0.75)",
          border: "2px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 28,
          padding: "24px 40px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "#38bdf8",
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
              textShadow: "0 0 30px rgba(56, 189, 248, 0.4)",
            }}
          >
            {Math.floor(currentYear)}
          </span>
        </div>

        {/* Milestone Callout */}
        <div
          style={{
            maxWidth: 500,
            textAlign: "right",
          }}
        >
          <div
            style={{
              color: "#f59e0b",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Key Event
          </div>
          <div
            style={{
              color: "#e2e8f0",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {activeMilestone ? activeMilestone.title : "The 2000s Tech Landscape"}
          </div>
        </div>
      </div>

      {/* Racing Bars Container */}
      <div
        style={{
          position: "absolute",
          top: START_Y,
          left: 50,
          right: 50,
          height: BAR_ROW_HEIGHT * liveStats.length,
        }}
      >
        {liveStats.map((item, rank) => {
          // Width based on market cap
          const barWidth = Math.max(
            35,
            (item.currentVal / maxVal) * MAX_BAR_WIDTH
          );

          // Smooth ranking position
          const targetY = rank * BAR_ROW_HEIGHT;

          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 105,
                transform: `translateY(${targetY}px)`,
                transition: "transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Rank Badge */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background:
                    rank === 0
                      ? "#eab308"
                      : rank === 1
                      ? "#94a3b8"
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

              {/* Company Logo & Name label */}
              <div
                style={{
                  width: 230,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      background: "rgba(255, 255, 255, 0.08)",
                      padding: 4,
                      boxSizing: "border-box",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    <CompanyLogo id={item.id} size={34} />
                  </div>
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#64748b",
                    marginLeft: 40,
                    letterSpacing: 1,
                  }}
                >
                  {item.ticker}
                </span>
              </div>

              {/* Dynamic Bar */}
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
                    background: item.gradient,
                    borderRadius: 14,
                    boxShadow: `0 0 25px ${item.color}55`,
                    position: "relative",
                    overflow: "hidden",
                    transition: "width 0.1s linear",
                  }}
                >
                  {/* Subtle shine highlight */}
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

                {/* Live Value Tag */}
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: item.currentVal > 1000 ? "#38bdf8" : "#f1f5f9",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                    textShadow: "0 2px 10px rgba(0,0,0,0.7)",
                  }}
                >
                  ${item.currentVal.toLocaleString()} B
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Reels Engagement Call To Action */}
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 50,
          right: 50,
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
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
          <div style={{ fontSize: 36 }}>📈</div>
          <div>
            <div
              style={{
                color: "#f8fafc",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
            >
              Which company will hit $5 Trillion first?
            </div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 18,
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              Comment below! Apple, Nvidia, or Microsoft? 👇
            </div>
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
            color: "#ffffff",
            fontSize: 20,
            fontWeight: 800,
            padding: "12px 28px",
            borderRadius: 40,
            letterSpacing: 1,
            boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)",
          }}
        >
          FOLLOW ⚡
        </div>
      </div>
    </AbsoluteFill>
  );
};

