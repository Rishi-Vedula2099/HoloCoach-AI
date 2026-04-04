"""
HoloCoach AI — API Gateway
FastAPI-powered backend service
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="HoloCoach AI API",
    description="Real-time AI + AR Sports Coaching Platform API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api-gateway"}


@app.get("/")
async def root():
    return {"message": "HoloCoach AI API Gateway", "version": "0.1.0"}
