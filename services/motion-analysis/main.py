"""
HoloCoach AI — Motion Analysis Service
Temporal movement analysis using sequence comparison against ideal motion templates.
Sport-specific movement scoring with detailed biomechanics breakdown.
"""
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from prometheus_client import Counter, generate_latest

import sys
sys.path.insert(0, "../../packages/config")
from sports import SPORTS, get_sport

app = FastAPI(title="HoloCoach Motion Analysis", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

ANALYSIS_REQUESTS = Counter("motion_analysis_total", "Total motion analyses", ["sport", "movement"])


# ─────────────────────────────────────────
# Data Models
# ─────────────────────────────────────────
class KeypointFrame(BaseModel):
    timestamp: float
    keypoints: List[Dict]

class MotionSequence(BaseModel):
    sport_id: str
    movement: Optional[str] = None
    frames: List[KeypointFrame]

class MovementScore(BaseModel):
    overall_score: float
    timing_score: float
    form_score: float
    power_score: float
    consistency_score: float
    breakdown: Dict[str, float]
    feedback: List[str]


# ─────────────────────────────────────────
# Motion Analysis Engine
# ─────────────────────────────────────────
class MotionAnalyzer:
    """Sport-specific motion analysis using keypoint sequences."""

    @staticmethod
    def extract_joint_trajectory(frames: List[KeypointFrame], joint_indices: List[int]) -> np.ndarray:
        """Extract the trajectory of specific joints over time."""
        trajectories = []
        for frame in frames:
            frame_joints = []
            for idx in joint_indices:
                if idx < len(frame.keypoints):
                    kp = frame.keypoints[idx]
                    frame_joints.extend([kp.get("x", 0), kp.get("y", 0)])
                else:
                    frame_joints.extend([0, 0])
            trajectories.append(frame_joints)
        return np.array(trajectories)

    @staticmethod
    def compute_velocity(trajectory: np.ndarray) -> np.ndarray:
        """Compute velocity from position trajectory."""
        if len(trajectory) < 2:
            return np.zeros_like(trajectory)
        return np.diff(trajectory, axis=0)

    @staticmethod
    def compute_smoothness(velocity: np.ndarray) -> float:
        """Compute movement smoothness (lower jerk = smoother)."""
        if len(velocity) < 2:
            return 100.0
        jerk = np.diff(velocity, axis=0)
        jerk_magnitude = np.sqrt(np.sum(jerk ** 2, axis=1))
        smoothness = max(0, 100 - np.mean(jerk_magnitude) * 5000)
        return round(smoothness, 1)

    @staticmethod
    def compute_symmetry(frames: List[KeypointFrame]) -> float:
        """Compute left-right body symmetry score."""
        symmetry_scores = []
        for frame in frames:
            kps = frame.keypoints
            if len(kps) < 28:
                continue

            pairs = [(11, 12), (13, 14), (15, 16), (23, 24), (25, 26), (27, 28)]
            for left_idx, right_idx in pairs:
                left = kps[left_idx]
                right = kps[right_idx]
                if left.get("visibility", 0) > 0.5 and right.get("visibility", 0) > 0.5:
                    y_diff = abs(left["y"] - right["y"])
                    symmetry_scores.append(max(0, 100 - y_diff * 500))

        return round(np.mean(symmetry_scores), 1) if symmetry_scores else 50.0

    @staticmethod
    def compute_timing(velocity: np.ndarray) -> float:
        """Analyze timing consistency of movement."""
        if len(velocity) < 3:
            return 50.0
        speed = np.sqrt(np.sum(velocity ** 2, axis=1))
        if np.max(speed) == 0:
            return 50.0
        peaks = np.where(speed > np.mean(speed) + np.std(speed))[0]
        if len(peaks) < 2:
            return 75.0
        intervals = np.diff(peaks)
        if len(intervals) == 0:
            return 75.0
        cv = np.std(intervals) / (np.mean(intervals) + 1e-6)
        return round(max(0, min(100, 100 - cv * 50)), 1)

    def analyze(self, sequence: MotionSequence) -> MovementScore:
        """Perform full sport-specific motion analysis."""
        sport = get_sport(sequence.sport_id)
        if not sport:
            return MovementScore(
                overall_score=0, timing_score=0, form_score=0,
                power_score=0, consistency_score=0, breakdown={}, feedback=["Unknown sport"]
            )

        # Key joint indices for the sport
        key_joints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

        trajectory = self.extract_joint_trajectory(sequence.frames, key_joints)
        velocity = self.compute_velocity(trajectory)

        form_score = self.compute_symmetry(sequence.frames)
        timing_score = self.compute_timing(velocity)
        smoothness = self.compute_smoothness(velocity)
        consistency_score = smoothness

        # Power: based on peak velocity magnitude
        speed = np.sqrt(np.sum(velocity ** 2, axis=1)) if len(velocity) > 0 else np.array([0])
        peak_speed = float(np.max(speed)) if len(speed) > 0 else 0
        power_score = min(100, peak_speed * 2000)

        # Apply sport-specific weights
        weights = sport.scoring_weights
        overall = (
            form_score * (weights.upper_body + weights.core) +
            timing_score * weights.balance +
            power_score * weights.lower_body * 0.3 +
            consistency_score * 0.2
        )
        overall = max(0, min(100, round(overall, 1)))

        # Generate feedback
        feedback = []
        if form_score < 70:
            feedback.append(f"Body symmetry needs improvement ({form_score:.0f}/100). Focus on balanced positioning.")
        if timing_score < 70:
            feedback.append(f"Movement timing is inconsistent ({timing_score:.0f}/100). Practice rhythm and tempo.")
        if consistency_score < 70:
            feedback.append(f"Movement smoothness is low ({consistency_score:.0f}/100). Reduce jerky movements.")

        if overall >= 80:
            feedback.insert(0, f"Great {sport.name} form! Overall score: {overall}/100.")
        elif overall >= 60:
            feedback.insert(0, f"Good {sport.name} form with areas to improve. Score: {overall}/100.")
        else:
            feedback.insert(0, f"Significant improvements needed for {sport.name}. Score: {overall}/100.")

        # Add sport-specific movement feedback
        if sequence.movement:
            for movement in sport.movements:
                if movement.name.lower() == sequence.movement.lower():
                    feedback.append(f"Analyzing: {movement.description}")
                    break

        if sport.tips:
            feedback.append(f"💡 Coach tip: {sport.tips[0]}")

        ANALYSIS_REQUESTS.labels(sport=sequence.sport_id, movement=sequence.movement or "general").inc()

        return MovementScore(
            overall_score=overall,
            timing_score=timing_score,
            form_score=form_score,
            power_score=round(power_score, 1),
            consistency_score=consistency_score,
            breakdown={
                "symmetry": form_score,
                "timing": timing_score,
                "smoothness": consistency_score,
                "power": round(power_score, 1),
            },
            feedback=feedback,
        )


analyzer = MotionAnalyzer()


# ─────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "motion-analysis"}


@app.post("/analyze", response_model=MovementScore)
async def analyze_motion(sequence: MotionSequence):
    """Analyze a motion sequence for the given sport."""
    return analyzer.analyze(sequence)


@app.post("/compare")
async def compare_motions(user: MotionSequence, reference: MotionSequence):
    """Compare user's motion against a reference/ideal motion."""
    user_score = analyzer.analyze(user)
    ref_score = analyzer.analyze(reference)

    comparison = {
        "user_score": user_score.dict(),
        "reference_score": ref_score.dict(),
        "gap_analysis": {
            "overall": round(ref_score.overall_score - user_score.overall_score, 1),
            "timing": round(ref_score.timing_score - user_score.timing_score, 1),
            "form": round(ref_score.form_score - user_score.form_score, 1),
            "consistency": round(ref_score.consistency_score - user_score.consistency_score, 1),
        },
    }
    return comparison


@app.get("/metrics")
async def metrics():
    from starlette.responses import Response
    return Response(content=generate_latest(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
