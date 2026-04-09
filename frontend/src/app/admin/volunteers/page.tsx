"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Volunteer = {
  id: number;
  user_id: number;
  skills: string | null;
  experience_years: number;
  zone: string | null;
  availability_status: "available" | "busy" | "offline" | "AVAILABLE" | "BUSY" | "OFFLINE";
  verified: number | boolean;
  missions_count?: number;
  created_at: string;
  user: { name: string; email: string; phone?: string; avatar_url?: string };
  availability?: string;
};

type Disaster = {
  id: number;
  title: string;
  location: string;
  status: string;
};

// ─── Shared Admin Nav ──────────────────────────────────────────────────────────
function AdminNav({ active }: { active: string }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const links = [
    { label: "Dashboard",    href: "/admin" },
    { label: "Disasters",    href: "/admin/disasters" },
    { label: "Volunteers",   href: "/admin/volunteers" },
    { label: "SOS Requests", href: "/admin/sos" },
    { label: "Tasks",        href: "/admin/tasks" },
    { label: "Assets",       href: "/admin/assets" },
    { label: "Certificates", href: "/admin/certificates" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0d131f]/95 backdrop-blur-xl border-b border-[#ffb3ad]/10">
      <div className="px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(229,62,62,0.2)]">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>shield</span>
          </div>
          <div>
            <span className="text-xl font-black text-[#E53E3E] font-['Space_Grotesk'] tracking-tighter uppercase block leading-none">ReliefConnect</span>
            <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.15em]">Command Center</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
          {links.map(link => (
            <button key={link.label} onClick={() => router.push(link.href)}
              className={`px-3 py-2 font-black text-[10px] tracking-[0.12em] uppercase transition-all rounded-lg hover:text-primary hover:bg-primary/5 ${active === link.href ? "text-primary border-b-2 border-primary" : "text-on-surface/60"}`}>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => router.push("/admin")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-[0_4px_16px_rgba(229,62,62,0.3)] hover:brightness-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span className="hidden sm:inline">New Dispatch</span>
          </button>

          <div className="h-8 w-px bg-[#ffb3ad]/10" />

          <button className="relative text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-[#0d131f]" />
          </button>

          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-[#ffb3ad] leading-none">{user?.name?.toUpperCase() || "ADMIN"}</p>
                <p className="text-[9px] text-on-surface-variant tracking-wider">Global Overseer</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm overflow-hidden">
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase() || "A"}
              </div>
            </button>

            {profileOpen && (
              <div className="absolute top-12 right-0 w-60 bg-[#0e1420] border border-[#ffb3ad]/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-[200]"
                onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-[#ffb3ad]/10">
                  <p className="text-sm font-black text-white">{user?.name || "Admin"}</p>
                  <p className="text-[10px] text-[#ffb3ad] font-bold uppercase tracking-widest">Global Overseer</p>
                </div>
                <div className="px-2 py-2 space-y-1">
                  {[
                    { label: "Admin Profile", icon: "manage_accounts", href: "/admin/profile" },
                    { label: "Dashboard", icon: "dashboard", href: "/admin" },
                  ].map(item => (
                    <button key={item.label} onClick={() => { setProfileOpen(false); router.push(item.href); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-white transition-colors text-left">
                      <span className="material-symbols-outlined text-sm">{item.icon}</span>
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="px-2 pb-2">
                  <button onClick={() => { logout(); router.push("/login"); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-error border border-error/20 hover:bg-error/10 transition-all">
                    <span className="material-symbols-outlined text-sm">logout</span> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Register Volunteer Modal ──────────────────────────────────────────────────
function RegisterVolunteerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    skills: "", experience_years: "0", zone: "",
    availability: "available" as "available" | "busy" | "offline",
  });
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Name, email, and password are required."); return; }
    setSubmitting(true); setError("");
    try {
      // Step 1: Register user
      const regRes = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone, role: "volunteer" }),
      });

      // Step 2: Update volunteer profile with skills/zone
      if (form.skills || form.zone || form.experience_years !== "0") {
        const userId = regRes?.data?.user?.id || regRes?.data?.id;
        if (userId) {
          await fetchApi(`/volunteers/${userId}`, {
            method: "PUT",
            body: JSON.stringify({
              skills: form.skills || null,
              experience_years: Number(form.experience_years),
              zone: form.zone || null,
              availability: form.availability,
            }),
          });
        }
      }
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to register volunteer");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-xl bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between sticky top-0 bg-[#0e1420] z-10"
          style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.08), #0e1420)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>person_add</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">Register Volunteer</h2>
              <div className="flex gap-2 mt-1">
                {[1, 2].map(s => (
                  <div key={s} className={`h-1 rounded-full transition-all ${s === step ? "w-8 bg-primary" : s < step ? "w-4 bg-green-400" : "w-4 bg-surface-container-high"}`} />
                ))}
              </div>
            </div>
          </div>
          <button onClick={onClose} disabled={submitting}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {success ? (
          <div className="px-8 py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            </div>
            <p className="text-lg font-black text-white uppercase">Volunteer Registered!</p>
            <p className="text-sm text-on-surface-variant">The operative has been added to the registry.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {step === 1 ? (
              <>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Step 1 of 2 — Account Credentials</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Full Name <span className="text-error">*</span></label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Full operative name"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Email <span className="text-error">*</span></label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="operative@relief.ops"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Password <span className="text-error">*</span></label>
                  <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
                  <button type="button" onClick={() => { if (!form.name || !form.email || !form.password) { setError("Name, email and password required"); return; } setError(""); setStep(2); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                    Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Step 2 of 2 — Operative Profile</p>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Skills / Specializations</label>
                  <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                    placeholder="Medical, Rescue, Logistics, Communications..."
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Zone / Region</label>
                    <input value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                      placeholder="Zone B-4, Northern Sector..."
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Experience (years)</label>
                    <input type="number" min="0" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Initial Availability</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["available", "busy", "offline"] as const).map(a => (
                      <button key={a} type="button" onClick={() => setForm(f => ({ ...f, availability: a }))} disabled={submitting}
                        className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${form.availability === a ? "bg-primary/15 text-primary border-primary/30" : "bg-surface-container/50 text-on-surface-variant border-outline-variant/10"}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
                    <span className="material-symbols-outlined text-sm text-error">error</span>
                    <p className="text-sm text-error font-bold">{error}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">
                    <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>Back
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                    {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</>
                      : <><span className="material-symbols-outlined text-sm">person_add</span> Register</>}
                  </button>
                </div>
              </>
            )}
            {step === 1 && error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
                <span className="material-symbols-outlined text-sm text-error">error</span>
                <p className="text-sm text-error font-bold">{error}</p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Profile Drawer ────────────────────────────────────────────────────────────
function ProfileDrawer({ volunteer, onClose, onVerify }: { volunteer: Volunteer; onClose: () => void; onVerify: (v: Volunteer) => void }) {
  const avail = (volunteer.availability_status || volunteer.availability || "offline").toLowerCase();
  const isVerified = Number(volunteer.verified) === 1 || volunteer.verified === true;
  const skills = volunteer.skills?.split(",").map(s => s.trim()).filter(Boolean) || [];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md h-full bg-[#0e1420] border-l border-[#ffb3ad]/15 overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0e1420]/95 backdrop-blur-xl px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between z-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Operative Profile</h2>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">close</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar + Name */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl font-black text-primary flex-shrink-0 overflow-hidden">
              {volunteer.user.avatar_url
                ? <img src={volunteer.user.avatar_url} alt="" className="w-full h-full object-cover" />
                : volunteer.user.name?.[0]?.toUpperCase() || "V"}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-white leading-tight">{volunteer.user.name}</h3>
              <p className="text-xs font-mono text-primary mt-0.5">VOL-{String(volunteer.user_id).padStart(4, "0")}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                  avail === "available" ? "bg-green-500/15 text-green-400 border-green-500/30"
                  : avail === "busy" ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                  : "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${avail === "available" ? "bg-green-400 animate-pulse" : avail === "busy" ? "bg-orange-400" : "bg-gray-500"}`} />
                  {avail}
                </span>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="divide-y divide-outline-variant/10 rounded-xl border border-outline-variant/10 overflow-hidden">
            {[
              { label: "Email", value: volunteer.user.email },
              { label: "Phone", value: volunteer.user.phone || "—" },
              { label: "Zone", value: volunteer.zone || "—" },
              { label: "Experience", value: `${volunteer.experience_years || 0} year(s)` },
              { label: "Missions", value: volunteer.missions_count?.toString() || "0" },
            ].map(item => (
              <div key={item.label} className="px-4 py-3 flex justify-between items-center bg-surface-container-low">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{item.label}</span>
                <span className="text-xs font-bold text-white max-w-[60%] text-right truncate">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Skills & Specializations</p>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isVerified && (
            <button onClick={() => onVerify(volunteer)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 bg-blue-600 hover:brightness-110">
              <span className="material-symbols-outlined text-sm">verified</span>
              Verify This Operative
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Assign Task Modal ────────────────────────────────────────────────────────
function AssignTaskModal({ volunteer, onClose, onSuccess }: { volunteer: Volunteer; onClose: () => void; onSuccess: () => void }) {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [form, setForm] = useState({ title: "", description: "", disaster_id: "", due_date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchApi("/disasters").then(res => {
      const raw = res?.data;
      const list = Array.isArray(raw) ? raw : (raw?.disasters || []);
      setDisasters(list.filter((d: Disaster) => d.status === "active"));
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.disaster_id) { setError("Title and disaster zone are required."); return; }
    setSubmitting(true); setError("");
    try {
      await fetchApi("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          disaster_id: Number(form.disaster_id),
          volunteer_id: volunteer.id,
          due_date: form.due_date || undefined,
        }),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to assign task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.08), #0e1420)" }}>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight">Assign Task</h2>
            <p className="text-[10px] text-on-surface-variant">→ {volunteer.user.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {success ? (
          <div className="px-8 py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            </div>
            <p className="text-lg font-black text-white uppercase">Task Assigned!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Task Title <span className="text-error">*</span></label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="E.g. Search & Rescue — Zone B Perimeter"
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Mission objectives and notes..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 resize-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Disaster Zone <span className="text-error">*</span></label>
                <select required value={form.disaster_id} onChange={e => setForm(f => ({ ...f, disaster_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors appearance-none">
                  <option value="">Select disaster...</option>
                  {disasters.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Deadline</label>
                <input type="datetime-local" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors" />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
                <span className="material-symbols-outlined text-sm text-error">error</span>
                <p className="text-sm text-error font-bold">{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Assigning...</>
                  : <><span className="material-symbols-outlined text-sm">assignment_add</span> Assign</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Remove Confirm ───────────────────────────────────────────────────────────
function RemoveConfirm({ volunteer, onClose, onSuccess }: { volunteer: Volunteer; onClose: () => void; onSuccess: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleRemove() {
    setDeleting(true);
    try {
      await fetchApi(`/users/${volunteer.user_id}`, { method: "DELETE" });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to remove volunteer");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !deleting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-[#0e1420] border border-error/30 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="px-8 py-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-error/15 border border-error/30 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl text-error" style={{ fontVariationSettings: '"FILL" 1' }}>person_remove</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase">Remove Operative?</h3>
            <p className="text-on-surface-variant text-sm mt-1">This will deactivate <span className="text-white font-bold">{volunteer.user.name}</span>'s account. This action cannot be undone.</p>
          </div>
          {error && <p className="text-error text-xs font-bold">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={deleting} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
            <button onClick={handleRemove} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-error hover:brightness-110 disabled:opacity-60 transition-all active:scale-95">
              {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Removing...</>
                : <><span className="material-symbols-outlined text-sm">delete</span> Confirm Remove</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [availFilter, setAvailFilter] = useState("all");
  const [skillsFilter, setSkillsFilter] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [zoneFilter, setZoneFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modals
  const [registerModal, setRegisterModal] = useState(false);
  const [profileVolunteer, setProfileVolunteer] = useState<Volunteer | null>(null);
  const [assignVolunteer, setAssignVolunteer] = useState<Volunteer | null>(null);
  const [removeVolunteer, setRemoveVolunteer] = useState<Volunteer | null>(null);

  const loadVolunteers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/volunteers");
      const raw = res?.data;
      const list = Array.isArray(raw) ? raw : (raw?.volunteers || []);
      setVolunteers(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadVolunteers(); }, [loadVolunteers]);

  // Handle verify
  async function handleVerify(v: Volunteer) {
    try {
      await fetchApi(`/volunteers/${v.user_id}/verify`, { method: "PUT", body: JSON.stringify({ verified: true }) });
      loadVolunteers();
    } catch (e) { console.error(e); }
  }

  // Unique zones + skills for dropdowns
  const allZones = useMemo(() => {
    const z = new Set(volunteers.map(v => v.zone).filter(Boolean));
    return Array.from(z) as string[];
  }, [volunteers]);

  const allSkills = useMemo(() => {
    const s = new Set<string>();
    volunteers.forEach(v => v.skills?.split(",").forEach(sk => { if (sk.trim()) s.add(sk.trim()); }));
    return Array.from(s).sort();
  }, [volunteers]);

  // Filter
  const filtered = useMemo(() => {
    return volunteers.filter(v => {
      const avail = (v.availability_status || v.availability || "").toLowerCase();
      if (search) {
        const q = search.toLowerCase();
        if (!v.user.name?.toLowerCase().includes(q) && !v.user.email?.toLowerCase().includes(q) && !String(v.user_id).includes(q)) return false;
      }
      if (availFilter !== "all" && avail !== availFilter) return false;
      if (skillsFilter !== "all") {
        const volSkills = (v.skills || "").toLowerCase();
        if (!volSkills.includes(skillsFilter.toLowerCase())) return false;
      }
      if (verifiedOnly && Number(v.verified) !== 1 && v.verified !== true) return false;
      if (zoneFilter !== "all" && v.zone !== zoneFilter) return false;
      return true;
    });
  }, [volunteers, search, availFilter, skillsFilter, verifiedOnly, zoneFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: volunteers.length,
    available: volunteers.filter(v => (v.availability_status || v.availability || "").toLowerCase() === "available").length,
    busy: volunteers.filter(v => (v.availability_status || v.availability || "").toLowerCase() === "busy").length,
    verified: volunteers.filter(v => Number(v.verified) === 1 || v.verified === true).length,
  }), [volunteers]);

  return (
    <>
      {registerModal && <RegisterVolunteerModal onClose={() => setRegisterModal(false)} onSuccess={loadVolunteers} />}
      {profileVolunteer && <ProfileDrawer volunteer={profileVolunteer} onClose={() => setProfileVolunteer(null)} onVerify={v => { setProfileVolunteer(null); handleVerify(v); }} />}
      {assignVolunteer && <AssignTaskModal volunteer={assignVolunteer} onClose={() => setAssignVolunteer(null)} onSuccess={loadVolunteers} />}
      {removeVolunteer && <RemoveConfirm volunteer={removeVolunteer} onClose={() => setRemoveVolunteer(null)} onSuccess={loadVolunteers} />}

      <AdminNav active="/admin/volunteers" />

      <main className="min-h-screen bg-[#0b0f16] text-on-surface">
        <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-primary font-black uppercase tracking-widest text-[10px] mb-1">FIELD OPERATIVE REGISTRY</p>
              <h1 className="text-4xl font-black tracking-tight uppercase font-['Space_Grotesk'] text-white">Volunteer Management</h1>
              <p className="text-on-surface-variant text-sm mt-1 max-w-xl">Monitor active personnel, verify credentials, and deploy field operatives to disaster zones.</p>
            </div>
            <button onClick={() => setRegisterModal(true)}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(229,62,62,0.3)] hover:brightness-110 shrink-0"
              style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
              <span className="material-symbols-outlined">person_add</span>
              REGISTER VOLUNTEER
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Volunteers", value: stats.total, badge: "TOTAL", color: "#ffb3ad", icon: "groups" },
              { label: "Available", value: stats.available, badge: "READY", color: "#4ade80", icon: "event_available" },
              { label: "Busy / On Mission", value: stats.busy, badge: "ENGAGED", color: "#ff8c42", icon: "work_history" },
              { label: "Verified", value: stats.verified, badge: "AUTH CLEARED", color: "#60a5fa", icon: "verified" },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-low p-5 rounded-xl border-l-4 relative overflow-hidden" style={{ borderLeftColor: s.color }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">{s.label}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded" style={{ color: s.color, background: `${s.color}18` }}>{s.badge}</span>
                </div>
                <span className="text-3xl font-black text-white font-['Space_Grotesk']">{loading ? "—" : s.value.toLocaleString()}</span>
                <div className="absolute -bottom-2 -right-2 opacity-5">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1", color: s.color }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="flex flex-wrap items-center divide-x divide-outline-variant/10">
              {/* Search */}
              <div className="flex-1 min-w-[220px] relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                <input className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  placeholder="Search by name, ID, or email..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>

              {/* Availability */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[160px]"
                value={availFilter} onChange={e => { setAvailFilter(e.target.value); setPage(1); }}>
                <option value="all">Availability: All</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>

              {/* Skills */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[140px]"
                value={skillsFilter} onChange={e => { setSkillsFilter(e.target.value); setPage(1); }}>
                <option value="all">Skills: All</option>
                {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Zone */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[150px]"
                value={zoneFilter} onChange={e => { setZoneFilter(e.target.value); setPage(1); }}>
                <option value="all">Zone: Global</option>
                {allZones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>

              {/* Verified Toggle */}
              <button onClick={() => { setVerifiedOnly(!verifiedOnly); setPage(1); }}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container-high transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant whitespace-nowrap">Verified Only</span>
                <div className={`w-9 h-5 rounded-full transition-colors relative ${verifiedOnly ? "bg-blue-500" : "bg-surface-container-high"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${verifiedOnly ? "left-4" : "left-0.5"}`} />
                </div>
              </button>

              {/* Clear */}
              {(search || availFilter !== "all" || skillsFilter !== "all" || zoneFilter !== "all" || verifiedOnly) && (
                <button onClick={() => { setSearch(""); setAvailFilter("all"); setSkillsFilter("all"); setZoneFilter("all"); setVerifiedOnly(false); setPage(1); }}
                  className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-error hover:bg-error/10 transition-colors">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant/15">
                    {["Operative", "Contact Info", "Skills", "Zone", "Availability", "Verified", "Missions", "Actions"].map((h, i) => (
                      <th key={h} className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-on-surface-variant ${i === 7 ? "text-right" : ""} ${i === 4 || i === 5 || i === 6 ? "text-center" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-container-high rounded w-3/4" /></td>
                        ))}
                      </tr>
                    ))
                  ) : error ? (
                    <tr><td colSpan={8} className="px-5 py-12 text-center text-error font-bold">{error}</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={8} className="px-5 py-16 text-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">person_search</span>
                      <p className="text-on-surface-variant text-sm font-bold">No volunteers match your filters</p>
                    </td></tr>
                  ) : (
                    paginated.map(v => {
                      const avail = (v.availability_status || v.availability || "offline").toLowerCase();
                      const isVerified = Number(v.verified) === 1 || v.verified === true;
                      const skills = v.skills?.split(",").map(s => s.trim()).filter(Boolean) || [];

                      return (
                        <tr key={v.id} className="hover:bg-surface-container-high/20 transition-colors">
                          {/* Operative */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm flex-shrink-0 overflow-hidden">
                                {v.user.avatar_url
                                  ? <img src={v.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                  : v.user.name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-black text-white">{v.user.name}</div>
                                <div className="text-[10px] font-mono text-primary/70">VOL-{String(v.user_id).padStart(4, "0")}</div>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-5 py-4">
                            <div className="text-xs text-on-surface-variant">{v.user.email}</div>
                            {v.user.phone && <div className="text-[10px] text-on-surface-variant/50 mt-0.5">{v.user.phone}</div>}
                          </td>

                          {/* Skills */}
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {skills.slice(0, 2).map(s => (
                                <span key={s} className="px-2 py-0.5 text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/15 rounded">{s}</span>
                              ))}
                              {skills.length > 2 && <span className="text-[9px] text-on-surface-variant">+{skills.length - 2}</span>}
                              {skills.length === 0 && <span className="text-[10px] text-on-surface-variant">—</span>}
                            </div>
                          </td>

                          {/* Zone */}
                          <td className="px-5 py-4 text-xs text-on-surface-variant">{v.zone || "—"}</td>

                          {/* Availability */}
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                              avail === "available" ? "bg-green-500/15 text-green-400 border-green-500/30"
                              : avail === "busy" ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                              : "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${avail === "available" ? "bg-green-400 animate-pulse" : avail === "busy" ? "bg-orange-400" : "bg-gray-500"}`} />
                              {avail}
                            </span>
                          </td>

                          {/* Verified */}
                          <td className="px-5 py-4 text-center">
                            {isVerified
                              ? <span className="material-symbols-outlined text-blue-400 text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                              : <span className="material-symbols-outlined text-on-surface-variant/25 text-xl">verified</span>}
                          </td>

                          {/* Missions */}
                          <td className="px-5 py-4 text-center font-black text-white">{v.missions_count ?? 0}</td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setProfileVolunteer(v)}
                                className="p-2 rounded-lg hover:bg-primary/15 transition-all text-on-surface-variant hover:text-primary" title="View Profile">
                                <span className="material-symbols-outlined text-xl">person</span>
                              </button>
                              <button onClick={() => setAssignVolunteer(v)}
                                className="p-2 rounded-lg hover:bg-yellow-500/10 transition-all text-on-surface-variant hover:text-yellow-400" title="Assign Task">
                                <span className="material-symbols-outlined text-xl">assignment_add</span>
                              </button>
                              <button onClick={() => setRemoveVolunteer(v)}
                                className="p-2 rounded-lg hover:bg-error/15 transition-all text-on-surface-variant hover:text-error" title="Remove">
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-surface-container/50 border-t border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} operatives
              </span>
              <div className="flex gap-1.5 items-center">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg bg-surface-container hover:bg-primary/20 transition-colors text-on-surface-variant disabled:opacity-30">
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-black transition-colors ${p === page ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-primary/20"}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg bg-surface-container hover:bg-primary/20 transition-colors text-on-surface-variant disabled:opacity-30">
                  <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}