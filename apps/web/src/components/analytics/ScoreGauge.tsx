"use client";

import { useMemo } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  color?: string;
}

export default function ScoreGauge({
  score,
  size = 120,
  label = "Score",
  color,
}: ScoreGaugeProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const scoreColor = useMemo(() => {
    if (color) return color;
    if (score >= 80) return "#6FCF97";
    if (score >= 60) return "#F2994A";
    return "#EB5757";
  }, [score, color]);

  return (
    <div className="score-gauge" style={{ width: size, height: size }}>
      <svg
        className="score-gauge-circle"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="score-gauge-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className="score-gauge-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scoreColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-gauge-value" style={{ color: scoreColor }}>
        {Math.round(score)}
      </div>
    </div>
  );
}
