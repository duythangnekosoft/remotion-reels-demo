import { QuizItem } from "../types";

export const CRAZY_LAWS_DATA: QuizItem[] = [
  {
    id: 1,
    category: "WILDLIFE LAW 🐻",
    question: "In which state is it illegal to wake a sleeping bear just for a photograph?",
    options: [
      { key: "A", text: "Alaska" },
      { key: "B", text: "Montana" },
      { key: "C", text: "Wyoming" },
      { key: "D", text: "Idaho" },
    ],
    correctKey: "A",
    funFact: "While hunting bears is permitted in season, waking a sleeping bear for a photo is strictly banned for public safety!",
  },
  {
    id: 2,
    category: "PHYSICS LAW 🌊",
    question: "In which US state is it technically illegal to whistle underwater?",
    options: [
      { key: "A", text: "Maine" },
      { key: "B", text: "Vermont" },
      { key: "C", text: "Oregon" },
      { key: "D", text: "Hawaii" },
    ],
    correctKey: "B",
    funFact: "Vermont still carries an ancient municipal ordinance banning whistling underwater — despite it being physically impossible!",
  },
  {
    id: 3,
    category: "DAIRY STATE 🧀",
    question: "In which state is it illegal to serve margarine in restaurants unless asked?",
    options: [
      { key: "A", text: "Iowa" },
      { key: "B", text: "Minnesota" },
      { key: "C", text: "Wisconsin" },
      { key: "D", text: "Nebraska" },
    ],
    correctKey: "C",
    funFact: "Wisconsin Statute 97.18 strictly protects America's Dairyland by penalizing restaurants that serve fake butter without asking!",
  },
  {
    id: 4,
    category: "SUNDAY RULE 🍦",
    question: "Which state outlawed carrying an ice cream cone in your back pocket on Sundays?",
    options: [
      { key: "A", text: "Georgia" },
      { key: "B", text: "Texas" },
      { key: "C", text: "Florida" },
      { key: "D", text: "Alabama" },
    ],
    correctKey: "A",
    funFact: "This historic law stopped horse thieves who lured horses away silently by putting an ice cream cone in their back pocket!",
  },
  {
    id: 5,
    category: "CITY ORDINANCE 🚗",
    question: "In Denver, Colorado, it is technically illegal to drive what color car on Sunday?",
    options: [
      { key: "A", text: "Red" },
      { key: "B", text: "White" },
      { key: "C", text: "Yellow" },
      { key: "D", text: "Black" },
    ],
    correctKey: "D",
    funFact: "Denver once banned driving black cars on the Sabbath under old Puritan blue laws to enforce solemnity!",
  },
];

