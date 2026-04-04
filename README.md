# HoloCoach AI

**Real-time AI + AR Sports Coaching Platform**

> "Apple Fitness + AI Coach + AR Trainer"

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose-4285F4?style=flat-square&logo=google)](https://mediapipe.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## 🎯 Features

- **Real-Time Pose Detection** — Browser-side MediaPipe pose estimation at 30 FPS
- **Biomechanics Analysis** — Joint angle measurement, posture scoring (0-100), balance tracking
- **AI Feedback Engine** — Automated form corrections and insight timeline
- **AR Overlay Mode** — 3D skeleton overlay with ghost trainer (WebXR + Three.js)
- **Video Upload & Analysis** — Async video processing with timeline insights
- **Premium "Calm Intelligence" UI** — Glassmorphism, micro-animations, Apple-inspired design

## 📁 Project Structure

```
holocoach-ai/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   └── api-gateway/            # FastAPI gateway
├── services/
│   ├── pose-service/           # MediaPipe / OpenPose
│   ├── motion-analysis/        # TimeSformer + scoring
│   ├── feedback-engine/        # AI coaching logic
│   └── video-processor/        # Upload + preprocessing
├── packages/
│   ├── ui/                     # Shared UI components
│   ├── config/                 # Env, constants
│   └── utils/                  # Helpers
├── infrastructure/
│   ├── docker/
│   └── k8s/
├── data/
│   ├── sample-videos/
│   └── trained-models/
└── scripts/
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Development

```bash
# Install dependencies
npm install

# Start the frontend dev server
npm run dev

# Opens at http://localhost:3000
```

### Frontend Only (from apps/web)

```bash
cd apps/web
npm run dev
```

## 🎨 Design System

**"Calm Intelligence UI"** — Inspired by Apple × Notion × Strava

| Token | Value |
|-------|-------|
| Background | `#F7F7F8` |
| Primary | `#4A90E2` (Soft Blue) |
| Accent | `#6FCF97` (Muted Green) |
| Warm Accent | `#F2994A` (Orange) |
| Text | `#2D3436` (Dark Gray) |
| Heading Font | Outfit |
| Body Font | Inter |
| Mono Font | JetBrains Mono |

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS v4, React Three Fiber |
| State | Zustand |
| Charts | Recharts |
| Animations | Framer Motion, CSS Animations |
| Pose Detection | MediaPipe Tasks Vision |
| Backend | FastAPI (Python) |
| AI/ML | MediaPipe, PyTorch, TimeSformer, ONNX Runtime |
| Database | PostgreSQL, TimescaleDB |
| Infrastructure | Docker, Kubernetes, NGINX |

## 📝 License

MIT
