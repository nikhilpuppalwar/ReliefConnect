"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────────
type Task = {
  id: number;
  title: string;
  description: string | null;
  disaster_id: number | null;
  volunteer_id: number | null;
  due_date: string | null;
  status: "assigned" | "in_progress" | "completed" | "cancelled" | "pending";
  created_by: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  proof_url: string | null;
  disaster_title: string | null;
  disaster_location: string | null;
  assigned_to_name: string | null;
  assigned_by_name: string | null;
};

type Volunteer = { id: number; user_id: number; user: { name: string; email: string }; availability_status?: string; availability?: string };
type Disaster  = { id: number; title: string; status: string };

// ─── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  assigned:    { label: "Assigned",    dot: "bg-blue-400",              text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
  in_progress: { label: "In Progress", dot: "bg-sky-400 animate-pulse", text: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20"     },
  completed:   { label: "Completed",   dot: "bg-green-400",             text: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/20"   },
  cancelled:   { label: "Cancelled",   dot: "bg-gray-500",              text: "text-gray-400",    bg: "bg-gray-500/10",    border: "border-gray-500/20"    },
  pending:     { label: "Pending",     dot: "bg-amber-400 animate-pulse", text: "text-amber-400", bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
};

const CATEGORY_CFG: Record<string, { bg: string; text: string; border: string }> = {
  logistics:     { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/25" },
  humanitarian:  { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/25"   },
  medical:       { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/25"    },
  technical:     { bg: "bg-slate-500/10",  text: "text-slate-400",  border: "border-slate-500/25"  },
  search_rescue: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/25" },
  general:       { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/25" },
};

function guessCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("medic") || t.includes("triage") || t.includes("health")) return "medical";
  if (t.includes("supply") || t.includes("logistics") || t.includes("deliver") || t.includes("transport")) return "logistics";
  if (t.includes("rescue") || t.includes("search") || t.includes("evacu")) return "search_rescue";
  if (t.includes("shelter") || t.includes("humani") || t.includes("food") || t.includes("water")) return "humanitarian";
  if (t.includes("tech") || t.includes("assess") || t.includes("damage") || t.includes("infra")) return "technical";
  return "general";
}

function isDue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

function formatDue(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Admin Nav ──────────────────────────────────────────────────────────────────
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
            <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.15em]">Command Center</span>
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
          {links.map(link => (
            <button key={link.label} onClick={() => router.push(link.href)}
              className={`px-3 py-2 font-black text-[10px] tracking-[0.12em] uppercase transition-all rounded-lg hover:text-primary hover:bg-primary/5 ${active === link.href ? "text-primary border-b-2 border-primary" : "text-on-surface/60"}`}>
              {link.label}
            </button>
          ))}
        </nav>

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
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-[#ffb3ad] leading-none">{user?.name?.toUpperCase() || "ADMIN"}</p>
                <p className="text-[9px] text-on-surface-variant tracking-wider">Global Overseer</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm overflow-hidden">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase() || "A"}
              </div>
            </button>
            {profileOpen && (
              <div className="absolute top-12 right-0 w-60 bg-[#0e1420] border border-[#ffb3ad]/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-[200]" onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-[#ffb3ad]/10">
                  <p className="text-sm font-black text-white">{user?.name || "Admin"}</p>
                  <p className="text-[10px] text-[#ffb3ad] font-bold uppercase tracking-widest">Global Overseer</p>
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

// ─── Deploy Mission Modal ────────────────────────────────────────────────────────
function DeployMissionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [disasters, setDisasters]   = useState<Disaster[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", disaster_id: "", volunteer_id: "",
    due_date: "", status: "assigned" as Task["status"],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  useEffect(() => {
    Promise.all([fetchApi("/disasters"), fetchApi("/volunteers")]).then(([dr, vr]) => {
      const dl = Array.isArray(dr?.data) ? dr.data : (dr?.data?.disasters || []);
      setDisasters(dl.filter((d: Disaster) => d.status === "active"));
      const vl = Array.isArray(vr?.data) ? vr.data : (vr?.data?.volunteers || []);
      setVolunteers(vl.filter((v: Volunteer) =>
        (v.availability_status || v.availability || "").toLowerCase() === "available"
      ));
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.disaster_id || !form.volunteer_id) { setError("Title, Disaster Zone, and Volunteer are required."); return; }
    setSubmitting(true); setError("");
    try {
      await fetchApi("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          disaster_id: Number(form.disaster_id),
          volunteer_id: Number(form.volunteer_id),
          due_date: form.due_date || undefined,
          status: form.status,
        }),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1400);
    } catch (err: any) {
      setError(err?.message || "Failed to deploy mission");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-xl bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between sticky top-0 bg-[#0e1420] z-10" style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.08), #0e1420)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>rocket_launch</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">Deploy Mission</h2>
              <p className="text-[10px] text-on-surface-variant">Create and assign a new operational task</p>
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
            <p className="text-lg font-black text-white uppercase">Mission Deployed!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Mission Title <span className="text-error">*</span></label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="E.g. Emergency Supply Delivery — Zone B"
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Operational objectives, resources needed, hazard notes..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 resize-none transition-colors" disabled={submitting} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Disaster Zone <span className="text-error">*</span></label>
                <select required value={form.disaster_id} onChange={e => setForm(f => ({ ...f, disaster_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 appearance-none" disabled={submitting}>
                  <option value="">Select disaster...</option>
                  {disasters.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Assign Volunteer <span className="text-error">*</span></label>
                <select required value={form.volunteer_id} onChange={e => setForm(f => ({ ...f, volunteer_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 appearance-none" disabled={submitting}>
                  <option value="">Select volunteer...</option>
                  {volunteers.map(v => <option key={v.id} value={v.id}>{v.user.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Due Date / Time</label>
                <input type="datetime-local" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Initial Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Task["status"] }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none appearance-none" disabled={submitting}>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
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
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deploying...</>
                  : <><span className="material-symbols-outlined text-sm">rocket_launch</span>Deploy Mission</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── View Drawer ─────────────────────────────────────────────────────────────────
function ViewDrawer({ task, onClose }: { task: Task; onClose: () => void }) {
  const sc = STATUS_CFG[task.status] || STATUS_CFG.pending;
  const cat = guessCategory(task.title);
  const cc = CATEGORY_CFG[cat] || CATEGORY_CFG.general;
  const overdue = task.status !== "completed" && task.status !== "cancelled" && isDue(task.due_date);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md h-full bg-[#0e1420] border-l border-[#ffb3ad]/15 overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0e1420]/95 backdrop-blur-xl px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between z-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Mission Detail</h2>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">close</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${sc.bg} ${sc.text} ${sc.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${cc.bg} ${cc.text} ${cc.border}`}>{cat}</span>
            {overdue && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30">OVERDUE</span>}
          </div>
          <div>
            <p className="text-[10px] font-mono text-primary mb-1">#RC-{String(task.id).padStart(4, "0")}</p>
            <h3 className="text-xl font-black text-white leading-tight">{task.title}</h3>
          </div>
          {task.description && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Description</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">{task.description}</p>
            </div>
          )}
          {task.proof_url && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Proof / Evidence</p>
              <a href={task.proof_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-xs font-bold text-green-400 hover:underline">
                <span className="material-symbols-outlined text-sm">attachment</span>View Submitted Evidence
              </a>
            </div>
          )}
          <div className="divide-y divide-outline-variant/10 rounded-xl border border-outline-variant/10 overflow-hidden">
            {[
              { label: "Assigned To",  value: task.assigned_to_name || "Unassigned" },
              { label: "Created By",   value: task.assigned_by_name || "Admin" },
              { label: "Disaster",     value: task.disaster_title || "—" },
              { label: "Location",     value: task.disaster_location || "—" },
              { label: "Due Date",     value: formatDue(task.due_date) },
              { label: "Created",      value: timeAgo(task.created_at) },
            ].map(item => (
              <div key={item.label} className="px-4 py-3 flex justify-between items-center bg-surface-container-low">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{item.label}</span>
                <span className="text-xs font-bold text-white max-w-[60%] text-right truncate">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Task Modal ──────────────────────────────────────────────────────────────
function EditTaskModal({ task, onClose, onSuccess }: { task: Task; onClose: () => void; onSuccess: () => void }) {
  const [disasters, setDisasters]   = useState<Disaster[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    disaster_id: task.disaster_id ? String(task.disaster_id) : "",
    volunteer_id: task.volunteer_id ? String(task.volunteer_id) : "",
    due_date: task.due_date ? task.due_date.slice(0, 16) : "",
    status: task.status,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  useEffect(() => {
    Promise.all([fetchApi("/disasters"), fetchApi("/volunteers")]).then(([dr, vr]) => {
      const dl = Array.isArray(dr?.data) ? dr.data : (dr?.data?.disasters || []);
      setDisasters(dl);
      const vl = Array.isArray(vr?.data) ? vr.data : (vr?.data?.volunteers || []);
      setVolunteers(vl);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { setError("Title is required."); return; }
    setSubmitting(true); setError("");
    try {
      await fetchApi(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          disaster_id: form.disaster_id ? Number(form.disaster_id) : undefined,
          volunteer_id: form.volunteer_id ? Number(form.volunteer_id) : undefined,
          due_date: form.due_date || undefined,
          status: form.status,
        }),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: any) {
      setError(err?.message || "Failed to update task");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-xl bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between sticky top-0 bg-[#0e1420] z-10" style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.06), #0e1420)" }}>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight">Edit Mission</h2>
            <p className="text-[10px] text-on-surface-variant">#RC-{String(task.id).padStart(4, "0")}</p>
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
            <p className="text-lg font-black text-white uppercase">Mission Updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Mission Title <span className="text-error">*</span></label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 resize-none transition-colors" disabled={submitting} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Disaster Zone</label>
                <select value={form.disaster_id} onChange={e => setForm(f => ({ ...f, disaster_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none appearance-none" disabled={submitting}>
                  <option value="">Select disaster...</option>
                  {disasters.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Volunteer</label>
                <select value={form.volunteer_id} onChange={e => setForm(f => ({ ...f, volunteer_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none appearance-none" disabled={submitting}>
                  <option value="">Unassigned</option>
                  {volunteers.map(v => <option key={v.id} value={v.id}>{v.user.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Due Date</label>
                <input type="datetime-local" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none transition-colors" disabled={submitting} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Task["status"] }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none appearance-none" disabled={submitting}>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</>
                  : <><span className="material-symbols-outlined text-sm">save</span>Save Changes</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Emergency Assign Modal ───────────────────────────────────────────────────────
function EmergencyAssignModal({ task, onClose, onSuccess }: { task: Task; onClose: () => void; onSuccess: () => void }) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedVol, setSelectedVol] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState(false);

  useEffect(() => {
    fetchApi("/volunteers").then(res => {
      const raw = res?.data;
      const list = Array.isArray(raw) ? raw : (raw?.volunteers || []);
      setVolunteers(list.filter((v: Volunteer) =>
        (v.availability_status || v.availability || "").toLowerCase() === "available"
      ));
    }).catch(() => {});
  }, []);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVol) { setError("Please select a volunteer."); return; }
    setSubmitting(true); setError("");
    try {
      await fetchApi(`/tasks/${task.id}/assign`, {
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
      <div className="relative z-10 w-full max-w-md bg-[#0e1420] border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-4 border-b border-red-500/20 flex items-center gap-3" style={{ background: "rgba(229,62,62,0.08)" }}>
          <span className="material-symbols-outlined text-red-400 animate-pulse" style={{ fontVariationSettings: '"FILL" 1' }}>priority_high</span>
          <div>
            <h2 className="text-sm font-black text-red-400 uppercase tracking-tight">Emergency Assign</h2>
            <p className="text-[10px] text-on-surface-variant">#RC-{String(task.id).padStart(4, "0")} · {task.title}</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {success ? (
          <div className="px-8 py-12 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            </div>
            <p className="text-base font-black text-white uppercase">Operative Dispatched!</p>
          </div>
        ) : (
          <form onSubmit={handleAssign} className="px-8 py-6 space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="material-symbols-outlined text-red-400 text-lg mt-0.5">warning</span>
              <p className="text-xs text-red-400 font-bold leading-relaxed">This task is CRITICAL and unassigned. Dispatch an available operative immediately.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Select Available Operative</label>
              {volunteers.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic py-2">No available volunteers at this time.</p>
              ) : (
                <select required value={selectedVol} onChange={e => setSelectedVol(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-red-400/40 appearance-none" disabled={submitting}>
                  <option value="">Choose operative...</option>
                  {volunteers.map(v => <option key={v.id} value={v.id}>VOL-{String(v.user_id).padStart(4, "0")} · {v.user.name}</option>)}
                </select>
              )}
            </div>
            {error && <p className="text-error text-xs font-bold">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
              <button type="submit" disabled={submitting || volunteers.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-all active:scale-95">
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Dispatching...</>
                  : <><span className="material-symbols-outlined text-sm">flash_on</span>Emergency Dispatch</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────────
function DeleteConfirm({ task, onClose, onSuccess }: { task: Task; onClose: () => void; onSuccess: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState("");

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetchApi(`/tasks/${task.id}`, { method: "DELETE" });
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to delete task"); setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !deleting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-[#0e1420] border border-error/30 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-error/15 border border-error/30 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl text-error" style={{ fontVariationSettings: '"FILL" 1' }}>delete</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase">Decommission Mission?</h3>
            <p className="text-on-surface-variant text-sm mt-1">This will permanently delete <span className="text-white font-bold">{task.title}</span>. This cannot be undone.</p>
          </div>
          {error && <p className="text-error text-xs font-bold">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={deleting} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-error hover:brightness-110 disabled:opacity-60 transition-all active:scale-95">
              {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Deleting...</>
                : <><span className="material-symbols-outlined text-sm">delete</span>Confirm</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

export default function AdminTasksPage() {
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Filters
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState("all");
  const [categoryFilter,  setCategoryFilter]  = useState("all");
  const [disasterFilter,  setDisasterFilter]  = useState("all");
  const [dateFrom,        setDateFrom]        = useState("");
  const [dateTo,          setDateTo]          = useState("");
  const [page, setPage] = useState(1);
  const [showDatePicker, setShowDatePicker]   = useState(false);

  // Modals
  const [deployModal,         setDeployModal]         = useState(false);
  const [viewTask,            setViewTask]            = useState<Task | null>(null);
  const [editTask,            setEditTask]            = useState<Task | null>(null);
  const [emergencyAssignTask, setEmergencyAssignTask] = useState<Task | null>(null);
  const [deleteTask,          setDeleteTask]          = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/tasks");
      const raw = res?.data;
      const list: Task[] = Array.isArray(raw) ? raw : (raw?.tasks || []);
      setTasks(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load tasks");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // Unique disaster zones for dropdown
  const allDisasters = useMemo(() => {
    const z = new Map<number, string>();
    tasks.forEach(t => { if (t.disaster_id && t.disaster_title) z.set(t.disaster_id, t.disaster_title); });
    return Array.from(z.entries());
  }, [tasks]);

  // Stats
  const stats = useMemo(() => ({
    total:       tasks.length,
    pending:     tasks.filter(t => t.status === "pending" || t.status === "assigned").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed:   tasks.filter(t => t.status === "completed").length,
    overdue:     tasks.filter(t => t.status !== "completed" && t.status !== "cancelled" && isDue(t.due_date)).length,
  }), [tasks]);

  // Filter chain
  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (search) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q)
          && !String(t.id).includes(q)
          && !(t.assigned_to_name?.toLowerCase().includes(q))
          && !(t.disaster_title?.toLowerCase().includes(q))) return false;
      }
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (categoryFilter !== "all" && guessCategory(t.title) !== categoryFilter) return false;
      if (disasterFilter !== "all" && String(t.disaster_id) !== disasterFilter) return false;
      if (dateFrom && new Date(t.created_at) < new Date(dateFrom)) return false;
      if (dateTo   && new Date(t.created_at) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [tasks, search, statusFilter, categoryFilter, disasterFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Smart pagination: show first 3, ellipsis, last page
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3) return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }, [page, totalPages]);

  const hasFilter = search || statusFilter !== "all" || categoryFilter !== "all" || disasterFilter !== "all" || dateFrom || dateTo;

  return (
    <>
      {deployModal         && <DeployMissionModal     onClose={() => setDeployModal(false)} onSuccess={loadTasks} />}
      {viewTask            && <ViewDrawer             task={viewTask}            onClose={() => setViewTask(null)} />}
      {editTask            && <EditTaskModal          task={editTask}            onClose={() => setEditTask(null)}            onSuccess={loadTasks} />}
      {emergencyAssignTask && <EmergencyAssignModal   task={emergencyAssignTask} onClose={() => setEmergencyAssignTask(null)} onSuccess={loadTasks} />}
      {deleteTask          && <DeleteConfirm          task={deleteTask}          onClose={() => setDeleteTask(null)}          onSuccess={loadTasks} />}

      <AdminNav active="/admin/tasks" />

      <main className="min-h-screen bg-[#0b0f16] text-on-surface">
        <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-primary font-black uppercase tracking-widest text-[10px] mb-1">MISSION CONTROL SYSTEM</p>
              <h1 className="text-4xl font-black tracking-tight uppercase font-['Space_Grotesk'] text-white">Task Management</h1>
              <p className="text-on-surface-variant text-sm mt-1 max-w-xl">Deploy, monitor, and manage all field operations across active disaster zones.</p>
            </div>
            <button onClick={() => setDeployModal(true)}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(229,62,62,0.3)] hover:brightness-110 shrink-0"
              style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
              <span className="material-symbols-outlined">add_circle</span>
              Deploy Mission
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Missions",   value: stats.total,       badge: "TOTAL",      color: "#ffb3ad",  icon: "assignment"   },
              { label: "Pending / Queued", value: stats.pending,     badge: "QUEUED",     color: "#f59e0b",  icon: "pending"      },
              { label: "In Progress",      value: stats.in_progress, badge: "ACTIVE",     color: "#38bdf8",  icon: "sync"         },
              { label: "Completed",        value: stats.completed,   badge: "CLOSED",     color: "#4ade80",  icon: "task_alt"     },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-low p-5 rounded-xl border-l-4 relative overflow-hidden"
                style={{ borderLeftColor: s.color }}>
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

          {/* Table Card */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/5">

            {/* Filter Row */}
            <div className="flex flex-wrap items-stretch divide-x divide-outline-variant/10 bg-surface-container border-b border-outline-variant/10">
              {/* Search */}
              <div className="flex-1 min-w-[240px] relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                <input className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-on-surface-variant/50 focus:outline-none"
                  placeholder="Search mission ID, title, operative..."
                  value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>

              {/* Status */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[150px]"
                value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="all">Status: All</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Category */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[150px]"
                value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
                <option value="all">Category: All</option>
                <option value="logistics">Logistics</option>
                <option value="humanitarian">Humanitarian</option>
                <option value="medical">Medical</option>
                <option value="search_rescue">Search & Rescue</option>
                <option value="technical">Technical</option>
                <option value="general">General</option>
              </select>

              {/* Disaster Zone */}
              <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[170px]"
                value={disasterFilter} onChange={e => { setDisasterFilter(e.target.value); setPage(1); }}>
                <option value="all">Disaster Zone: All</option>
                {allDisasters.map(([id, title]) => <option key={id} value={String(id)}>{title}</option>)}
              </select>

              {/* Date Range */}
              <div className="relative">
                <button onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm whitespace-nowrap transition-colors hover:bg-surface-container-high ${dateFrom || dateTo ? "text-primary" : "text-on-surface-variant"}`}>
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  {dateFrom || dateTo ? `${dateFrom || "…"} → ${dateTo || "…"}` : "Date Range"}
                </button>
                {showDatePicker && (
                  <div className="absolute top-full right-0 mt-1 z-20 bg-[#0e1420] border border-outline-variant/20 rounded-xl shadow-2xl p-4 space-y-3 min-w-[260px]">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">From</label>
                      <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">To</label>
                      <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                        className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }} className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border border-outline-variant/20 rounded-lg hover:bg-surface-container transition-all">Clear</button>
                      <button onClick={() => setShowDatePicker(false)} className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-white rounded-lg transition-all" style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>Apply</button>
                    </div>
                  </div>
                )}
              </div>

              {hasFilter && (
                <button onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); setDisasterFilter("all"); setDateFrom(""); setDateTo(""); setPage(1); }}
                  className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-error hover:bg-error/10 transition-colors">
                  Clear All
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant/10">
                    {["Mission ID", "Mission Title", "Category", "Assigned To", "Disaster Zone", "Status", "Due Date", "Actions"].map((h, i) => (
                      <th key={h} className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-on-surface-variant ${i === 7 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
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
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">assignment_late</span>
                      <p className="text-on-surface-variant text-sm font-bold">No missions match your filters</p>
                    </td></tr>
                  ) : (
                    paginated.map(t => {
                      const sc      = STATUS_CFG[t.status] || STATUS_CFG.pending;
                      const cat     = guessCategory(t.title);
                      const cc      = CATEGORY_CFG[cat] || CATEGORY_CFG.general;
                      const overdue = t.status !== "completed" && t.status !== "cancelled" && isDue(t.due_date);
                      const isEmergency = !t.volunteer_id || (overdue && (t.status === "assigned" || t.status === "pending"));

                      return (
                        <tr key={t.id}
                          className={`hover:bg-surface-container-high/20 transition-colors group ${isEmergency ? "bg-red-500/5" : ""}`}>
                          {/* ID */}
                          <td className="px-5 py-4 font-mono text-xs font-bold text-primary whitespace-nowrap">
                            RC-{String(t.id).padStart(4, "0")}
                          </td>

                          {/* Title */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-white leading-tight">{t.title}</p>
                            {t.description && <p className="text-[10px] text-on-surface-variant truncate max-w-[200px] mt-0.5">{t.description}</p>}
                            {isEmergency && !t.volunteer_id && <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mt-1">⚡ CRITICAL — UNASSIGNED</p>}
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-widest border ${cc.bg} ${cc.text} ${cc.border}`}>
                              {cat.replace("_", " ")}
                            </span>
                          </td>

                          {/* Assigned To */}
                          <td className="px-5 py-4">
                            {t.assigned_to_name ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs flex-shrink-0">
                                  {t.assigned_to_name[0].toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-white">{t.assigned_to_name}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-on-surface-variant/40">
                                <span className="material-symbols-outlined text-base">person_off</span>
                                <span className="text-xs italic">Unassigned</span>
                              </div>
                            )}
                          </td>

                          {/* Disaster Zone */}
                          <td className="px-5 py-4 text-xs text-on-surface-variant max-w-[140px] truncate">
                            {t.disaster_title || "—"}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              <span className={`text-xs font-bold ${sc.text}`}>{sc.label}</span>
                            </div>
                            {overdue && <p className="text-[9px] text-red-400 font-black uppercase mt-0.5">OVERDUE</p>}
                          </td>

                          {/* Due Date */}
                          <td className="px-5 py-4">
                            {t.due_date ? (
                              <div className={`flex items-center gap-1.5 ${overdue ? "text-red-400" : "text-on-surface-variant"}`}>
                                {overdue && <span className="material-symbols-outlined text-base">warning</span>}
                                <span className="text-xs font-bold">{formatDue(t.due_date)}</span>
                              </div>
                            ) : <span className="text-xs text-on-surface-variant/40">—</span>}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              {isEmergency ? (
                                <button onClick={() => setEmergencyAssignTask(t)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">
                                  <span className="material-symbols-outlined text-sm">flash_on</span>
                                  <span className="hidden sm:inline">Emergency Assign</span>
                                </button>
                              ) : (
                                <>
                                  <button onClick={() => setViewTask(t)}
                                    className="p-2 rounded-lg hover:bg-primary/15 transition-all text-on-surface-variant hover:text-primary opacity-60 group-hover:opacity-100" title="View">
                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                  </button>
                                  <button onClick={() => setEditTask(t)}
                                    className="p-2 rounded-lg hover:bg-yellow-500/10 transition-all text-on-surface-variant hover:text-yellow-400 opacity-60 group-hover:opacity-100" title="Edit">
                                    <span className="material-symbols-outlined text-xl">edit</span>
                                  </button>
                                  <button onClick={() => setDeleteTask(t)}
                                    className="p-2 rounded-lg hover:bg-error/15 transition-all text-on-surface-variant hover:text-error opacity-60 group-hover:opacity-100" title="Delete">
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer + Pagination */}
            <div className="px-6 py-4 bg-surface-container/30 border-t border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Bottom stats */}
              <div className="flex flex-wrap gap-6">
                {[
                  { label: "Total Missions", value: stats.total.toLocaleString(),       color: "text-white"       },
                  { label: "Completion",     value: stats.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%", color: "text-green-400" },
                  { label: "Overdue",        value: stats.overdue.toString(),            color: "text-red-400"     },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-black">{s.label}</p>
                    <p className={`text-base font-black font-['Space_Grotesk'] ${s.color}`}>{loading ? "—" : s.value}</p>
                  </div>
                ))}
                <span className="text-[10px] font-bold text-on-surface-variant self-end mb-0.5 uppercase tracking-widest">
                  Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
              </div>

              {/* Pagination */}
              <div className="flex gap-1.5 items-center flex-shrink-0">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg bg-surface-container hover:bg-primary/20 transition-colors text-on-surface-variant disabled:opacity-30">
                  <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>

                {pageNumbers.map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-on-surface-variant text-sm">…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(Number(p))}
                      className={`w-8 h-8 rounded-lg text-sm font-black transition-colors ${p === page ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant hover:bg-primary/20"}`}>
                      {p}
                    </button>
                  )
                )}

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