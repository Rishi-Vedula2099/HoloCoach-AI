"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome, HiOutlineVideoCamera, HiOutlineCloudUpload,
  HiOutlineCube, HiOutlineChartBar, HiOutlineCog, HiOutlineUser,
  HiOutlinePhone, HiOutlineLogout,
} from "react-icons/hi";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: HiOutlineHome },
  { label: "Live Session", href: "/session", icon: HiOutlineVideoCamera },
  { label: "Upload Video", href: "/upload", icon: HiOutlineCloudUpload },
  { label: "Consultation", href: "/consultation", icon: HiOutlinePhone },
  { label: "AR Mode", href: "/ar-mode", icon: HiOutlineCube },
];

const secondaryItems = [
  { label: "Analytics", href: "/analytics", icon: HiOutlineChartBar },
  { label: "Profile", href: "/profile", icon: HiOutlineUser },
  { label: "Settings", href: "/settings", icon: HiOutlineCog },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" id="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">H</div>
        <span className="sidebar-logo-text">HoloCoach AI</span>
      </div>

      {/* Primary Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Training</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? "active" : ""}`} id={`nav-${item.href.replace("/", "")}`}>
              <span className="sidebar-link-icon"><item.icon size={20} /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="sidebar-section-label" style={{ marginTop: "8px" }}>Account</div>
        {secondaryItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? "active" : ""}`} id={`nav-${item.href.replace("/", "")}`}>
              <span className="sidebar-link-icon"><item.icon size={20} /></span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Section */}
      <div style={{ padding: "16px 8px", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>
          AJ
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar-logo-text" style={{ fontSize: "13px", background: "none", WebkitTextFillColor: "var(--color-text)", color: "var(--color-text)", fontWeight: 600, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Alex Johnson
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 400 }}>Pro Plan</div>
        </div>
        <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28, flexShrink: 0 }} title="Logout">
          <HiOutlineLogout size={14} />
        </button>
      </div>
    </aside>
  );
}
