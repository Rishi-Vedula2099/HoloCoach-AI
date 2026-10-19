"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useSessionStore } from "@/store/sessionStore";
import PoseCanvas from "@/components/pose-overlay/PoseCanvas";
import JointAngleCard from "@/components/pose-overlay/JointAngleCard";
import ScoreGauge from "@/components/analytics/ScoreGauge";
import InsightTimeline from "@/components/analytics/InsightTimeline";
import SportSelector from "@/components/sports/SportSelector";
import { SPORTS, getSport } from "@/lib/sports";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import {
  HiOutlineVideoCamera,
  HiOutlineStop,
  HiOutlineRefresh,
  HiOutlineX,
  HiOutlineTrendingUp,
  HiOutlineCheck,
} from "react-icons/hi";

export default function SessionPage() {
  const {
    videoRef,
    isActive: cameraActive,
    error: cameraError,
    startCamera,
    stopCamera,
  } = useCamera({ width: 1280, height: 720 });

  const {
    keypoints,
    jointAngles,
    postureScore,
    balanceScore,
    insights,
    scoreHistory,
    isActive: sessionActive,
    duration,
    sportId,
    sportName,
    movement,
    sessionSummary,
    showSummary,
    startSession,
    endSession,
    setSport,
    setMovement,
    updatePoseData,
    updateScores,
    addInsight,
    incrementDuration,
    dismissSummary,
  } = useSessionStore();

  const lastInsightRef = useRef<number>(0);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [showSportPicker, setShowSportPicker] = useState(false);

  const handlePoseDetected = useCallback(
    (
      newKeypoints: any[],
      newAngles: any[],
      newPostureScore: number,
      newBalanceScore: number
    ) => {
      updatePoseData(newKeypoints, newAngles);
      updateScores(newPostureScore, newBalanceScore);

      const now = Date.now();
      if (now - lastInsightRef.current > 3000) {
        for (const angle of newAngles) {
          if (angle.status === "bad") {
            addInsight({
              timestamp: duration,
              type: "bad",
              message: `${angle.name} angle is ${angle.angle}° (ideal: ${angle.ideal}°). Adjust your form.`,
            });
            lastInsightRef.current = now;
            break;
          }
        }

        if (
          newPostureScore >= 90 &&
          now - lastInsightRef.current > 5000
        ) {
          addInsight({
            timestamp: duration,
            type: "good",
            message: "Excellent posture! Score: " + newPostureScore,
          });
          lastInsightRef.current = now;
        }
      }
    },
    [updatePoseData, updateScores, addInsight, duration]
  );

  const { isLoading: modelLoading, isRunning, startDetection, stopDetection, modelError } =
    usePoseDetection({ onPoseDetected: handlePoseDetected, sportId });

  // Duration timer
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      incrementDuration();
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, incrementDuration]);

  // Track video dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (videoContainerRef.current) {
        setVideoDimensions({
          width: videoContainerRef.current.offsetWidth,
          height: videoContainerRef.current.offsetHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleStart = async () => {
    startSession(sportId, sportName);
    await startCamera();
    setTimeout(() => {
      if (videoRef.current) {
        startDetection(videoRef.current);
      }
    }, 1000);
  };

  const handleStop = () => {
    stopDetection();
    stopCamera();
    endSession();
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const chartData = scoreHistory.map((s, i) => ({ t: i, score: s }));
  const currentSport = getSport(sportId);
  const sportMovements = currentSport?.movements || [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Live Session</h1>
          <p className="page-subtitle">
            {sessionActive
              ? `${sportName}${movement ? ` · ${movement}` : ""} · ${formatDuration(duration)}`
              : "Start a session to begin AI-powered pose analysis"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {!sessionActive ? (
            <>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowSportPicker(!showSportPicker)}
                id="btn-pick-sport"
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span style={{ fontSize: "1.125rem" }}>{currentSport?.icon || "⚽"}</span>
                {sportName}
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleStart}
                disabled={modelLoading}
                id="btn-start-live"
              >
                {modelLoading ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Loading AI Model...
                  </>
                ) : (
                  <>
                    <HiOutlineVideoCamera size={20} />
                    Start Session
                  </>
                )}
              </button>
            </>
          ) : (
            <button className="btn btn-sm" onClick={handleStop} id="btn-stop-live"
              style={{
                background: "rgba(235, 87, 87, 0.1)",
                color: "var(--color-danger)",
                border: "1px solid rgba(235, 87, 87, 0.2)",
              }}
            >
              <HiOutlineStop size={16} />
              End Session
            </button>
          )}
        </div>
      </div>

      {/* Sport Picker Panel */}
      {showSportPicker && !sessionActive && (
        <div className="glass-card-static animate-slide-up" style={{ padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1rem" }}>Choose Your Sport</h3>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowSportPicker(false)} style={{ width: 28, height: 28 }}>
              <HiOutlineX size={16} />
            </button>
          </div>
          <SportSelector
            selectedSport={sportId}
            onSelect={(id) => {
              const sport = getSport(id);
              if (sport) {
                setSport(id, sport.name);
                setMovement(null);
              }
            }}
            mode="grid"
            showCategories={true}
          />

          {/* Movement Selector */}
          {sportMovements.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Movement Focus (optional)
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  className={`btn btn-sm ${!movement ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setMovement(null)}
                >
                  General
                </button>
                {sportMovements.map((m) => (
                  <button
                    key={m.name}
                    className={`btn btn-sm ${movement === m.name ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setMovement(m.name)}
                    title={m.description}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error states */}
      {cameraError && (
        <div
          className="glass-card-static"
          style={{
            padding: "20px 24px",
            marginBottom: "24px",
            borderLeft: "3px solid var(--color-danger)",
          }}
        >
          <strong style={{ color: "var(--color-danger)" }}>Camera Error:</strong>{" "}
          {cameraError}
          <br />
          <button
            className="btn btn-sm btn-secondary"
            onClick={startCamera}
            style={{ marginTop: "8px" }}
          >
            <HiOutlineRefresh size={14} />
            Retry
          </button>
        </div>
      )}

      {modelError && (
        <div
          className="glass-card-static"
          style={{
            padding: "20px 24px",
            marginBottom: "24px",
            borderLeft: "3px solid var(--color-accent-warm)",
          }}
        >
          <strong style={{ color: "var(--color-accent-warm)" }}>Model Error:</strong>{" "}
          {modelError}
        </div>
      )}

      {/* Main Content: Split View */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: sessionActive ? "1fr 340px" : "1fr",
          gap: "24px",
        }}
      >
        {/* Left: Video Feed */}
        <div>
          <div
            ref={videoContainerRef}
            className="glass-card-static"
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "#0a0a0a",
              aspectRatio: "16/9",
            }}
            id="video-container"
          >
            {!sessionActive ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "rgba(255,255,255,0.4)",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "rgba(74, 144, 226, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HiOutlineVideoCamera size={36} color="#4A90E2" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                    Camera Preview
                  </div>
                  <div style={{ fontSize: "0.875rem", marginTop: "4px" }}>
                    Select sport → Click &quot;Start Session&quot; to begin
                  </div>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scaleX(-1)",
                  }}
                />
                <div style={{ transform: "scaleX(-1)" }}>
                  <PoseCanvas
                    keypoints={keypoints}
                    width={videoDimensions.width}
                    height={videoDimensions.height}
                  />
                </div>

                {/* Floating Joint Angle Cards */}
                {jointAngles.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      left: "16px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      maxWidth: "300px",
                      transform: "scaleX(-1)",
                      direction: "rtl",
                    }}
                  >
                    {jointAngles.slice(0, 4).map((angle) => (
                      <div key={angle.name} style={{ direction: "ltr" }}>
                        <JointAngleCard angle={angle} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Session Timer + Sport Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    className="floating-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(0,0,0,0.6)",
                      borderColor: "rgba(255,255,255,0.1)",
                      padding: "8px 12px",
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>{currentSport?.icon || "🏃"}</span>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#EB5757",
                        animation: "pulse-glow 2s infinite",
                        boxShadow: "0 0 8px rgba(235, 87, 87, 0.5)",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        color: "white",
                      }}
                    >
                      {formatDuration(duration)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Joint angles row below video */}
          {sessionActive && jointAngles.length > 4 && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "16px",
                flexWrap: "wrap",
              }}
            >
              {jointAngles.slice(4).map((angle) => (
                <JointAngleCard key={angle.name} angle={angle} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Analytics Panel */}
        {sessionActive && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            className="animate-slide-in-right"
          >
            {/* Posture Score */}
            <div className="glass-card-static" style={{ padding: "20px", textAlign: "center" }}>
              <h3 style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Posture Score
              </h3>
              <ScoreGauge score={postureScore} size={140} label="Posture" />
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "0.8125rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                {postureScore >= 80
                  ? "Great form! Keep it up."
                  : postureScore >= 60
                  ? "Good, but room for improvement."
                  : "Focus on your alignment."}
              </div>
            </div>

            {/* Balance Score */}
            <div className="glass-card-static" style={{ padding: "20px", textAlign: "center" }}>
              <h3 style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Balance
              </h3>
              <ScoreGauge score={balanceScore} size={100} label="Balance" />
            </div>

            {/* Score Trend Mini Chart */}
            {chartData.length > 1 && (
              <div className="glass-card-static" style={{ padding: "16px" }}>
                <h3 style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Score Trend
                </h3>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={chartData}>
                    <YAxis domain={[0, 100]} hide />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#4A90E2"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Coach Tip */}
            {currentSport?.tips && currentSport.tips.length > 0 && (
              <div className="glass-card-static" style={{ padding: "16px", borderLeft: "3px solid var(--color-accent)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  💡 Coach Tip
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                  {currentSport.tips[Math.floor(duration / 10) % currentSport.tips.length]}
                </div>
              </div>
            )}

            {/* Insight Timeline */}
            <div
              className="glass-card-static"
              style={{
                padding: "16px",
                flex: 1,
                maxHeight: "280px",
                overflowY: "auto",
              }}
            >
              <h3 style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Live Insights
              </h3>
              <InsightTimeline insights={insights} />
            </div>
          </div>
        )}
      </div>

      {/* ─── Session Summary Modal ─── */}
      {showSummary && sessionSummary && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={dismissSummary}
        >
          <div
            className="glass-card-static animate-scale-in"
            style={{
              padding: "40px",
              maxWidth: "500px",
              width: "90%",
              background: "rgba(255,255,255,0.95)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Checkmark */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-accent), #27AE60)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 8px 24px rgba(111, 207, 151, 0.3)",
              }}
            >
              <HiOutlineCheck size={32} color="white" />
            </div>

            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.5rem",
                marginBottom: "4px",
              }}
            >
              Session Complete!
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "24px" }}>
              {sessionSummary.sportName}{sessionSummary.movement ? ` · ${sessionSummary.movement}` : ""} · {formatDuration(sessionSummary.duration)}
            </p>

            {/* Score Gauges */}
            <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "24px" }}>
              <div>
                <ScoreGauge score={sessionSummary.avgPostureScore} size={100} label="Avg Posture" />
              </div>
              <div>
                <ScoreGauge score={sessionSummary.peakScore} size={100} label="Peak Score" color="#6FCF97" />
              </div>
            </div>

            {/* Stats Row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "24px",
              padding: "16px",
              background: "rgba(0,0,0,0.02)",
              borderRadius: "var(--radius-md)",
            }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.25rem", color: "var(--color-primary)" }}>
                  {sessionSummary.insightCount}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                  Total Insights
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.25rem", color: "var(--color-accent)" }}>
                  {sessionSummary.goodCount}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                  Good Form
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.25rem", color: "var(--color-danger)" }}>
                  {sessionSummary.badCount}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                  Needs Work
                </div>
              </div>
            </div>

            {/* Coach Feedback */}
            {currentSport?.tips && (
              <div style={{
                padding: "12px 16px",
                background: "rgba(111, 207, 151, 0.06)",
                borderRadius: "var(--radius-md)",
                borderLeft: "3px solid var(--color-accent)",
                textAlign: "left",
                marginBottom: "24px",
              }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-accent)", marginBottom: "4px" }}>
                  🧠 AI Coach Feedback
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                  {sessionSummary.avgPostureScore >= 80
                    ? `Great ${sessionSummary.sportName} session! Your form was consistently strong. ${currentSport.tips[0]}`
                    : sessionSummary.avgPostureScore >= 60
                    ? `Good effort! Focus on the ${sessionSummary.badCount} areas flagged. ${currentSport.tips[1] || currentSport.tips[0]}`
                    : `Keep practicing! Review the insights and focus on alignment. ${currentSport.tips[0]}`}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={dismissSummary}>
                <HiOutlineTrendingUp size={16} />
                View Analytics
              </button>
              <button className="btn btn-secondary" onClick={dismissSummary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for spinner */}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
