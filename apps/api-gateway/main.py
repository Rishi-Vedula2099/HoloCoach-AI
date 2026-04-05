"""
HoloCoach AI — API Gateway
Central FastAPI gateway routing requests to all microservices.
Handles auth, WebSocket proxying, and request routing.
"""
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt, JWTError
from passlib.context import CryptContext
from prometheus_client import Counter, Histogram, generate_latest

# ─────────────────────────────────────────
# Config
# ─────────────────────────────────────────
SECRET_KEY = "holocoach-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

SERVICE_URLS = {
    "pose": "http://localhost:8001",
    "motion": "http://localhost:8002",
    "feedback": "http://localhost:8003",
    "video": "http://localhost:8004",
}

# ─────────────────────────────────────────
# App
# ─────────────────────────────────────────
app = FastAPI(
    title="HoloCoach AI API Gateway",
    description="Real-time AI + AR Sports Coaching Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Metrics
API_REQUESTS = Counter("api_requests_total", "Total API requests", ["method", "endpoint", "status"])
API_LATENCY = Histogram("api_request_duration_seconds", "Request latency")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

# In-memory user store (replace with database)
users_db = {}


# ─────────────────────────────────────────
# Auth Models
# ─────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    primary_sport: str = "football"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email and email in users_db:
            return users_db[email]
    except JWTError:
        pass
    return None


# ─────────────────────────────────────────
# Auth Endpoints
# ─────────────────────────────────────────
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserRegister):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    users_db[user.email] = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "primary_sport": user.primary_sport,
        "created_at": datetime.utcnow().isoformat(),
    }

    access_token = create_access_token(data={"sub": user.email})
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={"name": user.name, "email": user.email, "primary_sport": user.primary_sport},
    )


@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    db_user = users_db.get(user.email)
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.email})
    return Token(
        access_token=access_token,
        token_type="bearer",
        user={"name": db_user["name"], "email": db_user["email"], "primary_sport": db_user["primary_sport"]},
    )


@app.get("/api/auth/me")
async def get_me(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"name": user["name"], "email": user["email"], "primary_sport": user["primary_sport"]}


# ─────────────────────────────────────────
# Health & Metrics
# ─────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "api-gateway", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/services/health")
async def services_health():
    """Check health of all microservices."""
    statuses = {}
    async with httpx.AsyncClient(timeout=5) as client:
        for name, url in SERVICE_URLS.items():
            try:
                response = await client.get(f"{url}/health")
                statuses[name] = {"status": "healthy", "code": response.status_code}
            except Exception as e:
                statuses[name] = {"status": "unhealthy", "error": str(e)}
    return statuses


@app.get("/metrics")
async def metrics():
    from starlette.responses import Response
    return Response(content=generate_latest(), media_type="text/plain")


# ─────────────────────────────────────────
# Sport Config Proxy
# ─────────────────────────────────────────
@app.get("/api/sports")
async def list_sports():
    """List all supported sports."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{SERVICE_URLS['pose']}/sports")
            return response.json()
    except:
        # Fallback: return from local config
        import sys
        sys.path.insert(0, "../../packages/config")
        from sports import get_all_sports
        return [{"id": s.id, "name": s.name, "icon": s.icon, "category": s.category} for s in get_all_sports()]


@app.get("/api/sports/{sport_id}")
async def get_sport(sport_id: str):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{SERVICE_URLS['pose']}/sports/{sport_id}")
            return response.json()
    except:
        raise HTTPException(status_code=503, detail="Pose service unavailable")


# ─────────────────────────────────────────
# Pose WebSocket Proxy
# ─────────────────────────────────────────
@app.websocket("/ws/pose/{sport_id}")
async def websocket_pose_proxy(websocket: WebSocket, sport_id: str = "football"):
    """Proxy WebSocket to pose service for real-time analysis."""
    await websocket.accept()

    import websockets
    try:
        async with websockets.connect(f"ws://localhost:8001/ws/pose/{sport_id}") as ws:
            import asyncio

            async def forward_to_service():
                try:
                    while True:
                        data = await websocket.receive_text()
                        await ws.send(data)
                except WebSocketDisconnect:
                    await ws.close()

            async def forward_to_client():
                try:
                    async for message in ws:
                        await websocket.send_text(message)
                except:
                    pass

            await asyncio.gather(forward_to_service(), forward_to_client())

    except Exception:
        # If pose service is not running, run local analysis
        await websocket.send_json({"error": "Pose service not available. Use browser-side detection."})
        await websocket.close()


# ─────────────────────────────────────────
# Motion Analysis Proxy
# ─────────────────────────────────────────
@app.post("/api/analyze/motion")
async def analyze_motion(body: dict):
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(f"{SERVICE_URLS['motion']}/analyze", json=body)
            return response.json()
    except:
        raise HTTPException(status_code=503, detail="Motion analysis service unavailable")


# ─────────────────────────────────────────
# Feedback Proxy
# ─────────────────────────────────────────
@app.post("/api/feedback")
async def generate_feedback(body: dict):
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(f"{SERVICE_URLS['feedback']}/generate", json=body)
            return response.json()
    except:
        raise HTTPException(status_code=503, detail="Feedback engine unavailable")


# ─────────────────────────────────────────
# Video Upload Proxy
# ─────────────────────────────────────────
@app.post("/api/upload/video")
async def upload_video(file: UploadFile = File(...), sport_id: str = Form("football")):
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            contents = await file.read()
            response = await client.post(
                f"{SERVICE_URLS['video']}/upload",
                files={"file": (file.filename, contents, file.content_type)},
                data={"sport_id": sport_id},
            )
            return response.json()
    except:
        raise HTTPException(status_code=503, detail="Video processor unavailable")


@app.get("/api/upload/status/{job_id}")
async def get_upload_status(job_id: str):
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{SERVICE_URLS['video']}/job/{job_id}")
            return response.json()
    except:
        raise HTTPException(status_code=503, detail="Video processor unavailable")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
