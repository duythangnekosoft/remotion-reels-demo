import React from "react";

interface CompanyLogoProps {
  id: string;
  size?: number;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ id, size = 44 }) => {
  switch (id) {
    case "aapl":
      // Apple icon
      return (
        <svg width={size} height={size} viewBox="0 0 170 170" fill="none">
          <path
            d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-5.97-9.03-10.63-19.34-13.98-30.93-3.35-11.59-5.03-22.38-5.03-32.39 0-14.35 3.58-26.12 10.74-35.32 7.16-9.2 16.29-13.91 27.38-14.13 5.43 0 11.21 1.41 17.33 4.23 6.13 2.83 10.12 4.3 11.97 4.42 1.63 0 5.86-1.57 12.69-4.71 6.83-3.14 12.87-4.47 18.13-3.99 13.7.65 24.38 5.76 32.05 15.33-12.18 7.39-18.13 17.51-17.87 30.36.26 10.01 4.12 18.49 11.58 25.43 7.46 6.94 16.14 11.06 26.04 12.37-2.18 6.52-4.78 13.11-7.8 19.78zM119.22 33.04c0-7.07 2.53-13.79 7.59-20.16 5.06-6.37 11.39-10.45 18.99-12.24.44 1.74.66 3.48.66 5.22 0 6.96-2.67 13.75-8.01 20.37-5.34 6.62-11.8 10.65-19.39 12.08-.22-1.74-.34-3.5-.34-5.27z"
            fill="#ffffff"
          />
        </svg>
      );

    case "msft":
      // Microsoft 4-square logo
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="5" y="5" width="42" height="42" fill="#f25022" rx="4" />
          <rect x="53" y="5" width="42" height="42" fill="#7fba00" rx="4" />
          <rect x="5" y="53" width="42" height="42" fill="#00a4ef" rx="4" />
          <rect x="53" y="53" width="42" height="42" fill="#ffb900" rx="4" />
        </svg>
      );

    case "nvda":
      // Nvidia green claw
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect width="100" height="100" rx="20" fill="#76b900" />
          <path
            d="M50 20C33.43 20 20 33.43 20 50c0 16.57 13.43 30 30 30 11.05 0 20.7-5.98 25.86-14.88-5.32 3.65-11.75 5.88-18.86 5.88-17.67 0-32-14.33-32-32 0-9.82 4.43-18.6 11.41-24.5C32.18 21.6 26.33 25.5 22 31c6-11 18-18 31-18 19 0 35 15 35 34 0 9-3 17-9 23 4-5 7-12 7-19 0-16.57-12.43-30-29-30z"
            fill="#ffffff"
          />
        </svg>
      );

    case "googl":
      // Google 4-color 'G'
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path
            fill="#4285F4"
            d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
          />
          <path
            fill="#34A853"
            d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
          />
          <path
            fill="#FBBC05"
            d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A23.93 23.93 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.35-5.7.78-.9z"
          />
          <path
            fill="#EA4335"
            d="M24 9.5c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 2.72 29.93.5 24 .5 15.4.5 7.96 5.43 4.34 12.62l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
          />
        </svg>
      );

    case "amzn":
      // Amazon Arrow smile
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect width="100" height="100" rx="20" fill="#232f3e" />
          <path
            d="M25 60c15 8 35 8 50-2"
            stroke="#ff9900"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M72 52l6 7-9 1"
            fill="#ff9900"
            stroke="#ff9900"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <text
            x="50"
            y="44"
            fill="#ffffff"
            fontSize="32"
            fontWeight="bold"
            fontFamily="sans-serif"
            textAnchor="middle"
          >
            a
          </text>
        </svg>
      );

    case "xom":
      // ExxonMobil
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect width="100" height="100" rx="20" fill="#dc2626" />
          <text
            x="50"
            y="62"
            fill="#ffffff"
            fontSize="36"
            fontWeight="900"
            fontFamily="sans-serif"
            textAnchor="middle"
            letterSpacing="-2"
          >
            XOM
          </text>
        </svg>
      );

    case "ge":
      // General Electric
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
          <rect width="100" height="100" rx="20" fill="#2563eb" />
          <circle cx="50" cy="50" r="38" stroke="#ffffff" strokeWidth="4" />
          <text
            x="50"
            y="62"
            fill="#ffffff"
            fontSize="36"
            fontWeight="900"
            fontFamily="serif"
            fontStyle="italic"
            textAnchor="middle"
          >
            GE
          </text>
        </svg>
      );

    default:
      return <div style={{ fontSize: size * 0.75 }}>🏢</div>;
  }
};

