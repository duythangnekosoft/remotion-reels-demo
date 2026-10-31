import React from "react";
import { getRemotionEnvironment } from "remotion";

export interface StudioBilingualBadgeProps {
  topicEn: string;
  topicVn: string;
  epNumber?: number;
  epTitleEn?: string;
  epTitleVn?: string;
}

export const StudioBilingualBadge: React.FC<StudioBilingualBadgeProps> = ({
  topicEn,
  topicVn,
  epNumber,
  epTitleEn,
  epTitleVn,
}) => {
  const env = getRemotionEnvironment();
  // Only display in Remotion Studio web preview, NEVER during video render
  if (env.isRendering) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        backgroundColor: "rgba(8, 14, 26, 0.92)",
        border: "1.5px solid #00F0FF",
        borderRadius: 12,
        padding: "10px 18px",
        color: "#FFFFFF",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        fontSize: 18,
        fontWeight: 700,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        boxShadow: "0 0 25px rgba(0, 240, 255, 0.4)",
        pointerEvents: "none",
        maxWidth: 750,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#39FF14", fontSize: 15, letterSpacing: "1px" }}>🇻🇳 TIẾNG VIỆT:</span>
        <span style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 900 }}>
          {topicVn} {epNumber ? `(Tập ${epNumber}/10)` : ""}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "#8E9EBC" }}>
        <span style={{ color: "#00F0FF", fontWeight: 700 }}>🇺🇸 ENGLISH:</span>
        <span>{topicEn} {epNumber ? `• Episode ${epNumber}` : ""}</span>
        {epTitleVn && <span style={{ color: "#FFD700" }}>— {epTitleVn}</span>}
      </div>
    </div>
  );
};

