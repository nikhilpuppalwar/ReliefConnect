"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Disaster = {
  id: number;
  title: string;
  description: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "monitoring" | "resolved";
  location: string;
  reported_by: { name: string } | string | null;
  created_at: string;
  updated_at: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  critical: { label: "CRITICAL", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  high:     { label: "HIGH",     bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
  medium:   { label: "MEDIUM",   bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  low:      { label: "LOW",      bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
};

const STATUS_CONFIG = {
  active:     { label: "Active",     dot: "bg-red-500 animate-pulse", text: "text-red-400" },
  monitoring: { label: "Monitoring", dot: "bg-yellow-500", text: "text-yellow-400" },
  resolved:   { label: "Resolved",   dot: "bg-green-500", text: "text-green-400" },
};

const TYPE_ICONS: Record<string, string> = {
  flood: "water_drop", fire: "local_fire_department", wildfire: "local_fire_department",
  earthquake: "landslide", storm: "thunderstorm", cyclone: "cyclone", tornado: "cyclone",
  drought: "wb_sunny", tsunami: "waves", volcanic: "volcano", landslide: "landslide",
  other: "warning",
};

function getTypeIcon(type: string) {
  const t = type?.toLowerCase() || "other";
  for (const key of Object.keys(TYPE_ICONS)) {
    if (t.includes(key)) return TYPE_ICONS[key];
  }
  return "warning";
}

// ─── Admin shared Nav ─────────────────────────────────────────────────────────
function AdminNav({ active }: { active?: string }) {
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

        {/* Nav links */}
        <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
          {links.map(link => (
            <button key={link.label} onClick={() => router.push(link.href)}
              className={`px-3 py-2 font-black text-[10px] tracking-[0.12em] uppercase transition-all rounded-lg hover:text-primary hover:bg-primary/5 ${
                (active || link.href) === link.href ? "text-primary border-b-2 border-primary" : "text-on-surface/60"
              }`}>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
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
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm">
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-xl object-cover" />
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
                    { label: "Manage Volunteers", icon: "diversity_3", href: "/admin/volunteers" },
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

// ─── Report Incident Modal ────────────────────────────────────────────────────
function ReportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: "", description: "", type: "Flood",
    severity: "high" as "low" | "medium" | "high" | "critical",
    location: "", status: "active" as "active" | "monitoring" | "resolved",
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description) { setError("Title and description are required."); return; }
    setSubmitting(true); setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value as string));
      mediaFiles.forEach(file => formData.append("media", file));

      await fetchApi("/disasters", {
        method: "POST",
        body: formData,
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to report incident");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-2xl bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#ffb3ad]/10 flex items-center justify-between sticky top-0 bg-[#0e1420] z-10"
          style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.08) 0%, #0e1420 60%)" }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>add_location_alt</span>
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight font-['Space_Grotesk']">Report Incident</h2>
              <p className="text-[10px] text-[#ffb3ad]/60">Log a new disaster or emergency event</p>
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
            <p className="text-lg font-black text-white uppercase">Incident Reported!</p>
            <p className="text-sm text-on-surface-variant">The disaster has been logged to the database.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Title <span className="text-error">*</span></label>
              <input required type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="E.g. Western Valley Flash Flood"
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors"
                disabled={submitting} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Description <span className="text-error">*</span></label>
              <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Detailed description of the incident, affected areas, and immediate threats..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 resize-none transition-colors"
                disabled={submitting} />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Disaster Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors appearance-none"
                  disabled={submitting}>
                  {["Flood", "Wildfire", "Earthquake", "Storm", "Cyclone", "Drought", "Tsunami", "Landslide", "Volcanic", "Collapse", "Other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Location</label>
                <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="City, Region, Country"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors"
                  disabled={submitting} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {(["low", "medium", "high", "critical"] as const).map(s => {
                  const sc = SEVERITY_CONFIG[s];
                  const active = form.severity === s;
                  return (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, severity: s }))} disabled={submitting}
                      className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${active ? `${sc.bg} ${sc.text} ${sc.border}` : "bg-surface-container/50 text-on-surface-variant border-outline-variant/10"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Initial Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(["active", "monitoring", "resolved"] as const).map(s => {
                  const sc = STATUS_CONFIG[s];
                  const active = form.status === s;
                  return (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))} disabled={submitting}
                      className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${active ? "bg-primary/15 text-primary border-primary/30" : "bg-surface-container/50 text-on-surface-variant border-outline-variant/10"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Media / Images (Optional)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={e => setMediaFiles(Array.from(e.target.files || []))}
                className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:transition-colors cursor-pointer"
                disabled={submitting}
              />
               {mediaFiles.length > 0 && (
                 <p className="text-[10px] text-on-surface-variant mt-1">{mediaFiles.length} file(s) selected.</p>
               )}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
                <span className="material-symbols-outlined text-sm text-error">error</span>
                <p className="text-sm text-error font-bold">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} disabled={submitting}
                className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Reporting...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">add_location_alt</span> Report Incident</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ disaster, onClose }: { disaster: Disaster; onClose: () => void }) {
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    fetchApi(`/disasters/${disaster.id}`).then(res => {
      setDetails(res.data);
    }).catch(console.error);
  }, [disaster.id]);

  const sc = SEVERITY_CONFIG[disaster.severity] || SEVERITY_CONFIG.medium;
  const stc = STATUS_CONFIG[disaster.status] || STATUS_CONFIG.active;
  const reportedBy = typeof disaster.reported_by === "object" ? disaster.reported_by?.name : disaster.reported_by;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md h-full bg-[#0e1420] border-l border-[#ffb3ad]/15 overflow-y-auto shadow-[0_0_80px_rgba(0,0,0,0.6)]"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[#0e1420]/95 backdrop-blur-xl px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between z-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Incident Detail</h2>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">close</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${sc.bg} ${sc.text} ${sc.border}`}>
              {sc.label} Severity
            </span>
            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${stc.dot}`} />
              <span className={stc.text}>{stc.label}</span>
            </span>
          </div>

          {/* Title */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Disaster ID</p>
            <p className="text-[10px] font-mono text-primary mb-3">#DIS-{String(disaster.id).padStart(4, "0")}</p>
            <h3 className="text-xl font-black text-white leading-tight">{disaster.title}</h3>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Description</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">{disaster.description || "No description provided."}</p>
          </div>

          {/* Info Grid */}
          <div className="divide-y divide-outline-variant/10 rounded-xl border border-outline-variant/10 overflow-hidden">
            {[
              { label: "Type", value: disaster.type },
              { label: "Location", value: disaster.location || "—" },
              { label: "Reported By", value: reportedBy || "Unknown" },
              { label: "Reported On", value: new Date(disaster.created_at).toLocaleString() },
              { label: "Last Updated", value: new Date(disaster.updated_at).toLocaleString() },
            ].map(item => (
              <div key={item.label} className="px-4 py-3 flex justify-between items-center bg-surface-container-low">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{item.label}</span>
                <span className="text-xs font-bold text-white max-w-[60%] text-right">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Media */}
          {details?.media && details.media.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70 mb-2">Attached Media</p>
              <div className="grid grid-cols-2 gap-3">
                {details.media.map((img: any) => (
                  <a key={img.id} href={img.media_url} target="_blank" rel="noreferrer" className="block outline-none hover:scale-105 transition-transform">
                    <img src={img.media_url} alt="Disaster media" className="rounded-xl w-full h-24 object-cover border border-[#ffb3ad]/10 shadow-lg" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ disaster, onClose, onSuccess }: { disaster: Disaster; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: disaster.title,
    description: disaster.description || "",
    type: disaster.type,
    severity: disaster.severity,
    status: disaster.status,
    location: disaster.location || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await fetchApi(`/disasters/${disaster.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: any) {
      setError(err?.message || "Failed to update disaster");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !saving && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-xl bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between sticky top-0 bg-[#0e1420] z-10">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight">Edit Incident</h2>
            <p className="text-[10px] text-on-surface-variant">#{String(disaster.id).padStart(4, "0")} · {disaster.title}</p>
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
            <p className="text-lg font-black text-white uppercase">Incident Updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="px-8 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 resize-none transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none appearance-none">
                  {["Flood", "Wildfire", "Earthquake", "Storm", "Cyclone", "Drought", "Tsunami", "Landslide", "Volcanic", "Collapse", "Other"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Severity</label>
              <div className="grid grid-cols-4 gap-2">
                {(["low", "medium", "high", "critical"] as const).map(s => {
                  const sc = SEVERITY_CONFIG[s];
                  return (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, severity: s }))}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${form.severity === s ? `${sc.bg} ${sc.text} ${sc.border}` : "bg-surface-container/50 text-on-surface-variant border-outline-variant/10"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(["active", "monitoring", "resolved"] as const).map(s => (
                  <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${form.status === s ? "bg-primary/15 text-primary border-primary/30" : "bg-surface-container/50 text-on-surface-variant border-outline-variant/10"}`}>
                    {s}
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

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  : <><span className="material-symbols-outlined text-sm">save</span> Save Changes</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ disaster, onClose, onSuccess }: { disaster: Disaster; onClose: () => void; onSuccess: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetchApi(`/disasters/${disaster.id}`, { method: "DELETE" });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to delete");
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
            <span className="material-symbols-outlined text-2xl text-error" style={{ fontVariationSettings: '"FILL" 1' }}>delete</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase">Delete Incident?</h3>
            <p className="text-on-surface-variant text-sm mt-1">This will permanently delete <span className="text-white font-bold">{disaster.title}</span>. This action cannot be undone.</p>
          </div>
          {error && <p className="text-error text-xs font-bold">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={deleting}
              className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-error hover:brightness-110 disabled:opacity-60 transition-all active:scale-95">
              {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
                : <><span className="material-symbols-outlined text-sm">delete</span> Confirm Delete</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

export default function AdminDisastersPage() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateRange, setShowDateRange] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  // Modals
  const [reportModal, setReportModal] = useState(false);
  const [viewDisaster, setViewDisaster] = useState<Disaster | null>(null);
  const [editDisaster, setEditDisaster] = useState<Disaster | null>(null);
  const [deleteDisaster, setDeleteDisaster] = useState<Disaster | null>(null);

  const loadDisasters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/disasters");
      const raw = res?.data;
      const list = Array.isArray(raw) ? raw : (raw?.disasters || []);
      setDisasters(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load disasters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDisasters(); }, [loadDisasters]);

  // All unique types for dropdown
  const allTypes = useMemo(() => {
    const types = new Set(disasters.map(d => d.type));
    return Array.from(types).sort();
  }, [disasters]);

  // Filter
  const filtered = useMemo(() => {
    return disasters.filter(d => {
      if (search) {
        const q = search.toLowerCase();
        if (!d.title?.toLowerCase().includes(q) && !d.location?.toLowerCase().includes(q) && !String(d.id).includes(q)) return false;
      }
      if (typeFilter !== "all" && d.type?.toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (severityFilter !== "all" && d.severity !== severityFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (dateFrom && new Date(d.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(d.created_at) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [disasters, search, typeFilter, severityFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: disasters.length,
    active: disasters.filter(d => d.status === "active").length,
    resolved: disasters.filter(d => d.status === "resolved").length,
    monitoring: disasters.filter(d => d.status === "monitoring").length,
  }), [disasters]);

  function handleFilterChange() { setPage(1); }

  return (
    <>
      {/* Modals */}
      {reportModal && <ReportModal onClose={() => setReportModal(false)} onSuccess={loadDisasters} />}
      {viewDisaster && <ViewModal disaster={viewDisaster} onClose={() => setViewDisaster(null)} />}
      {editDisaster && <EditModal disaster={editDisaster} onClose={() => setEditDisaster(null)} onSuccess={loadDisasters} />}
      {deleteDisaster && <DeleteConfirm disaster={deleteDisaster} onClose={() => setDeleteDisaster(null)} onSuccess={loadDisasters} />}

      <AdminNav active="/admin/disasters" />

      <main className="min-h-screen bg-[#0b0f16] text-on-surface">
        <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-primary font-black uppercase tracking-widest text-[10px] mb-1">INCIDENT COMMAND MODULE</p>
              <h1 className="text-4xl font-black tracking-tight uppercase font-['Space_Grotesk'] text-white">Disaster Operations</h1>
              <p className="text-on-surface-variant text-sm mt-1 max-w-xl">Global monitoring and deployment interface for high-priority emergency responses.</p>
            </div>
            <button onClick={() => setReportModal(true)}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(229,62,62,0.3)] hover:brightness-110 shrink-0"
              style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
              <span className="material-symbols-outlined">add_circle</span>
              REPORT INCIDENT
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Disasters", value: stats.total, badge: "TOTAL", icon: "public", color: "#ffb3ad" },
              { label: "Active Emergencies", value: stats.active, badge: "CRITICAL", icon: "warning", color: "#E53E3E" },
              { label: "Resolved", value: stats.resolved, badge: "CLOSED", icon: "check_circle", color: "#4ade80" },
              { label: "Under Control", value: stats.monitoring, badge: "MONITORING", icon: "visibility", color: "#ff8c42" },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-low p-5 rounded-xl border-l-4 relative overflow-hidden" style={{ borderLeftColor: s.color }}>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-on-surface-variant text-[9px] uppercase tracking-widest font-bold">{s.label}</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded" style={{ color: s.color, background: `${s.color}18` }}>{s.badge}</span>
                  </div>
                  <span className="text-3xl font-black text-white font-['Space_Grotesk']">{loading ? "—" : s.value.toLocaleString()}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 opacity-5">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1", color: s.color }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="flex flex-wrap items-center gap-0 divide-x divide-outline-variant/10">
              {/* Search */}
              <div className="flex-1 min-w-[220px] relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                <input
                  className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  placeholder="Search ID, Title, Location..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); handleFilterChange(); }}
                />
              </div>

              {/* Type */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[130px]"
                value={typeFilter} onChange={e => { setTypeFilter(e.target.value); handleFilterChange(); }}>
                <option value="all">Type: All</option>
                {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              {/* Severity */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[140px]"
                value={severityFilter} onChange={e => { setSeverityFilter(e.target.value); handleFilterChange(); }}>
                <option value="all">Severity: All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Status */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[130px]"
                value={statusFilter} onChange={e => { setStatusFilter(e.target.value); handleFilterChange(); }}>
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>

              {/* Date Range */}
              <button onClick={() => setShowDateRange(!showDateRange)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-colors ${showDateRange ? "text-primary" : "text-on-surface-variant"} hover:text-primary`}>
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                Date Range
                {(dateFrom || dateTo) && <span className="w-2 h-2 bg-primary rounded-full" />}
              </button>

              {/* Clear filters */}
              {(search || typeFilter !== "all" || severityFilter !== "all" || statusFilter !== "all" || dateFrom || dateTo) && (
                <button onClick={() => { setSearch(""); setTypeFilter("all"); setSeverityFilter("all"); setStatusFilter("all"); setDateFrom(""); setDateTo(""); setShowDateRange(false); handleFilterChange(); }}
                  className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-error hover:bg-error/10 transition-colors">
                  Clear
                </button>
              )}
            </div>

            {/* Date Range Expander */}
            {showDateRange && (
              <div className="border-t border-outline-variant/10 px-6 py-4 flex flex-wrap gap-4 items-center bg-surface-container-lowest/50">
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">From</label>
                  <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); handleFilterChange(); }}
                    className="bg-surface-container border border-outline-variant/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40" />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">To</label>
                  <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); handleFilterChange(); }}
                    className="bg-surface-container border border-outline-variant/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/40" />
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant/15">
                    {["ID", "Title", "Type", "Location", "Severity", "Status", "Reported By", "Date", "Actions"].map((h, i) => (
                      <th key={h} className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-on-surface-variant ${i === 8 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 9 }).map((_, j) => (
                          <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-container-high rounded w-3/4" /></td>
                        ))}
                      </tr>
                    ))
                  ) : error ? (
                    <tr><td colSpan={9} className="px-5 py-12 text-center text-error font-bold">{error}</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={9} className="px-5 py-16 text-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">search_off</span>
                      <p className="text-on-surface-variant text-sm font-bold">No disasters match your filters</p>
                    </td></tr>
                  ) : (
                    paginated.map(d => {
                      const sc = SEVERITY_CONFIG[d.severity] || SEVERITY_CONFIG.medium;
                      const stc = STATUS_CONFIG[d.status] || STATUS_CONFIG.active;
                      const reportedBy = typeof d.reported_by === "object" ? d.reported_by?.name : d.reported_by;

                      return (
                        <tr key={d.id} className="hover:bg-surface-container-high/30 transition-colors group">
                          <td className="px-5 py-4 text-xs font-mono text-primary">#DIS-{String(d.id).padStart(4, "0")}</td>
                          <td className="px-5 py-4 text-sm font-bold text-white max-w-[200px] truncate" title={d.title}>{d.title}</td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1.5 text-[10px] font-black bg-surface-container-high border border-outline-variant/15 px-2 py-1 rounded w-fit">
                              <span className="material-symbols-outlined text-xs text-on-surface-variant">{getTypeIcon(d.type)}</span>
                              <span className="text-on-surface-variant uppercase">{d.type}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-on-surface-variant max-w-[140px] truncate">{d.location || "—"}</td>
                          <td className="px-5 py-4">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>{sc.label}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${stc.dot}`} />
                              <span className={`text-xs font-bold ${stc.text}`}>{stc.label}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-on-surface-variant">{reportedBy || "—"}</td>
                          <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                            {new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setViewDisaster(d)}
                                className="p-2 rounded-lg hover:bg-primary/15 transition-all text-on-surface-variant hover:text-primary" title="View">
                                <span className="material-symbols-outlined text-xl">visibility</span>
                              </button>
                              <button onClick={() => setEditDisaster(d)}
                                className="p-2 rounded-lg hover:bg-yellow-500/10 transition-all text-on-surface-variant hover:text-yellow-400" title="Edit">
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button onClick={() => setDeleteDisaster(d)}
                                className="p-2 rounded-lg hover:bg-error/15 transition-all text-on-surface-variant hover:text-error" title="Delete">
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
                Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
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