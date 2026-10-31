import { QuizItem } from "../types";

export const BIBLE_QUIZ_DATA: QuizItem[] = [
  {
    id: 1,
    category: "ANCIENT SCRIPTURES",
    question: "Who is the OLDEST person recorded in the Bible, living 969 years?",
    options: [
      { key: "A", text: "Noah" },
      { key: "B", text: "Adam" },
      { key: "C", text: "Methuselah" },
      { key: "D", text: "Abraham" },
    ],
    correctKey: "C",
    funFact: "Genesis 5:27 records that Methuselah lived to be 969 years old!",
  },
  {
    id: 2,
    category: "NOAH'S ARK",
    question: "What was the FIRST bird that Noah released from the Ark?",
    options: [
      { key: "A", text: "The Dove" },
      { key: "B", text: "The Raven" },
      { key: "C", text: "The Sparrow" },
      { key: "D", text: "The Eagle" },
    ],
    correctKey: "B",
    funFact: "Genesis 8:7 reveals Noah sent out a raven first, before sending the dove!",
  },
  {
    id: 3,
    category: "BIBLE MYSTERIES",
    question: "Which is the SHORTEST verse in the entire English Bible?",
    options: [
      { key: "A", text: "God is love" },
      { key: "B", text: "Jesus wept" },
      { key: "C", text: "Pray continually" },
      { key: "D", text: "Rejoice always" },
    ],
    correctKey: "B",
    funFact: "John 11:35 contains just two words: 'Jesus wept', making it the shortest verse!",
  },
  {
    id: 4,
    category: "DAVID VS GOLIATH",
    question: "How many smooth stones did David pick up from the brook?",
    options: [
      { key: "A", text: "One stone" },
      { key: "B", text: "Three stones" },
      { key: "C", text: "Five stones" },
      { key: "D", text: "Seven stones" },
    ],
    correctKey: "C",
    funFact: "David gathered five smooth stones from the stream, though he needed only one!",
  },
  {
    id: 5,
    category: "FINAL BOSS",
    question: "Who was swallowed by a great fish after fleeing God's command?",
    options: [
      { key: "A", text: "Jonah" },
      { key: "B", text: "Elijah" },
      { key: "C", text: "Daniel" },
      { key: "D", text: "Moses" },
    ],
    correctKey: "A",
    funFact: "Jonah spent 3 days and 3 nights in the belly of the fish before being delivered!",
  },
];

