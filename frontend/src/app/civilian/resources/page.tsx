"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type Resource = {
  id: number;
  name: string;
  quantity: number;
  unit: string | null;
  location: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_by: number | null;
  created_at: string;
};

type FormState = {
  name: string;
  quantity: string;
  unit: string;
  location: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  approved: { label: "Available",  color: "#4ade80", bg: "rgba(74,222,128,0.10)",  border: "rgba(74,222,128,0.25)", dot: "#4ade80" },
  pending:  { label: "Pending",    color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.25)", dot: "#fbbf24" },
  rejected: { label: "Unavailable",color: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.25)", dot: "#f87171" },
};

// Smart icon guesser from resource name
function getResourceIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("water") || n.includes("drink")) return "water_drop";
  if (n.includes("food") || n.includes("meal") || n.includes("ration")) return "restaurant";
  if (n.includes("shelter") || n.includes("tent") || n.includes("camp")) return "home";
  if (n.includes("blood") || n.includes("medic") || n.includes("first aid") || n.includes("kit")) return "medical_services";
  if (n.includes("blanket") || n.includes("cloth")) return "dry_cleaning";
  if (n.includes("generator") || n.includes("power") || n.includes("fuel")) return "bolt";
  if (n.includes("vehicle") || n.includes("truck") || n.includes("transport")) return "local_shipping";
  if (n.includes("mask") || n.includes("ppe") || n.includes("glove")) return "masks";
  if (n.includes("sandbag") || n.includes("sand")) return "inventory_2";
  if (n.includes("phone") || n.includes("radio") || n.includes("comm")) return "device_hub";
  return "inventory_2";
}

function getResourceColor(idx: number): string {
  const colors = ["#60a5fa", "#4ade80", "#fb923c", "#a78bfa", "#f472b6", "#34d399", "#fbbf24", "#f87171"];
  return colors[idx % colors.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Emergency contact list (static) ─────────────────────────────────────────
const EMERGENCY_CONTACTS = [
  { label: "NDRF Helpline",    number: "1078",         icon: "emergency",       color: "#f87171" },
  { label: "Police",           number: "100",          icon: "local_police",    color: "#60a5fa" },
  { label: "Ambulance",        number: "108",          icon: "ambulance",       color: "#f87171" },
  { label: "Fire Department",  number: "101",          icon: "local_fire_department", color: "#fb923c" },
  { label: "Red Cross",        number: "1800-111-1111",icon: "favorite",        color: "#f87171" },
  { label: "Disaster Control", number: "1070",         icon: "crisis_alert",    color: "#a78bfa" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CivilianResourcesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all");

  // Submit new resource modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", quantity: "", unit: "", location: "" });

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchApi("/resources");
      const raw = Array.isArray(res?.data?.resources)
        ? res.data.resources
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setResources(raw);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  // ─── Filter ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const statusMatch = filterStatus === "all" || r.status === filterStatus;
      const q = search.toLowerCase();
      const searchMatch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.location || "").toLowerCase().includes(q) ||
        (r.unit || "").toLowerCase().includes(q);
      return statusMatch && searchMatch;
    });
  }, [resources, search, filterStatus]);

  const stats = useMemo(() => ({
    total: resources.length,
    available: resources.filter((r) => r.status === "approved").length,
    pending: resources.filter((r) => r.status === "pending").length,
  }), [resources]);

  // ─── Submit resource ─────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setSubmitError("Resource name is required."); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      await fetchApi("/resources", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          quantity: form.quantity ? parseFloat(form.quantity) : 0,
          unit: form.unit.trim() || null,
          location: form.location.trim() || null,
        }),
      });
      setSubmitSuccess(true);
      setForm({ name: "", quantity: "", unit: "", location: "" });
      await fetchResources();
      setTimeout(() => { setSubmitSuccess(false); setShowModal(false); }, 1800);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0d131f]/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-white/5 shadow-[0_0_20px_rgba(255,179,173,0.06)]">
        <div className="flex items-center gap-4">
          <span
            onClick={() => router.push("/civilian/dashboard")}
            className="text-xl font-black tracking-tighter text-primary font-['Space_Grotesk'] uppercase cursor-pointer"
          >ReliefConnect</span>
          <span className="bg-surface-container-high text-primary text-[10px] font-black px-2 py-0.5 rounded-sm border border-primary/20 tracking-widest hidden sm:inline">CIVILIAN PORTAL</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Dashboard", href: "/civilian/dashboard" },
            { label: "Reports",   href: "/civilian/report" },
            { label: "Resources", href: "/civilian/resources" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => router.push(item.href)}
              className={`font-['Space_Grotesk'] uppercase tracking-tight text-sm font-bold transition-all ${
                item.label === "Resources"
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-on-background opacity-60 hover:opacity-100 hover:text-primary"
              }`}
            >{item.label}</button>
          ))}
        </div>
        <button type="button" onClick={() => router.push("/civilian/profile")}
          className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm">person</span>
        </button>
      </nav>

      <main className="pt-20 pb-20 min-h-screen bg-background text-on-background">
        {/* ── Hero ── */}
        <div className="relative overflow-hidden border-b border-outline-variant/10">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(96,165,250,0.07) 0%, transparent 60%)" }} />
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
          <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-400 text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>inventory_2</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Relief Resource Hub</p>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-['Space_Grotesk'] text-on-surface">
                  Aid &amp; Relief <span className="text-blue-400">Resources</span>
                </h1>
                <p className="text-on-surface-variant text-sm max-w-lg">Real-time inventory of available relief materials, shelter, and emergency aid. Report a resource to help your community.</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowModal(true); setSubmitError(""); setSubmitSuccess(false); }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Report Resource
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-8 max-w-md">
              {[
                { label: "Total",     value: stats.total,     color: "#60a5fa" },
                { label: "Available", value: stats.available, color: "#4ade80" },
                { label: "Pending",   value: stats.pending,   color: "#fbbf24" },
              ].map((s) => (
                <div key={s.label} className="bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-black font-['Space_Grotesk']" style={{ color: s.color }}>{loading ? "—" : s.value}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* ── Search + Filter ── */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                placeholder="Search resources, locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-container-low border border-outline-variant/15 text-sm placeholder-on-surface-variant/50 focus:outline-none focus:border-blue-400/40 transition-colors"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg hover:text-on-surface">
                  close
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {(["all", "approved", "pending"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border"
                  style={{
                    background: filterStatus === s ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.03)",
                    borderColor: filterStatus === s ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.06)",
                    color: filterStatus === s ? "#60a5fa" : "var(--color-on-surface-variant)",
                  }}
                >
                  {s === "all" ? "All" : s === "approved" ? "Available" : "Pending"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Grid or states ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Loading Resources...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 space-y-3">
              <span className="material-symbols-outlined text-5xl text-error">cloud_off</span>
              <p className="text-error font-bold">{error}</p>
              <button type="button" onClick={fetchResources} className="text-primary text-xs font-bold uppercase hover:underline">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant">search_off</span>
              <p className="text-on-surface-variant font-bold uppercase tracking-widest text-sm">
                {resources.length === 0 ? "No resources have been added yet" : "No resources match your search"}
              </p>
              {resources.length === 0 && (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white"
                  style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Be the first to report a resource
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((res, idx) => {
                const ss = STATUS_STYLES[res.status] || STATUS_STYLES.approved;
                const icon = getResourceIcon(res.name);
                const color = getResourceColor(idx);
                const qtyLabel = res.quantity !== null && res.quantity !== undefined
                  ? `${Number(res.quantity).toLocaleString()}${res.unit ? ` ${res.unit}` : ""}`
                  : null;

                return (
                  <div
                    key={res.id}
                    className="relative bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden transition-all duration-200 hover:border-blue-400/20 hover:shadow-[0_0_30px_rgba(96,165,250,0.05)] flex flex-col"
                  >
                    {/* Status bar at top */}
                    <div className="h-0.5 w-full" style={{ backgroundColor: ss.color }} />

                    <div className="p-5 flex-1 space-y-4">
                      {/* Icon + Name */}
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                          <span className="material-symbols-outlined text-xl" style={{ color, fontVariationSettings: '"FILL" 1' }}>{icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-sm text-on-surface leading-snug">{res.name}</h3>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">Added {timeAgo(res.created_at)}</p>
                        </div>
                        {/* Status badge */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ss.dot }} />
                          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: ss.color }}>{ss.label}</span>
                        </div>
                      </div>

                      {/* Quantity */}
                      {qtyLabel && (
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm" style={{ color }}>scale</span>
                          <span className="text-sm font-black text-on-surface">{qtyLabel}</span>
                          <span className="text-[10px] text-on-surface-variant">available</span>
                        </div>
                      )}

                      {/* Location */}
                      {res.location && (
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm text-blue-400">location_on</span>
                          <span>{res.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer actions */}
                    <div className="border-t border-outline-variant/10 px-4 py-3 flex gap-2">
                      {res.status === "approved" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => router.push("/civilian/sos")}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                            style={{ background: `${color}15`, border: `1px solid ${color}40`, color }}
                          >
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>sos</span>
                            Request Help
                          </button>
                          <button
                            type="button"
                            title="Bookmark"
                            className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant/15 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">bookmark</span>
                          </button>
                        </>
                      ) : res.status === "pending" ? (
                        <div className="flex-1 flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-on-surface-variant bg-surface-container border border-outline-variant/10">
                          <span className="material-symbols-outlined text-sm text-yellow-400">schedule</span>
                          Awaiting admin approval
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-on-surface-variant bg-surface-container border border-outline-variant/10 opacity-60">
                          <span className="material-symbols-outlined text-sm text-error">block</span>
                          Not available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Emergency Contacts ── */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-outline-variant/10" />
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Emergency Contacts</p>
              <div className="h-px flex-1 bg-outline-variant/10" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              {EMERGENCY_CONTACTS.map((ec) => (
                <a
                  key={ec.label}
                  href={`tel:${ec.number}`}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant/10 bg-surface-container-low hover:border-opacity-50 transition-all hover:-translate-y-0.5 text-center"
                  style={{ "--tw-border-opacity": "0.3" } as React.CSSProperties}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${ec.color}15` }}
                  >
                    <span className="material-symbols-outlined text-xl" style={{ color: ec.color, fontVariationSettings: '"FILL" 1' }}>{ec.icon}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors">{ec.label}</p>
                    <p className="text-sm font-black mt-0.5" style={{ color: ec.color }}>{ec.number}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ── Big Emergency CTA ── */}
          <div className="relative overflow-hidden rounded-2xl border border-error/25 p-6">
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,68,68,0.06) 0%, transparent 60%)" }} />
            <div className="absolute right-4 top-0 bottom-0 flex items-center opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[120px] text-error" style={{ fontVariationSettings: '"FILL" 1' }}>emergency</span>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                  <span className="text-[10px] font-black text-error uppercase tracking-widest">Emergency</span>
                </div>
                <p className="text-xl font-black text-on-surface">Need Immediate Help?</p>
                <p className="text-sm text-on-surface-variant mt-0.5">Submit an SOS request or call the national disaster helpline.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:1078"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-error transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>call</span>
                  Call 1078
                </a>
                <button
                  type="button"
                  onClick={() => router.push("/civilian/sos")}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest border border-error/35 text-error hover:bg-error/10 transition-all"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>sos</span>
                  SOS Request
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Report Resource Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => !submitting && setShowModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.7)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, rgba(96,165,250,0.08) 0%, transparent 60%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-400/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-400 text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>inventory_2</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-on-surface uppercase tracking-tight font-['Space_Grotesk']">Report a Resource</h2>
                  <p className="text-[10px] text-on-surface-variant">Submit relief materials for community use</p>
                </div>
              </div>
              <button type="button" onClick={() => !submitting && setShowModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {submitSuccess ? (
              <div className="px-6 py-14 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                </div>
                <div>
                  <p className="text-lg font-black text-on-surface uppercase">Resource Submitted!</p>
                  <p className="text-sm text-on-surface-variant mt-1">Your report is pending admin review. Thank you!</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Resource Name <span className="text-error">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Drinking Water, First Aid Kit, Blankets..."
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm placeholder-on-surface-variant/40 focus:outline-none focus:border-blue-400/40 transition-colors"
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.quantity}
                      onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                      placeholder="100"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm placeholder-on-surface-variant/40 focus:outline-none focus:border-blue-400/40 transition-colors"
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Unit</label>
                    <input
                      type="text"
                      value={form.unit}
                      onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                      placeholder="litres, kgs, units..."
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm placeholder-on-surface-variant/40 focus:outline-none focus:border-blue-400/40 transition-colors"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Location / Collection Point</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">location_on</span>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="Street, landmark, district..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm placeholder-on-surface-variant/40 focus:outline-none focus:border-blue-400/40 transition-colors"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="bg-blue-400/8 border border-blue-400/20 rounded-xl px-4 py-3 flex gap-2">
                  <span className="material-symbols-outlined text-sm text-blue-400 flex-shrink-0 mt-0.5">info</span>
                  <p className="text-xs text-on-surface-variant">Your submission will be reviewed by an admin and listed as approved once verified.</p>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
                    <span className="material-symbols-outlined text-sm text-error">error</span>
                    <p className="text-sm text-error font-bold">{submitError}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all"
                  >Cancel</button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
                  >
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <><span className="material-symbols-outlined text-sm">send</span> Submit</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
