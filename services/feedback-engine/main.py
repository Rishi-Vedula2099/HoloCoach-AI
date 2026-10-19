"""
HoloCoach AI — Feedback Engine
AI-powered coaching feedback generation for all sports.
Generates structured, actionable coaching advice based on pose and motion analysis.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from prometheus_client import Counter, generate_latest

import sys
sys.path.insert(0, "../../packages/config")
from sports import SPORTS, get_sport

app = FastAPI(title="HoloCoach Feedback Engine", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

FEEDBACK_GENERATED = Counter("feedback_generated_total", "Total feedbacks generated", ["sport", "severity"])


# ─────────────────────────────────────────
# Models
# ─────────────────────────────────────────
class JointAngleData(BaseModel):
    name: str
    angle: float
    ideal: float
    diff: float
    status: str  # good, warning, bad

class SessionAnalysis(BaseModel):
    sport_id: str
    movement: Optional[str] = None
    duration: float  # seconds
    avg_posture_score: float
    avg_balance_score: float
    joint_angles: List[JointAngleData]
    posture_scores: List[float]  # time series
    balance_scores: List[float]

class FeedbackItem(BaseModel):
    category: str  # posture, timing, balance, technique, general
    severity: str  # info, success, warning, critical
    title: str
    message: str
    action: str  # specific action to take

class CoachingFeedback(BaseModel):
    sport: str
    movement: Optional[str]
    overall_grade: str  # A, B, C, D, F
    overall_score: float
    summary: str
    feedback_items: List[FeedbackItem]
    drill_recommendations: List[Dict[str, str]]
    next_session_focus: List[str]


# ─────────────────────────────────────────
# Feedback Generator
# ─────────────────────────────────────────
class FeedbackGenerator:
    """Generate comprehensive coaching feedback for any sport."""

    GRADE_THRESHOLDS = {
        "A+": 95, "A": 90, "A-": 85, "B+": 80, "B": 75, "B-": 70,
        "C+": 65, "C": 60, "C-": 55, "D": 50, "F": 0,
    }

    def get_grade(self, score: float) -> str:
        for grade, threshold in self.GRADE_THRESHOLDS.items():
            if score >= threshold:
                return grade
        return "F"

    def analyze_joint_issues(self, angles: List[JointAngleData], sport_id: str) -> List[FeedbackItem]:
        """Analyze joint-specific issues and generate targeted feedback."""
        feedback = []
        sport = get_sport(sport_id)
        sport_name = sport.name if sport else "this sport"

        for angle in angles:
            if angle.status == "bad":
                feedback.append(FeedbackItem(
                    category="posture",
                    severity="critical",
                    title=f"{angle.name.replace('_', ' ').title()} — Critical Deviation",
                    message=f"Your {angle.name.replace('_', ' ')} angle is {angle.angle}°, "
                            f"but the ideal for {sport_name} is {angle.ideal}°. "
                            f"This {angle.diff}° deviation significantly impacts performance.",
                    action=f"Focus on {angle.name.replace('_', ' ')} positioning. "
                           f"Practice isolated drills targeting this joint angle.",
                ))
                FEEDBACK_GENERATED.labels(sport=sport_id, severity="critical").inc()

            elif angle.status == "warning":
                feedback.append(FeedbackItem(
                    category="posture",
                    severity="warning",
                    title=f"{angle.name.replace('_', ' ').title()} — Minor Adjustment",
                    message=f"Your {angle.name.replace('_', ' ')} angle ({angle.angle}°) is close to ideal "
                            f"({angle.ideal}°) but could be improved. Deviation: {angle.diff}°.",
                    action=f"Be mindful of {angle.name.replace('_', ' ')} during practice.",
                ))
                FEEDBACK_GENERATED.labels(sport=sport_id, severity="warning").inc()

        return feedback

    def analyze_balance(self, scores: List[float]) -> List[FeedbackItem]:
        """Analyze balance consistency over the session."""
        feedback = []
        if not scores:
            return feedback

        import numpy as np
        avg = np.mean(scores)
        std = np.std(scores)

        if avg < 60:
            feedback.append(FeedbackItem(
                category="balance",
                severity="critical",
                title="Balance Needs Significant Work",
                message=f"Average balance score was {avg:.0f}/100. "
                        f"This indicates unstable weight distribution throughout the session.",
                action="Practice single-leg stands and weight shifting drills.",
            ))
        elif avg < 75:
            feedback.append(FeedbackItem(
                category="balance",
                severity="warning",
                title="Balance Could Improve",
                message=f"Average balance: {avg:.0f}/100. Some instability detected.",
                action="Incorporate balance board exercises into your warmup.",
            ))

        if std > 15:
            feedback.append(FeedbackItem(
                category="balance",
                severity="warning",
                title="Inconsistent Balance",
                message=f"Balance varied significantly (std: {std:.1f}). "
                        f"This suggests you lose balance during certain movements.",
                action="Identify which movements cause balance loss and drill them slowly.",
            ))

        return feedback

    def analyze_progress(self, scores: List[float]) -> List[FeedbackItem]:
        """Analyze score progression during the session."""
        feedback = []
        if len(scores) < 5:
            return feedback

        import numpy as np
        first_half = np.mean(scores[:len(scores)//2])
        second_half = np.mean(scores[len(scores)//2:])
        trend = second_half - first_half

        if trend > 5:
            feedback.append(FeedbackItem(
                category="general",
                severity="success",
                title="Improving During Session! 📈",
                message=f"Your score improved by {trend:.1f} points from first to second half. "
                        f"You're warming up well and maintaining focus.",
                action="Keep this positive momentum going!",
            ))
        elif trend < -5:
            feedback.append(FeedbackItem(
                category="general",
                severity="warning",
                title="Form Declining — Fatigue Detected",
                message=f"Score dropped {abs(trend):.1f} points in the second half. "
                        f"This typically indicates fatigue.",
                action="Consider shorter sessions or take breaks to maintain form quality.",
            ))

        return feedback

    def generate_drills(self, sport_id: str, weak_areas: List[str]) -> List[Dict[str, str]]:
        """Generate sport-specific drill recommendations."""
        sport = get_sport(sport_id)
        if not sport:
            return []

        drills = []
        # Generic drills based on weak areas
        drill_map = {
            "left_elbow": {"name": "Arm Isolation Drill", "description": "Slow motion arm movements focusing on elbow angle", "duration": "5 min"},
            "right_elbow": {"name": "Arm Isolation Drill", "description": "Mirror drill for arm mechanics", "duration": "5 min"},
            "left_knee": {"name": "Knee Track Drill", "description": "Single-leg squats focusing on knee alignment", "duration": "3 sets x 10 reps"},
            "right_knee": {"name": "Knee Alignment Check", "description": "Wall sits with focus on knee-over-toe positioning", "duration": "3 sets x 30s"},
            "left_shoulder": {"name": "Shoulder Mobility", "description": "Band pull-aparts and shoulder circles", "duration": "3 sets x 15 reps"},
            "right_shoulder": {"name": "Shoulder Mobility", "description": "Overhead press with controlled tempo", "duration": "3 sets x 12 reps"},
            "left_hip": {"name": "Hip Opener", "description": "Pigeon pose and hip flexor stretches", "duration": "2 min each side"},
            "right_hip": {"name": "Hip Opener", "description": "90/90 hip stretch progression", "duration": "2 min each side"},
        }

        for area in weak_areas:
            if area in drill_map:
                drills.append(drill_map[area])

        # Add sport-specific warm up
        drills.append({
            "name": f"{sport.name} Warm-Up Routine",
            "description": f"Dynamic stretching and sport-specific movement prep for {sport.name}",
            "duration": "10 min",
        })

        return drills

    def generate(self, analysis: SessionAnalysis) -> CoachingFeedback:
        """Generate full coaching feedback for a session."""
        sport = get_sport(analysis.sport_id)
        sport_name = sport.name if sport else "General"

        overall_score = (analysis.avg_posture_score * 0.6 + analysis.avg_balance_score * 0.4)
        grade = self.get_grade(overall_score)

        feedback_items = []

        # Joint angle analysis
        feedback_items.extend(self.analyze_joint_issues(analysis.joint_angles, analysis.sport_id))

        # Balance analysis
        feedback_items.extend(self.analyze_balance(analysis.balance_scores))

        # Progress analysis
        feedback_items.extend(self.analyze_progress(analysis.posture_scores))

        # Summary
        if overall_score >= 80:
            summary = f"Excellent {sport_name} session! Your technique is strong across most areas."
        elif overall_score >= 60:
            summary = f"Good {sport_name} session with some areas to work on. Focus on the feedback below."
        else:
            summary = f"This {sport_name} session revealed several areas for improvement. Review the detailed feedback."

        # Add sport-specific success feedback
        if overall_score >= 85 and sport:
            feedback_items.append(FeedbackItem(
                category="general",
                severity="success",
                title=f"Outstanding {sport_name} Form! 🏆",
                message=f"Score: {overall_score:.0f}/100 ({grade}). Your technique is at competitive level.",
                action="Challenge yourself with more advanced movements.",
            ))
            FEEDBACK_GENERATED.labels(sport=analysis.sport_id, severity="success").inc()

        # Drill recommendations
        weak_joints = [a.name for a in analysis.joint_angles if a.status == "bad"]
        drills = self.generate_drills(analysis.sport_id, weak_joints)

        # Next session focus
        next_focus = []
        if weak_joints:
            next_focus.append(f"Focus on: {', '.join(j.replace('_', ' ') for j in weak_joints[:3])}")
        if analysis.avg_balance_score < 70:
            next_focus.append("Include balance exercises in warm-up")
        if sport and sport.tips:
            next_focus.append(f"Remember: {sport.tips[-1]}")
        if not next_focus:
            next_focus.append("Maintain current form and increase intensity")

        return CoachingFeedback(
            sport=sport_name,
            movement=analysis.movement,
            overall_grade=grade,
            overall_score=round(overall_score, 1),
            summary=summary,
            feedback_items=feedback_items,
            drill_recommendations=drills,
            next_session_focus=next_focus,
        )


generator = FeedbackGenerator()


# ─────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "feedback-engine"}


@app.post("/generate", response_model=CoachingFeedback)
async def generate_feedback(analysis: SessionAnalysis):
    """Generate comprehensive coaching feedback for a session."""
    return generator.generate(analysis)


@app.get("/metrics")
async def metrics():
    from starlette.responses import Response
    return Response(content=generate_latest(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
