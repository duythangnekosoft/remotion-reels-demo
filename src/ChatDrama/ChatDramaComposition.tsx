import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CHAT_DRAMA_EPISODES } from "../data/chatDramaEpisodes";
import { MessageBubble } from "./iMessageBubble";
import { StudioBilingualBadge } from "../components/StudioBilingualBadge";
import { getChatDramaTiming, getChatDramaDuration } from "../data/timelineUtils";

export { getChatDramaDuration };

export const ChatDramaComposition: React.FC<{ episode?: number }> = ({
  episode = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const story = useMemo(() => {
    return (
      CHAT_DRAMA_EPISODES.find((e) => e.episodeNumber === episode) ||
      CHAT_DRAMA_EPISODES[0]
    );
  }, [episode]);

  // Dynamically compute timeline for each message from actual WAV audio durations
  const { messages: computedMessages, ctaStartFrame, ctaDuration } = useMemo(() => {
    return getChatDramaTiming(episode);
  }, [episode]);

  // Frame-based smooth scroll offset calculation (deterministic, no CSS transitions)
  let scrollY = 0;
  const scrollSteps = [
    { idx: 2, from: 0, to: -140 },
    { idx: 3, from: -140, to: -340 },
    { idx: 4, from: -340, to: -580 },
    { idx: 5, from: -580, to: -840 },
    { idx: 6, from: -840, to: -1120 },
  ];

  for (const step of scrollSteps) {
    if (computedMessages.length > step.idx) {
      const msg = computedMessages[step.idx];
      const startF = msg.messageStart - 20;
      const endF = msg.messageStart + 20;
      if (frame >= startF) {
        scrollY = interpolate(
          frame,
          [startF, endF],
          [step.from, step.to],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }
        );
      }
    }
  }

  const ctaSpring = spring({
    frame: frame - ctaStartFrame,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "#000000",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Roboto, sans-serif",
        overflow: "hidden",
      }}
    >
      <StudioBilingualBadge
        topicEn="Fake iMessage Drama / AITAH"
        topicVn="Kịch Bản Tin Nhắn Drama Tâm Sự AITAH"
        epNumber={episode}
        epTitleEn={story.title}
      />

      {/* Background Ambience Audio */}
      <Audio src={staticFile("audio/bgm_loop.wav")} loop volume={0.08} />

      {/* Voiceover and Message Sound Effects */}
      {computedMessages.map((msg) => (
        <React.Fragment key={msg.id}>
          {/* SFX pop on appearance */}
          <Sequence from={msg.messageStart} durationInFrames={15}>
            <Audio
              src={
                msg.sender === "outgoing"
                  ? staticFile("audio/ios_send.wav")
                  : staticFile("audio/ios_receive.wav")
              }
              volume={0.8}
            />
          </Sequence>

          {/* Voiceover Speech - Full WAV duration, never cut */}
          <Sequence from={msg.messageStart} durationInFrames={msg.duration + 2}>
            <Audio src={staticFile(msg.audioFile)} volume={1.0} />
          </Sequence>
        </React.Fragment>
      ))}

      {/* iPhone Status Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 48px 0 48px",
          color: "#ffffff",
          zIndex: 60,
          boxSizing: "border-box",
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.2 }}>
          9:41
        </span>
        {/* Dynamic Island Pill */}
        <div
          style={{
            width: 170,
            height: 40,
            background: "#1c1c1e",
            borderRadius: 24,
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24 }}>
          <span>5G</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* iMessage Navigation Header */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          height: 130,
          background: "rgba(22, 22, 24, 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 30px",
          zIndex: 50,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#007aff", fontSize: 32 }}>
          <span style={{ fontSize: 40, fontWeight: 300 }}>‹</span>
          <span style={{ fontSize: 26, fontWeight: 500 }}>3</span>
        </div>

        {/* Contact Info Center */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff416c, #8a2387)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            {story.contactEmoji}
          </div>
          <div style={{ color: "#ffffff", fontSize: 22, fontWeight: 700 }}>
            {story.contactName}
          </div>
        </div>

        {/* FaceTime Video Icon */}
        <div style={{ color: "#007aff", fontSize: 30 }}>
          🎥
        </div>
      </div>

      {/* Fixed Message Feed Viewport: strictly between Navigation Header (top: 230) and Input Bar (bottom: 120) */}
      <div
        style={{
          position: "absolute",
          top: 230,
          left: 0,
          right: 0,
          bottom: 120,
          overflow: "hidden",
          zIndex: 20,
        }}
      >
        {/* Inner Scrollable List */}
        <div
          style={{
            width: "100%",
            padding: "20px 20px 40px 20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            transform: `translateY(${scrollY}px)`,
          }}
        >
          {/* Date Stamp */}
          <div
            style={{
              textAlign: "center",
              color: "#8e8e93",
              fontSize: 20,
              fontWeight: 600,
              margin: "15px 0 25px 0",
            }}
          >
            iMessage • {story.timeHeader}
          </div>

          {computedMessages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </div>
      </div>

      {/* Bottom Message Input Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          background: "rgba(22, 22, 24, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          padding: "0 28px 24px 28px",
          gap: 16,
          zIndex: 50,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#2c2c2e",
            color: "#8e8e93",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
          }}
        >
          +
        </div>
        <div
          style={{
            flex: 1,
            height: 52,
            background: "#1c1c1e",
            borderRadius: 26,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            color: "#8e8e93",
            fontSize: 24,
          }}
        >
          iMessage
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#007aff",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          ↑
        </div>
      </div>

      {/* Climax Call-To-Action Overlay */}
      {frame >= ctaStartFrame && (
        <Sequence from={ctaStartFrame} durationInFrames={ctaDuration}>
          <Audio src={staticFile("audio/celebrate.wav")} volume={0.8} />

          <AbsoluteFill
            style={{
              background: "rgba(0, 0, 0, 0.92)",
              backdropFilter: "blur(25px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 50,
              zIndex: 100,
              opacity: ctaSpring,
              transform: `scale(${interpolate(ctaSpring, [0, 1], [0.88, 1])})`,
            }}
          >
            <div
              style={{
                fontSize: 84,
                marginBottom: 20,
                filter: "drop-shadow(0 0 20px rgba(255, 65, 108, 0.8))",
              }}
            >
              {story.contactEmoji}💔
            </div>

            <div
              style={{
                background: "linear-gradient(90deg, #ff416c, #ff4b2b)",
                color: "#ffffff",
                padding: "8px 24px",
                borderRadius: 8,
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              AITAH DRAMA • EPISODE #{story.episodeNumber}
            </div>

            <h1
              style={{
                color: "#ffffff",
                fontSize: 54,
                fontWeight: 900,
                textAlign: "center",
                lineHeight: 1.25,
                margin: "0 0 40px 0",
              }}
            >
              {story.dilemmaQuestion}
            </h1>

            {/* Voting Options */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                width: "100%",
                maxWidth: 860,
                marginBottom: 40,
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0, 122, 255, 0.3) 0%, rgba(0, 122, 255, 0.15) 100%)",
                  border: "2px solid #007aff",
                  borderRadius: 20,
                  padding: "24px 30px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "#007aff",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  A
                </div>
                <div style={{ color: "#ffffff", fontSize: 28, fontWeight: 700 }}>
                  {story.optionA}
                </div>
              </div>

              <div
                style={{
                  background:
                    "linear-gradient(90deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.15) 100%)",
                  border: "2px solid #ef4444",
                  borderRadius: 20,
                  padding: "24px 30px",
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "#ef4444",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  B
                </div>
                <div style={{ color: "#ffffff", fontSize: 28, fontWeight: 700 }}>
                  {story.optionB}
                </div>
              </div>
            </div>

            <p
              style={{
                color: "#94a3b8",
                fontSize: 26,
                fontWeight: 600,
                textAlign: "center",
                margin: "0 0 35px 0",
              }}
            >
              Drop your vote (A or B) in the comments! 👇
            </p>

            <div
              style={{
                background: "#ffffff",
                color: "#000000",
                padding: "20px 50px",
                borderRadius: 50,
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                boxShadow: "0 10px 30px rgba(255,255,255,0.3)",
              }}
            >
              Follow For Next Episode 🔥
            </div>
          </AbsoluteFill>
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
