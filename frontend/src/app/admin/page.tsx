"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Disaster = {
  id: number;
  title: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "monitoring" | "resolved";
  location: string;
  created_at: string;
};

type Task = {
  id: number;
  title: string;
  status: "assigned" | "in_progress" | "completed" | "cancelled";
  disaster_title?: string;
  assigned_to_name?: string;
  created_at: string;
  due_date?: string;
};

type HelpRequest = {
  id: number;
  description: string;
  location: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "assigned" | "in_progress" | "resolved" | "cancelled";
  created_at: string;
  requested_by_name?: string;
};

type Volunteer = {
  id: number;
  user: { name: string; email: string; avatar_url?: string };
  availability_status: string;
  zone?: string;
  skills?: string;
};

type DashStats = {
  disasters: { total: number; active: number };
  volunteers: { total: number; available: number };
  tasks: { total: number; pending: number; completed: number; inProgress: number };
  requests: { total: number; pending: number; active: number };
};

// ─── Dispatch Modal ────────────────────────────────────────────────────────────
function DispatchModal({
  onClose,
  onSuccess,
  disasters,
  volunteers,
}: {
  onClose: () => void;
  onSuccess: () => void;
  disasters: Disaster[];
  volunteers: Volunteer[];
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    disaster_id: "",
    volunteer_id: "",
    due_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.disaster_id || !form.volunteer_id) {
      setError("Title, Disaster and Volunteer are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await fetchApi("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          disaster_id: Number(form.disaster_id),
          volunteer_id: Number(form.volunteer_id),
          due_date: form.due_date || undefined,
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Failed to create dispatch");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-2xl bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#ffb3ad]/10 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.1) 0%, transparent 60%)" }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>add_circle</span>
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight font-['Space_Grotesk']">New Dispatch</h2>
              <p className="text-[10px] text-[#ffb3ad]/60">Assign mission task to a volunteer</p>
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
            <p className="text-lg font-black text-white uppercase">Dispatch Created!</p>
            <p className="text-sm text-on-surface-variant">Task has been assigned and logged.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Title <span className="text-error">*</span></label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="E.g. Emergency Supply Delivery - Zone B"
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors"
                disabled={submitting}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief mission description and objectives..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 resize-none transition-colors"
                disabled={submitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Disaster */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Disaster Zone <span className="text-error">*</span></label>
                <select
                  required
                  value={form.disaster_id}
                  onChange={(e) => setForm(f => ({ ...f, disaster_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors appearance-none"
                  disabled={submitting}
                >
                  <option value="">Select disaster...</option>
                  {disasters.filter(d => d.status === "active").map(d => (
                    <option key={d.id} value={d.id}>{d.title} — {d.location}</option>
                  ))}
                </select>
              </div>

              {/* Volunteer */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Assign Volunteer <span className="text-error">*</span></label>
                <select
                  required
                  value={form.volunteer_id}
                  onChange={(e) => setForm(f => ({ ...f, volunteer_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors appearance-none"
                  disabled={submitting}
                >
                  <option value="">Select volunteer...</option>
                  {volunteers.map(v => (
                    <option key={v.id} value={v.id}>{v.user.name} — {v.availability_status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]/70">Due Date / Deadline</label>
              <input
                type="datetime-local"
                value={form.due_date}
                onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors"
                disabled={submitting}
              />
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
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">send</span> Create Dispatch</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Emergency Mode Modal ────────────────────────────────────────────────────
function EmergencyModeModal({ onClose }: { onClose: (activated: boolean) => void }) {
  const [activating, setActivating] = useState(false);
  const [broadcast, setBroadcast] = useState("");
  const [severity, setSeverity] = useState<"high" | "critical">("critical");

  async function handleActivate() {
    setActivating(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulate broadcast
    setActivating(false);
    onClose(true);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => onClose(false)}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-[#0e1420] border-2 border-error/40 rounded-2xl shadow-[0_0_60px_rgba(229,62,62,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        
        <div className="px-8 py-6 border-b border-error/20 text-center"
          style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.15) 0%, transparent 60%)" }}>
          <div className="w-14 h-14 rounded-full bg-error/20 border-2 border-error/40 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-3xl text-error animate-pulse" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
          </div>
          <h2 className="text-xl font-black text-error uppercase tracking-tight font-['Space_Grotesk']">EMERGENCY MODE</h2>
          <p className="text-xs text-on-surface-variant mt-1">This will broadcast an emergency alert to all volunteers and admins.</p>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-error/70">Alert Severity</label>
            <div className="grid grid-cols-2 gap-3">
              {(["high", "critical"] as const).map(s => (
                <button key={s} type="button" onClick={() => setSeverity(s)}
                  className="py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border"
                  style={{
                    background: severity === s ? (s === "critical" ? "rgba(229,62,62,0.2)" : "rgba(255,140,66,0.15)") : "rgba(255,255,255,0.03)",
                    borderColor: severity === s ? (s === "critical" ? "rgba(229,62,62,0.5)" : "rgba(255,140,66,0.4)") : "rgba(255,255,255,0.06)",
                    color: severity === s ? (s === "critical" ? "#E53E3E" : "#ff8c42") : "var(--color-on-surface-variant)",
                  }}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-error/70">Emergency Broadcast Message</label>
            <textarea
              rows={3}
              value={broadcast}
              onChange={(e) => setBroadcast(e.target.value)}
              placeholder="Describe the emergency situation requiring all-hands response..."
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-error/20 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-error/50 resize-none transition-colors"
            />
          </div>

          <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-error text-sm mt-0.5">info</span>
            <p className="text-xs text-error/80 font-bold leading-relaxed">All available volunteers will receive an emergency notification and be placed on standby. This action is logged and cannot be undone silently.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => onClose(false)}
              className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">
              Cancel
            </button>
            <button onClick={handleActivate} disabled={activating}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95 bg-error">
              {activating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Broadcasting...</>
              ) : (
                <><span className="material-symbols-outlined text-sm">warning</span> Activate Emergency</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // ── Notifications panel
  const [notifOpen, setNotifOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const [disRes, taskRes, reqRes, volRes] = await Promise.allSettled([
        fetchApi("/disasters"),
        fetchApi("/tasks"),
        fetchApi("/requests"),
        fetchApi("/volunteers"),
      ]);

      if (disRes.status === "fulfilled") {
        const raw = disRes.value?.data;
        setDisasters(Array.isArray(raw) ? raw : (raw?.disasters || []));
      }
      if (taskRes.status === "fulfilled") {
        const raw = taskRes.value?.data;
        setTasks(Array.isArray(raw) ? raw : (raw?.tasks || []));
      }
      if (reqRes.status === "fulfilled") {
        const raw = reqRes.value?.data;
        setRequests(Array.isArray(raw) ? raw : (raw?.requests || []));
      }
      if (volRes.status === "fulfilled") {
        const raw = volRes.value?.data;
        setVolunteers(Array.isArray(raw) ? raw : (raw?.volunteers || []));
      }
    } catch (e) {
      console.error("Dashboard load error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // ── Stats
  const stats: DashStats = useMemo(() => ({
    disasters: {
      total: disasters.length,
      active: disasters.filter(d => d.status === "active").length,
    },
    volunteers: {
      total: volunteers.length,
      available: volunteers.filter(v => v.availability_status?.toLowerCase() === "available").length,
    },
    tasks: {
      total: tasks.length,
      pending: tasks.filter(t => t.status === "assigned").length,
      inProgress: tasks.filter(t => t.status === "in_progress").length,
      completed: tasks.filter(t => t.status === "completed").length,
    },
    requests: {
      total: requests.length,
      pending: requests.filter(r => r.status === "pending").length,
      active: requests.filter(r => r.status === "in_progress" || r.status === "assigned").length,
    },
  }), [disasters, tasks, requests, volunteers]);

  // ── Disaster Distribution for chart
  const disasterTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    disasters.forEach(d => {
      const t = d.type || "Other";
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [disasters]);

  // ── Task Resolution Matrix
  const taskStatusMatrix = useMemo(() => {
    const total = tasks.length || 1;
    return [
      { label: "Completed", count: tasks.filter(t => t.status === "completed").length, color: "#4ade80" },
      { label: "In Progress", count: tasks.filter(t => t.status === "in_progress").length, color: "#ff8c42" },
      { label: "Assigned", count: tasks.filter(t => t.status === "assigned").length, color: "#60a5fa" },
      { label: "Cancelled", count: tasks.filter(t => t.status === "cancelled").length, color: "#6b7280" },
    ].map(s => ({ ...s, pct: Math.round((s.count / total) * 100) }));
  }, [tasks]);

  // ── Live Dispatch Log (last 8 events from tasks + requests combined)
  const dispatchLog = useMemo(() => {
    const taskEvents = tasks.slice(0, 4).map(t => ({
      id: `t-${t.id}`,
      type: "task" as const,
      text: t.assigned_to_name
        ? `Volunteer ${t.assigned_to_name} assigned to ${t.title}`
        : `Task "${t.title}" dispatched`,
      meta: `Task #${String(t.id).padStart(4, "0")}`,
      time: t.created_at,
      color: t.status === "completed" ? "#4ade80" : t.status === "in_progress" ? "#ff8c42" : "#ffb3ad",
    }));
    const reqEvents = requests.slice(0, 4).map(r => ({
      id: `r-${r.id}`,
      type: "request" as const,
      text: `SOS request from ${r.requested_by_name || "civilian"}: ${r.description?.slice(0, 60)}`,
      meta: `Priority: ${r.priority?.toUpperCase()}`,
      time: r.created_at,
      color: r.priority === "critical" ? "#E53E3E" : r.priority === "high" ? "#ff8c42" : "#60a5fa",
    }));
    return [...taskEvents, ...reqEvents]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [tasks, requests]);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const STAT_CARDS = [
    { label: "Disasters Logged", value: stats.disasters.total, badge: "TOTAL", badgeColor: "#ffb3ad", icon: "public", borderColor: "#E53E3E" },
    { label: "Active Disasters", value: stats.disasters.active, badge: "CRITICAL", badgeColor: "#E53E3E", icon: "warning", borderColor: "#ff4444" },
    { label: "Total Volunteers", value: stats.volunteers.total, badge: "ENGAGED", badgeColor: "#ff8c42", icon: "diversity_3", borderColor: "#ff8c42" },
    { label: "Open SOS Requests", value: stats.requests.pending, badge: "PENDING", badgeColor: "#60a5fa", icon: "contact_emergency", borderColor: "#60a5fa" },
    { label: "Pending Tasks", value: stats.tasks.pending, badge: "IN-QUEUE", badgeColor: "#94a3b8", icon: "rule", borderColor: "#94a3b8" },
    { label: "Available Volunteers", value: stats.volunteers.available, badge: "READY", badgeColor: "#4ade80", icon: "how_to_reg", borderColor: "#4ade80" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d131f]">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Loading Command Center...</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Dispatch Modal */}
      {showDispatchModal && (
        <DispatchModal
          onClose={() => setShowDispatchModal(false)}
          onSuccess={loadDashboard}
          disasters={disasters}
          volunteers={volunteers}
        />
      )}

      {/* ── Emergency Mode Modal */}
      {showEmergencyModal && (
        <EmergencyModeModal
          onClose={(activated) => {
            setShowEmergencyModal(false);
            if (activated) setEmergencyActive(true);
          }}
        />
      )}

      {/* Profile Dropdown */}
      {profileOpen && (
        <div className="fixed inset-0 z-[150]" onClick={() => setProfileOpen(false)}>
          <div className="absolute top-20 right-6 w-72 bg-[#0e1420] border border-[#ffb3ad]/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-[160]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[#ffb3ad]/10" style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.08), transparent)" }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xl">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="text-sm font-black text-white">{user?.name || "Admin"}</p>
                  <p className="text-[10px] text-[#ffb3ad] font-bold uppercase tracking-widest">Global Overseer</p>
                  <p className="text-[10px] text-on-surface-variant">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="px-3 py-3 space-y-1">
              {[
                { label: "Admin Profile", icon: "manage_accounts", href: "/admin/profile" },
                { label: "Manage Volunteers", icon: "diversity_3", href: "/admin/volunteers" },
                { label: "Certificates", icon: "military_tech", href: "/admin/certificates" },
                { label: "System Status", icon: "health_and_safety", href: "/system-status" },
              ].map(item => (
                <button key={item.label} onClick={() => { setProfileOpen(false); router.push(item.href); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-white transition-colors text-left">
                  <span className="material-symbols-outlined text-sm">{item.icon}</span>
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="px-3 pb-3">
              <button onClick={() => { logout(); router.push("/login"); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-error border border-error/20 hover:bg-error/10 transition-all">
                <span className="material-symbols-outlined text-sm">logout</span> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP NAV BAR ────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b transition-colors ${emergencyActive ? "bg-error/20 border-error/40" : "bg-[#0d131f]/95 border-[#ffb3ad]/10"}`}>
        {emergencyActive && (
          <div className="w-full bg-error text-white text-center py-1.5 text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xs animate-pulse">warning</span>
            EMERGENCY MODE ACTIVE — ALL UNITS ON STANDBY
            <button onClick={() => setEmergencyActive(false)} className="ml-3 underline text-white/80 hover:text-white">Deactivate</button>
          </div>
        )}
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

          {/* Nav links - hidden on smaller screens */}
          <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
            {[
              { label: "Dashboard", href: "/admin", icon: "dashboard" },
              { label: "Disasters", href: "/admin/disasters", icon: "public" },
              { label: "Volunteers", href: "/admin/volunteers", icon: "diversity_3" },
              { label: "SOS Requests", href: "/admin/sos", icon: "contact_emergency" },
              { label: "Tasks", href: "/admin/tasks", icon: "rule" },
              { label: "Assets", href: "/admin/assets", icon: "inventory" },
              { label: "Certificates", href: "/admin/certificates", icon: "military_tech" },
            ].map(item => (
              <button key={item.label}
                onClick={() => router.push(item.href)}
                className={`px-3 py-2 font-black text-[10px] tracking-[0.12em] uppercase transition-all rounded-lg hover:text-primary hover:bg-primary/5 ${item.href === "/admin" ? "text-primary border-b-2 border-primary" : "text-on-surface/60"}`}>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* New Dispatch */}
            <button
              onClick={() => setShowDispatchModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-[0_4px_16px_rgba(229,62,62,0.3)] hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span className="hidden sm:inline">New Dispatch</span>
            </button>

            {/* Emergency Mode */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className={`px-4 py-2 font-black text-[10px] uppercase tracking-widest rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                emergencyActive
                  ? "bg-error text-white border-error animate-pulse"
                  : "bg-error/10 text-error border-error/30 hover:bg-error hover:text-white"
              }`}>
              <span className="hidden sm:inline">Emergency Mode</span>
              <span className="sm:hidden material-symbols-outlined text-sm">warning</span>
            </button>

            {/* Separator */}
            <div className="h-8 w-px bg-[#ffb3ad]/10" />

            {/* Notifications */}
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">notifications</span>
              {(stats.requests.pending > 0 || stats.tasks.pending > 0) && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-[#0d131f]" />
              )}
            </button>

            {/* Admin profile */}
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
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="min-h-screen bg-[#0b0f16] text-on-background">
        <div className="max-w-[1600px] mx-auto px-6 py-8">

          {/* Page Title */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-white uppercase font-['Space_Grotesk'] tracking-tight">Command Dashboard</h1>
              <p className="text-on-surface-variant text-sm mt-1">Real-time operational overview · Last refreshed just now</p>
            </div>
            <button onClick={loadDashboard} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/10 hover:bg-surface-container-high transition-colors text-xs font-black uppercase tracking-widest text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
          </div>

          {/* ── Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {STAT_CARDS.map((card) => (
              <div key={card.label}
                className="bg-surface-container-low p-5 rounded-xl border-l-4 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] cursor-default"
                style={{ borderLeftColor: card.borderColor }}>
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined" style={{ color: card.borderColor }}>{card.icon}</span>
                  <span className="text-[9px] font-black px-2 py-1 rounded" style={{ color: card.badgeColor, background: `${card.badgeColor}18` }}>{card.badge}</span>
                </div>
                <h3 className="text-2xl font-black text-white font-['Space_Grotesk'] leading-none">
                  {loading ? "—" : card.value.toLocaleString()}
                </h3>
                <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* ── Main Grid */}
          <div className="grid grid-cols-12 gap-6">

            {/* Left: Charts + Actions */}
            <div className="col-span-12 lg:col-span-8 space-y-6">

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Disaster Distribution */}
                <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
                  <h4 className="font-black text-sm uppercase tracking-widest mb-6 pb-4 border-b border-[#ffb3ad]/10 text-white">Disaster Distribution</h4>
                  {disasterTypeCounts.length === 0 ? (
                    <div className="text-center py-8 text-on-surface-variant text-xs">No disaster data</div>
                  ) : (
                    <div className="space-y-4">
                      {disasterTypeCounts.map(([type, count], i) => {
                        const colors = ["#E53E3E", "#ff8c42", "#60a5fa", "#4ade80"];
                        const pct = Math.round((count / disasters.length) * 100);
                        return (
                          <div key={type}>
                            <div className="flex justify-between text-[10px] uppercase tracking-widest font-black mb-2">
                              <span className="text-on-surface-variant">{type}</span>
                              <span style={{ color: colors[i] }}>{pct}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: colors[i] }} />
                            </div>
                          </div>
                        );
                      })}
                      <div className="mt-4 pt-4 border-t border-outline-variant/10 flex flex-wrap gap-3">
                        {disasterTypeCounts.map(([type], i) => {
                          const colors = ["#E53E3E", "#ff8c42", "#60a5fa", "#4ade80"];
                          return (
                            <div key={type} className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
                              <span className="text-[10px] text-on-surface-variant">{type}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Task Resolution Matrix */}
                <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
                  <h4 className="font-black text-sm uppercase tracking-widest mb-6 pb-4 border-b border-[#ffb3ad]/10 text-white">Task Resolution Matrix</h4>
                  <div className="space-y-5">
                    {taskStatusMatrix.map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-black mb-2">
                          <span className="text-on-surface-variant">{s.label}</span>
                          <span style={{ color: s.color }}>{s.pct}% ({s.count})</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.pct || 5}%`, backgroundColor: s.color }} />
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-outline-variant/10">
                      <p className="text-[10px] text-on-surface-variant">Total Tasks: <span className="text-white font-black">{tasks.length}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Quick Actions */}
              <div className="bg-surface-container-low rounded-xl p-6 border border-[#ffb3ad]/5">
                <h4 className="font-black text-sm uppercase tracking-widest mb-5 text-white">Operational Quick Actions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "New Dispatch", icon: "add_circle", color: "#E53E3E", action: () => setShowDispatchModal(true) },
                    { label: "Add Disaster", icon: "add_location_alt", color: "#ff8c42", action: () => router.push("/admin/disasters/new") },
                    { label: "Manage Volunteers", icon: "diversity_3", color: "#60a5fa", action: () => router.push("/admin/volunteers") },
                    { label: "Issue Certificate", icon: "military_tech", color: "#4ade80", action: () => router.push("/admin/certificates") },
                    { label: "View SOS Queue", icon: "contact_emergency", color: "#fbbf24", action: () => router.push("/admin/sos") },
                    { label: "Task Overview", icon: "rule", color: "#a78bfa", action: () => router.push("/admin/tasks") },
                    { label: "Assets & Resources", icon: "inventory", color: "#94a3b8", action: () => router.push("/admin/assets") },
                    { label: "Emergency Mode", icon: "warning", color: "#E53E3E", action: () => setShowEmergencyModal(true) },
                  ].map(item => (
                    <button key={item.label}
                      onClick={item.action}
                      className="group flex items-center justify-between p-4 bg-surface-container-high rounded-xl hover:scale-[1.02] active:scale-95 transition-all border border-transparent hover:border-outline-variant/20">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}20`, border: `1px solid ${item.color}30` }}>
                          <span className="material-symbols-outlined text-lg" style={{ color: item.color }}>{item.icon}</span>
                        </div>
                        <span className="text-xs font-black uppercase tracking-wide text-on-surface">{item.label}</span>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant text-sm opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">chevron_right</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Disasters Table */}
              <div className="bg-surface-container-low rounded-xl border border-outline-variant/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                  <h4 className="font-black text-sm uppercase tracking-widest text-white">Recent Disasters</h4>
                  <button onClick={() => router.push("/admin/disasters")} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-container border-b border-outline-variant/10">
                      <tr>
                        {["ID", "Title", "Type", "Severity", "Status", "Location"].map(h => (
                          <th key={h} className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-on-surface-variant">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {disasters.slice(0, 5).map(d => (
                        <tr key={d.id} className="hover:bg-surface-container transition-colors cursor-pointer"
                          onClick={() => router.push(`/admin/disasters`)}>
                          <td className="px-5 py-3 font-mono text-on-surface-variant">#{d.id}</td>
                          <td className="px-5 py-3 font-bold text-white max-w-[200px] truncate">{d.title}</td>
                          <td className="px-5 py-3 text-on-surface-variant capitalize">{d.type}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              d.severity === "critical" ? "bg-red-500/20 text-red-400" :
                              d.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                              d.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-green-500/20 text-green-400"}`}>
                              {d.severity}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${d.status === "active" ? "bg-red-500/15 text-red-400" : d.status === "resolved" ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"}`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-on-surface-variant truncate max-w-[150px]">{d.location || "—"}</td>
                        </tr>
                      ))}
                      {disasters.length === 0 && (
                        <tr><td colSpan={6} className="px-5 py-8 text-center text-on-surface-variant text-xs">No disasters recorded</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: Live Dispatch Log */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-surface-container-high rounded-xl border border-[#ffb3ad]/5 overflow-hidden flex flex-col h-full shadow-2xl sticky top-24">
                <div className="px-6 py-5 bg-surface-container-highest border-b border-[#ffb3ad]/10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm uppercase tracking-widest text-[#E53E3E]">LIVE DISPATCH LOG</h4>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Live</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-5 space-y-6 overflow-y-auto max-h-[540px]">
                  {dispatchLog.length === 0 ? (
                    <div className="text-center py-12 text-on-surface-variant text-xs">No recent activity</div>
                  ) : dispatchLog.map(event => (
                    <div key={event.id} className="relative pl-7 border-l" style={{ borderColor: `${event.color}40` }}>
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full flex items-center justify-center border-4 border-surface-container-high"
                        style={{ backgroundColor: event.color }} />
                      <div className="space-y-1">
                        <p className="text-xs text-on-surface leading-relaxed">{event.text}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: event.color }}>{event.meta}</span>
                          <span className="text-[9px] text-on-surface-variant">{timeAgo(event.time)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push("/admin/tasks")}
                  className="w-full py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] bg-surface-container-highest hover:bg-surface-variant transition-all border-t border-[#ffb3ad]/10 hover:text-white">
                  View Historical Archives
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-[#ffb3ad]/5 px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant">
          <p className="text-[10px] font-black tracking-widest uppercase">© 2026 ReliefConnect Sentinel · Protocol v4.8.2-Alpha</p>
          <div className="flex items-center gap-6">
            {[
              { color: "#4ade80", label: "System Operational" },
              { color: "#ff8c42", label: "Cloud Sync Active" },
              { color: "#ffb3ad", label: "Encryption Secured" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] font-black tracking-widest uppercase">{s.label}</span>
              </div>
            ))}
          </div>
        </footer>
      </main>
    </>
  );
}