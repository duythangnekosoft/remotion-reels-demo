import React from "react";
import { AbsoluteFill } from "remotion";
import { BillionairesAvatar } from "./BillionairesAvatar";

export const BillionairesThumbnail: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 35%, #062b1b 0%, #050b08 85%)",
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
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(225, 29, 72, 0.35) 0%, transparent 70%)",
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
          background: "radial-gradient(circle, rgba(234, 179, 8, 0.35) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Top Tag */}
      <div
        style={{
          background: "linear-gradient(90deg, #10b981, #eab308)",
          color: "#000000",
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: 3,
          padding: "14px 40px",
          borderRadius: 50,
          boxShadow: "0 0 30px rgba(234, 179, 8, 0.6)",
          textTransform: "uppercase",
        }}
      >
        👑 WORLD'S WEALTH RACE (2000 - 2026)
      </div>

      {/* Main Headline */}
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
          THE $300 BILLION <br />
          <span
            style={{
              background: "linear-gradient(90deg, #34d399, #facc15, #fb7185)",
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
            color: "#6ee7b7",
            letterSpacing: 2,
          }}
        >
          WHO BECAME THE RICHEST ON EARTH?
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
        }}
      >
        {/* Elon Musk Card */}
        <div
          style={{
            flex: 1,
            background: "rgba(10, 25, 18, 0.85)",
            border: "3px solid #fb7185",
            borderRadius: 32,
            padding: "45px 25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 0 45px rgba(251, 113, 133, 0.35)",
            backdropFilter: "blur(20px)",
          }}
        >
          <BillionairesAvatar id="musk" initials="EM" color="#e11d48" size={90} />
          <div style={{ fontSize: 36, fontWeight: 900, color: "#ffffff", marginTop: 16 }}>
            ELON MUSK
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 950,
              color: "#fb7185",
              marginTop: 10,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            $345 B
          </div>
          <div style={{ fontSize: 20, color: "#94a3b8", fontWeight: 700 }}>
            TESLA • RANK #1
          </div>
        </div>

        {/* VS Badge */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #eab308)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 950,
            color: "#000000",
            boxShadow: "0 0 35px rgba(234, 179, 8, 0.8)",
            zIndex: 10,
          }}
        >
          VS
        </div>

        {/* Jeff Bezos Card */}
        <div
          style={{
            flex: 1,
            background: "rgba(10, 25, 18, 0.85)",
            border: "3px solid #fbbf24",
            borderRadius: 32,
            padding: "45px 25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 0 45px rgba(251, 191, 36, 0.35)",
            backdropFilter: "blur(20px)",
          }}
        >
          <BillionairesAvatar id="bezos" initials="JB" color="#f59e0b" size={90} />
          <div style={{ fontSize: 36, fontWeight: 900, color: "#ffffff", marginTop: 16 }}>
            JEFF BEZOS
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 950,
              color: "#fbbf24",
              marginTop: 10,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            $225 B
          </div>
          <div style={{ fontSize: 20, color: "#94a3b8", fontWeight: 700 }}>
            AMAZON • RANK #2
          </div>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div
        style={{
          width: "100%",
          background: "rgba(10, 25, 18, 0.8)",
          border: "2px solid rgba(110, 231, 183, 0.25)",
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
          <div style={{ fontSize: 18, color: "#facc15", fontWeight: 700 }}>
            MUSK'S SURGE
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#34d399" }}>
            +34,000%
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

      {/* Bottom Hook Button */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(90deg, #10b981, #059669)",
          padding: "22px 0",
          borderRadius: 40,
          textAlign: "center",
          fontSize: 30,
          fontWeight: 900,
          letterSpacing: 2,
          boxShadow: "0 0 40px rgba(16, 185, 129, 0.6)",
        }}
      >
        ▶️ WATCH BILLIONAIRES RACE
      </div>
    </AbsoluteFill>
  );
};

