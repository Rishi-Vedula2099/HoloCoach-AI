"use client";

import { useState } from "react";
import SportSelector from "@/components/sports/SportSelector";
import { SPORTS } from "@/lib/sports";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
} from "recharts";
import { HiOutlineDownload, HiOutlineCalendar, HiOutlineTrendingUp } from "react-icons/hi";

// Mock analytics data
const performanceData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  score: Math.round(60 + Math.random() * 30 + i * 0.5),
  sessions: Math.floor(1 + Math.random() * 3),
}));

const bodyPartRadar = [
  { part: "Shoulders", score: 82 },
  { part: "Elbows", score: 78 },
  { part: "Core/Torso", score: 75 },
  { part: "Hips", score: 88 },
  { part: "Knees", score: 71 },
  { part: "Ankles", score: 85 },
];

const sportBreakdown = [
  { sport: "Football", sessions: 18, avgScore: 82, color: "#2ECC71" },
  { sport: "Cricket", sessions: 12, avgScore: 76, color: "#E67E22" },
  { sport: "Tennis", sessions: 8, avgScore: 85, color: "#F39C12" },
  { sport: "Boxing", sessions: 6, avgScore: 79, color: "#C0392B" },
  { sport: "Yoga", sessions: 10, avgScore: 91, color: "#27AE60" },
];

const sessionHistory = [
  { id: 1, sport: "Football", movement: "Kick", score: 87, duration: "12m", date: "2026-04-04", insights: 5 },
  { id: 2, sport: "Cricket", movement: "Batting Stance", score: 72, duration: "8m", date: "2026-04-04", insights: 8 },
  { id: 3, sport: "Tennis", movement: "Serve", score: 91, duration: "15m", date: "2026-04-03", insights: 3 },
  { id: 4, sport: "Boxing", movement: "Jab", score: 65, duration: "10m", date: "2026-04-03", insights: 11 },
  { id: 5, sport: "Yoga", movement: "Warrior I", score: 94, duration: "20m", date: "2026-04-02", insights: 2 },
  { id: 6, sport: "Football", movement: "Sprint", score: 78, duration: "6m", date: "2026-04-02", insights: 6 },
  { id: 7, sport: "Cricket", movement: "Bowling Action", score: 68, duration: "14m", date: "2026-04-01", insights: 9 },
  { id: 8, sport: "Badminton", movement: "Smash", score: 83, duration: "11m", date: "2026-04-01", insights: 4 },
];

const improvementAreas = [
  { area: "Left Knee Alignment", sport: "Football", severity: "high", tip: "Your left knee tends to collapse inward during kicks. Focus on external hip rotation." },
  { area: "Bowling Elbow", sport: "Cricket", severity: "high", tip: "Elbow flexion exceeds 15° during delivery. Work on arm straightening drills." },
  { area: "Serve Toss", sport: "Tennis", severity: "medium", tip: "Ball toss inconsistency detected. Practice toss-only drills with target." },
  { area: "Guard Position", sport: "Boxing", severity: "medium", tip: "Hands drop after jab. Focus on return to guard habit." },
  { area: "Hip Flexibility", sport: "Yoga", severity: "low", tip: "Hip opening improving — continue with Pigeon Pose progressions." },
];

export default function AnalyticsPage() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  const filteredHistory = selectedSport
    ? sessionHistory.filter((s) => s.sport === SPORTS[selectedSport]?.name)
    : sessionHistory;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep insights into your performance across all sports</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-strong)",
              background: "white", fontSize: "0.875rem", fontWeight: 500,
              cursor: "pointer", outline: "none",
            }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="btn btn-secondary btn-sm" id="btn-export-analytics">
            <HiOutlineDownload size={16} /> Export
          </button>
        </div>
      </div>

      {/* Sport Filter */}
      <div style={{ marginBottom: "24px" }}>
        <SportSelector selectedSport={selectedSport} onSelect={(id) => setSelectedSport(id === selectedSport ? null : id)} mode="compact" showCategories={false} />
      </div>

      {/* Top Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Sessions", value: "54", change: "+12", color: "var(--color-primary)" },
          { label: "Avg Score", value: "82", change: "+6", color: "var(--color-accent)" },
          { label: "Training Hours", value: "18.5h", change: "+4.2h", color: "var(--color-accent-warm)" },
          { label: "Issues Fixed", value: "47", change: "+15", color: "var(--color-purple)" },
          { label: "Sports Active", value: "5", change: "+1", color: "#1ABC9C" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card-static" style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-heading)", color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>{stat.label}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-accent)", fontWeight: 600, marginTop: "4px" }}>↑ {stat.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "24px" }}>
        {/* Performance Over Time */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1rem" }}>Performance Over Time</h3>
            <span className="badge badge-green"><HiOutlineTrendingUp size={12} /> Improving</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A90E2" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#4A90E2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#A4ABB0", fontSize: 11 }} interval={4} />
              <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fill: "#A4ABB0", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: "13px" }} />
              <Area type="monotone" dataKey="score" stroke="#4A90E2" strokeWidth={2} fill="url(#perfGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Body Part Radar */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "16px" }}>Body Part Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={bodyPartRadar}>
              <PolarGrid stroke="rgba(0,0,0,0.08)" />
              <PolarAngleAxis dataKey="part" tick={{ fill: "#636E72", fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="score" stroke="#4A90E2" fill="#4A90E2" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sport Breakdown + Improvement Areas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        {/* Sport Breakdown */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "16px" }}>Sport Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sportBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.06)" />
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#A4ABB0", fontSize: 11 }} />
              <YAxis dataKey="sport" type="category" axisLine={false} tickLine={false} tick={{ fill: "#636E72", fontSize: 12 }} width={80} />
              <Tooltip contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "12px", fontSize: "13px" }} />
              <Bar dataKey="avgScore" radius={[0, 6, 6, 0]} barSize={20}>
                {sportBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Improvement Areas */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "16px" }}>🧠 AI Improvement Areas</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {improvementAreas.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: item.severity === "high" ? "rgba(235,87,87,0.06)" : item.severity === "medium" ? "rgba(242,153,74,0.06)" : "rgba(111,207,151,0.06)",
                  borderLeft: `3px solid ${item.severity === "high" ? "var(--color-danger)" : item.severity === "medium" ? "var(--color-accent-warm)" : "var(--color-accent)"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.area}</span>
                  <span className={`badge badge-${item.severity === "high" ? "red" : item.severity === "medium" ? "orange" : "green"}`}>
                    {item.sport}
                  </span>
                </div>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{item.tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session History Table */}
      <div className="glass-card-static" style={{ padding: "24px" }} id="session-history-table">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1rem" }}>Session History</h3>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{filteredHistory.length} sessions</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border-strong)" }}>
                {["Sport", "Movement", "Score", "Duration", "Date", "Insights"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "var(--color-text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((session) => (
                <tr key={session.id} style={{ borderBottom: "1px solid var(--color-border)", cursor: "pointer", transition: "background var(--transition-fast)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,144,226,0.04)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "12px" }}>
                    <span className="badge" style={{ background: SPORTS[session.sport.toLowerCase()]?.bgColor || "rgba(0,0,0,0.06)", color: SPORTS[session.sport.toLowerCase()]?.color || "#636E72" }}>
                      {SPORTS[session.sport.toLowerCase()]?.icon} {session.sport}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontWeight: 500 }}>{session.movement}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: session.score >= 80 ? "var(--color-accent)" : session.score >= 60 ? "var(--color-accent-warm)" : "var(--color-danger)" }}>
                      {session.score}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "var(--color-text-secondary)" }}>{session.duration}</td>
                  <td style={{ padding: "12px", color: "var(--color-text-secondary)" }}>{session.date}</td>
                  <td style={{ padding: "12px" }}>
                    <span className="badge badge-blue">{session.insights} insights</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
