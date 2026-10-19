"""
HoloCoach AI — Video Processor Service
Handles video upload, preprocessing, frame extraction, and async analysis.
"""
import os
import uuid
import time
import json
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from prometheus_client import Counter, Histogram, generate_latest

app = FastAPI(title="HoloCoach Video Processor", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

UPLOAD_DIR = Path("../../data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

VIDEOS_PROCESSED = Counter("videos_processed_total", "Total videos processed", ["sport"])
PROCESSING_TIME = Histogram("video_processing_seconds", "Video processing duration")

# In-memory job store (replace with Redis in production)
processing_jobs = {}


class ProcessingJob(BaseModel):
    job_id: str
    status: str  # pending, processing, completed, failed
    sport_id: str
    filename: str
    progress: float  # 0-100
    result: Optional[dict] = None
    error: Optional[str] = None


def extract_video_metadata(video_path: str) -> dict:
    """Extract metadata from a video file."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"error": "Cannot open video"}

    metadata = {
        "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        "fps": cap.get(cv2.CAP_PROP_FPS),
        "total_frames": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
        "duration_seconds": round(
            int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) / max(cap.get(cv2.CAP_PROP_FPS), 1), 2
        ),
        "codec": int(cap.get(cv2.CAP_PROP_FOURCC)),
    }
    cap.release()
    return metadata


def extract_frames(video_path: str, sample_rate: int = 3) -> list:
    """Extract key frames from video at given sample rate per second."""
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_interval = max(1, int(fps / sample_rate))

    frames = []
    frame_idx = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % frame_interval == 0:
            frames.append({
                "index": frame_idx,
                "timestamp": round(frame_idx / fps, 2),
                "data": cv2.resize(frame, (640, 480)),
            })
        frame_idx += 1

    cap.release()
    return frames


def generate_thumbnail(video_path: str, output_path: str) -> bool:
    """Generate a thumbnail from the first frame of the video."""
    cap = cv2.VideoCapture(video_path)
    ret, frame = cap.read()
    cap.release()
    if ret:
        thumbnail = cv2.resize(frame, (320, 240))
        cv2.imwrite(output_path, thumbnail)
        return True
    return False


async def process_video_background(job_id: str, video_path: str, sport_id: str):
    """Background task: process video and update job status."""
    import httpx

    job = processing_jobs[job_id]
    job["status"] = "processing"
    job["progress"] = 10

    try:
        # Step 1: Extract metadata
        metadata = extract_video_metadata(video_path)
        job["progress"] = 20

        # Step 2: Generate thumbnail
        thumb_path = video_path.replace(".mp4", "_thumb.jpg")
        generate_thumbnail(video_path, thumb_path)
        job["progress"] = 30

        # Step 3: Extract frames
        frames = extract_frames(video_path, sample_rate=5)
        job["progress"] = 50

        # Step 4: Send to pose service for analysis
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                with open(video_path, "rb") as f:
                    response = await client.post(
                        f"http://localhost:8001/analyze/video?sport_id={sport_id}",
                        files={"file": (os.path.basename(video_path), f, "video/mp4")},
                    )
                if response.status_code == 200:
                    analysis_result = response.json()
                    job["progress"] = 90
                else:
                    analysis_result = {"error": "Pose service returned error", "frames_extracted": len(frames)}
        except Exception as e:
            # If pose service is not running, generate mock results
            analysis_result = {
                "sport": sport_id,
                "total_frames": metadata.get("total_frames", 0),
                "analyzed_frames": len(frames),
                "duration": metadata.get("duration_seconds", 0),
                "avg_posture_score": round(65 + np.random.random() * 25, 1),
                "max_score": round(80 + np.random.random() * 20, 1),
                "min_score": round(40 + np.random.random() * 20, 1),
                "note": "Mock results — pose service not available",
            }

        # Step 5: Update final result
        job["status"] = "completed"
        job["progress"] = 100
        job["result"] = {
            "metadata": metadata,
            "analysis": analysis_result,
            "thumbnail": thumb_path if os.path.exists(thumb_path) else None,
        }

        VIDEOS_PROCESSED.labels(sport=sport_id).inc()

    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "video-processor"}


@app.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    sport_id: str = Form("football"),
):
    """Upload a video and start async processing."""
    job_id = str(uuid.uuid4())[:8]
    filename = f"{job_id}_{file.filename}"
    file_path = str(UPLOAD_DIR / filename)

    # Save uploaded file
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # Create job
    processing_jobs[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "sport_id": sport_id,
        "filename": filename,
        "progress": 0,
        "result": None,
        "error": None,
    }

    # Start background processing
    background_tasks.add_task(process_video_background, job_id, file_path, sport_id)

    return {"job_id": job_id, "status": "pending", "message": "Video uploaded, processing started."}


@app.get("/job/{job_id}")
async def get_job_status(job_id: str):
    """Check processing job status."""
    job = processing_jobs.get(job_id)
    if not job:
        return {"error": "Job not found"}
    return job


@app.get("/jobs")
async def list_jobs():
    """List all processing jobs."""
    return list(processing_jobs.values())


@app.get("/metrics")
async def metrics():
    from starlette.responses import Response
    return Response(content=generate_latest(), media_type="text/plain")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
