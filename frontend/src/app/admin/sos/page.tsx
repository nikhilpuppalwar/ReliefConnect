"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import AdminNavLinks from "@/components/AdminNavLinks";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Request = {
  id: number;
  title: string;
  description: string;
  location: string | null;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "assigned" | "in_progress" | "resolved" | "cancelled";
  disaster_id?: number | null;
  user_id: number;
  volunteer_id?: number | null;
  photo_url?: string | null;
  created_at: string;
  requested_by: { name: string; avatar_url?: string } | null;
  assigned_to: { name: string; avatar_url?: string } | null;
};

type Volunteer = { id: number; user_id: number; user: { name: string; email: string } };
type Disaster = { id: number; title: string; status: string };

// ─── Priority Config ───────────────────────────────────────────────────────────
const PRIORITY_CFG = {
  critical: { label: "CRITICAL", bg: "bg-red-500/15",    text: "text-red-400",    border: "border-red-500/30"    },
  high:     { label: "HIGH",     bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
  medium:   { label: "MEDIUM",   bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
  low:      { label: "LOW",      bg: "bg-green-500/15",  text: "text-green-400",  border: "border-green-500/30"  },
};

const STATUS_CFG = {
  pending:     { label: "Pending",     dot: "bg-orange-400 animate-pulse", text: "text-orange-400" },
  assigned:    { label: "Assigned",    dot: "bg-blue-400",                  text: "text-blue-400"   },
  in_progress: { label: "In Progress", dot: "bg-primary animate-pulse",    text: "text-primary"    },
  resolved:    { label: "Resolved",    dot: "bg-green-400",                 text: "text-green-400"  },
  cancelled:   { label: "Cancelled",   dot: "bg-gray-500",                  text: "text-gray-400"   },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Admin Nav ─────────────────────────────────────────────────────────────────
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
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(229,62,62,0.2)]">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>shield</span>
          </div>
          <div>
            <span className="text-xl font-black text-[#E53E3E] font-['Space_Grotesk'] tracking-tighter uppercase block leading-none">ReliefConnect</span>
            <span className="text-xs font-black text-on-surface-variant uppercase tracking-[0.15em]">Command Center</span>
          </div>
        </div>

        <AdminNavLinks />

        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => router.push("/admin")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-[0_4px_16px_rgba(229,62,62,0.3)] hover:brightness-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span className="hidden 2xl:inline">New Dispatch</span><span className="hidden lg:inline 2xl:hidden">Dispatch</span>
          </button>
          <div className="h-8 w-px bg-[#ffb3ad]/10" />
          <button className="relative text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-[#0d131f]" />
          </button>

          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-[#ffb3ad] leading-none">{user?.name?.toUpperCase() || "ADMIN"}</p>
                <p className="text-xs text-on-surface-variant tracking-wider">Global Overseer</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm overflow-hidden">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase() || "A"}
              </div>
            </button>

            {profileOpen && (
              <div className="absolute top-12 right-0 w-60 bg-[#0e1420] border border-[#ffb3ad]/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-[200]" onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-[#ffb3ad]/10">
                  <p className="text-sm font-black text-white">{user?.name || "Admin"}</p>
                  <p className="text-sm text-[#ffb3ad] font-bold uppercase tracking-widest">Global Overseer</p>
                </div>
                <div className="px-2 py-2 space-y-1">
                  {[{ label: "Admin Profile", icon: "manage_accounts", href: "/admin/profile" }, { label: "Dashboard", icon: "dashboard", href: "/admin" }].map(item => (
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

// ─── New Request Modal ────────────────────────────────────────────────────────
function NewRequestModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", location: "", priority: "high" as Request["priority"] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { setError("Title is required."); return; }
    setSubmitting(true); setError("");
    try {
      await fetchApi("/requests", {
        method: "POST",
        body: JSON.stringify({ title: form.title, description: form.description, location: form.location, priority: form.priority, status: "pending" }),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1400);
    } catch (err: any) {
      setError(err?.message || "Failed to create request");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.08), #0e1420)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>add_circle</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">New SOS Request</h2>
              <p className="text-sm text-on-surface-variant">Log a new civilian distress request</p>
            </div>
          </div>
          <button onClick={onClose} disabled={submitting} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {success ? (
          <div className="px-8 py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            </div>
            <p className="text-lg font-black text-white uppercase">Request Created!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Title <span className="text-error">*</span></label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="E.g. Medical Emergency — Flood Zone B"
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the situation, number of people, immediate needs..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 resize-none transition-colors" disabled={submitting} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Block / Sector / Area"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Request["priority"] }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none appearance-none" disabled={submitting}>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
                <span className="material-symbols-outlined text-sm text-error">error</span>
                <p className="text-sm text-error font-bold">{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} disabled={submitting} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                  : <><span className="material-symbols-outlined text-sm">add_circle</span> Create Request</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── View Drawer ──────────────────────────────────────────────────────────────
function ViewDrawer({ request, onClose }: { request: Request; onClose: () => void }) {
  const pc = PRIORITY_CFG[request.priority] || PRIORITY_CFG.medium;
  const sc = STATUS_CFG[request.status] || STATUS_CFG.pending;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md h-full bg-[#0e1420] border-l border-[#ffb3ad]/15 overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0e1420]/95 backdrop-blur-xl px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between z-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Request Detail</h2>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">close</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-full text-sm font-black uppercase tracking-widest border ${pc.bg} ${pc.text} ${pc.border}`}>{pc.label} Priority</span>
            <span className="px-3 py-1.5 rounded-full text-sm font-black uppercase border border-white/10 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} /><span className={sc.text}>{sc.label}</span>
            </span>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-1">Request ID</p>
            <p className="text-sm font-mono text-primary mb-2">#RQ-{String(request.id).padStart(4, "0")}</p>
            <h3 className="text-lg font-black text-white leading-tight">{request.title}</h3>
          </div>

          {request.description && (
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-2">Description</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">{request.description}</p>
            </div>
          )}

          {request.photo_url && (
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-2">Attached Photo</p>
              <img src={request.photo_url} alt="Request photo" className="w-full rounded-xl object-cover max-h-48" />
            </div>
          )}

          <div className="divide-y divide-outline-variant/10 rounded-xl border border-outline-variant/10 overflow-hidden">
            {[
              { label: "Requested By", value: request.requested_by?.name || "Unknown" },
              { label: "Assigned To",  value: request.assigned_to?.name || "Unassigned" },
              { label: "Location",     value: request.location || "—" },
              { label: "Reported",     value: new Date(request.created_at).toLocaleString() },
            ].map(item => (
              <div key={item.label} className="px-4 py-3 flex justify-between items-center bg-surface-container-low">
                <span className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">{item.label}</span>
                <span className="text-xs font-bold text-white max-w-[60%] text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Assign Modal ─────────────────────────────────────────────────────────────
function AssignModal({ request, onClose, onSuccess }: { request: Request; onClose: () => void; onSuccess: () => void }) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVol, setSelectedVol] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchApi("/volunteers").then(res => {
      const raw = res?.data;
      const list = Array.isArray(raw) ? raw : (raw?.volunteers || []);
      setVolunteers(list.filter((v: any) =>
        (v.availability_status || v.availability || "").toLowerCase() === "available"
      ));
    }).catch(() => {});
  }, []);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVol) { setError("Please select a volunteer."); return; }
    setSubmitting(true); setError("");
    try {
      await fetchApi(`/requests/${request.id}/assign`, {
        method: "PUT",
        body: JSON.stringify({ volunteer_id: Number(selectedVol) }),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: any) {
      setError(err?.message || "Failed to assign");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.08), #0e1420)" }}>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight">Assign Request</h2>
            <p className="text-sm text-on-surface-variant">#RQ-{String(request.id).padStart(4, "0")} · {request.title}</p>
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
            <p className="text-lg font-black text-white uppercase">Assigned!</p>
          </div>
        ) : (
          <form onSubmit={handleAssign} className="px-8 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Select Available Volunteer</label>
              {volunteers.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic py-2">No available volunteers at this time.</p>
              ) : (
                <select required value={selectedVol} onChange={e => setSelectedVol(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 appearance-none" disabled={submitting}>
                  <option value="">Choose a volunteer...</option>
                  {volunteers.map(v => (
                    <option key={v.id} value={v.id}>VOL-{String(v.user_id).padStart(4, "0")} · {v.user.name}</option>
                  ))}
                </select>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
                <span className="material-symbols-outlined text-sm text-error">error</span>
                <p className="text-sm text-error font-bold">{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
              <button type="submit" disabled={submitting || volunteers.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Assigning...</>
                  : <><span className="material-symbols-outlined text-sm">assignment_ind</span> Assign</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ request, onClose, onSuccess }: { request: Request; onClose: () => void; onSuccess: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]   = useState("");

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetchApi(`/requests/${request.id}`, { method: "DELETE" });
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to delete"); setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !deleting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-[#0e1420] border border-error/30 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-error/15 border border-error/30 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl text-error" style={{ fontVariationSettings: '"FILL" 1' }}>delete</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase">Delete Request?</h3>
            <p className="text-on-surface-variant text-sm mt-1">This will permanently delete <span className="text-white font-bold">#{String(request.id).padStart(4, "0")}</span>. This cannot be undone.</p>
          </div>
          {error && <p className="text-error text-xs font-bold">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={deleting} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-error hover:brightness-110 disabled:opacity-60 transition-all active:scale-95">
              {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting...</>
                : <><span className="material-symbols-outlined text-sm">delete</span> Confirm</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;
const STATUS_TABS = ["all", "pending", "assigned", "in_progress", "resolved"] as const;
const TAB_LABELS = { all: "ALL", pending: "PENDING", assigned: "ASSIGNED", in_progress: "IN PROGRESS", resolved: "RESOLVED" };

export default function AdminSosPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Tab / filters
  const [activeTab,      setActiveTab]      = useState<typeof STATUS_TABS[number]>("all");
  const [search,         setSearch]         = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [disasterFilter, setDisasterFilter] = useState("all");
  const [timeFilter,     setTimeFilter]     = useState("all"); // all | 24h | 7d
  const [page, setPage] = useState(1);

  // Modals
  const [newModal,    setNewModal]    = useState(false);
  const [viewReq,     setViewReq]     = useState<Request | null>(null);
  const [assignReq,   setAssignReq]   = useState<Request | null>(null);
  const [deleteReq,   setDeleteReq]   = useState<Request | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqRes, disRes] = await Promise.all([
        fetchApi("/requests"),
        fetchApi("/disasters"),
      ]);
      const rawReq = reqRes?.data;
      const reqList: Request[] = Array.isArray(rawReq) ? rawReq : (rawReq?.requests || []);
      setRequests(reqList);

      const rawDis = disRes?.data;
      const disList: Disaster[] = Array.isArray(rawDis) ? rawDis : (rawDis?.disasters || []);
      setDisasters(disList.filter(d => d.status === "active"));
    } catch (e: any) {
      setError(e?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Counts per tab
  const counts = useMemo(() => ({
    all:         requests.length,
    pending:     requests.filter(r => r.status === "pending").length,
    assigned:    requests.filter(r => r.status === "assigned").length,
    in_progress: requests.filter(r => r.status === "in_progress").length,
    resolved:    requests.filter(r => r.status === "resolved").length,
  }), [requests]);

  // Filter chain
  const filtered = useMemo(() => {
    const now = Date.now();
    return requests.filter(r => {
      if (activeTab !== "all" && r.status !== activeTab) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.title?.toLowerCase().includes(q)
          && !(r.requested_by?.name?.toLowerCase().includes(q))
          && !String(r.id).includes(q)
          && !r.location?.toLowerCase().includes(q)) return false;
      }
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (disasterFilter !== "all" && String(r.disaster_id) !== disasterFilter) return false;
      if (timeFilter === "24h" && now - new Date(r.created_at).getTime() > 86400000) return false;
      if (timeFilter === "7d"  && now - new Date(r.created_at).getTime() > 604800000) return false;
      return true;
    });
  }, [requests, activeTab, search, priorityFilter, disasterFilter, timeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function switchTab(tab: typeof STATUS_TABS[number]) { setActiveTab(tab); setPage(1); }

  return (
    <>
      {newModal    && <NewRequestModal onClose={() => setNewModal(false)} onSuccess={loadData} />}
      {viewReq     && <ViewDrawer     request={viewReq}   onClose={() => setViewReq(null)} />}
      {assignReq   && <AssignModal    request={assignReq} onClose={() => setAssignReq(null)} onSuccess={loadData} />}
      {deleteReq   && <DeleteConfirm  request={deleteReq} onClose={() => setDeleteReq(null)} onSuccess={loadData} />}

      <AdminNav active="/admin/sos" />

      <main className="min-h-screen bg-[#0b0f16] text-on-surface">
        <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-primary font-black uppercase tracking-widest text-sm mb-1">EMERGENCY DISPATCH CENTER</p>
              <h1 className="text-4xl font-black tracking-tight uppercase font-['Space_Grotesk'] text-white">SOS Request Center</h1>
              <p className="text-on-surface-variant text-sm mt-1 max-w-xl">Real-time civilian distress signal monitoring and resource allocation dispatching system.</p>
            </div>
            <button onClick={() => setNewModal(true)}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(229,62,62,0.3)] hover:brightness-110 shrink-0"
              style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
              <span className="material-symbols-outlined">add_circle</span>
              NEW REQUEST
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Requests", value: counts.all,         badge: "TOTAL",    color: "#ffb3ad", icon: "emergency_share" },
              { label: "Pending",        value: counts.pending,      badge: "ACTION!",  color: "#f97316", icon: "pending" },
              { label: "Assigned",       value: counts.assigned,     badge: "ACTIVE",   color: "#60a5fa", icon: "assignment_ind" },
              { label: "Resolved",       value: counts.resolved,     badge: "CLOSED",   color: "#4ade80", icon: "check_circle" },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-low p-5 rounded-xl border-l-4 relative overflow-hidden cursor-pointer hover:brightness-110 transition-all"
                style={{ borderLeftColor: s.color }}
                onClick={() => switchTab(s.label === "Total Requests" ? "all" : s.label.toLowerCase().replace(" ", "_") as any)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{s.label}</span>
                  <span className="text-xs font-black px-2 py-0.5 rounded" style={{ color: s.color, background: `${s.color}18` }}>{s.badge}</span>
                </div>
                <span className="text-3xl font-black text-white font-['Space_Grotesk']">{loading ? "—" : s.value.toLocaleString()}</span>
                <div className="absolute -bottom-2 -right-2 opacity-5">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1", color: s.color }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Table Card */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/5">

            {/* Status Tabs */}
            <div className="flex border-b border-outline-variant/15 px-6 pt-1 overflow-x-auto">
              {STATUS_TABS.map(tab => (
                <button key={tab} onClick={() => switchTab(tab)}
                  className={`px-5 py-4 text-sm font-black tracking-widest uppercase whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === tab ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>
                  {TAB_LABELS[tab]}
                  {counts[tab] > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${activeTab === tab ? "bg-primary/20 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                      {counts[tab]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-0 divide-x divide-outline-variant/10 bg-surface-container border-b border-outline-variant/10">
              {/* Search */}
              <div className="flex-1 min-w-[220px] relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                <input className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  placeholder="Search civilian name, ID, location..."
                  value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>

              {/* Priority */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[150px]"
                value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
                <option value="all">Priority: All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Disaster */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[180px]"
                value={disasterFilter} onChange={e => { setDisasterFilter(e.target.value); setPage(1); }}>
                <option value="all">Disaster: All Active</option>
                {disasters.map(d => <option key={d.id} value={String(d.id)}>{d.title}</option>)}
              </select>

              {/* Time */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[160px]"
                value={timeFilter} onChange={e => { setTimeFilter(e.target.value); setPage(1); }}>
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>

              {/* Clear */}
              {(search || priorityFilter !== "all" || disasterFilter !== "all" || timeFilter !== "all") && (
                <button onClick={() => { setSearch(""); setPriorityFilter("all"); setDisasterFilter("all"); setTimeFilter("all"); setPage(1); }}
                  className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-error hover:bg-error/10 transition-colors">
                  Clear
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant/10">
                    {["Request ID", "Civilian", "Location", "Priority", "Status", "Assigned To", "Time", "Actions"].map((h, i) => (
                      <th key={h} className={`px-5 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant ${i === 7 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
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
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">inbox</span>
                      <p className="text-on-surface-variant text-sm font-bold">No requests match your filters</p>
                    </td></tr>
                  ) : (
                    paginated.map(r => {
                      const pc = PRIORITY_CFG[r.priority] || PRIORITY_CFG.medium;
                      const sc = STATUS_CFG[r.status]   || STATUS_CFG.pending;
                      return (
                        <tr key={r.id} className="hover:bg-surface-container/50 transition-colors group">
                          <td className="px-5 py-4 text-xs font-mono font-bold text-primary whitespace-nowrap">
                            #RQ-{String(r.id).padStart(4, "0")}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs flex-shrink-0 overflow-hidden">
                                {r.requested_by?.avatar_url
                                  ? <img src={r.requested_by.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                                  : r.requested_by?.name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{r.requested_by?.name || "Unknown"}</p>
                                <p className="text-sm text-on-surface-variant truncate max-w-[120px]">{r.title}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {r.location ? (
                              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                <span className="max-w-[140px] truncate">{r.location}</span>
                              </div>
                            ) : <span className="text-sm text-on-surface-variant/40">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-sm font-black px-2.5 py-1 rounded-full border ${pc.bg} ${pc.text} ${pc.border}`}>{pc.label}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              <span className={`text-xs font-bold ${sc.text}`}>{sc.label}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-on-surface-variant">
                            {r.assigned_to?.name || <span className="text-on-surface-variant/40 italic">Unassigned</span>}
                          </td>
                          <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">{timeAgo(r.created_at)}</td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setViewReq(r)}
                                className="p-2 rounded-lg hover:bg-primary/15 transition-all text-on-surface-variant hover:text-primary" title="View">
                                <span className="material-symbols-outlined text-xl">visibility</span>
                              </button>
                              <button onClick={() => setAssignReq(r)}
                                className="p-2 rounded-lg hover:bg-yellow-500/10 transition-all text-on-surface-variant hover:text-yellow-400" title="Assign">
                                <span className="material-symbols-outlined text-xl">assignment_ind</span>
                              </button>
                              <button onClick={() => setDeleteReq(r)}
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
            <div className="px-6 py-4 bg-surface-container/30 border-t border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
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