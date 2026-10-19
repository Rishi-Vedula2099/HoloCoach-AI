"use client";

import { useState, useRef, useCallback } from "react";
import {
  HiOutlineCloudUpload,
  HiOutlineVideoCamera,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineDocumentText,
} from "react-icons/hi";
import SportSelector from "@/components/sports/SportSelector";
import VideoAnalysisResult from "@/components/analysis/VideoAnalysisResult";
import { getSport } from "@/lib/sports";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  sportId: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedSport, setSelectedSport] = useState("football");
  const [viewingAnalysis, setViewingAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles: UploadedFile[] = Array.from(fileList)
      .filter((f) => f.type.startsWith("video/"))
      .map((f) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: f.name,
        size: formatSize(f.size),
        progress: 0,
        status: "uploading" as const,
        sportId: selectedSport,
      }));

    setFiles((prev) => [...newFiles, ...prev]);

    newFiles.forEach((file) => {
      simulateUpload(file.id);
    });
  }, [selectedSport]);

  const simulateUpload = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, progress: 100, status: "processing" } : f
          )
        );
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, status: "complete" } : f
            )
          );
        }, 2000);
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, progress: Math.min(progress, 99) } : f
          )
        );
      }
    }, 300);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (viewingAnalysis === id) setViewingAnalysis(null);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const viewingFile = files.find((f) => f.id === viewingAnalysis);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Upload Video</h1>
        <p className="page-subtitle">
          Upload training videos for AI-powered analysis and feedback
        </p>
      </div>

      {/* Sport Selector */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          What sport is this video?
        </div>
        <SportSelector
          selectedSport={selectedSport}
          onSelect={setSelectedSport}
          mode="compact"
          showCategories={false}
        />
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${isDragOver ? "dragover" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        id="upload-zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="upload-zone-icon">
          <HiOutlineCloudUpload size={48} />
        </div>
        <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text)", marginBottom: "8px" }}>
          {isDragOver ? "Drop your videos here" : "Drag & drop videos here"}
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "16px" }}>
          or click to browse · MP4, MOV, AVI up to 500MB
        </div>
        <span className="btn btn-primary btn-sm">
          <HiOutlineVideoCamera size={16} />
          Select Videos
        </span>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h3 style={{ marginBottom: "16px" }}>Uploaded Videos</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {files.map((file, idx) => {
              const sportConfig = getSport(file.sportId);
              return (
                <div
                  key={file.id}
                  className={`glass-card-static animate-slide-up ${viewingAnalysis === file.id ? "" : ""}`}
                  style={{
                    padding: "16px 20px",
                    animationDelay: `${idx * 60}ms`,
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    borderLeft: viewingAnalysis === file.id ? `3px solid ${sportConfig?.color || "var(--color-primary)"}` : undefined,
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "var(--radius-md)",
                      background:
                        file.status === "complete"
                          ? "rgba(111, 207, 151, 0.1)"
                          : file.status === "error"
                          ? "rgba(235, 87, 87, 0.1)"
                          : "rgba(74, 144, 226, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {file.status === "complete" ? (
                      <HiOutlineCheck size={24} color="#6FCF97" />
                    ) : (
                      <HiOutlineDocumentText
                        size={24}
                        color={file.status === "error" ? "#EB5757" : "#4A90E2"}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                        marginBottom: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {file.name}
                      <span className="badge" style={{ background: sportConfig?.bgColor, color: sportConfig?.color, fontSize: "0.625rem" }}>
                        {sportConfig?.icon} {sportConfig?.name}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--color-text-secondary)",
                        display: "flex",
                        gap: "12px",
                      }}
                    >
                      <span>{file.size}</span>
                      <span>
                        {file.status === "uploading"
                          ? `Uploading... ${Math.round(file.progress)}%`
                          : file.status === "processing"
                          ? "Processing with AI..."
                          : file.status === "complete"
                          ? "Analysis complete"
                          : "Upload failed"}
                      </span>
                    </div>

                    {(file.status === "uploading" || file.status === "processing") && (
                      <div className="progress-bar" style={{ marginTop: "8px" }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: file.status === "processing" ? "100%" : `${file.progress}%`,
                            background: file.status === "processing"
                              ? "linear-gradient(90deg, #F2994A, #F2C94C)"
                              : undefined,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <span
                    className={`badge ${
                      file.status === "complete"
                        ? "badge-green"
                        : file.status === "processing"
                        ? "badge-orange"
                        : file.status === "error"
                        ? "badge-red"
                        : "badge-blue"
                    }`}
                  >
                    {file.status === "complete"
                      ? "Ready"
                      : file.status === "processing"
                      ? "Processing"
                      : file.status === "error"
                      ? "Failed"
                      : "Uploading"}
                  </span>

                  {/* Actions */}
                  {file.status === "complete" && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setViewingAnalysis(viewingAnalysis === file.id ? null : file.id)}
                    >
                      {viewingAnalysis === file.id ? "Hide" : "View Analysis"}
                    </button>
                  )}

                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    style={{ width: 32, height: 32 }}
                  >
                    <HiOutlineX size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {viewingFile && viewingFile.status === "complete" && (
        <VideoAnalysisResult sportId={viewingFile.sportId} fileName={viewingFile.name} />
      )}

      {/* Tips Section */}
      <div
        style={{
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        {[
          {
            emoji: "🎥",
            title: "Good Lighting",
            desc: "Record in a well-lit area for best pose detection accuracy",
          },
          {
            emoji: "📐",
            title: "Full Body Visible",
            desc: "Ensure your entire body is visible in the frame",
          },
          {
            emoji: "🏋️",
            title: "Steady Camera",
            desc: "Use a stable camera position for consistent analysis",
          },
        ].map((tip) => (
          <div
            key={tip.title}
            className="glass-card-static"
            style={{ padding: "20px", textAlign: "center" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
              {tip.emoji}
            </div>
            <div style={{ fontWeight: 600, marginBottom: "4px" }}>
              {tip.title}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {tip.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
