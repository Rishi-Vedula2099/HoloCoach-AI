"use client";

import { SPORTS, getSport } from "@/lib/sports";
import ScoreGauge from "@/components/analytics/ScoreGauge";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from "recharts";
import {
  HiOutlineTrendingUp,
  HiOutlineLightningBolt,
  HiOutlineDownload,
  HiOutlinePlay,
} from "react-icons/hi";

interface VideoAnalysisResultProps {
  sportId: string;
  fileName: string;
}

// Mock analysis results
function generateMockResults(sportId: string) {
  const sport = getSport(sportId);
  const overall = Math.round(72 + Math.random() * 20);
  const form = Math.round(65 + Math.random() * 25);
  const timing = Math.round(60 + Math.random() * 30);
  const power = Math.round(55 + Math.random() * 35);
  const consistency = Math.round(70 + Math.random() * 20);

  const bodyParts = [
    { part: "Shoulders", score: Math.round(70 + Math.random() * 25) },
    { part: "Elbows", score: Math.round(65 + Math.random() * 30) },
    { part: "Core", score: Math.round(68 + Math.random() * 25) },
    { part: "Hips", score: Math.round(72 + Math.random() * 20) },
    { part: "Knees", score: Math.round(60 + Math.random() * 30) },
    { part: "Ankles", score: Math.round(75 + Math.random() * 20) },
  ];

  const issues = [
    { time: "0:03", severity: "warning" as const, message: `${sport?.movements[0]?.name || "Movement"} starting position needs adjustment` },
    { time: "0:08", severity: "bad" as const, message: "Left knee tracking inward — risk of injury" },
    { time: "0:12", severity: "good" as const, message: "Excellent upper body alignment maintained" },
    { time: "0:18", severity: "warning" as const, message: "Hip rotation timing slightly delayed" },
    { time: "0:24", severity: "good" as const, message: "Strong follow-through on completion" },
  ];

  return { overall, form, timing, power, consistency, bodyParts, issues, sport };
}

export default function VideoAnalysisResult({ sportId, fileName }: VideoAnalysisResultProps) {
  const results = generateMockResults(sportId);
  const sport = results.sport;

  return (
    <div className="animate-slide-up" style={{ marginTop: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h3 style={{ fontSize: "1.125rem", marginBottom: "4px" }}>
            Analysis Results
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
            {sport?.icon} {sport?.name || "General"} · {fileName}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm">
            <HiOutlineDownload size={14} /> Export Report
          </button>
          <button className="btn btn-primary btn-sm">
            <HiOutlinePlay size={14} /> Replay Analysis
          </button>
        </div>
      </div>

      {/* Scores Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", marginBottom: "20px" }}>
        {/* Overall Score */}
        <div className="glass-card-static" style={{ padding: "32px", textAlign: "center" }}>
          <ScoreGauge score={results.overall} size={160} label="Overall" />
          <div style={{ marginTop: "16px", fontSize: "0.9375rem", fontWeight: 500, color: "var(--color-text-secondary)" }}>
            {results.overall >= 80 ? "Excellent form!" : results.overall >= 60 ? "Good, with room to improve" : "Significant improvements needed"}
          </div>
        </div>

        {/* Sub-Scores + Radar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Sub-score cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Form", score: results.form, icon: <HiOutlineTrendingUp size={16} />, color: "var(--color-primary)" },
              { label: "Timing", score: results.timing, icon: <HiOutlineLightningBolt size={16} />, color: "var(--color-accent)" },
              { label: "Power", score: results.power, icon: <HiOutlineLightningBolt size={16} />, color: "var(--color-accent-warm)" },
              { label: "Consistency", score: results.consistency, icon: <HiOutlineTrendingUp size={16} />, color: "var(--color-purple)" },
            ].map((s) => (
              <div key={s.label} className="glass-card-static" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{s.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div className="progress-bar" style={{ width: "80px" }}>
                    <div className="progress-bar-fill" style={{ width: `${s.score}%` }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.875rem", color: s.color, minWidth: "28px", textAlign: "right" }}>
                    {s.score}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Body Part Radar */}
          <div className="glass-card-static" style={{ padding: "16px" }}>
            <h4 style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Body Part Analysis
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={results.bodyParts}>
                <PolarGrid stroke="rgba(0,0,0,0.08)" />
                <PolarAngleAxis dataKey="part" tick={{ fill: "#636E72", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="score" stroke={sport?.color || "#4A90E2"} fill={sport?.color || "#4A90E2"} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Issues Timeline + Tips */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Issues Timeline */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "16px" }}>
            Detected Issues
          </h4>
          <div className="insight-timeline">
            {results.issues.map((issue, i) => (
              <div key={i} className="timeline-item">
                <div className={`timeline-dot ${issue.severity}`} />
                <div className="timeline-time">{issue.time}</div>
                <div className="timeline-text">{issue.message}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sport-Specific Tips */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "16px" }}>
            🧠 AI Recommendations
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sport?.tips.map((tip, i) => (
              <div key={i} style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "rgba(111, 207, 151, 0.06)", borderLeft: "3px solid var(--color-accent)", fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                {tip}
              </div>
            ))}
            {results.overall < 80 && (
              <div style={{ padding: "12px 16px", borderRadius: "var(--radius-md)", background: "rgba(74, 144, 226, 0.06)", borderLeft: "3px solid var(--color-primary)", fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                💡 Consider booking a consultation with a {sport?.name} specialist for personalized coaching.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
