"use client";

import { useState } from "react";
import { SPORTS, getSportsByCategory, SPORT_CATEGORIES, type SportConfig } from "@/lib/sports";

interface SportSelectorProps {
  selectedSport: string | null;
  onSelect: (sportId: string) => void;
  mode?: "grid" | "compact" | "inline";
  showCategories?: boolean;
}

export default function SportSelector({
  selectedSport,
  onSelect,
  mode = "grid",
  showCategories = true,
}: SportSelectorProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const sports = getSportsByCategory(activeCategory);

  if (mode === "inline") {
    return (
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {Object.values(SPORTS).map((sport) => (
          <button
            key={sport.id}
            className={`btn btn-sm ${selectedSport === sport.id ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onSelect(sport.id)}
            id={`sport-inline-${sport.id}`}
          >
            <span>{sport.icon}</span>
            {sport.name}
          </button>
        ))}
      </div>
    );
  }

  if (mode === "compact") {
    return (
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {Object.values(SPORTS).map((sport) => (
          <button
            key={sport.id}
            onClick={() => onSelect(sport.id)}
            className={selectedSport === sport.id ? "btn-primary" : ""}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              border: selectedSport === sport.id
                ? "2px solid var(--color-primary)"
                : "1px solid var(--color-border-strong)",
              background: selectedSport === sport.id
                ? "var(--color-primary-glow)"
                : "white",
              fontSize: "0.8125rem",
              fontWeight: selectedSport === sport.id ? 600 : 500,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              color: selectedSport === sport.id ? "var(--color-primary)" : "var(--color-text)",
            }}
            id={`sport-compact-${sport.id}`}
          >
            <span style={{ fontSize: "1rem" }}>{sport.icon}</span>
            {sport.name}
          </button>
        ))}
      </div>
    );
  }

  // Grid mode (default)
  return (
    <div>
      {/* Category Filter */}
      {showCategories && (
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
          {SPORT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              style={{
                padding: "5px 14px",
                borderRadius: "var(--radius-full)",
                border: activeCategory === cat.value
                  ? "none"
                  : "1px solid var(--color-border-strong)",
                background: activeCategory === cat.value
                  ? "var(--color-primary)"
                  : "white",
                color: activeCategory === cat.value
                  ? "white"
                  : "var(--color-text-secondary)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Sport Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => onSelect(sport.id)}
            className={`glass-card ${selectedSport === sport.id ? "" : ""}`}
            style={{
              padding: "16px",
              textAlign: "center",
              cursor: "pointer",
              border: selectedSport === sport.id
                ? `2px solid ${sport.color}`
                : "1px solid rgba(255, 255, 255, 0.18)",
              background: selectedSport === sport.id
                ? sport.bgColor
                : "var(--color-bg-card)",
              transition: "all var(--transition-fast)",
              position: "relative",
              overflow: "hidden",
            }}
            id={`sport-grid-${sport.id}`}
          >
            {selectedSport === sport.id && (
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: sport.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "12px",
                }}
              >
                ✓
              </div>
            )}
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{sport.icon}</div>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "2px" }}>
              {sport.name}
            </div>
            <span
              className="badge"
              style={{
                background: sport.bgColor,
                color: sport.color,
                fontSize: "0.6875rem",
              }}
            >
              {sport.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
