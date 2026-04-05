"use client";

import { useState } from "react";
import { SPORTS } from "@/lib/sports";
import { HiOutlineVideoCamera, HiOutlinePhone, HiOutlineChat, HiOutlineCalendar, HiOutlineStar, HiOutlineClock } from "react-icons/hi";

const coaches = [
  { id: 1, name: "Dr. Sarah Chen", speciality: ["football", "athletics"], rating: 4.9, sessions: 342, avatar: "SC", available: true, rate: "$75/hr", bio: "Former Olympic analyst. Specializes in biomechanics for field sports." },
  { id: 2, name: "Marcus Williams", speciality: ["basketball", "athletics"], rating: 4.8, sessions: 218, avatar: "MW", available: true, rate: "$60/hr", bio: "NBA D-League coach. Expert in shooting form and defensive positioning." },
  { id: 3, name: "Priya Patel", speciality: ["cricket", "badminton"], rating: 4.9, sessions: 156, avatar: "PP", available: false, rate: "$55/hr", bio: "National cricket team analyst. Focus on bowling action and batting technique." },
  { id: 4, name: "Yuki Tanaka", speciality: ["tennis", "badminton"], rating: 4.7, sessions: 189, avatar: "YT", available: true, rate: "$65/hr", bio: "WTA tour coach. Expertise in serve mechanics and footwork patterns." },
  { id: 5, name: "Coach Mike Rivera", speciality: ["boxing", "rugby"], rating: 4.8, sessions: 274, avatar: "MR", available: true, rate: "$70/hr", bio: "Professional boxing trainer. Certified in combat sport biomechanics." },
  { id: 6, name: "Emily Zhang", speciality: ["yoga", "swimming"], rating: 5.0, sessions: 401, avatar: "EZ", available: true, rate: "$50/hr", bio: "Yoga Alliance certified. Focus on alignment, flexibility, and breath work." },
];

const upcomingSessions = [
  { id: 1, coach: "Dr. Sarah Chen", sport: "Football", date: "Apr 6, 2026", time: "3:00 PM", status: "confirmed" },
  { id: 2, coach: "Yuki Tanaka", sport: "Tennis", date: "Apr 8, 2026", time: "10:00 AM", status: "pending" },
];

const pastSessions = [
  { id: 1, coach: "Dr. Sarah Chen", sport: "Football", date: "Apr 2, 2026", duration: "45 min", rating: 5, notes: "Excellent session on sprinting form. Key takeaways: improve arm swing symmetry." },
  { id: 2, coach: "Coach Mike Rivera", sport: "Boxing", date: "Mar 30, 2026", duration: "30 min", rating: 4, notes: "Worked on jab-cross combinations. Need to keep guard up during combos." },
];

export default function ConsultationPage() {
  const [activeTab, setActiveTab] = useState<"coaches" | "upcoming" | "past">("coaches");
  const [sportFilter, setSportFilter] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null);

  const filteredCoaches = sportFilter
    ? coaches.filter((c) => c.speciality.includes(sportFilter))
    : coaches;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Live Consultation</h1>
        <p className="page-subtitle">Connect with expert coaches for real-time, AI-enhanced training sessions</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", padding: "4px", width: "fit-content" }}>
        {[
          { id: "coaches" as const, label: "Find Coaches", icon: <HiOutlineStar size={14} /> },
          { id: "upcoming" as const, label: "Upcoming", icon: <HiOutlineCalendar size={14} />, count: upcomingSessions.length },
          { id: "past" as const, label: "Past Sessions", icon: <HiOutlineClock size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "none",
              background: activeTab === tab.id ? "white" : "transparent",
              boxShadow: activeTab === tab.id ? "var(--shadow-sm)" : "none",
              color: activeTab === tab.id ? "var(--color-text)" : "var(--color-text-secondary)",
              fontWeight: activeTab === tab.id ? 600 : 500, fontSize: "0.875rem",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              transition: "all var(--transition-fast)",
            }}
          >
            {tab.icon} {tab.label}
            {tab.count && <span className="badge badge-blue" style={{ marginLeft: "4px" }}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Find Coaches */}
      {activeTab === "coaches" && (
        <>
          {/* Sport Filter */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button
              onClick={() => setSportFilter(null)}
              className={!sportFilter ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            >All Sports</button>
            {Object.values(SPORTS).slice(0, 8).map((sport) => (
              <button key={sport.id} onClick={() => setSportFilter(sport.id)}
                className={sportFilter === sport.id ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}>
                {sport.icon} {sport.name}
              </button>
            ))}
          </div>

          {/* Coach Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            {filteredCoaches.map((coach) => (
              <div key={coach.id} className="glass-card" style={{ padding: "24px", cursor: "pointer" }} onClick={() => setSelectedCoach(selectedCoach === coach.id ? null : coach.id)}>
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>
                    {coach.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ fontSize: "1rem", marginBottom: "2px" }}>{coach.name}</h3>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {coach.speciality.map((s) => (
                            <span key={s} className="badge" style={{ background: SPORTS[s]?.bgColor, color: SPORTS[s]?.color, fontSize: "0.625rem" }}>
                              {SPORTS[s]?.icon} {SPORTS[s]?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-primary)" }}>{coach.rate}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "2px", justifyContent: "flex-end" }}>
                          <HiOutlineStar size={12} color="#F39C12" />
                          <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{coach.rating}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>({coach.sessions})</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "8px", lineHeight: 1.5 }}>{coach.bio}</p>
                    <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
                      <span className={`badge ${coach.available ? "badge-green" : "badge-orange"}`}>
                        {coach.available ? "Available Now" : "Busy"}
                      </span>
                      {coach.available && (
                        <>
                          <button className="btn btn-primary btn-sm"><HiOutlineVideoCamera size={14} /> Video Call</button>
                          <button className="btn btn-secondary btn-sm"><HiOutlineChat size={14} /> Message</button>
                          <button className="btn btn-ghost btn-sm"><HiOutlineCalendar size={14} /> Schedule</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upcoming Sessions */}
      {activeTab === "upcoming" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {upcomingSessions.length === 0 ? (
            <div className="glass-card-static" style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📅</div>
              <p style={{ color: "var(--color-text-secondary)" }}>No upcoming sessions. Book a consultation with a coach!</p>
            </div>
          ) : (
            upcomingSessions.map((s) => (
              <div key={s.id} className="glass-card-static" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>{s.coach}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{s.sport} · {s.date} at {s.time}</div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className={`badge ${s.status === "confirmed" ? "badge-green" : "badge-orange"}`}>{s.status}</span>
                  {s.status === "confirmed" && <button className="btn btn-primary btn-sm"><HiOutlineVideoCamera size={14} /> Join</button>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Past Sessions */}
      {activeTab === "past" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {pastSessions.map((s) => (
            <div key={s.id} className="glass-card-static" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.coach}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{s.sport} · {s.date} · {s.duration}</div>
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <HiOutlineStar key={i} size={14} color={i < s.rating ? "#F39C12" : "#ddd"} />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, padding: "8px 12px", background: "rgba(0,0,0,0.02)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--color-primary)" }}>
                {s.notes}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
