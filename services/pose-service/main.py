"""
HoloCoach AI — Pose Service
Real-time pose estimation using MediaPipe with sport-specific analysis.
Provides WebSocket endpoint for live streaming and REST endpoint for video analysis.
"""
import asyncio
import base64
import json
import time
from typing import Optional

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prometheus_client import Counter, Histogram, generate_latest

import sys
sys.path.insert(0, "../../packages/config")
from sports import SPORTS, get_sport, get_ideal_angle

# ─────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────
app = FastAPI(title="HoloCoach Pose Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Metrics
POSE_DETECTIONS = Counter("pose_detections_total", "Total pose detections", ["sport"])
POSE_LATENCY = Histogram("pose_detection_seconds", "Pose detection latency")
FRAME_ERRORS = Counter("pose_frame_errors_total", "Frame processing errors")

# MediaPipe
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

LANDMARK_NAMES = [
    "nose", "left_eye_inner", "left_eye", "left_eye_outer",
    "right_eye_inner", "right_eye", "right_eye_outer",
    "left_ear", "right_ear", "mouth_left", "mouth_right",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_pinky", "right_pinky",
    "left_index", "right_index", "left_thumb", "right_thumb",
    "left_hip", "right_hip", "left_knee", "right_knee",
    "left_ankle", "right_ankle", "left_heel", "right_heel",
    "left_foot_index", "right_foot_index",
]


# ─────────────────────────────────────────
# Angle Calculation
# ─────────────────────────────────────────
def calculate_angle(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> float:
    """Calculate angle at point b given three 2D points."""
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(np.degrees(radians))
    if angle > 180:
        angle = 360 - angle
    return round(angle, 1)


def compute_joint_angles(landmarks, sport_id: str = "football"):
    """Compute all relevant joint angles with sport-specific ideal comparisons."""
    sport = get_sport(sport_id)
    if not sport:
        return []

    tolerances = sport.tolerances
    angles = []

    joint_configs = [
        ("left_elbow", 11, 13, 15, "left_elbow"),
        ("right_elbow", 12, 14, 16, "right_elbow"),
        ("left_knee", 23, 25, 27, "left_knee"),
        ("right_knee", 24, 26, 28, "right_knee"),
        ("left_shoulder", 13, 11, 23, "left_shoulder"),
        ("right_shoulder", 14, 12, 24, "right_shoulder"),
        ("left_hip", 11, 23, 25, "left_hip"),
        ("right_hip", 12, 24, 26, "right_hip"),
    ]

    for name, idx_a, idx_b, idx_c, ideal_key in joint_configs:
        a = landmarks[idx_a]
        b = landmarks[idx_b]
        c = landmarks[idx_c]

        if a.visibility < 0.5 or b.visibility < 0.5 or c.visibility < 0.5:
            continue

        angle = calculate_angle(
            np.array([a.x, a.y]),
            np.array([b.x, b.y]),
            np.array([c.x, c.y]),
        )

        ideal = get_ideal_angle(sport_id, ideal_key)
        diff = abs(angle - ideal)

        if diff <= tolerances["good"]:
            status = "good"
        elif diff <= tolerances["warning"]:
            status = "warning"
        else:
            status = "bad"

        angles.append({
            "name": name,
            "angle": angle,
            "ideal": ideal,
            "diff": round(diff, 1),
            "status": status,
        })

    return angles


def compute_posture_score(landmarks, angles, sport_id: str = "football") -> float:
    """Compute sport-weighted posture score (0-100)."""
    sport = get_sport(sport_id)
    if not sport or not angles:
        return 0.0

    score = 100.0
    weights = sport.scoring_weights

    upper_deductions = 0
    lower_deductions = 0
    core_deductions = 0
    balance_deductions = 0

    for angle in angles:
        deduction = 0
        if angle["status"] == "bad":
            deduction = 8
        elif angle["status"] == "warning":
            deduction = 3

        name = angle["name"]
        if "shoulder" in name or "elbow" in name:
            upper_deductions += deduction
        elif "knee" in name:
            lower_deductions += deduction
        elif "hip" in name:
            core_deductions += deduction

    # Check symmetry for balance
    if landmarks[11].visibility > 0.5 and landmarks[12].visibility > 0.5:
        shoulder_diff = abs(landmarks[11].y - landmarks[12].y)
        if shoulder_diff > 0.05:
            balance_deductions += 5
        if shoulder_diff > 0.1:
            balance_deductions += 10

    if landmarks[23].visibility > 0.5 and landmarks[24].visibility > 0.5:
        hip_diff = abs(landmarks[23].y - landmarks[24].y)
        if hip_diff > 0.05:
            balance_deductions += 5
        if hip_diff > 0.1:
            balance_deductions += 10

    score -= upper_deductions * weights.upper_body
    score -= lower_deductions * weights.lower_body
    score -= core_deductions * weights.core
    score -= balance_deductions * weights.balance

    return max(0, min(100, round(score, 1)))


def compute_balance_score(landmarks) -> float:
    """Compute balance score based on center of mass alignment."""
    score = 100.0

    ls, rs = landmarks[11], landmarks[12]
    lh, rh = landmarks[23], landmarks[24]

    if all(l.visibility > 0.5 for l in [ls, rs, lh, rh]):
        shoulder_cx = (ls.x + rs.x) / 2
        hip_cx = (lh.x + rh.x) / 2
        lateral_shift = abs(shoulder_cx - hip_cx)

        if lateral_shift > 0.02:
            score -= 10
        if lateral_shift > 0.05:
            score -= 15
        if lateral_shift > 0.08:
            score -= 20

    la, ra = landmarks[27], landmarks[28]
    if la.visibility > 0.5 and ra.visibility > 0.5 and lh.visibility > 0.5 and rh.visibility > 0.5:
        hip_center = (lh.x + rh.x) / 2
        asymmetry = abs(abs(la.x - hip_center) - abs(ra.x - hip_center))
        if asymmetry > 0.03:
            score -= 5
        if asymmetry > 0.06:
            score -= 10

    return max(0, min(100, round(score, 1)))


def generate_insights(angles, posture_score: float, balance_score: float, sport_id: str, timestamp: float):
    """Generate AI coaching insights based on analysis."""
    insights = []
    sport = get_sport(sport_id)

    for angle in angles:
        if angle["status"] == "bad":
            insights.append({
                "timestamp": timestamp,
                "type": "bad",
                "message": f"{angle['name'].replace('_', ' ').title()} angle is {angle['angle']}° "
                           f"(ideal for {sport.name if sport else 'this sport'}: {angle['ideal']}°). "
                           f"Deviation: {angle['diff']}°. Adjust your form.",
            })
        elif angle["status"] == "warning":
            insights.append({
                "timestamp": timestamp,
                "type": "warning",
                "message": f"{angle['name'].replace('_', ' ').title()} is slightly off "
                           f"({angle['angle']}° vs ideal {angle['ideal']}°). Minor adjustment needed.",
            })

    if posture_score >= 90:
        insights.append({
            "timestamp": timestamp,
            "type": "good",
            "message": f"Excellent posture! Score: {posture_score}/100",
        })

    if balance_score < 70:
        insights.append({
            "timestamp": timestamp,
            "type": "warning",
            "message": f"Balance score low ({balance_score}/100). Focus on weight distribution.",
        })

    # Add sport-specific tips
    if sport and posture_score < 70:
        tip = sport.tips[0] if sport.tips else ""
        if tip:
            insights.append({
                "timestamp": timestamp,
                "type": "info",
                "message": f"💡 Tip: {tip}",
            })

    return insights


# ─────────────────────────────────────────
# API Endpoints
# ─────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "pose-service", "sports": list(SPORTS.keys())}


@app.get("/sports")
async def list_sports():
    return [{"id": s.id, "name": s.name, "icon": s.icon, "category": s.category} for s in SPORTS.values()]


@app.get("/sports/{sport_id}")
async def get_sport_config(sport_id: str):
    sport = get_sport(sport_id)
    if not sport:
        return {"error": f"Sport '{sport_id}' not found"}
    return {
        "id": sport.id, "name": sport.name,
        "ideal_angles": sport.ideal_angles.to_dict(),
        "tolerances": sport.tolerances,
        "movements": [{"name": m.name, "description": m.description, "key_joints": m.key_joints} for m in sport.movements],
        "tips": sport.tips,
    }


@app.get("/metrics")
async def metrics():
    from starlette.responses import Response
    return Response(content=generate_latest(), media_type="text/plain")


@app.websocket("/ws/pose/{sport_id}")
async def websocket_pose(websocket: WebSocket, sport_id: str = "football"):
    """Real-time pose estimation via WebSocket.
    
    Client sends: base64 encoded JPEG frames
    Server responds: JSON with keypoints, angles, scores, insights
    """
    await websocket.accept()
    
    pose = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    
    frame_count = 0
    session_start = time.time()
    
    try:
        while True:
            data = await websocket.receive_text()
            start_time = time.time()
            
            try:
                # Decode frame
                frame_data = base64.b64decode(data)
                nparr = np.frombuffer(frame_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if frame is None:
                    FRAME_ERRORS.inc()
                    continue
                
                # Process with MediaPipe
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                result = pose.process(rgb_frame)
                
                if result.pose_landmarks:
                    landmarks = result.pose_landmarks.landmark
                    timestamp = time.time() - session_start
                    
                    # Extract keypoints
                    keypoints = [
                        {
                            "x": lm.x, "y": lm.y, "z": lm.z,
                            "visibility": lm.visibility,
                            "name": LANDMARK_NAMES[i] if i < len(LANDMARK_NAMES) else f"point_{i}",
                        }
                        for i, lm in enumerate(landmarks)
                    ]
                    
                    # Compute sport-specific analysis
                    angles = compute_joint_angles(landmarks, sport_id)
                    posture_score = compute_posture_score(landmarks, angles, sport_id)
                    balance_score = compute_balance_score(landmarks)
                    
                    # Generate insights (every 3 seconds)
                    insights = []
                    if frame_count % 90 == 0:  # ~every 3s at 30fps
                        insights = generate_insights(angles, posture_score, balance_score, sport_id, timestamp)
                    
                    # Send response
                    response = {
                        "keypoints": keypoints,
                        "angles": angles,
                        "posture_score": posture_score,
                        "balance_score": balance_score,
                        "insights": insights,
                        "frame": frame_count,
                        "timestamp": timestamp,
                        "sport": sport_id,
                        "latency_ms": round((time.time() - start_time) * 1000, 1),
                    }
                    
                    await websocket.send_json(response)
                    POSE_DETECTIONS.labels(sport=sport_id).inc()
                    POSE_LATENCY.observe(time.time() - start_time)
                else:
                    await websocket.send_json({"keypoints": [], "angles": [], "posture_score": 0, "balance_score": 0, "insights": []})
                
                frame_count += 1
                
            except Exception as e:
                FRAME_ERRORS.inc()
                await websocket.send_json({"error": str(e)})
    
    except WebSocketDisconnect:
        pose.close()


@app.post("/analyze/video")
async def analyze_video(file: UploadFile = File(...), sport_id: str = Query("football")):
    """Analyze an uploaded video file frame by frame."""
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    
    # Save to temp file for OpenCV
    import tempfile, os
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name
    
    try:
        cap = cv2.VideoCapture(tmp_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        pose = mp_pose.Pose(static_image_mode=False, model_complexity=2, min_detection_confidence=0.5)
        
        results = []
        frame_idx = 0
        sample_rate = max(1, int(fps / 10))  # Analyze ~10 frames per second
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_idx % sample_rate == 0:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                result = pose.process(rgb)
                
                if result.pose_landmarks:
                    landmarks = result.pose_landmarks.landmark
                    timestamp = frame_idx / fps
                    
                    angles = compute_joint_angles(landmarks, sport_id)
                    posture_score = compute_posture_score(landmarks, angles, sport_id)
                    balance_score = compute_balance_score(landmarks)
                    insights = generate_insights(angles, posture_score, balance_score, sport_id, timestamp)
                    
                    results.append({
                        "frame": frame_idx,
                        "timestamp": round(timestamp, 2),
                        "angles": angles,
                        "posture_score": posture_score,
                        "balance_score": balance_score,
                        "insights": insights,
                    })
            
            frame_idx += 1
        
        cap.release()
        pose.close()
        
        # Compute summary
        scores = [r["posture_score"] for r in results if r["posture_score"] > 0]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0
        
        all_insights = []
        for r in results:
            all_insights.extend(r["insights"])
        
        return {
            "sport": sport_id,
            "total_frames": total_frames,
            "analyzed_frames": len(results),
            "fps": fps,
            "duration": round(total_frames / fps, 2),
            "avg_posture_score": avg_score,
            "max_score": max(scores) if scores else 0,
            "min_score": min(scores) if scores else 0,
            "frame_results": results,
            "insights": all_insights,
        }
    
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
