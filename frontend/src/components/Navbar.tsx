"use client";

import Link from "next/link";
import { useState } from "react";
import { Shield, Menu, X, ChevronRight } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="navbar-glass fixed top-0 left-0 right-0 z-50"
      style={{ padding: "0 1.5rem" }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
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
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #ff5450, #ffb3ad)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={20} color="#fff" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--on-background)",
              letterSpacing: "-0.01em",
            }}
          >
            Relief<span style={{ color: "var(--primary-container)" }}>Connect</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
          className="hidden-mobile"
        >
          {["Home", "About", "How It Works", "Contact"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              style={{
                color: "var(--on-surface-variant)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--on-background)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color =
                  "var(--on-surface-variant)")
              }
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link href="/login" className="btn-ghost" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
            Login
          </Link>
          <Link href="/register" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
            Join Now <ChevronRight size={14} />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            style={{
              background: "none",
              border: "none",
              color: "var(--on-background)",
              cursor: "pointer",
              display: "none",
              padding: "0.25rem",
            }}
            className="mobile-menu-btn"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            background: "var(--surface-container-low)",
            borderTop: "1px solid rgba(255,179,173,0.08)",
            padding: "1rem 1.5rem",
          }}
        >
          {["Home", "About", "How It Works", "Contact"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              style={{
                display: "block",
                color: "var(--on-surface-variant)",
                textDecoration: "none",
                padding: "0.625rem 0",
                borderBottom: "none",
              }}
              onClick={() => setOpen(false)}
            >
              {item}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
