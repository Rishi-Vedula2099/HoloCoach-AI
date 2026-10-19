import { create } from "zustand";

export interface PoseKeypoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
  name: string;
}

export interface JointAngle {
  name: string;
  angle: number;
  ideal: number;
  status: "good" | "warning" | "bad";
}

export interface InsightEvent {
  id: string;
  timestamp: number;
  type: "good" | "warning" | "bad" | "info";
  message: string;
}

export interface SessionSummary {
  duration: number;
  avgPostureScore: number;
  avgBalanceScore: number;
  peakScore: number;
  insightCount: number;
  goodCount: number;
  warningCount: number;
  badCount: number;
  sportId: string;
  sportName: string;
  movement: string | null;
}

interface SessionState {
  // Session
  isActive: boolean;
  isRecording: boolean;
  sessionId: string | null;
  duration: number;
  sportId: string;
  sportName: string;
  movement: string | null;

  // Pose data
  keypoints: PoseKeypoint[];
  jointAngles: JointAngle[];
  postureScore: number;
  balanceScore: number;

  // Timeline
  insights: InsightEvent[];

  // History
  scoreHistory: number[];

  // Session summary (populated on end)
  sessionSummary: SessionSummary | null;
  showSummary: boolean;

  // Actions
  startSession: (sportId?: string, sportName?: string) => void;
  endSession: () => void;
  setSport: (sportId: string, sportName: string) => void;
  setMovement: (movement: string | null) => void;
  toggleRecording: () => void;
  updatePoseData: (keypoints: PoseKeypoint[], angles: JointAngle[]) => void;
  updateScores: (posture: number, balance: number) => void;
  addInsight: (event: Omit<InsightEvent, "id">) => void;
  incrementDuration: () => void;
  dismissSummary: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  isActive: false,
  isRecording: false,
  sessionId: null,
  duration: 0,
  sportId: "football",
  sportName: "Football",
  movement: null,

  keypoints: [],
  jointAngles: [],
  postureScore: 0,
  balanceScore: 0,

  insights: [],
  scoreHistory: [],

  sessionSummary: null,
  showSummary: false,

  startSession: (sportId = "football", sportName = "Football") =>
    set({
      isActive: true,
      sessionId: `session-${Date.now()}`,
      duration: 0,
      sportId,
      sportName,
      movement: null,
      keypoints: [],
      jointAngles: [],
      postureScore: 0,
      balanceScore: 0,
      insights: [],
      scoreHistory: [],
      sessionSummary: null,
      showSummary: false,
    }),

  endSession: () => {
    const state = get();
    const avgPosture = state.scoreHistory.length > 0
      ? Math.round(state.scoreHistory.reduce((a, b) => a + b, 0) / state.scoreHistory.length)
      : 0;
    const peakScore = state.scoreHistory.length > 0
      ? Math.max(...state.scoreHistory)
      : 0;

    const summary: SessionSummary = {
      duration: state.duration,
      avgPostureScore: avgPosture,
      avgBalanceScore: state.balanceScore,
      peakScore,
      insightCount: state.insights.length,
      goodCount: state.insights.filter(i => i.type === "good").length,
      warningCount: state.insights.filter(i => i.type === "warning").length,
      badCount: state.insights.filter(i => i.type === "bad").length,
      sportId: state.sportId,
      sportName: state.sportName,
      movement: state.movement,
    };

    set({
      isActive: false,
      isRecording: false,
      sessionSummary: summary,
      showSummary: true,
    });
  },

  setSport: (sportId, sportName) =>
    set({ sportId, sportName }),

  setMovement: (movement) =>
    set({ movement }),

  toggleRecording: () =>
    set((state) => ({ isRecording: !state.isRecording })),

  updatePoseData: (keypoints, jointAngles) =>
    set({ keypoints, jointAngles }),

  updateScores: (posture, balance) =>
    set((state) => ({
      postureScore: posture,
      balanceScore: balance,
      scoreHistory: [...state.scoreHistory.slice(-59), posture],
    })),

  addInsight: (event) =>
    set((state) => ({
      insights: [
        { ...event, id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` },
        ...state.insights,
      ].slice(0, 50),
    })),

  incrementDuration: () =>
    set((state) => ({ duration: state.duration + 1 })),

  dismissSummary: () =>
    set({ showSummary: false }),

  reset: () =>
    set({
      isActive: false,
      isRecording: false,
      sessionId: null,
      duration: 0,
      keypoints: [],
      jointAngles: [],
      postureScore: 0,
      balanceScore: 0,
      insights: [],
      scoreHistory: [],
      sessionSummary: null,
      showSummary: false,
    }),
}));
