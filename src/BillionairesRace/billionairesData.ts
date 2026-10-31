export interface BillionaireProfile {
  id: string;
  name: string;
  company: string;
  color: string;
  gradient: string;
  initials: string;
  badgeBg: string;
  history: { year: number; netWorth: number }[]; // In Billions USD
}

export interface BillionaireMilestone {
  year: number;
  title: string;
  person: string;
}

export const BILLIONAIRES: BillionaireProfile[] = [
  {
    id: "musk",
    name: "Elon Musk",
    company: "Tesla / SpaceX",
    color: "#e11d48",
    gradient: "linear-gradient(90deg, #be123c, #fb7185)",
    initials: "EM",
    badgeBg: "#e11d48",
    history: [
      { year: 2000, netWorth: 0 },
      { year: 2004, netWorth: 0.1 },
      { year: 2008, netWorth: 0.3 },
      { year: 2012, netWorth: 2 },
      { year: 2016, netWorth: 12 },
      { year: 2019, netWorth: 24 },
      { year: 2021, netWorth: 195 },
      { year: 2023, netWorth: 250 },
      { year: 2026, netWorth: 345 },
    ],
  },
  {
    id: "bezos",
    name: "Jeff Bezos",
    company: "Amazon",
    color: "#f59e0b",
    gradient: "linear-gradient(90deg, #d97706, #fbbf24)",
    initials: "JB",
    badgeBg: "#f59e0b",
    history: [
      { year: 2000, netWorth: 6 },
      { year: 2004, netWorth: 5 },
      { year: 2008, netWorth: 8 },
      { year: 2012, netWorth: 18 },
      { year: 2016, netWorth: 45 },
      { year: 2018, netWorth: 112 },
      { year: 2021, netWorth: 190 },
      { year: 2023, netWorth: 175 },
      { year: 2026, netWorth: 225 },
    ],
  },
  {
    id: "gates",
    name: "Bill Gates",
    company: "Microsoft",
    color: "#0284c7",
    gradient: "linear-gradient(90deg, #0369a1, #38bdf8)",
    initials: "BG",
    badgeBg: "#0284c7",
    history: [
      { year: 2000, netWorth: 85 },
      { year: 2004, netWorth: 46 },
      { year: 2008, netWorth: 58 },
      { year: 2012, netWorth: 61 },
      { year: 2016, netWorth: 75 },
      { year: 2018, netWorth: 90 },
      { year: 2021, netWorth: 124 },
      { year: 2023, netWorth: 115 },
      { year: 2026, netWorth: 135 },
    ],
  },
  {
    id: "zuck",
    name: "Mark Zuckerberg",
    company: "Meta",
    color: "#2563eb",
    gradient: "linear-gradient(90deg, #1d4ed8, #60a5fa)",
    initials: "MZ",
    badgeBg: "#2563eb",
    history: [
      { year: 2000, netWorth: 0 },
      { year: 2004, netWorth: 0 },
      { year: 2008, netWorth: 1.5 },
      { year: 2012, netWorth: 17 },
      { year: 2016, netWorth: 44 },
      { year: 2018, netWorth: 71 },
      { year: 2021, netWorth: 97 },
      { year: 2023, netWorth: 118 },
      { year: 2026, netWorth: 210 },
    ],
  },
  {
    id: "buffett",
    name: "Warren Buffett",
    company: "Berkshire Hathaway",
    color: "#16a34a",
    gradient: "linear-gradient(90deg, #15803d, #4ade80)",
    initials: "WB",
    badgeBg: "#16a34a",
    history: [
      { year: 2000, netWorth: 28 },
      { year: 2004, netWorth: 42 },
      { year: 2008, netWorth: 62 },
      { year: 2012, netWorth: 44 },
      { year: 2016, netWorth: 60 },
      { year: 2018, netWorth: 84 },
      { year: 2021, netWorth: 96 },
      { year: 2023, netWorth: 118 },
      { year: 2026, netWorth: 148 },
    ],
  },
  {
    id: "arnault",
    name: "Bernard Arnault",
    company: "LVMH Luxury",
    color: "#9333ea",
    gradient: "linear-gradient(90deg, #7e22ce, #c084fc)",
    initials: "BA",
    badgeBg: "#9333ea",
    history: [
      { year: 2000, netWorth: 10 },
      { year: 2004, netWorth: 12 },
      { year: 2008, netWorth: 25 },
      { year: 2012, netWorth: 41 },
      { year: 2016, netWorth: 37 },
      { year: 2018, netWorth: 72 },
      { year: 2021, netWorth: 150 },
      { year: 2023, netWorth: 185 },
      { year: 2026, netWorth: 195 },
    ],
  },
];

export const BILLIONAIRE_MILESTONES: BillionaireMilestone[] = [
  { year: 2000, title: "👑 Bill Gates reigns supreme at $85 Billion", person: "Bill Gates" },
  { year: 2008, title: "📈 Warren Buffett briefly takes the #1 crown", person: "Warren Buffett" },
  { year: 2017, title: "🚀 Jeff Bezos becomes first $100B centibillionaire", person: "Jeff Bezos" },
  { year: 2021, title: "⚡ Elon Musk surges past Bezos to claim #1", person: "Elon Musk" },
  { year: 2024, title: "💎 The $200B Club: Musk, Bezos & Zuckerberg", person: "Elon Musk" },
];

