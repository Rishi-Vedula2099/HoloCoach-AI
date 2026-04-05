// HoloCoach AI — Multi-Sport Configuration
// Ideal angles, movement templates, scoring rules for every supported sport

export interface SportMovement {
  name: string;
  description: string;
  keyJoints: string[];
}

export interface SportIdealAngles {
  [key: string]: number;
  leftElbow: number;
  rightElbow: number;
  leftKnee: number;
  rightKnee: number;
  leftShoulder: number;
  rightShoulder: number;
  leftHip: number;
  rightHip: number;
}

export interface ScoringWeights {
  upperBody: number;
  core: number;
  lowerBody: number;
  balance: number;
}

export interface SportConfig {
  id: string;
  name: string;
  icon: string;
  category: "Team" | "Racquet" | "Combat" | "Individual" | "Fitness";
  color: string;
  bgColor: string;
  description: string;
  idealAngles: SportIdealAngles;
  tolerances: { good: number; warning: number };
  scoringWeights: ScoringWeights;
  movements: SportMovement[];
  tips: string[];
}

export const SPORTS: Record<string, SportConfig> = {
  football: {
    id: "football",
    name: "Football",
    icon: "⚽",
    category: "Team",
    color: "#2ECC71",
    bgColor: "rgba(46, 204, 113, 0.08)",
    description: "AI-powered analysis for kicking, sprinting, dribbling, and defensive posture.",
    idealAngles: {
      leftElbow: 155, rightElbow: 155,
      leftKnee: 130, rightKnee: 130,
      leftShoulder: 40, rightShoulder: 40,
      leftHip: 160, rightHip: 160,
    },
    tolerances: { good: 12, warning: 28 },
    scoringWeights: { upperBody: 0.15, core: 0.25, lowerBody: 0.4, balance: 0.2 },
    movements: [
      { name: "Kick", description: "Ball striking technique", keyJoints: ["rightKnee", "rightHip", "leftKnee"] },
      { name: "Sprint", description: "Running form analysis", keyJoints: ["leftKnee", "rightKnee", "leftHip", "rightHip"] },
      { name: "Header", description: "Heading technique", keyJoints: ["leftShoulder", "rightShoulder", "leftHip", "rightHip"] },
      { name: "Dribble", description: "Ball control posture", keyJoints: ["leftKnee", "rightKnee", "leftHip", "rightHip"] },
    ],
    tips: [
      "Plant foot should point toward target when kicking",
      "Keep your body leaning slightly forward during sprint",
      "Eyes on the ball during headers, use forehead contact",
    ],
  },

  cricket: {
    id: "cricket",
    name: "Cricket",
    icon: "🏏",
    category: "Team",
    color: "#E67E22",
    bgColor: "rgba(230, 126, 34, 0.08)",
    description: "Batting stance, bowling action, and fielding posture analysis.",
    idealAngles: {
      leftElbow: 165, rightElbow: 165,
      leftKnee: 140, rightKnee: 140,
      leftShoulder: 90, rightShoulder: 90,
      leftHip: 155, rightHip: 155,
    },
    tolerances: { good: 10, warning: 22 },
    scoringWeights: { upperBody: 0.35, core: 0.25, lowerBody: 0.25, balance: 0.15 },
    movements: [
      { name: "Batting Stance", description: "Ready position analysis", keyJoints: ["leftKnee", "rightKnee", "leftShoulder", "rightShoulder"] },
      { name: "Bowling Action", description: "Bowling arm and body mechanics", keyJoints: ["rightShoulder", "rightElbow", "rightHip", "leftKnee"] },
      { name: "Fielding", description: "Catch and throw posture", keyJoints: ["leftKnee", "rightKnee", "leftShoulder", "rightShoulder"] },
      { name: "Drive Shot", description: "Front foot drive technique", keyJoints: ["leftKnee", "leftHip", "rightShoulder", "rightElbow"] },
    ],
    tips: [
      "Keep your elbow high during bowling action",
      "Maintain a side-on stance when batting",
      "Bend knees in fielding ready position",
    ],
  },

  rugby: {
    id: "rugby",
    name: "Rugby",
    icon: "🏉",
    category: "Team",
    color: "#8E44AD",
    bgColor: "rgba(142, 68, 173, 0.08)",
    description: "Tackling form, scrum posture, passing technique, and sprint analysis.",
    idealAngles: {
      leftElbow: 90, rightElbow: 90,
      leftKnee: 120, rightKnee: 120,
      leftShoulder: 50, rightShoulder: 50,
      leftHip: 140, rightHip: 140,
    },
    tolerances: { good: 15, warning: 30 },
    scoringWeights: { upperBody: 0.25, core: 0.3, lowerBody: 0.3, balance: 0.15 },
    movements: [
      { name: "Tackle", description: "Safe tackling technique", keyJoints: ["leftKnee", "rightKnee", "leftShoulder", "rightShoulder"] },
      { name: "Scrum", description: "Scrum body position", keyJoints: ["leftHip", "rightHip", "leftKnee", "rightKnee"] },
      { name: "Pass", description: "Lateral passing form", keyJoints: ["leftShoulder", "rightShoulder", "leftElbow", "rightElbow"] },
      { name: "Ruck", description: "Ruck body position", keyJoints: ["leftHip", "rightHip", "leftKnee", "rightKnee"] },
    ],
    tips: [
      "Keep head to the side during tackle",
      "Flat back with hips below shoulders in scrum",
      "Follow through with arms when passing",
    ],
  },

  badminton: {
    id: "badminton",
    name: "Badminton",
    icon: "🏸",
    category: "Racquet",
    color: "#1ABC9C",
    bgColor: "rgba(26, 188, 156, 0.08)",
    description: "Smash, drop shot, net play, and footwork analysis.",
    idealAngles: {
      leftElbow: 150, rightElbow: 140,
      leftKnee: 135, rightKnee: 135,
      leftShoulder: 60, rightShoulder: 120,
      leftHip: 165, rightHip: 165,
    },
    tolerances: { good: 10, warning: 22 },
    scoringWeights: { upperBody: 0.35, core: 0.2, lowerBody: 0.25, balance: 0.2 },
    movements: [
      { name: "Smash", description: "Overhead smash technique", keyJoints: ["rightShoulder", "rightElbow", "rightHip", "rightKnee"] },
      { name: "Drop Shot", description: "Deceptive drop shot form", keyJoints: ["rightShoulder", "rightElbow", "rightKnee"] },
      { name: "Net Play", description: "Front court positioning", keyJoints: ["leftKnee", "rightKnee", "rightElbow"] },
      { name: "Footwork", description: "Court movement patterns", keyJoints: ["leftKnee", "rightKnee", "leftHip", "rightHip"] },
    ],
    tips: [
      "Full arm extension at highest point for smash",
      "Stay on balls of feet for quick movement",
      "Racquet up in ready position between shots",
    ],
  },

  tennis: {
    id: "tennis",
    name: "Tennis",
    icon: "🎾",
    category: "Racquet",
    color: "#F39C12",
    bgColor: "rgba(243, 156, 18, 0.08)",
    description: "Serve, forehand, backhand, and volley technique analysis.",
    idealAngles: {
      leftElbow: 150, rightElbow: 140,
      leftKnee: 140, rightKnee: 140,
      leftShoulder: 55, rightShoulder: 120,
      leftHip: 165, rightHip: 165,
    },
    tolerances: { good: 10, warning: 24 },
    scoringWeights: { upperBody: 0.35, core: 0.2, lowerBody: 0.25, balance: 0.2 },
    movements: [
      { name: "Serve", description: "Service motion analysis", keyJoints: ["rightShoulder", "rightElbow", "rightKnee", "rightHip"] },
      { name: "Forehand", description: "Forehand stroke technique", keyJoints: ["rightShoulder", "rightElbow", "rightHip", "rightKnee"] },
      { name: "Backhand", description: "Backhand stroke form", keyJoints: ["leftShoulder", "rightShoulder", "rightElbow", "rightKnee"] },
      { name: "Volley", description: "Net volley positioning", keyJoints: ["rightElbow", "leftKnee", "rightKnee"] },
    ],
    tips: [
      "Trophy position: racquet behind head, elbow at 90°",
      "Rotate hips before shoulders on groundstrokes",
      "Split step before every shot",
    ],
  },

  basketball: {
    id: "basketball",
    name: "Basketball",
    icon: "🏀",
    category: "Team",
    color: "#E74C3C",
    bgColor: "rgba(231, 76, 60, 0.08)",
    description: "Shooting form, dribbling stance, defensive posture analysis.",
    idealAngles: {
      leftElbow: 90, rightElbow: 90,
      leftKnee: 130, rightKnee: 130,
      leftShoulder: 80, rightShoulder: 80,
      leftHip: 155, rightHip: 155,
    },
    tolerances: { good: 10, warning: 25 },
    scoringWeights: { upperBody: 0.35, core: 0.2, lowerBody: 0.25, balance: 0.2 },
    movements: [
      { name: "Shooting", description: "Jump shot form", keyJoints: ["rightElbow", "rightShoulder", "rightKnee", "rightHip"] },
      { name: "Dribbling", description: "Ball handling posture", keyJoints: ["leftKnee", "rightKnee", "leftHip", "rightHip"] },
      { name: "Defense", description: "Defensive stance analysis", keyJoints: ["leftKnee", "rightKnee", "leftHip", "rightHip"] },
      { name: "Layup", description: "Layup approach technique", keyJoints: ["leftKnee", "rightKnee", "rightElbow", "rightShoulder"] },
    ],
    tips: [
      "Shooting elbow should be at 90° (L-shape)",
      "Low athletic stance for defensive positioning",
      "Follow through: snap wrist, cookie jar finish",
    ],
  },

  swimming: {
    id: "swimming",
    name: "Swimming",
    icon: "🏊",
    category: "Individual",
    color: "#3498DB",
    bgColor: "rgba(52, 152, 219, 0.08)",
    description: "Stroke technique, body rotation, and kick analysis (dry-land training focus).",
    idealAngles: {
      leftElbow: 160, rightElbow: 160,
      leftKnee: 170, rightKnee: 170,
      leftShoulder: 170, rightShoulder: 170,
      leftHip: 175, rightHip: 175,
    },
    tolerances: { good: 8, warning: 20 },
    scoringWeights: { upperBody: 0.35, core: 0.3, lowerBody: 0.2, balance: 0.15 },
    movements: [
      { name: "Freestyle Stroke", description: "Arm pull pattern", keyJoints: ["rightShoulder", "rightElbow", "leftShoulder", "leftElbow"] },
      { name: "Streamline", description: "Streamline body position", keyJoints: ["leftShoulder", "rightShoulder", "leftHip", "rightHip"] },
      { name: "Kick Drill", description: "Flutter kick technique", keyJoints: ["leftKnee", "rightKnee", "leftHip", "rightHip"] },
      { name: "Turn Prep", description: "Flip turn approach form", keyJoints: ["leftHip", "rightHip", "leftKnee", "rightKnee"] },
    ],
    tips: [
      "High elbow catch — keep elbow above wrist",
      "Body rotation drives power, not just arms",
      "Kick from hips, not knees — minimal knee bend",
    ],
  },

  athletics: {
    id: "athletics",
    name: "Athletics",
    icon: "🏃",
    category: "Individual",
    color: "#9B59B6",
    bgColor: "rgba(155, 89, 182, 0.08)",
    description: "Sprint form, long jump, shot put, and general track & field technique.",
    idealAngles: {
      leftElbow: 90, rightElbow: 90,
      leftKnee: 140, rightKnee: 140,
      leftShoulder: 45, rightShoulder: 45,
      leftHip: 165, rightHip: 165,
    },
    tolerances: { good: 10, warning: 22 },
    scoringWeights: { upperBody: 0.2, core: 0.25, lowerBody: 0.35, balance: 0.2 },
    movements: [
      { name: "Sprint Start", description: "Block start technique", keyJoints: ["leftKnee", "rightKnee", "leftHip", "rightHip"] },
      { name: "Sprint Form", description: "Mid-race running form", keyJoints: ["leftElbow", "rightElbow", "leftKnee", "rightKnee"] },
      { name: "Long Jump", description: "Takeoff and flight phase", keyJoints: ["leftKnee", "rightKnee", "leftHip", "rightHip"] },
      { name: "Shot Put", description: "Throwing technique", keyJoints: ["rightShoulder", "rightElbow", "rightHip", "rightKnee"] },
    ],
    tips: [
      "Drive arms at 90° angle during sprinting",
      "High knee lift for maximum stride length",
      "Push off from balls of feet, not heels",
    ],
  },

  yoga: {
    id: "yoga",
    name: "Yoga",
    icon: "🧘",
    category: "Fitness",
    color: "#27AE60",
    bgColor: "rgba(39, 174, 96, 0.08)",
    description: "Pose alignment, balance, flexibility tracking, and breathing form.",
    idealAngles: {
      leftElbow: 170, rightElbow: 170,
      leftKnee: 170, rightKnee: 170,
      leftShoulder: 90, rightShoulder: 90,
      leftHip: 170, rightHip: 170,
    },
    tolerances: { good: 8, warning: 18 },
    scoringWeights: { upperBody: 0.25, core: 0.25, lowerBody: 0.25, balance: 0.25 },
    movements: [
      { name: "Warrior I", description: "Virabhadrasana I alignment", keyJoints: ["leftKnee", "rightKnee", "leftShoulder", "rightShoulder"] },
      { name: "Warrior II", description: "Virabhadrasana II alignment", keyJoints: ["leftKnee", "leftHip", "leftShoulder", "rightShoulder"] },
      { name: "Tree Pose", description: "Vrksasana balance", keyJoints: ["leftKnee", "rightKnee", "leftHip", "rightHip"] },
      { name: "Downward Dog", description: "Adho Mukha Svanasana form", keyJoints: ["leftShoulder", "rightShoulder", "leftHip", "rightHip"] },
    ],
    tips: [
      "Keep shoulders away from ears in all poses",
      "Engage core — belly button toward spine",
      "Focus gaze (drishti) for balance poses",
    ],
  },

  boxing: {
    id: "boxing",
    name: "Boxing",
    icon: "🥊",
    category: "Combat",
    color: "#C0392B",
    bgColor: "rgba(192, 57, 43, 0.08)",
    description: "Stance, jab, cross, hook, and defensive movement analysis.",
    idealAngles: {
      leftElbow: 90, rightElbow: 90,
      leftKnee: 140, rightKnee: 140,
      leftShoulder: 35, rightShoulder: 35,
      leftHip: 155, rightHip: 155,
    },
    tolerances: { good: 10, warning: 25 },
    scoringWeights: { upperBody: 0.35, core: 0.25, lowerBody: 0.2, balance: 0.2 },
    movements: [
      { name: "Jab", description: "Lead hand straight punch", keyJoints: ["leftShoulder", "leftElbow", "leftHip", "leftKnee"] },
      { name: "Cross", description: "Rear hand power punch", keyJoints: ["rightShoulder", "rightElbow", "rightHip", "rightKnee"] },
      { name: "Hook", description: "Lead hook technique", keyJoints: ["leftShoulder", "leftElbow", "leftHip"] },
      { name: "Defense", description: "Guard and slip technique", keyJoints: ["leftElbow", "rightElbow", "leftKnee", "rightKnee"] },
    ],
    tips: [
      "Chin down, hands up — protect your centerline",
      "Rotate hips for power, not just arms",
      "Return to guard position after every punch",
    ],
  },
};

export const SPORT_CATEGORIES = [
  { name: "All Sports", value: "all" },
  { name: "Team", value: "Team" },
  { name: "Racquet", value: "Racquet" },
  { name: "Combat", value: "Combat" },
  { name: "Individual", value: "Individual" },
  { name: "Fitness", value: "Fitness" },
] as const;

export function getSport(id: string): SportConfig | undefined {
  return SPORTS[id];
}

export function getSportList(): SportConfig[] {
  return Object.values(SPORTS);
}

export function getSportsByCategory(category: string): SportConfig[] {
  if (category === "all") return getSportList();
  return getSportList().filter((s) => s.category === category);
}

export function getIdealAngleForJoint(
  sportId: string,
  joint: string
): number {
  const sport = SPORTS[sportId];
  if (!sport) return 160;
  return sport.idealAngles[joint] ?? 160;
}

export function getTolerances(sportId: string) {
  const sport = SPORTS[sportId];
  return sport?.tolerances ?? { good: 10, warning: 25 };
}
