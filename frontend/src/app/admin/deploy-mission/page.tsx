"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

type Volunteer = {
  id: number;
  user_id: number;
  availability_status?: string;
  availability?: string;
  user: { name: string; email: string; avatar_url?: string };
};

type Disaster = { id: number; title: string; status: string; location?: string };

// ─── Admin Nav ─────────────────────────────────────────────────────────────────
function AdminNav() {
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
              className="px-3 py-2 font-black text-[10px] tracking-[0.12em] uppercase transition-all rounded-lg text-on-surface/60 hover:text-primary hover:bg-primary/5">
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DeployMissionPage() {
  const router = useRouter();
  const [disasters,  setDisasters]  = useState<Disaster[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading,    setLoading]    = useState(true);

  const [form, setForm] = useState({
    title:        "",
    description:  "",
    disaster_id:  "",
    volunteer_id: "",
    due_date:     "",
    status:       "assigned" as "assigned" | "in_progress" | "cancelled",
    priority:     "medium" as "low" | "medium" | "high" | "critical",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);

  useEffect(() => {
    Promise.all([fetchApi("/disasters"), fetchApi("/volunteers")])
      .then(([dr, vr]) => {
        const dl = Array.isArray(dr?.data) ? dr.data : (dr?.data?.disasters || []);
        setDisasters(dl.filter((d: Disaster) => d.status === "active"));
        const vl = Array.isArray(vr?.data) ? vr.data : (vr?.data?.volunteers || []);
        setVolunteers(vl);
      })
      .catch(() => setError("Failed to load data. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  // Active + available volunteers (show all if none available)
  const availableVolunteers = useMemo(() => {
    const avail = volunteers.filter(v =>
      (v.availability_status || v.availability || "").toLowerCase() === "available"
    );
    return avail.length > 0 ? avail : volunteers;
  }, [volunteers]);

  const selectedVolunteer = useMemo(() =>
    volunteers.find(v => String(v.id) === form.volunteer_id), [volunteers, form.volunteer_id]);

  const selectedDisaster = useMemo(() =>
    disasters.find(d => String(d.id) === form.disaster_id), [disasters, form.disaster_id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Mission title is required."); return; }
    if (!form.disaster_id)  { setError("Please link a disaster zone."); return; }
    if (!form.volunteer_id) { setError("Please assign a volunteer."); return; }

    // Convert datetime-local value to full ISO8601 string the server accepts
    let dueDateISO: string | undefined = undefined;
    if (form.due_date) {
      try {
        dueDateISO = new Date(form.due_date).toISOString();
      } catch {
        setError("Invalid due date format."); return;
      }
    }

    setSubmitting(true); setError("");
    try {
      const payload: Record<string, unknown> = {
        title:        form.title.trim(),
        disaster_id:  Number(form.disaster_id),
        volunteer_id: Number(form.volunteer_id),
        status:       form.status,
      };
      if (form.description.trim()) payload.description = form.description.trim();
      if (dueDateISO)              payload.due_date     = dueDateISO;

      await fetchApi("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccess(true);
    } catch (err: any) {
      // Show the full error from server (includes validation messages)
      setError(err?.message || "Failed to deploy mission");
      setSubmitting(false);
    }
  }

  const PRIORITY_CFG = {
    low:      { color: "text-green-400",  bg: "bg-green-500/15",  border: "border-green-500/30",  label: "Low"      },
    medium:   { color: "text-blue-400",   bg: "bg-blue-500/15",   border: "border-blue-500/30",   label: "Medium"   },
    high:     { color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", label: "High"     },
    critical: { color: "text-red-400",    bg: "bg-red-500/15",    border: "border-red-500/30",    label: "Critical" },
  };

  const pc = PRIORITY_CFG[form.priority];

  if (success) {
    return (
      <>
        <AdminNav />
        <main className="min-h-screen bg-[#0b0f16] flex items-center justify-center px-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-24 h-24 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto"
              style={{ boxShadow: "0 0 60px rgba(74,222,128,0.15)" }}>
              <span className="material-symbols-outlined text-5xl text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>rocket_launch</span>
            </div>
            <div>
              <p className="text-green-400 font-black text-[10px] uppercase tracking-widest mb-2">Mission Deployed!</p>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">{form.title}</h2>
              {selectedVolunteer && (
                <p className="text-on-surface-variant text-sm mt-2">
                  Assigned to <span className="text-white font-bold">{selectedVolunteer.user.name}</span>
                  {selectedDisaster && <> · <span className="text-primary font-bold">{selectedDisaster.title}</span></>}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => router.push("/admin/tasks")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                <span className="material-symbols-outlined text-sm">assignment</span>View All Tasks
              </button>
              <button onClick={() => { setSuccess(false); setSubmitting(false); setForm({ title: "", description: "", disaster_id: "", volunteer_id: "", due_date: "", status: "assigned", priority: "medium" }); }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:text-white hover:border-white/20 transition-all">
                <span className="material-symbols-outlined text-sm">add_circle</span>Deploy Another
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <main className="min-h-screen bg-[#0b0f16] text-on-surface">
        {/* Background glows */}
        <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none -z-10" />
        <div className="fixed bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[#ffb3ad]/5 to-transparent pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <button onClick={() => router.back()}
              className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-6 group">
              <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              Back
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center"
                style={{ boxShadow: "0 0 30px rgba(229,62,62,0.15)" }}>
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>rocket_launch</span>
              </div>
              <div>
                <p className="text-primary font-black text-[10px] uppercase tracking-widest mb-0.5">Mission Control</p>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight font-['Space_Grotesk']">Deploy New Mission</h1>
                <p className="text-on-surface-variant text-sm mt-0.5">Initialize a tactical task and assign to a field operative</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-24">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-on-surface-variant text-sm font-bold">Loading operational data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Card: Mission Details */}
              <div className="bg-[#0e1420] border border-outline-variant/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.05), transparent)" }}>
                  <span className="material-symbols-outlined text-primary text-lg">description</span>
                  <h2 className="text-sm font-black text-white uppercase tracking-wide">Mission Details</h2>
                </div>
                <div className="p-6 space-y-5">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                      Mission Title <span className="text-error">*</span>
                    </label>
                    <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="E.g. Emergency Medicine Supply — Zone B"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors"
                      disabled={submitting} />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Mission Description</label>
                    <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Provide detailed operational objectives, target location, resources needed, hazard notes..."
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 resize-none transition-colors"
                      disabled={submitting} />
                  </div>

                  {/* Priority selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Priority Level</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(Object.entries(PRIORITY_CFG) as [typeof form.priority, typeof PRIORITY_CFG[keyof typeof PRIORITY_CFG]][]).map(([key, cfg]) => (
                        <button key={key} type="button" onClick={() => setForm(f => ({ ...f, priority: key }))}
                          disabled={submitting}
                          className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-widest border transition-all ${form.priority === key ? `${cfg.bg} ${cfg.color} ${cfg.border}` : "bg-surface-container border-outline-variant/15 text-on-surface-variant hover:border-outline-variant/30"}`}>
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card: Zone & Assignment */}
              <div className="bg-[#0e1420] border border-outline-variant/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.05), transparent)" }}>
                  <span className="material-symbols-outlined text-primary text-lg">person_pin_circle</span>
                  <h2 className="text-sm font-black text-white uppercase tracking-wide">Zone & Assignment</h2>
                </div>
                <div className="p-6 space-y-5">
                  {/* Disaster Zone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                      Disaster Zone <span className="text-error">*</span>
                      <span className="ml-auto text-[9px] text-on-surface-variant/50">{disasters.length} active zones</span>
                    </label>
                    {disasters.length === 0 ? (
                      <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400 text-sm">warning</span>
                        <p className="text-xs text-amber-400 font-bold">No active disasters. Create a disaster first.</p>
                      </div>
                    ) : (
                      <select required value={form.disaster_id} onChange={e => setForm(f => ({ ...f, disaster_id: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 appearance-none"
                        disabled={submitting}>
                        <option value="">Select active disaster zone...</option>
                        {disasters.map(d => <option key={d.id} value={d.id}>{d.title}{d.location ? ` — ${d.location}` : ""}</option>)}
                      </select>
                    )}
                    {selectedDisaster && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/15 rounded-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs text-primary font-bold">{selectedDisaster.title}</span>
                        {selectedDisaster.location && <span className="text-xs text-on-surface-variant">· {selectedDisaster.location}</span>}
                      </div>
                    )}
                  </div>

                  {/* Volunteer */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                      Assign Volunteer <span className="text-error">*</span>
                      <span className="ml-auto text-[9px] text-on-surface-variant/50">{availableVolunteers.length} available</span>
                    </label>
                    <select required value={form.volunteer_id} onChange={e => setForm(f => ({ ...f, volunteer_id: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 appearance-none"
                      disabled={submitting}>
                      <option value="">Select volunteer operative...</option>
                      {availableVolunteers.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.user.name} — {(v.availability_status || v.availability || "unknown").toUpperCase()}
                        </option>
                      ))}
                    </select>
                    {selectedVolunteer && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-surface-container border border-outline-variant/15 rounded-xl">
                        <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm overflow-hidden flex-shrink-0">
                          {selectedVolunteer.user.avatar_url
                            ? <img src={selectedVolunteer.user.avatar_url} alt="" className="w-full h-full object-cover" />
                            : selectedVolunteer.user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{selectedVolunteer.user.name}</p>
                          <p className="text-[10px] text-on-surface-variant">VOL-{String(selectedVolunteer.user_id).padStart(4, "0")} · {selectedVolunteer.user.email}</p>
                        </div>
                        <div className="ml-auto">
                          <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${(selectedVolunteer.availability_status || selectedVolunteer.availability || "").toLowerCase() === "available" ? "bg-green-500/15 text-green-400" : "bg-orange-500/15 text-orange-400"}`}>
                            {(selectedVolunteer.availability_status || selectedVolunteer.availability || "Unknown").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card: Schedule */}
              <div className="bg-[#0e1420] border border-outline-variant/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.05), transparent)" }}>
                  <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                  <h2 className="text-sm font-black text-white uppercase tracking-wide">Schedule & Status</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Due Date & Time</label>
                    <input type="datetime-local" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors [color-scheme:dark]"
                      disabled={submitting} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Initial Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof form.status }))}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none appearance-none"
                      disabled={submitting}>
                      <option value="assigned">Assigned — Ready to begin</option>
                      <option value="in_progress">In Progress — Already active</option>
                      <option value="cancelled">Cancelled — on hold</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mission Summary Preview */}
              {(form.title || selectedDisaster || selectedVolunteer) && (
                <div className="bg-[#0e1420] border border-[#ffb3ad]/15 rounded-2xl p-5 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">preview</span>
                    Mission Summary Preview
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {form.title && (
                      <div className="col-span-2">
                        <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Title</p>
                        <p className="font-bold text-white">{form.title}</p>
                      </div>
                    )}
                    {selectedDisaster && (
                      <div>
                        <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Zone</p>
                        <p className="font-bold text-primary text-xs">{selectedDisaster.title}</p>
                      </div>
                    )}
                    {selectedVolunteer && (
                      <div>
                        <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Operative</p>
                        <p className="font-bold text-white text-xs">{selectedVolunteer.user.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Priority</p>
                      <p className={`font-black text-xs uppercase ${pc.color}`}>{pc.label}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Status</p>
                      <p className="font-bold text-white text-xs uppercase">{form.status.replace("_", " ")}</p>
                    </div>
                    {form.due_date && (
                      <div className="col-span-2">
                        <p className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">Due</p>
                        <p className="font-bold text-white text-xs">{new Date(form.due_date).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-error/10 border border-error/25">
                  <span className="material-symbols-outlined text-error text-xl">error</span>
                  <p className="text-sm text-error font-bold">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => router.back()} disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container hover:text-white transition-all disabled:opacity-50">
                  <span className="material-symbols-outlined text-base">close</span>
                  Cancel
                </button>
                <button type="submit" disabled={submitting || disasters.length === 0}
                  className="flex-[2] flex items-center justify-center gap-3 py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-60 shadow-[0_4px_24px_rgba(229,62,62,0.3)] hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                  {submitting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Deploying Mission...</>
                  ) : (
                    <><span className="material-symbols-outlined text-lg">rocket_launch</span>Confirm Deployment</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
