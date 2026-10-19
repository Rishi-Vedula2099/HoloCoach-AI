"use client";

import type { InsightEvent } from "@/store/sessionStore";

interface InsightTimelineProps {
  insights: InsightEvent[];
  maxItems?: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  if (mins > 0) return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  return `${secs}.${ms}s`;
}

export default function InsightTimeline({
  insights,
  maxItems = 10,
}: InsightTimelineProps) {
  const visibleInsights = insights.slice(0, maxItems);

  if (visibleInsights.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>📋</div>
        Insights will appear here during your session
      </div>
    );
  }

  return (
    <div className="insight-timeline" id="insight-timeline">
      {visibleInsights.map((insight, idx) => (
        <div
          key={insight.id}
          className="timeline-item animate-slide-up"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className={`timeline-dot ${insight.type}`} />
          <div className="timeline-time">
            {formatTime(insight.timestamp)}
          </div>
          <div className="timeline-text">{insight.message}</div>
        </div>
      ))}
    </div>
  );
}
