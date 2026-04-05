"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  HiOutlineVideoCamera,
  HiOutlineLightningBolt,
  HiOutlineCube,
  HiOutlineChartBar,
  HiOutlineArrowRight,
  HiOutlinePlay,
  HiOutlineShieldCheck,
  HiOutlineTrendingUp,
  HiOutlineGlobe,
} from "react-icons/hi";
import SkeletonAnimation from "@/components/ui/SkeletonAnimation";

const FEATURES = [
  {
    icon: <HiOutlineVideoCamera size={28} />,
    title: "Real-Time Pose Detection",
    desc: "Browser-side MediaPipe pose estimation running at 30 FPS with zero latency. 33 landmarks tracked simultaneously.",
    color: "#4A90E2",
    bg: "rgba(74, 144, 226, 0.08)",
  },
  {
    icon: <HiOutlineLightningBolt size={28} />,
    title: "AI Feedback Engine",
    desc: "Automated form corrections with sport-specific rules. Get real-time coaching tips while you train.",
    color: "#6FCF97",
    bg: "rgba(111, 207, 151, 0.08)",
  },
  {
    icon: <HiOutlineCube size={28} />,
    title: "AR Overlay Mode",
    desc: "3D skeleton overlay with ghost trainer guidance and correction lines via WebXR and Three.js.",
    color: "#9B59B6",
    bg: "rgba(155, 89, 182, 0.08)",
  },
  {
    icon: <HiOutlineChartBar size={28} />,
    title: "Deep Analytics",
    desc: "Track performance over time with body-part radar charts, sport breakdowns, and AI improvement insights.",
    color: "#F2994A",
    bg: "rgba(242, 153, 74, 0.08)",
  },
];

const SPORTS_SHOWCASE = [
  { icon: "⚽", name: "Football", color: "#2ECC71" },
  { icon: "🏏", name: "Cricket", color: "#E67E22" },
  { icon: "🏀", name: "Basketball", color: "#E74C3C" },
  { icon: "🎾", name: "Tennis", color: "#F39C12" },
  { icon: "🥊", name: "Boxing", color: "#C0392B" },
  { icon: "🏸", name: "Badminton", color: "#1ABC9C" },
  { icon: "🧘", name: "Yoga", color: "#27AE60" },
  { icon: "🏃", name: "Athletics", color: "#9B59B6" },
  { icon: "🏊", name: "Swimming", color: "#3498DB" },
  { icon: "🏉", name: "Rugby", color: "#8E44AD" },
];

const STATS = [
  { value: "10K+", label: "Athletes Coached" },
  { value: "1M+", label: "Poses Analyzed" },
  { value: "10", label: "Sports Supported" },
  { value: "30", label: "FPS Real-Time" },
];

const TECH_STACK = [
  { name: "Next.js 14", color: "#000" },
  { name: "MediaPipe", color: "#4285F4" },
  { name: "FastAPI", color: "#009688" },
  { name: "WebXR", color: "#9B59B6" },
  { name: "Three.js", color: "#049EF4" },
  { name: "Zustand", color: "#443D3A" },
  { name: "Recharts", color: "#22B5BF" },
  { name: "Framer Motion", color: "#E91E63" },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", overflow: "hidden" }}>
      {/* ─── Navbar ─── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: scrollY > 50 ? "rgba(247, 247, 248, 0.85)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
          borderBottom: scrollY > 50 ? "1px solid var(--color-border)" : "none",
          transition: "all 0.3s ease",
        }}
        id="landing-nav"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
            }}
          >
            H
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: 18,
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            HoloCoach AI
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link
            href="/dashboard"
            className="btn btn-secondary btn-sm"
            id="nav-login"
          >
            Log In
          </Link>
          <Link
            href="/dashboard"
            className="btn btn-primary btn-sm"
            id="nav-get-started"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section
        style={{
          position: "relative",
          paddingTop: "160px",
          paddingBottom: "100px",
          textAlign: "center",
          overflow: "hidden",
        }}
        id="hero"
      >
        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(74, 144, 226, 0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
          className="animate-float-slow"
        />
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(111, 207, 151, 0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
          className="animate-float"
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "30%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(155, 89, 182, 0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
          className="animate-float-slow"
        />

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "0 24px",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 16px",
              borderRadius: "var(--radius-full)",
              background: "rgba(74, 144, 226, 0.08)",
              border: "1px solid rgba(74, 144, 226, 0.15)",
              marginBottom: "24px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--color-primary)",
            }}
          >
            <HiOutlineShieldCheck size={14} />
            AI-Powered Sports Coaching Platform
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            Your AI Coach,{" "}
            <span className="gradient-text">Everywhere</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "var(--color-text-secondary)",
              maxWidth: "640px",
              margin: "0 auto 36px",
              lineHeight: 1.7,
              fontWeight: 400,
            }}
          >
            Real-time pose detection, biomechanics analysis, and personalized
            AI coaching across{" "}
            <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>
              10+ sports
            </strong>
            . Train smarter with instant feedback at 30 FPS.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginBottom: "40px",
            }}
          >
            <Link
              href="/dashboard"
              className="btn btn-primary btn-lg"
              id="hero-cta-primary"
              style={{ fontSize: "1.0625rem" }}
            >
              <HiOutlinePlay size={20} />
              Start Training
              <HiOutlineArrowRight size={16} />
            </Link>
            <Link
              href="/session"
              className="btn btn-secondary btn-lg"
              id="hero-cta-demo"
              style={{ fontSize: "1.0625rem" }}
            >
              <HiOutlineVideoCamera size={20} />
              Live Demo
            </Link>
          </div>

          {/* Tech Stack Chips */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "48px",
            }}
          >
            {TECH_STACK.map((tech) => (
              <span
                key={tech.name}
                style={{
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  background: "rgba(0,0,0,0.03)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>

        {/* Skeleton Preview */}
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.95)",
            transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
          }}
        >
          <div
            className="glass-card-static"
            style={{
              padding: "32px",
              borderRadius: "var(--radius-xl)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "16px",
                display: "flex",
                gap: "6px",
              }}
            >
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
                  fontSize: "0.6875rem",
                  color: "var(--color-text-muted)",
                }}
              >
                LIVE · 30 FPS
              </span>
            </div>
            <SkeletonAnimation width={320} height={320} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "8px",
              }}
            >
              {[
                { label: "Posture", val: "92", color: "#6FCF97" },
                { label: "Balance", val: "87", color: "#4A90E2" },
                { label: "Form", val: "95", color: "#9B59B6" },
              ].map((m) => (
                <div key={m.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: "1.25rem",
                      color: m.color,
                    }}
                  >
                    {m.val}
                  </div>
                  <div
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--color-text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section
        style={{
          padding: "48px 40px",
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
        id="stats"
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "32px",
            textAlign: "center",
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "2.25rem",
                  fontWeight: 800,
                  color: "var(--color-primary)",
                  lineHeight: 1.1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  marginTop: "4px",
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section
        style={{
          padding: "100px 40px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
        id="features"
      >
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Powered by cutting-edge AI
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-text-secondary)",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            From pose estimation to AR coaching, every feature is designed to
            elevate your training.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass-card-glow"
              style={{
                padding: "32px",
                cursor: "default",
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "var(--radius-md)",
                  background: f.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: f.color,
                  marginBottom: "16px",
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Multi-Sport Showcase ─── */}
      <section
        style={{
          padding: "80px 40px",
          background: "linear-gradient(180deg, transparent, rgba(74, 144, 226, 0.03), transparent)",
        }}
        id="sports"
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            10 sports, one platform
          </h2>
          <p
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-text-secondary)",
              maxWidth: "540px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Each sport has custom ideal angles, scoring weights, movement
            templates, and AI coaching tips.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {SPORTS_SHOWCASE.map((sport) => (
              <div
                key={sport.name}
                className="glass-card"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "100px",
                }}
              >
                <span style={{ fontSize: "2rem" }}>{sport.icon}</span>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: sport.color,
                  }}
                >
                  {sport.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section
        style={{ padding: "80px 40px", maxWidth: "1000px", margin: "0 auto" }}
        id="how-it-works"
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            How it works
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {[
            {
              step: "01",
              title: "Choose Your Sport",
              desc: "Select from 10 supported sports with customized biomechanics analysis.",
              icon: <HiOutlineGlobe size={24} />,
              color: "#4A90E2",
            },
            {
              step: "02",
              title: "Train with AI",
              desc: "Start a live session or upload a video. Our AI analyzes every frame in real-time.",
              icon: <HiOutlineVideoCamera size={24} />,
              color: "#6FCF97",
            },
            {
              step: "03",
              title: "Improve & Track",
              desc: "Get instant feedback, track progress with deep analytics, and consult expert coaches.",
              icon: <HiOutlineTrendingUp size={24} />,
              color: "#F2994A",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="glass-card-static"
              style={{
                padding: "32px 28px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  fontFamily: "var(--font-heading)",
                  fontSize: "5rem",
                  fontWeight: 800,
                  color: "rgba(0,0,0,0.03)",
                  lineHeight: 1,
                }}
              >
                {item.step}
              </div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: `${item.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: item.color,
                }}
              >
                {item.icon}
              </div>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section
        style={{
          padding: "80px 40px",
          textAlign: "center",
        }}
        id="cta"
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "56px 48px",
            borderRadius: "var(--radius-xl)",
            background:
              "linear-gradient(135deg, rgba(74, 144, 226, 0.06), rgba(111, 207, 151, 0.06))",
            border: "1px solid rgba(74, 144, 226, 0.12)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30%",
              right: "-20%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(74, 144, 226, 0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.75rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Ready to train smarter?
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--color-text-secondary)",
              marginBottom: "28px",
              lineHeight: 1.7,
            }}
          >
            Join thousands of athletes using AI-powered coaching to push their
            limits. Free to start, no credit card required.
          </p>
          <Link
            href="/dashboard"
            className="btn btn-primary btn-lg"
            id="cta-start"
          >
            Get Started Free
            <HiOutlineArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        style={{
          padding: "32px 40px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            H
          </div>
          <span>© 2026 HoloCoach AI. All rights reserved.</span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          <span style={{ cursor: "pointer" }}>Privacy</span>
          <span style={{ cursor: "pointer" }}>Terms</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-text-muted)" }}
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
