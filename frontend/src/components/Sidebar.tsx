"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  Users,
  CheckSquare,
  HelpCircle,
  Radio,
  Award,
  Package,
  FileText,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const civilianNav: NavItem[] = [
  { label: "Dashboard", href: "/civilian", icon: <LayoutDashboard size={18} /> },
  { label: "My SOS Requests", href: "/civilian/sos", icon: <Radio size={18} /> },
  { label: "Report Disaster", href: "/civilian/report", icon: <AlertTriangle size={18} /> },
];

const volunteerNav: NavItem[] = [
  { label: "Dashboard", href: "/volunteer", icon: <LayoutDashboard size={18} /> },
  { label: "My Tasks", href: "/volunteer/tasks", icon: <CheckSquare size={18} /> },
  { label: "My Certificates", href: "/volunteer/certificates", icon: <Award size={18} /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Manage Disasters", href: "/admin/disasters", icon: <AlertTriangle size={18} /> },
  { label: "Manage Volunteers", href: "/admin/volunteers", icon: <Users size={18} /> },
  { label: "Manage Tasks", href: "/admin/tasks", icon: <CheckSquare size={18} /> },
  { label: "Help Requests", href: "/admin/help-requests", icon: <HelpCircle size={18} /> },
  { label: "SOS Center", href: "/admin/sos", icon: <Radio size={18} /> },
  { label: "Certificates", href: "/admin/certificates", icon: <Award size={18} /> },
  { label: "Asset Inventory", href: "/admin/assets", icon: <Package size={18} /> },
];

interface SidebarProps {
  role: "civilian" | "volunteer" | "admin";
  userName?: string;
}

export default function Sidebar({ role, userName = "User" }: SidebarProps) {
  const pathname = usePathname();

  const navItems =
    role === "civilian"
      ? civilianNav
      : role === "volunteer"
      ? volunteerNav
      : adminNav;

  const roleLabels = {
    civilian: "Civilian Portal",
    volunteer: "Volunteer Portal",
    admin: "Admin Command",
  };

  const roleColors = {
    civilian: "#90c8ff",
    volunteer: "#6dffb3",
    admin: "#ffb3ad",
  };

  return (
    <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <div
        style={{
          padding: "1.5rem 1.25rem",
          borderBottom: "1px solid rgba(255,179,173,0.06)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #ff5450, #ffb3ad)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Shield size={17} color="#fff" />
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "var(--on-background)",
                lineHeight: 1.2,
              }}
            >
              Relief<span style={{ color: "var(--primary-container)" }}>Connect</span>
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: roleColors[role],
                lineHeight: 1,
              }}
            >
              {roleLabels[role]}
            </div>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <span style={{ color: isActive ? "var(--primary)" : "var(--outline)" }}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <ChevronRight
                  size={14}
                  style={{ marginLeft: "auto", color: "var(--primary)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(255,179,173,0.06)",
          padding: "1rem 1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary-container), var(--primary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--on-background)",
              }}
            >
              {userName}
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--outline)",
                textTransform: "capitalize",
              }}
            >
              {role}
            </div>
          </div>
          <Bell
            size={16}
            style={{ marginLeft: "auto", color: "var(--outline)", cursor: "pointer" }}
          />
        </div>
        <Link
          href="/login"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--outline)",
            textDecoration: "none",
            fontSize: "0.8rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius-md)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-container-high)";
            (e.currentTarget as HTMLElement).style.color = "var(--error)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--outline)";
          }}
        >
          <LogOut size={15} />
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
