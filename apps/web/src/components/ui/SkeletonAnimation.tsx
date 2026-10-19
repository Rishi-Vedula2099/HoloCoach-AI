"use client";

import { useEffect, useRef } from "react";

interface SkeletonAnimationProps {
  width?: number;
  height?: number;
  color?: string;
  jointColor?: string;
  showLabels?: boolean;
  className?: string;
}

// A simple 2D skeleton figure with 17 joints, animated with CSS + requestAnimationFrame
const JOINTS = [
  // head
  { id: "head", base: { x: 200, y: 48 }, r: 18 },
  // torso
  { id: "neck", base: { x: 200, y: 78 }, r: 5 },
  { id: "l_shoulder", base: { x: 155, y: 100 }, r: 6 },
  { id: "r_shoulder", base: { x: 245, y: 100 }, r: 6 },
  { id: "l_elbow", base: { x: 125, y: 150 }, r: 5 },
  { id: "r_elbow", base: { x: 275, y: 150 }, r: 5 },
  { id: "l_wrist", base: { x: 105, y: 200 }, r: 5 },
  { id: "r_wrist", base: { x: 295, y: 200 }, r: 5 },
  { id: "l_hip", base: { x: 175, y: 200 }, r: 6 },
  { id: "r_hip", base: { x: 225, y: 200 }, r: 6 },
  { id: "l_knee", base: { x: 165, y: 275 }, r: 5 },
  { id: "r_knee", base: { x: 235, y: 275 }, r: 5 },
  { id: "l_ankle", base: { x: 155, y: 345 }, r: 5 },
  { id: "r_ankle", base: { x: 245, y: 345 }, r: 5 },
];

const BONES: [number, number][] = [
  [0, 1], // head → neck
  [1, 2], [1, 3], // neck → shoulders
  [2, 4], [4, 6], // left arm
  [3, 5], [5, 7], // right arm
  [2, 8], [3, 9], // shoulders → hips
  [8, 9], // hip bar
  [8, 10], [10, 12], // left leg
  [9, 11], [11, 13], // right leg
];

export default function SkeletonAnimation({
  width = 400,
  height = 400,
  color = "#4A90E2",
  jointColor = "#6FCF97",
  className,
}: SkeletonAnimationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let t = 0;
    const animate = () => {
      t += 0.02;
      const svg = svgRef.current;
      if (!svg) return;

      // Simple idle animation: subtle breathing/swaying motion
      JOINTS.forEach((joint, i) => {
        const el = svg.getElementById(`skel-joint-${i}`);
        const phaseX = Math.sin(t * 1.2 + i * 0.5) * (i < 2 ? 1 : 3);
        const phaseY = Math.sin(t * 0.8 + i * 0.3) * (i < 2 ? 2 : 4);
        if (el) {
          el.setAttribute("cx", String(joint.base.x + phaseX));
          el.setAttribute("cy", String(joint.base.y + phaseY));
        }
      });

      // Update bones
      BONES.forEach(([a, b], i) => {
        const lineEl = svg.getElementById(`skel-bone-${i}`);
        const ja = svg.getElementById(`skel-joint-${a}`);
        const jb = svg.getElementById(`skel-joint-${b}`);
        if (lineEl && ja && jb) {
          lineEl.setAttribute("x1", ja.getAttribute("cx") || "0");
          lineEl.setAttribute("y1", ja.getAttribute("cy") || "0");
          lineEl.setAttribute("x2", jb.getAttribute("cx") || "0");
          lineEl.setAttribute("y2", jb.getAttribute("cy") || "0");
        }
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      width={width}
      height={height}
      className={className}
      style={{ overflow: "visible" }}
    >
      {/* Glow filter */}
      <defs>
        <filter id="skel-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="skel-radial" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.08" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <ellipse cx="200" cy="200" rx="160" ry="180" fill="url(#skel-radial)" />

      {/* Bones */}
      {BONES.map(([a, b], i) => (
        <line
          key={`bone-${i}`}
          id={`skel-bone-${i}`}
          x1={JOINTS[a].base.x}
          y1={JOINTS[a].base.y}
          x2={JOINTS[b].base.x}
          y2={JOINTS[b].base.y}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.7}
          filter="url(#skel-glow)"
        />
      ))}

      {/* Joints */}
      {JOINTS.map((joint, i) => (
        <circle
          key={joint.id}
          id={`skel-joint-${i}`}
          cx={joint.base.x}
          cy={joint.base.y}
          r={joint.r}
          fill={i === 0 ? color : jointColor}
          opacity={0.9}
          filter="url(#skel-glow)"
        />
      ))}

      {/* Angle indicator arcs on key joints */}
      <g opacity="0.4">
        {/* Left elbow angle arc */}
        <path
          d={`M ${JOINTS[2].base.x} ${JOINTS[2].base.y} Q ${JOINTS[4].base.x - 10} ${JOINTS[4].base.y + 5} ${JOINTS[6].base.x} ${JOINTS[6].base.y}`}
          fill="none"
          stroke="#F2994A"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.6}
        />
        {/* Right knee angle arc */}
        <path
          d={`M ${JOINTS[9].base.x} ${JOINTS[9].base.y} Q ${JOINTS[11].base.x + 10} ${JOINTS[11].base.y + 5} ${JOINTS[13].base.x} ${JOINTS[13].base.y}`}
          fill="none"
          stroke="#F2994A"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.6}
        />
      </g>
    </svg>
  );
}
