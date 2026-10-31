import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ChatMessage } from "./chatData";

interface MessageBubbleProps {
  msg: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ msg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isVisible = frame >= msg.messageStart;
  const isTyping = frame >= msg.typingStart && frame < msg.messageStart;

  const popSpring = spring({
    frame: frame - msg.messageStart,
    fps,
    config: { damping: 12, stiffness: 200 },
  });

  const isOutgoing = msg.sender === "outgoing";

  if (!isVisible && !isTyping) {
    return null;
  }

  // Render typing indicator
  if (isTyping) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: isOutgoing ? "flex-end" : "flex-start",
          width: "100%",
          padding: "6px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: isOutgoing ? "#007aff" : "#2c2c2e",
            borderRadius: 22,
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          }}
        >
          {[0, 1, 2].map((dotIndex) => {
            const dotAnim = Math.sin((frame - msg.typingStart) * 0.25 - dotIndex * 1.2);
            const translateY = interpolate(dotAnim, [-1, 1], [-4, 4]);
            return (
              <div
                key={dotIndex}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: isOutgoing ? "#ffffff" : "#8e8e93",
                  transform: `translateY(${translateY}px)`,
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Render actual message bubble
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isOutgoing ? "flex-end" : "flex-start",
        width: "100%",
        padding: "6px 20px",
        boxSizing: "border-box",
        opacity: popSpring,
        transform: `scale(${interpolate(popSpring, [0, 1], [0.85, 1])}) translateY(${(1 - popSpring) * 15}px)`,
      }}
    >
      <div
        style={{
          maxWidth: "78%",
          background: isOutgoing
            ? "linear-gradient(135deg, #0b84fe 0%, #006ee6 100%)"
            : "#2c2c2e",
          color: "#ffffff",
          borderRadius: 28,
          borderBottomRightRadius: isOutgoing ? 6 : 28,
          borderBottomLeftRadius: isOutgoing ? 28 : 6,
          padding: "18px 26px",
          fontSize: 32,
          fontWeight: 500,
          lineHeight: 1.35,
          letterSpacing: "-0.2px",
          boxShadow: isOutgoing
            ? "0 8px 20px rgba(11, 132, 254, 0.35)"
            : "0 6px 16px rgba(0, 0, 0, 0.3)",
          wordBreak: "break-word",
        }}
      >
        {msg.text}
      </div>

      {/* Read Status for Outgoing Messages */}
      {isOutgoing && frame >= msg.messageStart + 40 && (
        <div
          style={{
            fontSize: 18,
            color: "#8e8e93",
            fontWeight: 600,
            marginTop: 4,
            marginRight: 8,
          }}
        >
          Read
        </div>
      )}
    </div>
  );
};

