"use client";

import { useState } from "react";
import SportSelector from "@/components/sports/SportSelector";
import { HiOutlineCheck, HiOutlineTrash, HiOutlineDownload } from "react-icons/hi";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    name: "Alex Johnson",
    email: "alex@holocoach.ai",
    notifications: { email: true, push: true, sessionReminders: true, weeklyReport: true, coachMessages: true },
    camera: { resolution: "720p", fps: "30", modelQuality: "balanced", mirror: true },
    sports: ["football", "cricket", "tennis"],
    privacy: { shareData: false, publicProfile: false },
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account, preferences, and AI settings</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} id="btn-save-settings">
          {saved ? <><HiOutlineCheck size={16} /> Saved!</> : "Save Changes"}
        </button>
      </div>

      <div style={{ maxWidth: "800px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Account */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "20px" }}>Account</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Full Name</label>
              <input type="text" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-strong)", fontSize: "0.875rem", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Email</label>
              <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-strong)", fontSize: "0.875rem", outline: "none" }} />
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: "12px" }}>Change Password</button>
        </div>

        {/* Notifications */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "20px" }}>Notifications</h3>
          {Object.entries({ "Email Notifications": "email", "Push Notifications": "push", "Session Reminders": "sessionReminders", "Weekly Progress Report": "weeklyReport", "Coach Messages": "coachMessages" }).map(([label, key]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>{label}</span>
              <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={(settings.notifications as Record<string, boolean>)[key]}
                  onChange={() => setSettings({ ...settings, notifications: { ...settings.notifications, [key]: !(settings.notifications as Record<string, boolean>)[key] } })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: "absolute", inset: 0, borderRadius: 12,
                  background: (settings.notifications as Record<string, boolean>)[key] ? "var(--color-primary)" : "#ccc",
                  transition: "background 0.2s",
                }}>
                  <span style={{
                    position: "absolute", left: (settings.notifications as Record<string, boolean>)[key] ? 22 : 2, top: 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </span>
              </label>
            </div>
          ))}
        </div>

        {/* Camera & AI */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "20px" }}>Camera & AI Settings</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Resolution</label>
              <select value={settings.camera.resolution} onChange={(e) => setSettings({ ...settings, camera: { ...settings.camera, resolution: e.target.value } })} style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-strong)", fontSize: "0.875rem", outline: "none", background: "white" }}>
                <option value="480p">480p (Fast)</option>
                <option value="720p">720p (Balanced)</option>
                <option value="1080p">1080p (High Quality)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Target FPS</label>
              <select value={settings.camera.fps} onChange={(e) => setSettings({ ...settings, camera: { ...settings.camera, fps: e.target.value } })} style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-strong)", fontSize: "0.875rem", outline: "none", background: "white" }}>
                <option value="15">15 FPS (Battery Saver)</option>
                <option value="30">30 FPS (Balanced)</option>
                <option value="60">60 FPS (High Performance)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>AI Model Quality</label>
              <select value={settings.camera.modelQuality} onChange={(e) => setSettings({ ...settings, camera: { ...settings.camera, modelQuality: e.target.value } })} style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-strong)", fontSize: "0.875rem", outline: "none", background: "white" }}>
                <option value="lite">Lite (Fastest)</option>
                <option value="balanced">Balanced</option>
                <option value="full">Full (Most Accurate)</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}>
                <input type="checkbox" checked={settings.camera.mirror} onChange={() => setSettings({ ...settings, camera: { ...settings.camera, mirror: !settings.camera.mirror } })} style={{ width: 16, height: 16 }} />
                Mirror Video Feed
              </label>
            </div>
          </div>
        </div>

        {/* Sport Preferences */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "16px" }}>Sport Preferences</h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "16px" }}>Select the sports you train in. Your dashboard and analytics will focus on these.</p>
          <SportSelector selectedSport={null} onSelect={() => {}} mode="grid" />
        </div>

        {/* Data & Privacy */}
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "20px" }}>Data & Privacy</h3>
          {Object.entries({ "Share anonymized data for AI improvement": "shareData", "Public profile (visible to coaches)": "publicProfile" }).map(([label, key]) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>{label}</span>
              <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: "pointer" }}>
                <input type="checkbox" checked={(settings.privacy as Record<string, boolean>)[key]} onChange={() => setSettings({ ...settings, privacy: { ...settings.privacy, [key]: !(settings.privacy as Record<string, boolean>)[key] } })} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: "absolute", inset: 0, borderRadius: 12, background: (settings.privacy as Record<string, boolean>)[key] ? "var(--color-primary)" : "#ccc", transition: "background 0.2s" }}>
                  <span style={{ position: "absolute", left: (settings.privacy as Record<string, boolean>)[key] ? 22 : 2, top: 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </span>
              </label>
            </div>
          ))}

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button className="btn btn-secondary btn-sm"><HiOutlineDownload size={14} /> Export My Data</button>
            <button className="btn btn-sm" style={{ background: "rgba(235,87,87,0.08)", color: "var(--color-danger)", border: "1px solid rgba(235,87,87,0.2)" }}><HiOutlineTrash size={14} /> Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
