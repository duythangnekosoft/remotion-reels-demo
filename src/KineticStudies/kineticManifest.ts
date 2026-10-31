export interface KineticItem {
  id: string;
  kind: string;
  title: string;
  frames: number;
  finishFrame: number;
  duration: number;
  events: number;
  result: any;
  titleVn: string;
  titleEn: string;
  ruleVn: string;
}

export const KINETIC_FIVE_ITEMS: KineticItem[] = [
  {
    id: "HeartBloom",
    kind: "heart",
    title: "HEART BLOOM",
    frames: 1139,
    finishFrame: 1063,
    duration: 38.0,
    events: 104,
    result: { totalCells: 1001, lit: 1001, balls: 105, goal: "all cells lit" },
    titleVn: "Heart Bloom • Neon Kinetic Illumination (38.0s)",
    titleEn: "Heart Bloom • Neon Kinetic Illumination",
    ruleVn: "1 initial spark, bounces spawn new sparks until all 1,001 heart nodes illuminate",
  },
  {
    id: "OrbitBloom",
    kind: "orbit",
    title: "ORBIT BLOOM",
    frames: 1036,
    finishFrame: 960,
    duration: 34.5,
    events: 407,
    result: { totalCells: 1456, lit: 1456, balls: 408, goal: "all cells lit" },
    titleVn: "Orbit Bloom • Orbital Spark Cascades (34.5s)",
    titleEn: "Orbit Bloom • Orbital Spark Cascades",
    ruleVn: "1 spark bounces between inner and outer orbits, lighting 1,456 orbital nodes",
  },
  {
    id: "RingRivals",
    kind: "rings",
    title: "RING RIVALS",
    frames: 1117,
    finishFrame: 1042,
    duration: 37.2,
    events: 147,
    result: { score: [72, 75], rings: 147, remainingRadius: 8.75, goal: "arena closed", winner: "BLUE" },
    titleVn: "Ring Rivals • Red vs Blue Shrinking Arena (37.2s)",
    titleEn: "Ring Rivals • Red vs Blue Shrinking Arena",
    ruleVn: "Two balls duel, each bounce constructs a shrinking concentric barrier",
  },
  {
    id: "SquareRivals",
    kind: "square",
    title: "SQUARE RIVALS",
    frames: 1105,
    finishFrame: 1030,
    duration: 36.8,
    events: 197,
    result: { score: [98, 99], rings: 197, remainingRadius: 9.9, goal: "arena closed", winner: "VIOLET" },
    titleVn: "Square Rivals • Gold vs Violet Arena (36.8s)",
    titleEn: "Square Rivals • Gold vs Violet Arena",
    ruleVn: "Two balls duel inside a square arena, walls close inward on every bounce",
  },
  {
    id: "PrismCollapse",
    kind: "brick",
    title: "PRISM COLLAPSE",
    frames: 1055,
    finishFrame: 980,
    duration: 35.2,
    events: 796,
    result: { totalBricks: 796, remaining: 0, balls: 797, goal: "all bricks destroyed" },
    titleVn: "Prism Collapse • 796 Neon Brick Breaker (35.2s)",
    titleEn: "Prism Collapse • 796 Neon Brick Breaker",
    ruleVn: "1 starting ball, each shattered brick spawns another ball until all 796 bricks clear",
  },
];
