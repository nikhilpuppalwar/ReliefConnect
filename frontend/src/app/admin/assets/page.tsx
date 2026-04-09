"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────────
type Resource = {
  id: number;
  name: string;
  quantity: number;
  quantity_available?: number;
  unit: string | null;
  location: string | null;
  status: "approved" | "pending" | "rejected";
  category?: string | null;
  submitted_by: number;
  created_at: string;
};

type Disaster = { id: number; title: string; status: string };
type Allocation = {
  id: number;
  resource_id: number;
  disaster_id: number;
  quantity: number;
  note: string | null;
  allocated_by: number;
  allocated_at: string;
  resource_name: string;
  disaster_title: string;
  disaster_location: string;
  allocated_by_name: string;
};

// ─── Category config ───────────────────────────────────────────────────────────
const CAT_MAP: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  food:       { icon: "restaurant",          color: "#f59e0b", bg: "bg-amber-500/15",  label: "Food"       },
  medicine:   { icon: "medical_services",    color: "#f43f5e", bg: "bg-rose-500/15",   label: "Medicine"   },
  shelter:    { icon: "camping",             color: "#8b5cf6", bg: "bg-violet-500/15", label: "Shelter"    },
  water:      { icon: "water_drop",          color: "#38bdf8", bg: "bg-sky-500/15",    label: "Water"      },
  equipment:  { icon: "construction",        color: "#f97316", bg: "bg-orange-500/15", label: "Equipment"  },
  medical:    { icon: "medical_information", color: "#ec4899", bg: "bg-pink-500/15",   label: "Medical"    },
  bedding:    { icon: "bed",                 color: "#6366f1", bg: "bg-indigo-500/15", label: "Bedding"    },
  general:    { icon: "inventory_2",         color: "#94a3b8", bg: "bg-slate-500/15",  label: "General"    },
};

function guessCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("food") || n.includes("packet") || n.includes("meal") || n.includes("ration")) return "food";
  if (n.includes("insulin") || n.includes("medicine") || n.includes("drug") || n.includes("pill")) return "medicine";
  if (n.includes("tent") || n.includes("shelter") || n.includes("tarpaulin")) return "shelter";
  if (n.includes("water") || n.includes("bottle") || n.includes("liquid")) return "water";
  if (n.includes("kit") || n.includes("first aid") || n.includes("bandage") || n.includes("aid")) return "medical";
  if (n.includes("blanket") || n.includes("bedding") || n.includes("thermal") || n.includes("sheet")) return "bedding";
  if (n.includes("equipment") || n.includes("tool") || n.includes("generator") || n.includes("radio")) return "equipment";
  return "general";
}

function stockColor(qty: number, total: number): string {
  if (total === 0) return "bg-gray-500";
  const pct = qty / total;
  if (pct > 0.5) return "bg-emerald-500";
  if (pct > 0.2) return "bg-orange-500";
  return "bg-red-500";
}

function stockStatus(qty: number, total: number) {
  if (total === 0) return { label: "UNKNOWN", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" };
  const pct = qty / total;
  if (pct > 0.5)  return { label: "READY",    color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20"  };
  if (pct > 0.2)  return { label: "LOW",      color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" };
  return             { label: "CRITICAL", color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20"    };
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
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

// ─── Add Resource Modal ────────────────────────────────────────────────────────
function AddResourceModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: "", quantity: "", quantity_available: "", unit: "", location: "", category: "general" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.quantity) { setError("Name and quantity are required."); return; }
    setSubmitting(true); setError("");
    try {
      await fetchApi("/resources", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          quantity: Number(form.quantity),
          quantity_available: form.quantity_available ? Number(form.quantity_available) : Number(form.quantity),
          unit: form.unit || undefined,
          location: form.location || undefined,
          category: form.category,
        }),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1400);
    } catch (err: any) {
      setError(err?.message || "Failed to create resource");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.08), #0e1420)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>add_box</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">Add Resource</h2>
              <p className="text-[10px] text-on-surface-variant">Register a new asset in the inventory</p>
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
            <p className="text-lg font-black text-white uppercase">Resource Added!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Resource Name <span className="text-error">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="E.g. Food Packets, Insulin Supply..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Total Quantity <span className="text-error">*</span></label>
                <input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="500"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Available Qty</label>
                <input type="number" min="0" value={form.quantity_available} onChange={e => setForm(f => ({ ...f, quantity_available: e.target.value }))}
                  placeholder="Defaults to total"
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Unit</label>
                <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  placeholder="units, kg, litres..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none appearance-none" disabled={submitting}>
                  {Object.entries(CAT_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Storage Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Warehouse A, Zone B depot..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
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
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Adding...</>
                  : <><span className="material-symbols-outlined text-sm">add_box</span>Add Resource</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Edit Resource Modal ────────────────────────────────────────────────────────
function EditResourceModal({ resource, onClose, onSuccess }: { resource: Resource; onClose: () => void; onSuccess: () => void }) {
  const cat = (resource as any).category || guessCategory(resource.name);
  const [form, setForm] = useState({
    name: resource.name,
    quantity: String(resource.quantity),
    unit: resource.unit || "",
    location: resource.location || "",
    category: cat,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      await fetchApi(`/resources/${resource.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: form.name, quantity: Number(form.quantity), unit: form.unit || undefined, location: form.location || undefined }),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: any) {
      setError(err?.message || "Failed to update"); setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.06), #0e1420)" }}>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-tight">Edit Resource</h2>
            <p className="text-[10px] text-on-surface-variant">{resource.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        {success ? (
          <div className="px-8 py-14 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            </div>
            <p className="font-black text-white uppercase">Resource Updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Quantity</label>
                <input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Unit</label>
                <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  placeholder="units, kg..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Warehouse / Zone..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
            </div>
            {error && <p className="text-error text-xs font-bold">{error}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>
                  : <><span className="material-symbols-outlined text-sm">save</span>Save</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Allocate to Zone Modal ────────────────────────────────────────────────────
function AllocateModal({ resource, onClose, onSuccess }: { resource: Resource; onClose: () => void; onSuccess: () => void }) {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [form, setForm] = useState({ disaster_id: "", quantity: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState(false);

  useEffect(() => {
    fetchApi("/disasters").then(res => {
      const raw = res?.data;
      const list = Array.isArray(raw) ? raw : (raw?.disasters || []);
      setDisasters(list.filter((d: Disaster) => d.status === "active"));
    }).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.disaster_id || !form.quantity) { setError("Disaster Zone and quantity required."); return; }
    if (Number(form.quantity) > resource.quantity) { setError(`Only ${resource.quantity} ${resource.unit || "units"} available.`); return; }
    setSubmitting(true); setError("");
    try {
      await fetchApi(`/resources/${resource.id}/allocate`, {
        method: "POST",
        body: JSON.stringify({ disaster_id: Number(form.disaster_id), quantity: Number(form.quantity), note: form.note || undefined }),
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1400);
    } catch (err: any) {
      setError(err?.message || "Failed to allocate"); setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !submitting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-5 border-b border-outline-variant/10 flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.08), #0e1420)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>local_shipping</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">Allocate to Zone</h2>
              <p className="text-[10px] text-on-surface-variant">{resource.name} · {resource.quantity.toLocaleString()} {resource.unit || "units"} available</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {success ? (
          <div className="px-8 py-14 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            </div>
            <p className="font-black text-white uppercase">Resources Dispatched!</p>
            <p className="text-xs text-on-surface-variant">Allocation recorded in deployment log.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Target Disaster Zone <span className="text-error">*</span></label>
              {disasters.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic py-2">No active disasters found.</p>
              ) : (
                <select required value={form.disaster_id} onChange={e => setForm(f => ({ ...f, disaster_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 appearance-none" disabled={submitting}>
                  <option value="">Select disaster zone...</option>
                  {disasters.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Quantity to Dispatch <span className="text-error">*</span>
                <span className="ml-2 text-on-surface-variant/50">(max: {resource.quantity.toLocaleString()})</span>
              </label>
              <input required type="number" min="1" max={resource.quantity} value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder={`1–${resource.quantity}`}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Note / Instructions</label>
              <textarea rows={2} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Delivery instructions, priority level, target location..."
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 resize-none transition-colors" disabled={submitting} />
            </div>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
                <span className="material-symbols-outlined text-sm text-error">error</span>
                <p className="text-sm text-error font-bold">{error}</p>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
              <button type="submit" disabled={submitting || disasters.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Dispatching...</>
                  : <><span className="material-symbols-outlined text-sm">local_shipping</span>Dispatch</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ resource, onClose, onSuccess }: { resource: Resource; onClose: () => void; onSuccess: () => void }) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    setDeleting(true);
    try { await fetchApi(`/resources/${resource.id}`, { method: "DELETE" }); onSuccess(); onClose(); }
    catch { setDeleting(false); }
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
            <h3 className="text-lg font-black text-white uppercase">Remove Asset?</h3>
            <p className="text-on-surface-variant text-sm mt-1">Permanently delete <span className="text-white font-bold">{resource.name}</span> from inventory. Cannot be undone.</p>
          </div>
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

// ─── Resource Card (Grid) ───────────────────────────────────────────────────────
function ResourceCard({ r, onEdit, onAllocate, onDelete }: { r: Resource; onEdit: () => void; onAllocate: () => void; onDelete: () => void }) {
  const cat = (r as any).category || guessCategory(r.name);
  const cfg  = CAT_MAP[cat] || CAT_MAP.general;
  // Use quantity as both total and available since DB stores a single number
  const total = r.quantity;
  const avail = r.quantity;
  const pct   = total > 0 ? Math.round((avail / total) * 100) : 0;
  const bar   = stockColor(avail, total);
  const ss    = stockStatus(avail, total);

  return (
    <div className={`bg-surface-container rounded-xl border ${ss.label === "CRITICAL" ? "border-red-500/25" : ss.label === "LOW" ? "border-orange-500/15" : "border-outline-variant/10"} overflow-hidden transition-all hover:shadow-[0_0_24px_rgba(255,179,173,0.06)] relative group`}>

      {/* Card body */}
      <div className="p-6">
        {/* Top row: icon + category badge + delete */}
        <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl ${cfg.bg} border border-white/10 flex items-center justify-center flex-shrink-0`}>
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '"FILL" 1', color: cfg.color }}>{cfg.icon}</span>
          </div>

          {/* Category badge + delete — right-aligned, no overlap */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant uppercase tracking-widest border border-outline-variant/10">
              {cfg.label}
            </span>
            <button onClick={onDelete}
              className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant/30 hover:text-error hover:bg-error/10 transition-all"
              title="Delete asset">
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-lg font-black text-white uppercase tracking-tight leading-tight mb-1 break-words line-clamp-2 min-w-0 pr-2">{r.name}</h4>
        {r.location && <p className="text-[10px] text-on-surface-variant mb-4 flex items-center gap-1 min-w-0"><span className="material-symbols-outlined text-xs shrink-0">location_on</span><span className="truncate">{r.location}</span></p>}

        {/* Stock bar */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-on-surface-variant">Availability</span>
            <span className={ss.color}>{avail.toLocaleString()}/{total.toLocaleString()} {r.unit || "units"}</span>
          </div>
          <div className="w-full bg-surface-container-lowest h-2.5 rounded-full overflow-hidden">
            <div className={`${bar} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Critical warning */}
        {ss.label === "CRITICAL" && (
          <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl mb-4">
            <span className="material-symbols-outlined text-sm">error</span>
            Critical Restock Required
          </div>
        )}
        {ss.label === "LOW" && (
          <div className="flex items-center gap-2 text-orange-400 text-[10px] font-black uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-3 py-2 rounded-xl mb-4">
            <span className="material-symbols-outlined text-sm">warning</span>
            Running Low — Restock Soon
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onAllocate}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all active:scale-95 hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
            <span className="material-symbols-outlined text-sm">local_shipping</span>
            Allocate to Zone
          </button>
          <button onClick={onEdit}
            className="px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:text-white hover:border-white/20 transition-all">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Resource List Row ──────────────────────────────────────────────────────────
function ResourceRow({ r, onEdit, onAllocate, onDelete }: { r: Resource; onEdit: () => void; onAllocate: () => void; onDelete: () => void }) {
  const cat = (r as any).category || guessCategory(r.name);
  const cfg = CAT_MAP[cat] || CAT_MAP.general;
  const ss  = stockStatus(r.quantity, r.quantity);
  const pct = 100;

  return (
    <tr className="hover:bg-surface-container/50 transition-colors group">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1', color: cfg.color }}>{cfg.icon}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">{r.name}</p>
            {r.location && <p className="text-[10px] text-on-surface-variant">{r.location}</p>}
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${ss.bg} ${ss.color} ${ss.border}`}>{cfg.label}</span>
      </td>
      <td className="px-5 py-4 text-sm font-bold text-white">{r.quantity.toLocaleString()} {r.unit || "units"}</td>
      <td className="px-5 py-4">
        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${ss.bg} ${ss.color} ${ss.border}`}>{ss.label}</span>
      </td>
      <td className="px-5 py-4 text-xs text-on-surface-variant">{timeAgo(r.created_at)}</td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button onClick={onAllocate} className="p-2 rounded-lg hover:bg-primary/15 text-on-surface-variant hover:text-primary transition-all" title="Allocate">
            <span className="material-symbols-outlined text-xl">local_shipping</span>
          </button>
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-yellow-500/10 text-on-surface-variant hover:text-yellow-400 transition-all" title="Edit">
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-error/15 text-on-surface-variant hover:text-error transition-all" title="Delete">
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminAssetsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [viewMode, setViewMode]   = useState<"grid" | "list">("grid");

  // Filters
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals
  const [addModal,        setAddModal]        = useState(false);
  const [editResource,    setEditResource]    = useState<Resource | null>(null);
  const [allocateResource, setAllocateResource] = useState<Resource | null>(null);
  const [deleteResource,  setDeleteResource]  = useState<Resource | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [rRes, aRes] = await Promise.all([
        fetchApi("/resources"),
        fetchApi("/resource-allocations").catch(() => null),
      ]);
      const rawR = rRes?.data;
      setResources(Array.isArray(rawR) ? rawR : (rawR?.resources || []));
      if (aRes?.data?.allocations) setAllocations(aRes.data.allocations);
    } catch (e: any) {
      setError(e?.message || "Failed to load assets");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Derived stats
  const stats = useMemo(() => {
    const total   = resources.length;
    const avail   = resources.reduce((s, r) => s + r.quantity, 0);
    const deployed = allocations.reduce((s, a) => s + a.quantity, 0);
    const critical = resources.filter(r => {
      const ss = stockStatus(r.quantity, r.quantity);
      return ss.label === "CRITICAL";
    }).length;
    return { total, avail, deployed, critical };
  }, [resources, allocations]);

  const filtered = useMemo(() => {
    return resources.filter(r => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.location?.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== "all") {
        const ss = stockStatus(r.quantity, r.quantity);
        if (ss.label.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      if (categoryFilter !== "all" && guessCategory(r.name) !== categoryFilter) return false;
      return true;
    });
  }, [resources, search, statusFilter, categoryFilter]);

  return (
    <>
      {addModal         && <AddResourceModal    onClose={() => setAddModal(false)} onSuccess={loadData} />}
      {editResource     && <EditResourceModal   resource={editResource}    onClose={() => setEditResource(null)}    onSuccess={loadData} />}
      {allocateResource && <AllocateModal       resource={allocateResource} onClose={() => setAllocateResource(null)} onSuccess={loadData} />}
      {deleteResource   && <DeleteConfirm       resource={deleteResource}  onClose={() => setDeleteResource(null)}  onSuccess={loadData} />}

      <AdminNav active="/admin/assets" />

      <main className="min-h-screen bg-[#0b0f16] text-on-surface">
        <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-primary font-black uppercase tracking-widest text-[10px] mb-1">INVENTORY MANAGEMENT</p>
              <h1 className="text-4xl font-black tracking-tight uppercase font-['Space_Grotesk'] text-white">Asset Inventory</h1>
              <p className="text-on-surface-variant text-sm mt-1 max-w-xl">Monitor stocks, deploy assets to disaster zones, and manage field resource allocation.</p>
            </div>
            <button onClick={() => setAddModal(true)}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(229,62,62,0.3)] hover:brightness-110 shrink-0"
              style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
              <span className="material-symbols-outlined">add_box</span>
              Add Resource
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Asset Types",  value: stats.total,       badge: "TYPES",    color: "#ffb3ad",  icon: "inventory_2"    },
              { label: "Total Units",        value: stats.avail,       badge: "IN STOCK", color: "#4ade80",  icon: "deployed_code"  },
              { label: "Units Dispatched",   value: stats.deployed,    badge: "IN FIELD", color: "#60a5fa",  icon: "local_shipping" },
              { label: "Critical Stock",     value: stats.critical,    badge: "CRITICAL", color: "#f43f5e",  icon: "warning"        },
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
          <div className="bg-surface-container rounded-xl border border-outline-variant/10 flex flex-wrap items-center divide-x divide-outline-variant/10 overflow-hidden">
            {/* Search */}
            <div className="flex-1 min-w-[220px] relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm text-white placeholder-on-surface-variant/50 focus:outline-none uppercase tracking-wider"
                placeholder="Search asset inventory..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Status */}
            <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[140px]"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Status: All</option>
              <option value="READY">Ready</option>
              <option value="LOW">Low Stock</option>
              <option value="CRITICAL">Critical</option>
            </select>

            {/* Category */}
            <select className="bg-transparent px-5 py-3.5 text-sm text-on-surface-variant focus:outline-none cursor-pointer appearance-none min-w-[150px]"
              value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">Category: All</option>
              {Object.entries(CAT_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>

            {/* View toggle */}
            <div className="flex items-center px-3 py-2 gap-1">
              <button onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:text-white"}`} title="Grid view">
                <span className="material-symbols-outlined text-xl">grid_view</span>
              </button>
              <button onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:text-white"}`} title="List view">
                <span className="material-symbols-outlined text-xl">list</span>
              </button>
            </div>

            {/* Clear */}
            {(search || statusFilter !== "all" || categoryFilter !== "all") && (
              <button onClick={() => { setSearch(""); setStatusFilter("all"); setCategoryFilter("all"); }}
                className="px-5 py-3.5 text-xs font-black uppercase tracking-widest text-error hover:bg-error/10 transition-colors">
                Clear
              </button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : ""}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface-container-low rounded-xl p-6 animate-pulse">
                  <div className="flex gap-4 mb-4"><div className="w-12 h-12 rounded-xl bg-surface-container-high" /><div className="flex-1 space-y-2"><div className="h-4 bg-surface-container-high rounded w-3/4" /><div className="h-3 bg-surface-container-high rounded w-1/2" /></div></div>
                  <div className="h-2 bg-surface-container-high rounded-full mb-3" />
                  <div className="h-10 bg-surface-container-high rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 text-error font-bold">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">inventory_2</span>
              <p className="text-on-surface-variant font-bold">No assets match your filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(r => (
                <ResourceCard key={r.id} r={r}
                  onEdit={() => setEditResource(r)}
                  onAllocate={() => setAllocateResource(r)}
                  onDelete={() => setDeleteResource(r)} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant/10">
                    {["Asset", "Category", "Quantity", "Status", "Added", "Actions"].map((h, i) => (
                      <th key={h} className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-on-surface-variant ${i === 5 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {filtered.map(r => (
                    <ResourceRow key={r.id} r={r}
                      onEdit={() => setEditResource(r)}
                      onAllocate={() => setAllocateResource(r)}
                      onDelete={() => setDeleteResource(r)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent Allocations */}
          {allocations.length > 0 && (
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/5 shadow-xl">
              <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Recent Deployments</h3>
                <span className="text-[10px] text-on-surface-variant">{allocations.length} total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant/10">
                      {["Asset", "Disaster Zone", "Quantity", "Dispatched By", "Time", "Status"].map(h => (
                        <th key={h} className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {allocations.slice(0, 10).map(a => (
                      <tr key={a.id} className="hover:bg-surface-container/50 transition-colors">
                        <td className="px-5 py-4 text-sm font-bold text-white">{a.resource_name}</td>
                        <td className="px-5 py-4 text-xs text-on-surface-variant">{a.disaster_title}</td>
                        <td className="px-5 py-4 text-sm font-bold text-white">{a.quantity.toLocaleString()}</td>
                        <td className="px-5 py-4 text-xs text-on-surface-variant">{a.allocated_by_name}</td>
                        <td className="px-5 py-4 text-xs text-on-surface-variant">{timeAgo(a.allocated_at)}</td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Delivered
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}