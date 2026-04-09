"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type EditableField = "name" | "phone" | "location";

const STAT_CARDS = [
  { label: "SOS Requests", icon: "sos", color: "#f87171" },
  { label: "Resolved", icon: "check_circle", color: "#4ade80" },
  { label: "Reports Filed", icon: "campaign", color: "#ff8c42" },
];

export default function CivilianProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [formValues, setFormValues] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.name || "Civilian User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleEditSave(field: EditableField) {
    if (editing === field) {
      // save logic would go here (API call)
      setEditing(null);
    } else {
      setEditing(field);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0d131f]/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-white/5 shadow-[0_0_20px_rgba(255,179,173,0.06)]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/civilian/dashboard")}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="hidden sm:block text-xs font-bold uppercase tracking-widest">Dashboard</span>
          </button>
          <div className="hidden sm:block h-5 w-px bg-outline-variant/30" />
          <span className="hidden sm:block text-xl font-black tracking-tighter text-primary font-['Space_Grotesk'] uppercase">ReliefConnect</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
          <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Civilian Profile</span>
        </div>
      </nav>

      <main className="pt-20 pb-16 min-h-screen bg-background text-on-background">
        {/* Profile Hero */}
        <div className="relative overflow-hidden border-b border-outline-variant/10">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(255,179,173,0.07) 0%, transparent 60%)" }}
          />
          {/* Subtle grid lines */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl border-2 border-primary/30 overflow-hidden bg-surface-container-high flex items-center justify-center shadow-[0_0_30px_rgba(255,179,173,0.15)]">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-primary font-['Space_Grotesk']">{initials}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              {/* Name + Status */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-['Space_Grotesk'] text-on-surface uppercase">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 self-center sm:self-auto px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Verified Civilian</span>
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm">{user?.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-1">
                  <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-primary">shield</span>
                    Civilian Portal Access
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-green-400">circle</span>
                    Active Account
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-error/25 text-error text-xs font-black uppercase tracking-widest hover:bg-error/10 transition-all self-start"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Stats + Quick Actions */}
          <div className="space-y-5">
            {/* Activity Stats */}
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant/10">
                <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Activity Overview</h2>
              </div>
              <div className="divide-y divide-outline-variant/8">
                {STAT_CARDS.map((s) => (
                  <div key={s.label} className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: s.color + "18" }}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ color: s.color, fontVariationSettings: '"FILL" 1' }}>
                          {s.icon}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">{s.label}</span>
                    </div>
                    <span className="text-2xl font-black text-on-surface font-['Space_Grotesk']">—</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant/10">
                <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Quick Access</h2>
              </div>
              <div className="divide-y divide-outline-variant/8">
                {[
                  { label: "My SOS Requests", icon: "sos", href: "/civilian/sos", color: "#f87171" },
                  { label: "Active Disasters", icon: "warning", href: "/civilian/dashboard", color: "#ff8c42" },
                  { label: "Report a Disaster", icon: "campaign", href: "/civilian/report", color: "#ffb3ad" },
                  { label: "Relief Resources", icon: "inventory_2", href: "/civilian/resources", color: "#60a5fa" },
                ].map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => router.push(link.href)}
                    className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-surface-container/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-sm" style={{ color: link.color }}>{link.icon}</span>
                      <span className="text-sm font-bold text-on-surface">{link.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                  <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Personal Information</h2>
                </div>
              </div>
              <div className="divide-y divide-outline-variant/8">
                {/* Name */}
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Full Name</p>
                    {editing === "name" ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={formValues.name}
                        onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
                        className="w-full bg-surface-container border border-primary/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Your full name"
                      />
                    ) : (
                      <p className="text-sm font-bold text-on-surface">{formValues.name || "Not set"}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEditSave("name")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border"
                    style={{
                      background: editing === "name" ? "rgba(255,179,173,0.1)" : "rgba(255,255,255,0.04)",
                      borderColor: editing === "name" ? "rgba(255,179,173,0.4)" : "rgba(255,255,255,0.06)",
                      color: editing === "name" ? "#ffb3ad" : "var(--color-on-surface-variant)",
                    }}
                  >
                    <span className="material-symbols-outlined text-sm">{editing === "name" ? "check" : "edit"}</span>
                    {editing === "name" ? "Save" : "Edit"}
                  </button>
                </div>

                {/* Email - read only */}
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Email Address</p>
                    <p className="text-sm font-bold text-on-surface">{user?.email || "Not set"}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Locked
                  </div>
                </div>

                {/* Phone */}
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Phone Number</p>
                    {editing === "phone" ? (
                      <input
                        type="tel"
                        value={formValues.phone}
                        onChange={(e) => setFormValues((v) => ({ ...v, phone: e.target.value }))}
                        className="w-full bg-surface-container border border-primary/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="+91 00000 00000"
                      />
                    ) : (
                      <p className="text-sm font-bold text-on-surface">{formValues.phone || "Not set"}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEditSave("phone")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border"
                    style={{
                      background: editing === "phone" ? "rgba(255,179,173,0.1)" : "rgba(255,255,255,0.04)",
                      borderColor: editing === "phone" ? "rgba(255,179,173,0.4)" : "rgba(255,255,255,0.06)",
                      color: editing === "phone" ? "#ffb3ad" : "var(--color-on-surface-variant)",
                    }}
                  >
                    <span className="material-symbols-outlined text-sm">{editing === "phone" ? "check" : "edit"}</span>
                    {editing === "phone" ? "Save" : "Edit"}
                  </button>
                </div>

                {/* Location */}
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Location / Zone</p>
                    {editing === "location" ? (
                      <input
                        type="text"
                        value={formValues.location}
                        onChange={(e) => setFormValues((v) => ({ ...v, location: e.target.value }))}
                        className="w-full bg-surface-container border border-primary/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                        placeholder="Your city, district or zone"
                      />
                    ) : (
                      <p className="text-sm font-bold text-on-surface">{formValues.location || "Not set"}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEditSave("location")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border"
                    style={{
                      background: editing === "location" ? "rgba(255,179,173,0.1)" : "rgba(255,255,255,0.04)",
                      borderColor: editing === "location" ? "rgba(255,179,173,0.4)" : "rgba(255,255,255,0.06)",
                      color: editing === "location" ? "#ffb3ad" : "var(--color-on-surface-variant)",
                    }}
                  >
                    <span className="material-symbols-outlined text-sm">{editing === "location" ? "check" : "edit"}</span>
                    {editing === "location" ? "Save" : "Edit"}
                  </button>
                </div>

                {/* Role */}
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Account Role</p>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>shield_person</span>
                      <p className="text-sm font-black text-primary uppercase tracking-wider">{user?.role || "Civilian"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-sm">security</span>
                <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Account Security</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-400 text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>lock</span>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Password</p>
                      <p className="text-xs text-on-surface-variant">Last changed: Unknown</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container border border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
                    <div>
                      <p className="text-sm font-bold text-on-surface">Account Status</p>
                      <p className="text-xs text-green-400 font-bold">Verified & Active</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-error/6 rounded-xl border border-error/20 overflow-hidden">
              <div className="px-6 py-5 border-b border-error/15 flex items-center gap-3">
                <span className="material-symbols-outlined text-error text-sm">warning</span>
                <h2 className="text-xs font-black uppercase tracking-widest text-error">Danger Zone</h2>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-sm text-on-surface-variant">Signing out will end your active session. All unsaved data will be lost.</p>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-error border border-error/30 hover:bg-error/10 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Sign Out of ReliefConnect
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative z-10 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 mx-4 max-w-sm w-full shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl text-error">logout</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-on-surface uppercase tracking-tight font-['Space_Grotesk']">Sign Out?</h3>
                <p className="text-sm text-on-surface-variant mt-2">You will be redirected to the login screen and your session will end.</p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-error text-white hover:bg-error/90 transition-all active:scale-95"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
