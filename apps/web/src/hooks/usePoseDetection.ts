"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { PoseKeypoint, JointAngle } from "@/store/sessionStore";
import { getSport, getTolerances } from "@/lib/sports";

// MediaPipe landmark indices
const LANDMARK_NAMES = [
  "nose", "left_eye_inner", "left_eye", "left_eye_outer",
  "right_eye_inner", "right_eye", "right_eye_outer",
  "left_ear", "right_ear", "mouth_left", "mouth_right",
  "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
  "left_wrist", "right_wrist", "left_pinky", "right_pinky",
  "left_index", "right_index", "left_thumb", "right_thumb",
  "left_hip", "right_hip", "left_knee", "right_knee",
  "left_ankle", "right_ankle", "left_heel", "right_heel",
  "left_foot_index", "right_foot_index",
];

// Connection pairs for skeleton drawing
export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso
  [23, 24], // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
  [15, 17], [15, 19], [15, 21], // left hand
  [16, 18], [16, 20], [16, 22], // right hand
  [27, 29], [29, 31], // left foot
  [28, 30], [30, 32], // right foot
];

function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return Math.round(angle);
}

function getAngleStatus(
  angle: number,
  ideal: number,
  tolerances: { good: number; warning: number }
): "good" | "warning" | "bad" {
  const diff = Math.abs(angle - ideal);
  if (diff <= tolerances.good) return "good";
  if (diff <= tolerances.warning) return "warning";
  return "bad";
}

interface IdealAngles {
  leftElbow: number;
  rightElbow: number;
  leftKnee: number;
  rightKnee: number;
  leftShoulder: number;
  rightShoulder: number;
  leftHip: number;
  rightHip: number;
}

const DEFAULT_IDEALS: IdealAngles = {
  leftElbow: 160, rightElbow: 160,
  leftKnee: 170, rightKnee: 170,
  leftShoulder: 45, rightShoulder: 45,
  leftHip: 170, rightHip: 170,
};

const DEFAULT_TOLERANCES = { good: 10, warning: 25 };

function computeJointAngles(
  keypoints: PoseKeypoint[],
  ideals: IdealAngles,
  tolerances: { good: number; warning: number }
): JointAngle[] {
  if (keypoints.length < 33) return [];

  const angles: JointAngle[] = [];

  // Left elbow angle (shoulder-elbow-wrist)
  if (keypoints[11].visibility > 0.5 && keypoints[13].visibility > 0.5 && keypoints[15].visibility > 0.5) {
    const angle = calculateAngle(keypoints[11], keypoints[13], keypoints[15]);
    angles.push({ name: "L. Elbow", angle, ideal: ideals.leftElbow, status: getAngleStatus(angle, ideals.leftElbow, tolerances) });
  }

  // Right elbow angle
  if (keypoints[12].visibility > 0.5 && keypoints[14].visibility > 0.5 && keypoints[16].visibility > 0.5) {
    const angle = calculateAngle(keypoints[12], keypoints[14], keypoints[16]);
    angles.push({ name: "R. Elbow", angle, ideal: ideals.rightElbow, status: getAngleStatus(angle, ideals.rightElbow, tolerances) });
  }

  // Left knee angle (hip-knee-ankle)
  if (keypoints[23].visibility > 0.5 && keypoints[25].visibility > 0.5 && keypoints[27].visibility > 0.5) {
    const angle = calculateAngle(keypoints[23], keypoints[25], keypoints[27]);
    angles.push({ name: "L. Knee", angle, ideal: ideals.leftKnee, status: getAngleStatus(angle, ideals.leftKnee, tolerances) });
  }

  // Right knee angle
  if (keypoints[24].visibility > 0.5 && keypoints[26].visibility > 0.5 && keypoints[28].visibility > 0.5) {
    const angle = calculateAngle(keypoints[24], keypoints[26], keypoints[28]);
    angles.push({ name: "R. Knee", angle, ideal: ideals.rightKnee, status: getAngleStatus(angle, ideals.rightKnee, tolerances) });
  }

  // Left shoulder angle (elbow-shoulder-hip)
  if (keypoints[13].visibility > 0.5 && keypoints[11].visibility > 0.5 && keypoints[23].visibility > 0.5) {
    const angle = calculateAngle(keypoints[13], keypoints[11], keypoints[23]);
    angles.push({ name: "L. Shoulder", angle, ideal: ideals.leftShoulder, status: getAngleStatus(angle, ideals.leftShoulder, tolerances) });
  }

  // Right shoulder angle
  if (keypoints[14].visibility > 0.5 && keypoints[12].visibility > 0.5 && keypoints[24].visibility > 0.5) {
    const angle = calculateAngle(keypoints[14], keypoints[12], keypoints[24]);
    angles.push({ name: "R. Shoulder", angle, ideal: ideals.rightShoulder, status: getAngleStatus(angle, ideals.rightShoulder, tolerances) });
  }

  // Hip angle (shoulder-hip-knee)
  if (keypoints[11].visibility > 0.5 && keypoints[23].visibility > 0.5 && keypoints[25].visibility > 0.5) {
    const angle = calculateAngle(keypoints[11], keypoints[23], keypoints[25]);
    angles.push({ name: "L. Hip", angle, ideal: ideals.leftHip, status: getAngleStatus(angle, ideals.leftHip, tolerances) });
  }

  if (keypoints[12].visibility > 0.5 && keypoints[24].visibility > 0.5 && keypoints[26].visibility > 0.5) {
    const angle = calculateAngle(keypoints[12], keypoints[24], keypoints[26]);
    angles.push({ name: "R. Hip", angle, ideal: ideals.rightHip, status: getAngleStatus(angle, ideals.rightHip, tolerances) });
  }

  return angles;
}

function computePostureScore(keypoints: PoseKeypoint[], angles: JointAngle[]): number {
  if (angles.length === 0) return 0;
  
  let score = 100;
  
  for (const angle of angles) {
    const diff = Math.abs(angle.angle - angle.ideal);
    if (diff > 25) score -= 8;
    else if (diff > 10) score -= 3;
  }

  // Check shoulder alignment
  if (keypoints[11]?.visibility > 0.5 && keypoints[12]?.visibility > 0.5) {
    const shoulderDiff = Math.abs(keypoints[11].y - keypoints[12].y);
    if (shoulderDiff > 0.05) score -= 5;
    if (shoulderDiff > 0.1) score -= 10;
  }

  // Check hip alignment
  if (keypoints[23]?.visibility > 0.5 && keypoints[24]?.visibility > 0.5) {
    const hipDiff = Math.abs(keypoints[23].y - keypoints[24].y);
    if (hipDiff > 0.05) score -= 5;
    if (hipDiff > 0.1) score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

function computeBalanceScore(keypoints: PoseKeypoint[]): number {
  if (keypoints.length < 33) return 0;

  let score = 100;

  const leftShoulder = keypoints[11];
  const rightShoulder = keypoints[12];
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];

  if (leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5 &&
      leftHip.visibility > 0.5 && rightHip.visibility > 0.5) {
    const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
    const hipCenter = (leftHip.x + rightHip.x) / 2;
    const lateralShift = Math.abs(shoulderCenter - hipCenter);
    
    if (lateralShift > 0.02) score -= 10;
    if (lateralShift > 0.05) score -= 15;
    if (lateralShift > 0.08) score -= 20;
  }

  const leftAnkle = keypoints[27];
  const rightAnkle = keypoints[28];
  if (leftAnkle.visibility > 0.5 && rightAnkle.visibility > 0.5) {
    const hipCenterX = (leftHip.x + rightHip.x) / 2;
    const leftDist = Math.abs(leftAnkle.x - hipCenterX);
    const rightDist = Math.abs(rightAnkle.x - hipCenterX);
    const asymmetry = Math.abs(leftDist - rightDist);
    
    if (asymmetry > 0.03) score -= 5;
    if (asymmetry > 0.06) score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

interface UsePoseDetectionOptions {
  sportId?: string;
  onPoseDetected?: (keypoints: PoseKeypoint[], angles: JointAngle[], postureScore: number, balanceScore: number) => void;
}

export function usePoseDetection(options: UsePoseDetectionOptions = {}) {
  const { onPoseDetected, sportId } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const onPoseDetectedRef = useRef(onPoseDetected);
  const sportIdRef = useRef(sportId);

  // Keep callback ref updated
  useEffect(() => {
    onPoseDetectedRef.current = onPoseDetected;
  }, [onPoseDetected]);

  useEffect(() => {
    sportIdRef.current = sportId;
  }, [sportId]);

  const initializeModel = useCallback(async () => {
    setIsLoading(true);
    setModelError(null);
    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { PoseLandmarker, FilesetResolver } = vision;

      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }
      );

      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load pose model";
      setModelError(message);
      setIsLoading(false);
    }
  }, []);

  const detectPose = useCallback(
    (videoElement: HTMLVideoElement) => {
      if (!poseLandmarkerRef.current || !videoElement || videoElement.readyState < 2) return;

      const now = performance.now();
      if (now - lastTimeRef.current < 33) {
        animationFrameRef.current = requestAnimationFrame(() => detectPose(videoElement));
        return;
      }
      lastTimeRef.current = now;

      // Get sport-specific ideal angles and tolerances
      let ideals = DEFAULT_IDEALS;
      let tolerances = DEFAULT_TOLERANCES;
      const currentSportId = sportIdRef.current;
      if (currentSportId) {
        const sport = getSport(currentSportId);
        if (sport) {
          ideals = sport.idealAngles;
          tolerances = getTolerances(currentSportId);
        }
      }

      try {
        const result = poseLandmarkerRef.current.detectForVideo(videoElement, now);

        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          const keypoints: PoseKeypoint[] = landmarks.map(
            (lm: any, idx: number) => ({
              x: lm.x,
              y: lm.y,
              z: lm.z,
              visibility: lm.visibility ?? 0,
              name: LANDMARK_NAMES[idx] || `point_${idx}`,
            })
          );

          const angles = computeJointAngles(keypoints, ideals, tolerances);
          const postureScore = computePostureScore(keypoints, angles);
          const balanceScore = computeBalanceScore(keypoints);

          onPoseDetectedRef.current?.(keypoints, angles, postureScore, balanceScore);
        }
      } catch {
        // silently skip frame errors
      }

      animationFrameRef.current = requestAnimationFrame(() => detectPose(videoElement));
    },
    []
  );

  const startDetection = useCallback(
    async (videoElement: HTMLVideoElement) => {
      if (!poseLandmarkerRef.current) {
        await initializeModel();
      }
      setIsRunning(true);
      detectPose(videoElement);
    },
    [initializeModel, detectPose]
  );

  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    isLoading,
    isRunning,
    modelError,
    initializeModel,
    startDetection,
    stopDetection,
  };
}
