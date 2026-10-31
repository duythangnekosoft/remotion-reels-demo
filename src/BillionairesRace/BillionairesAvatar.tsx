import React from "react";

interface BillionairesAvatarProps {
  id: string;
  initials: string;
  color: string;
  size?: number;
}

export const BillionairesAvatar: React.FC<BillionairesAvatarProps> = ({
  id,
  initials,
  color,
  size = 46,
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, #0f172a)`,
        border: "2px solid rgba(255, 255, 255, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontSize: size * 0.42,
        fontWeight: 900,
        letterSpacing: 1,
        boxShadow: `0 0 15px ${color}66`,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

