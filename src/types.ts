export interface QuizItem {
  id: number;
  question: string;
  category: string;
  options: {
    key: string;
    text: string;
  }[];
  correctKey: string;
  funFact: string;
}

export interface CompanyDataPoint {
  year: number;
  marketCap: number; // In Billions USD
}

export interface CompanyProfile {
  id: string;
  name: string;
  ticker: string;
  color: string;
  gradient: string;
  logoEmoji: string;
  history: CompanyDataPoint[];
}

export interface MilestoneEvent {
  year: number;
  title: string;
  company: string;
}

