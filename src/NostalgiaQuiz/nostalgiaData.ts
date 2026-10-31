import { QuizItem } from "../types";

export const NOSTALGIA_QUIZ_DATA: QuizItem[] = [
  {
    id: 1,
    category: "RETRO TECH 💾",
    question: "What was the standard storage capacity of a 3.5\" floppy disk?",
    options: [
      { key: "A", text: "720 KB" },
      { key: "B", text: "1.44 MB" },
      { key: "C", text: "2.88 MB" },
      { key: "D", text: "512 KB" },
    ],
    correctKey: "B",
    funFact: "A modern 128GB iPhone holds the same data as over 88,000 floppy disks!",
  },
  {
    id: 2,
    category: "90s BLOCKBUSTER 📼",
    question: "What was Blockbuster's famous four-word commercial slogan?",
    options: [
      { key: "A", text: "Be Kind, Please Rewind" },
      { key: "B", text: "Make It A Blockbuster Night" },
      { key: "C", text: "Movies For Your Weekend" },
      { key: "D", text: "Rent More, Save More" },
    ],
    correctKey: "B",
    funFact: "'Be Kind, Please Rewind' was the cassette sticker, but their slogan was 'Make It A Blockbuster Night'!",
  },
  {
    id: 3,
    category: "MUSIC REVOLUTION 🎧",
    question: "Which company released the revolutionary cassette Walkman in 1979?",
    options: [
      { key: "A", text: "Panasonic" },
      { key: "B", text: "Sony" },
      { key: "C", text: "Toshiba" },
      { key: "D", text: "Pioneer" },
    ],
    correctKey: "B",
    funFact: "Sony's TPS-L2 Walkman changed how humanity listened to music on the go forever!",
  },
  {
    id: 4,
    category: "DIAL-UP ERA 🌐",
    question: "What iconic 3-word phrase did AOL announce for new emails?",
    options: [
      { key: "A", text: "\"You've Got Mail!\"" },
      { key: "B", text: "\"Message Received!\"" },
      { key: "C", text: "\"Check Your Inbox!\"" },
      { key: "D", text: "\"Welcome To AOL!\"" },
    ],
    correctKey: "A",
    funFact: "Voice actor Elwood Edwards recorded the famous 4 phrases on a cassette deck in his living room!",
  },
  {
    id: 5,
    category: "90s TOY CRAZE 👾",
    question: "What tiny handheld digital pet from Japan became a global mania in 1996?",
    options: [
      { key: "A", text: "Furby" },
      { key: "B", text: "Tamagotchi" },
      { key: "C", text: "Giga Pet" },
      { key: "D", text: "Pocket Pikachu" },
    ],
    correctKey: "B",
    funFact: "Over 82 million original Tamagotchis were sold worldwide, triggering school bans across the US!",
  },
];

