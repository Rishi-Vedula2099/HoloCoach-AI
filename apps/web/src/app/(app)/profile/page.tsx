"use client";

import { useState } from "react";
import SportSelector from "@/components/sports/SportSelector";
import ScoreGauge from "@/components/analytics/ScoreGauge";
import {
  HiOutlinePencil, HiOutlineCalendar, HiOutlineClock,
  HiOutlineLightningBolt, HiOutlineTrendingUp, HiOutlineFire,
} from "react-icons/hi";

const achievements = [
  { icon: "🏆", name: "First Session", desc: "Complete your first training session", unlocked: true },
  { icon: "🔥", name: "7-Day Streak", desc: "Train 7 days in a row", unlocked: true },
  { icon: "💯", name: "Perfect Score", desc: "Achieve a 100 posture score", unlocked: false },
  { icon: "🏅", name: "Multi-Sport", desc: "Train in 5 different sports", unlocked: true },
  { icon: "🧠", name: "AI Master", desc: "Fix 50 AI-detected issues", unlocked: false },
  { icon: "⚡", name: "Speed Demon", desc: "Complete 100 sessions", unlocked: false },
  { icon: "🎯", name: "Sharp Shooter", desc: "Score 90+ in 10 consecutive sessions", unlocked: false },
  { icon: "🌟", name: "Rising Star", desc: "Improve avg score by 20 points", unlocked: true },
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex@holocoach.ai",
    height: "5'11\"",
    weight: "175 lbs",
    primarySport: "football",
    experience: "Intermediate",
    goals: "Improve kicking accuracy and sprint form for upcoming season",
    injuries: "Minor left ankle sprain (recovered)",
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your athlete profile and training achievements</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px" }}>
        {/* Left: Profile Card */}
        <div>
          <div className="glass-card-static" style={{ padding: "32px 24px", textAlign: "center" }}>
            {/* Avatar */}
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "2rem", fontWeight: 700, margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(74, 144, 226, 0.3)" }}>
              {profile.name.split(" ").map(n => n[0]).join("")}
            </div>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "4px" }}>{profile.name}</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "16px" }}>{profile.email}</p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
              <span className="badge badge-blue">{profile.experience}</span>
              <span className="badge badge-green">Active</span>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(!isEditing)} style={{ width: "100%" }}>
              <HiOutlinePencil size={14} /> {isEditing ? "Save Changes" : "Edit Profile"}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="glass-card-static" style={{ padding: "20px", marginTop: "16px" }}>
            <h3 style={{ fontSize: "0.875rem", marginBottom: "16px", fontWeight: 600 }}>Training Stats</h3>
            {[
              { icon: <HiOutlineCalendar size={16} />, label: "Total Sessions", value: "54", color: "var(--color-primary)" },
              { icon: <HiOutlineClock size={16} />, label: "Training Hours", value: "18.5h", color: "var(--color-accent-warm)" },
              { icon: <HiOutlineLightningBolt size={16} />, label: "Current Streak", value: "7 days", color: "var(--color-accent)" },
              { icon: <HiOutlineTrendingUp size={16} />, label: "Best Score", value: "97", color: "var(--color-purple)" },
              { icon: <HiOutlineFire size={16} />, label: "Issues Fixed", value: "47", color: "var(--color-danger)" },
            ].map((stat) => (
              <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-text-secondary)", fontSize: "0.8125rem" }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span> {stat.label}
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Athlete Info */}
          <div className="glass-card-static" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "20px" }}>Athlete Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Height", value: profile.height },
                { label: "Weight", value: profile.weight },
                { label: "Primary Sport", value: profile.primarySport },
                { label: "Experience", value: profile.experience },
              ].map((field) => (
                <div key={field.label}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                    {field.label}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => setProfile({ ...profile, [field.label.toLowerCase().replace(" ", "")]: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-strong)", fontSize: "0.875rem", outline: "none", background: "white" }}
                    />
                  ) : (
                    <div style={{ fontSize: "0.9375rem", fontWeight: 500 }}>{field.value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Training Goals */}
          <div className="glass-card-static" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>Training Goals</h3>
            {isEditing ? (
              <textarea
                value={profile.goals}
                onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-strong)", fontSize: "0.875rem", minHeight: "80px", resize: "vertical", outline: "none", fontFamily: "var(--font-body)" }}
              />
            ) : (
              <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>{profile.goals}</p>
            )}
          </div>

          {/* Injury History */}
          <div className="glass-card-static" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "12px" }}>Injury History</h3>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>{profile.injuries}</p>
          </div>

          {/* Performance Overview */}
          <div className="glass-card-static" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "20px" }}>Sport Performance</h3>
            <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
              {[
                { sport: "Football", score: 82, color: "#2ECC71" },
                { sport: "Cricket", score: 76, color: "#E67E22" },
                { sport: "Tennis", score: 85, color: "#F39C12" },
                { sport: "Boxing", score: 79, color: "#C0392B" },
                { sport: "Yoga", score: 91, color: "#27AE60" },
              ].map((s) => (
                <div key={s.sport} style={{ textAlign: "center" }}>
                  <ScoreGauge score={s.score} size={90} color={s.color} />
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, marginTop: "8px" }}>{s.sport}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-card-static" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "16px" }}>Achievements</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {achievements.map((a) => (
                <div
                  key={a.name}
                  style={{
                    padding: "16px 12px",
                    textAlign: "center",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    background: a.unlocked ? "rgba(111, 207, 151, 0.04)" : "rgba(0,0,0,0.02)",
                    opacity: a.unlocked ? 1 : 0.5,
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{a.icon}</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "2px" }}>{a.name}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
