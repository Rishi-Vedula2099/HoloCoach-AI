"use client";

import type { JointAngle } from "@/store/sessionStore";

interface JointAngleCardProps {
  angle: JointAngle;
}

const statusColors = {
  good: { bg: "rgba(111, 207, 151, 0.1)", border: "rgba(111, 207, 151, 0.3)", text: "#5AB883" },
  warning: { bg: "rgba(242, 153, 74, 0.1)", border: "rgba(242, 153, 74, 0.3)", text: "#F2994A" },
  bad: { bg: "rgba(235, 87, 87, 0.1)", border: "rgba(235, 87, 87, 0.3)", text: "#EB5757" },
};

const statusLabels = {
  good: "Good",
  warning: "Adjust",
  bad: "Correct",
};

export default function JointAngleCard({ angle }: JointAngleCardProps) {
  const colors = statusColors[angle.status];

  return (
    <div
      className="floating-card"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        minWidth: "120px",
      }}
      id={`joint-${angle.name.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="floating-card-label">{angle.name}</div>
      <div className="floating-card-value" style={{ color: colors.text }}>
        {angle.angle}
        <span className="floating-card-unit">°</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "6px",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-text-muted)",
          }}
        >
          Ideal: {angle.ideal}°
        </span>
        <span
          className={`badge badge-${angle.status === "good" ? "green" : angle.status === "warning" ? "orange" : "red"}`}
          style={{ fontSize: "0.625rem" }}
        >
          {statusLabels[angle.status]}
        </span>
      </div>
    </div>
  );
}
