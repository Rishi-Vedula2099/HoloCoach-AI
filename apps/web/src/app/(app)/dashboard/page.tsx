"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SPORTS, getSportList } from "@/lib/sports";
import SportSelector from "@/components/sports/SportSelector";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import {
  HiOutlineVideoCamera,
  HiOutlineCloudUpload,
  HiOutlineTrendingUp,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlineChartBar,
  HiOutlineArrowRight,
  HiOutlinePlay,
} from "react-icons/hi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const recentSessions = [
  {
    id: 1, sport: "football", exercise: "Kick", score: 87,
    date: "Today, 2:30 PM", duration: "12 min", improvement: "+5",
  },
  {
    id: 2, sport: "boxing", exercise: "Jab", score: 72,
    date: "Today, 10:15 AM", duration: "8 min", improvement: "+12",
  },
  {
    id: 3, sport: "yoga", exercise: "Warrior I", score: 91,
    date: "Yesterday", duration: "15 min", improvement: "+3",
  },
  {
    id: 4, sport: "tennis", exercise: "Serve", score: 65,
    date: "Yesterday", duration: "5 min", improvement: "-2",
  },
];

const weeklyScores = [
  { day: "Mon", score: 72, sessions: 2 },
  { day: "Tue", score: 78, sessions: 3 },
  { day: "Wed", score: 65, sessions: 1 },
  { day: "Thu", score: 82, sessions: 2 },
  { day: "Fri", score: 85, sessions: 3 },
  { day: "Sat", score: 79, sessions: 2 },
  { day: "Sun", score: 88, sessions: 1 },
];

const bodyPartScores = [
  { part: "Upper Body", score: 82, change: "+4" },
  { part: "Core", score: 75, change: "+8" },
  { part: "Lower Body", score: 88, change: "+2" },
  { part: "Balance", score: 71, change: "+6" },
];

export default function DashboardPage() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const allSports = getSportList();

  // Rotate coach tip every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Get tips from all sports or selected sport
  const allTips = selectedSport
    ? SPORTS[selectedSport]?.tips || []
    : allSports.flatMap((s) => s.tips.map((t) => ({ sport: s.name, icon: s.icon, tip: t })));

  const currentTip = selectedSport
    ? { sport: SPORTS[selectedSport]?.name, icon: SPORTS[selectedSport]?.icon, tip: (allTips as string[])[tipIndex % allTips.length] || "" }
    : (allTips as { sport: string; icon: string; tip: string }[])[tipIndex % allTips.length];

  const filteredSessions = selectedSport
    ? recentSessions.filter((s) => s.sport === selectedSport)
    : recentSessions;

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Welcome back, Athlete 👋</h1>
        <p className="page-subtitle">
          Here&apos;s your training overview. Keep pushing your limits.
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <Link href="/session" className="btn btn-primary btn-lg" id="btn-start-session">
          <HiOutlineVideoCamera size={20} />
          Start Live Session
        </Link>
        <Link href="/upload" className="btn btn-secondary btn-lg" id="btn-upload-video">
          <HiOutlineCloudUpload size={20} />
          Upload Video
        </Link>
      </div>

      {/* Sport Filter */}
      <div style={{ marginBottom: "24px" }}>
        <SportSelector
          selectedSport={selectedSport}
          onSelect={(id) => setSelectedSport(id === selectedSport ? null : id)}
          mode="compact"
          showCategories={false}
        />
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
        id="stats-grid"
      >
        <div className="glass-card stat-card blue">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <AnimatedCounter value={87} className="stat-value" style={{ color: "var(--color-primary)" }} />
              <div className="stat-label">Avg. Posture Score</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "rgba(74, 144, 226, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
              <HiOutlineTrendingUp size={20} />
            </div>
          </div>
          <div className="stat-change positive">
            <HiOutlineTrendingUp size={14} /> +5% from last week
          </div>
        </div>

        <div className="glass-card stat-card green">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <AnimatedCounter value={14} className="stat-value" style={{ color: "var(--color-accent)" }} />
              <div className="stat-label">Sessions This Week</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "rgba(111, 207, 151, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>
              <HiOutlineLightningBolt size={20} />
            </div>
          </div>
          <div className="stat-change positive">
            <HiOutlineTrendingUp size={14} /> +3 from last week
          </div>
        </div>

        <div className="glass-card stat-card orange">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <AnimatedCounter value={2.4} suffix="h" decimals={1} className="stat-value" style={{ color: "var(--color-accent-warm)" }} />
              <div className="stat-label">Training Time</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "rgba(242, 153, 74, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent-warm)" }}>
              <HiOutlineClock size={20} />
            </div>
          </div>
          <div className="stat-change positive">
            <HiOutlineTrendingUp size={14} /> +45 min from last week
          </div>
        </div>

        <div className="glass-card stat-card purple">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <AnimatedCounter value={23} className="stat-value" style={{ color: "var(--color-purple)" }} />
              <div className="stat-label">Issues Corrected</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "rgba(155, 89, 182, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-purple)" }}>
              <HiOutlineChartBar size={20} />
            </div>
          </div>
          <div className="stat-change positive">
            <HiOutlineTrendingUp size={14} /> Great progress!
          </div>
        </div>
      </div>

      {/* AI Coach Tip + Continue Last Session */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {/* AI Coach Tip of the Day */}
        <div className="glass-card-static" style={{ padding: "20px", borderLeft: "3px solid var(--color-accent)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            🧠 AI Coach Tip
          </div>
          <div style={{ fontSize: "0.9375rem", color: "var(--color-text)", fontWeight: 500, lineHeight: 1.6, marginBottom: "4px" }}>
            {currentTip?.tip || "Select a sport for personalized tips!"}
          </div>
          {currentTip?.sport && (
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              — {currentTip.icon} {currentTip.sport}
            </span>
          )}
        </div>

        {/* Continue Where You Left Off */}
        <div className="glass-card" style={{ padding: "20px", cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                Continue Training
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "2px" }}>
                {SPORTS[recentSessions[0].sport]?.icon} {SPORTS[recentSessions[0].sport]?.name} · {recentSessions[0].exercise}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                Last session: {recentSessions[0].date} · Score: {recentSessions[0].score}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-accent)" }}>
              {recentSessions[0].score}
            </div>
          </div>
          <Link href="/session" className="btn btn-primary btn-sm" style={{ width: "100%" }}>
            <HiOutlinePlay size={14} /> Resume Training
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Performance Trend Chart */}
        <div className="glass-card-static" style={{ padding: "24px" }} id="performance-chart">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div>
              <h3 style={{ marginBottom: "4px" }}>Performance Trend</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                Weekly posture score average
              </p>
            </div>
            <span className="badge badge-green">↑ Improving</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyScores}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A90E2" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#4A90E2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(0,0,0,0.06)"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#A4ABB0", fontSize: 12 }}
              />
              <YAxis
                domain={[50, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#A4ABB0", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#4A90E2"
                strokeWidth={2.5}
                fill="url(#scoreGradient)"
                dot={{ fill: "#4A90E2", r: 4, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, stroke: "#4A90E2", strokeWidth: 2, fill: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Body Part Breakdown */}
        <div className="glass-card-static" style={{ padding: "24px" }} id="body-breakdown">
          <h3 style={{ marginBottom: "20px" }}>Body Part Scores</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {bodyPartScores.map((part) => (
              <div key={part.part}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    {part.part}
                  </span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color:
                        part.score >= 80
                          ? "var(--color-accent)"
                          : part.score >= 60
                          ? "var(--color-accent-warm)"
                          : "var(--color-danger)",
                    }}
                  >
                    {part.score}
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-accent)",
                        marginLeft: "6px",
                        fontWeight: 500,
                      }}
                    >
                      {part.change}
                    </span>
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${part.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div id="recent-sessions">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3>Recent Sessions</h3>
          <Link href="/analytics" className="btn btn-ghost btn-sm">
            View All <HiOutlineArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {filteredSessions.map((session, idx) => {
            const sportConfig = SPORTS[session.sport];
            return (
              <div
                key={session.id}
                className="glass-card session-card animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="session-card-header">
                  <span
                    className="session-card-sport"
                    style={{
                      background: sportConfig?.bgColor || "rgba(0,0,0,0.06)",
                      color: sportConfig?.color || "#636E72",
                    }}
                  >
                    {sportConfig?.icon} {sportConfig?.name || session.sport}
                  </span>
                  <div
                    className="session-card-score"
                    style={{
                      color:
                        session.score >= 80
                          ? "var(--color-accent)"
                          : session.score >= 60
                          ? "var(--color-accent-warm)"
                          : "var(--color-danger)",
                    }}
                  >
                    {session.score}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text)",
                    fontWeight: 500,
                  }}
                >
                  {session.exercise}
                </div>

                <div className="session-card-meta">
                  <span>{session.date}</span>
                  <span>{session.duration}</span>
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: session.improvement.startsWith("+")
                      ? "var(--color-accent)"
                      : "var(--color-danger)",
                  }}
                >
                  <HiOutlineTrendingUp size={12} />
                  {session.improvement} from last session
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
