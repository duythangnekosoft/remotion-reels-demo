import React from "react";
import { AbsoluteFill } from "remotion";
import { CompanyLogo } from "./CompanyLogo";

export const BarChartRaceThumbnail: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 35%, #1e1b4b 0%, #070913 80%)",
        color: "#ffffff",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "100px 50px 80px 50px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Background neon glows */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(118, 185, 0, 0.3) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Top Tag */}
      <div
        style={{
          background: "linear-gradient(90deg, #ef4444, #f59e0b)",
          color: "#ffffff",
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: 3,
          padding: "14px 40px",
          borderRadius: 50,
          boxShadow: "0 0 30px rgba(239, 68, 68, 0.6)",
          textTransform: "uppercase",
        }}
      >
        ⚡ EPIC TECH CLASH (2000 - 2026)
      </div>

      {/* Main Massive Headline */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <h1
          style={{
            fontSize: 74,
            fontWeight: 950,
            lineHeight: 1.1,
            margin: "0 0 10px 0",
            textTransform: "uppercase",
            letterSpacing: 1,
            textShadow: "0 10px 30px rgba(0,0,0,0.8)",
          }}
        >
          THE $3.5 TRILLION <br />
          <span
            style={{
              background: "linear-gradient(90deg, #38bdf8, #818cf8, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SHOWDOWN
          </span>
        </h1>
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: "#94a3b8",
            letterSpacing: 2,
          }}
        >
          WHO REACHED #1 IN THE WORLD?
        </div>
      </div>

      {/* Center VS Battle Card */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          margin: "30px 0",
          position: "relative",
        }}
      >
        {/* Apple Card */}
        <div
          style={{
            flex: 1,
            background: "rgba(15, 23, 42, 0.85)",
            border: "3px solid #a3e635",
            borderRadius: 32,
            padding: "45px 25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 0 45px rgba(163, 230, 53, 0.35)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <CompanyLogo id="aapl" size={70} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#ffffff" }}>
            APPLE
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 950,
              color: "#a3e635",
              marginTop: 10,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            $3,520 B
          </div>
          <div style={{ fontSize: 20, color: "#94a3b8", fontWeight: 700 }}>
            AAPL • RANK #1
          </div>
        </div>

        {/* VS Badge */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ef4444, #f59e0b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 950,
            color: "#ffffff",
            boxShadow: "0 0 35px rgba(239, 68, 68, 0.8)",
            zIndex: 10,
          }}
        >
          VS
        </div>

        {/* Nvidia Card */}
        <div
          style={{
            flex: 1,
            background: "rgba(15, 23, 42, 0.85)",
            border: "3px solid #22c55e",
            borderRadius: 32,
            padding: "45px 25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 0 45px rgba(34, 197, 94, 0.35)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <CompanyLogo id="nvda" size={70} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#ffffff" }}>
            NVIDIA
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 950,
              color: "#22c55e",
              marginTop: 10,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            $3,410 B
          </div>
          <div style={{ fontSize: 20, color: "#94a3b8", fontWeight: 700 }}>
            NVDA • AI LEADER
          </div>
        </div>
      </div>

      {/* Mini Highlight Stats */}
      <div
        style={{
          width: "100%",
          background: "rgba(30, 41, 59, 0.8)",
          border: "2px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 28,
          padding: "26px 36px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, color: "#94a3b8", fontWeight: 700 }}>
            START YEAR
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#f8fafc" }}>
            2000
          </div>
        </div>
        <div style={{ width: 2, height: 40, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, color: "#f59e0b", fontWeight: 700 }}>
            METEORIC SURGE
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#22c55e" }}>
            +110,000%
          </div>
        </div>
        <div style={{ width: 2, height: 40, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, color: "#94a3b8", fontWeight: 700 }}>
            TARGET YEAR
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#38bdf8" }}>
            2026
          </div>
        </div>
      </div>

      {/* Bottom Hook Callout */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
          padding: "22px 0",
          borderRadius: 40,
          textAlign: "center",
          fontSize: 30,
          fontWeight: 900,
          letterSpacing: 2,
          boxShadow: "0 0 40px rgba(236, 72, 153, 0.6)",
        }}
      >
        ▶️ WATCH FULL TIMELINE RACE
      </div>
    </AbsoluteFill>
  );
};

