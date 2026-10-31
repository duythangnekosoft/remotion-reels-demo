import { QuizItem } from "../types";

export const QUIZ_DATA: QuizItem[] = [
  {
    id: 1,
    category: "GEOGRAPHY IQ",
    question: "Which US state has the LONGEST total coastline?",
    options: [
      { key: "A", text: "California" },
      { key: "B", text: "Florida" },
      { key: "C", text: "Alaska" },
      { key: "D", text: "Hawaii" },
    ],
    correctKey: "C",
    funFact: "Alaska has 6,640 miles of coastline — more than all other 49 states combined!",
  },
  {
    id: 2,
    category: "TRIVIA SHOCK",
    question: "Which US state is geographically CLOSEST to Africa?",
    options: [
      { key: "A", text: "Florida" },
      { key: "B", text: "North Carolina" },
      { key: "C", text: "New York" },
      { key: "D", text: "Maine" },
    ],
    correctKey: "D",
    funFact: "Quoddy Head, Maine is only 3,154 miles from Morocco — closer than Florida!",
  },
  {
    id: 3,
    category: "SPELLING & SOUND",
    question: "What is the ONLY US state with a one-syllable name?",
    options: [
      { key: "A", text: "Maine" },
      { key: "B", text: "Utah" },
      { key: "C", text: "Ohio" },
      { key: "D", text: "Texas" },
    ],
    correctKey: "A",
    funFact: "Maine is indeed the only single-syllable state name in the United States!",
  },
  {
    id: 4,
    category: "FIRE & ICE",
    question: "Which US state contains over 80% of all active US volcanoes?",
    options: [
      { key: "A", text: "Hawaii" },
      { key: "B", text: "Washington" },
      { key: "C", text: "Alaska" },
      { key: "D", text: "Oregon" },
    ],
    correctKey: "C",
    funFact: "Alaska is home to over 130 volcanoes, with more than 50 active since 1760!",
  },
  {
    id: 5,
    category: "AGRICULTURE",
    question: "Which is the ONLY US state that produces coffee commercially?",
    options: [
      { key: "A", text: "Florida" },
      { key: "B", text: "California" },
      { key: "C", text: "Hawaii" },
      { key: "D", text: "Texas" },
    ],
    correctKey: "C",
    funFact: "Hawaii's volcanic soil and tropical climate make it the only commercial coffee producer!",
  },
];
