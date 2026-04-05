"use client";

import { useEffect, useState, useRef } from "react";
import { HiOutlineCube, HiOutlineVideoCamera, HiOutlineX, HiOutlineRefresh } from "react-icons/hi";
import SkeletonAnimation from "@/components/ui/SkeletonAnimation";
import PoseCanvas from "@/components/pose-overlay/PoseCanvas";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";

export default function ARModePage() {
  const [webxrSupported, setWebxrSupported] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [keypoints, setKeypoints] = useState<any[]>([]);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const {
    videoRef,
    isActive: cameraActive,
    error: cameraError,
    startCamera,
    stopCamera,
  } = useCamera({ width: 1280, height: 720 });

  const { isLoading, startDetection, stopDetection } = usePoseDetection({
    onPoseDetected: (kps) => {
      setKeypoints(kps);
    },
  });

  useEffect(() => {
    const checkWebXR = async () => {
      if ("xr" in navigator) {
        try {
          const supported = await (navigator as any).xr.isSessionSupported("immersive-ar");
          setWebxrSupported(supported);
        } catch {
          setWebxrSupported(false);
        }
      } else {
        setWebxrSupported(false);
      }
    };
    checkWebXR();
  }, []);

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
  }, [showCamera]);

  const handleToggleCamera = async () => {
    if (showCamera) {
      stopDetection();
      stopCamera();
      setShowCamera(false);
      setKeypoints([]);
    } else {
      setShowCamera(true);
      await startCamera();
      setTimeout(() => {
        if (videoRef.current) {
          startDetection(videoRef.current);
        }
      }, 1000);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">AR Mode</h1>
          <p className="page-subtitle">
            Augmented Reality coaching with real-time skeleton overlay
          </p>
        </div>
        <button
          className={`btn ${showCamera ? "btn-sm" : "btn-primary"}`}
          onClick={handleToggleCamera}
          disabled={isLoading}
          id="btn-toggle-ar-camera"
          style={showCamera ? {
            background: "rgba(235, 87, 87, 0.1)",
            color: "var(--color-danger)",
            border: "1px solid rgba(235, 87, 87, 0.2)",
          } : {}}
        >
          {isLoading ? (
            "Loading Model..."
          ) : showCamera ? (
            <><HiOutlineX size={16} /> Stop Camera</>
          ) : (
            <><HiOutlineVideoCamera size={20} /> Try Camera Preview</>
          )}
        </button>
      </div>

      {/* Camera Preview */}
      {showCamera && (
        <div style={{ marginBottom: "32px" }}>
          <div
            ref={videoContainerRef}
            className="glass-card-static"
            style={{
              position: "relative",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "#0a0a0a",
              aspectRatio: "16/9",
              maxHeight: "500px",
            }}
          >
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

            {/* AR-Style Floating Labels */}
            <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
              <div className="floating-card" style={{ background: "rgba(0,0,0,0.6)", borderColor: "rgba(255,255,255,0.1)", padding: "8px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6FCF97", animation: "pulse-glow 2s infinite", boxShadow: "0 0 8px rgba(111, 207, 151, 0.5)" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#6FCF97", fontWeight: 600 }}>
                    AR PREVIEW
                  </span>
                </div>
              </div>
            </div>

            <div style={{ position: "absolute", top: "16px", right: "16px" }}>
              <div className="floating-card" style={{ background: "rgba(0,0,0,0.6)", borderColor: "rgba(255,255,255,0.1)", padding: "8px 12px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>
                  {keypoints.length > 0 ? `${keypoints.length} landmarks` : "Waiting for pose..."}
                </span>
              </div>
            </div>
          </div>

          {cameraError && (
            <div className="glass-card-static" style={{ padding: "16px 20px", marginTop: "12px", borderLeft: "3px solid var(--color-danger)" }}>
              <strong style={{ color: "var(--color-danger)" }}>Camera Error:</strong> {cameraError}
              <button className="btn btn-sm btn-secondary" onClick={startCamera} style={{ marginLeft: "12px" }}>
                <HiOutlineRefresh size={14} /> Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Skeleton Preview */}
      {!showCamera && (
        <div
          className="glass-card-static"
          style={{
            padding: "40px",
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 auto 32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background gradient */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(74, 144, 226, 0.03), rgba(111, 207, 151, 0.03), rgba(155, 89, 182, 0.03))",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", gap: "40px", alignItems: "center", justifyContent: "center" }}>
            {/* Skeleton Animation */}
            <div style={{ position: "relative" }}>
              <SkeletonAnimation width={280} height={280} />
              <div style={{
                position: "absolute",
                bottom: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                background: "rgba(74, 144, 226, 0.1)",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "var(--color-primary)",
                fontFamily: "var(--font-mono)",
              }}>
                LIVE SKELETON
              </div>
            </div>

            {/* Info */}
            <div style={{ textAlign: "left", maxWidth: "320px" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "var(--radius-xl)",
                  background: "linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(111, 207, 151, 0.1))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <HiOutlineCube size={28} color="#4A90E2" />
              </div>

              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.375rem", marginBottom: "8px" }}>
                AR Training Mode
              </h2>
              <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "16px" }}>
                Experience real-time AR coaching with 3D skeleton overlay, ghost trainer guidance, and correction lines.
              </p>

              {/* WebXR Status */}
              <div
                className={`badge ${webxrSupported ? "badge-green" : webxrSupported === false ? "badge-orange" : "badge-blue"}`}
                style={{ fontSize: "0.75rem", padding: "5px 12px", marginBottom: "16px" }}
              >
                {webxrSupported === null
                  ? "Checking WebXR..."
                  : webxrSupported
                  ? "✓ WebXR Supported"
                  : "WebXR not available"}
              </div>

              <button className="btn btn-primary" onClick={handleToggleCamera} disabled={isLoading}>
                <HiOutlineVideoCamera size={18} />
                Try Camera Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {[
          {
            icon: "🧍",
            title: "Ghost Trainer",
            desc: "Semi-transparent ideal athlete overlay for reference",
            color: "#4A90E2",
            status: "coming soon",
          },
          {
            icon: "🦴",
            title: "3D Skeleton",
            desc: "Real-time skeletal tracking rendered in 3D space",
            color: "#6FCF97",
            status: showCamera ? "active" : "preview above",
          },
          {
            icon: "📏",
            title: "Correction Lines",
            desc: "Visual guides showing adjustments needed",
            color: "#F2994A",
            status: "coming soon",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="glass-card-glow"
            style={{ padding: "24px 20px", textAlign: "center" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>
              {feature.icon}
            </div>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: "4px" }}>
              {feature.title}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "10px", lineHeight: 1.5 }}>
              {feature.desc}
            </div>
            <span
              className={`badge ${feature.status === "active" ? "badge-green" : feature.status === "preview above" ? "badge-blue" : "badge-orange"}`}
            >
              {feature.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
