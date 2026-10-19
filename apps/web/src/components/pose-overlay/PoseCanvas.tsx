"use client";

import { useRef, useEffect } from "react";
import type { PoseKeypoint } from "@/store/sessionStore";
import { POSE_CONNECTIONS } from "@/hooks/usePoseDetection";

interface PoseCanvasProps {
  keypoints: PoseKeypoint[];
  width: number;
  height: number;
  className?: string;
}

export default function PoseCanvas({
  keypoints,
  width,
  height,
  className,
}: PoseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (keypoints.length === 0) return;

    // Draw connections
    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      const start = keypoints[startIdx];
      const end = keypoints[endIdx];

      if (!start || !end) continue;
      if (start.visibility < 0.5 || end.visibility < 0.5) continue;

      const sx = start.x * width;
      const sy = start.y * height;
      const ex = end.x * width;
      const ey = end.y * height;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);

      // Color based on visibility
      const avgVis = (start.visibility + end.visibility) / 2;
      if (avgVis > 0.8) {
        ctx.strokeStyle = "rgba(111, 207, 151, 0.85)";
      } else if (avgVis > 0.6) {
        ctx.strokeStyle = "rgba(242, 153, 74, 0.85)";
      } else {
        ctx.strokeStyle = "rgba(235, 87, 87, 0.7)";
      }

      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Draw keypoints
    for (const kp of keypoints) {
      if (kp.visibility < 0.5) continue;

      const x = kp.x * width;
      const y = kp.y * height;

      // Outer ring
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(74, 144, 226, 0.3)";
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#4A90E2";
      ctx.fill();
    }
  }, [keypoints, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      id="pose-canvas"
    />
  );
}
