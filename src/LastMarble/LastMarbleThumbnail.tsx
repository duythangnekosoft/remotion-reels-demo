import React from "react";
import { AbsoluteFill } from "remotion";
import { LastMarbleComposition } from "./LastMarbleComposition";

// Renders the pinnacle climax frame (Golden Bell Strike at Frame 1153)
export const LastMarbleThumbnail: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#070b14" }}>
      <LastMarbleComposition forcedFrame={1153} />

      {/* High-Impact Viral Cover Typography in top safe header */}
      <div
        style={{
          position: "absolute",
          top: 30,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "rgba(7, 11, 20, 0.9)",
            border: "1.5px solid #d4af37",
            borderRadius: 20,
            padding: "5px 22px",
            color: "#fef08a",
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: 3,
            textTransform: "uppercase",
            boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
            marginBottom: 6,
          }}
        >
          PURE MECHANICAL ASMR
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: 5,
            color: "#ffffff",
            textTransform: "uppercase",
            textShadow: "0 4px 20px rgba(0,0,0,0.9), 0 0 35px rgba(212, 175, 55, 0.5)",
            fontFamily: "'Cinzel', Georgia, serif",
          }}
        >
          THE LAST MARBLE
        </h1>
      </div>
    </AbsoluteFill>
  );
};
