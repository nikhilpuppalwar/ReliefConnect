"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import VolunteerNavBar from "../components/VolunteerNavBar";

// ─── Types ────────────────────────────────────────────────────────────────────
type HelpRequest = {
  id: number;
  title: string;
  description: string;
  location: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "assigned" | "in_progress" | "resolved" | "cancelled";
  created_at: string;
  photo_url?: string | null;
  assigned_to?: { name: string; avatar_url?: string | null } | null;
  requested_by?: { name: string } | null;
};

type FormState = {
  description: string;
  location: string;
  priority: "low" | "medium" | "high" | "critical";
  photo: File | null;
};

type Tab = "all" | "pending" | "assigned" | "in_progress" | "resolved";

// ─── Config ───────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "#ff4444", bg: "rgba(255,68,68,0.12)", border: "rgba(255,68,68,0.35)" },
  high:     { label: "High",     color: "#ff8c42", bg: "rgba(255,140,66,0.12)", border: "rgba(255,140,66,0.3)" },
  medium:   { label: "Medium",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)" },
  low:      { label: "Low",      color: "#4ade80", bg: "rgba(74,222,128,0.10)", border: "rgba(74,222,128,0.25)" },
};

const STATUS_CONFIG = {
  pending:     { label: "Pending",     color: "#94a3b8", dot: "#94a3b8", icon: "schedule" },
  assigned:    { label: "Assigned",    color: "#60a5fa", dot: "#60a5fa", icon: "assignment_ind" },
  in_progress: { label: "In Progress", color: "#ff8c42", dot: "#ff8c42", icon: "directions_run" },
  resolved:    { label: "Resolved",    color: "#4ade80", dot: "#4ade80", icon: "check_circle" },
  cancelled:   { label: "Cancelled",   color: "#6b7280", dot: "#6b7280", icon: "cancel" },
};

const TABS: { key: Tab; label: string }[] = [
  { key: "all",         label: "All" },
  { key: "pending",     label: "Pending" },
  { key: "assigned",    label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved",    label: "Resolved" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VolunteerSOSPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  // Volunteer Data
  const [volunteer, setVolunteer] = useState<any>(null);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // New Request Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [form, setForm] = useState<FormState>({
    description: "",
    location: "",
    priority: "high",
    photo: null,
  });

  // Detail drawer
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<HelpRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ─── Fetch requests ──────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/requests?requested_by=me");
      const raw = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.requests)
        ? res.data.requests
        : [];
      setRequests(raw);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load requests");
    } finally {
      if (volunteer) setLoading(false);
    }
  }, [volunteer]);

  useEffect(() => { 
    if (user) {
      fetchApi(`/volunteers/${user.id}`)
        .then(res => {
           setVolunteer(res.data);
           setLoading(false);
        })
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAvailabilityToggle = async (status: string) => {
    if (!user || updatingAvailability) return;
    setUpdatingAvailability(true);
    try {
      const res = await fetchApi(`/volunteers/${user.id}/availability`, {
        method: "PUT",
        body: JSON.stringify({ availability_status: status.toUpperCase() }),
      });
      setVolunteer(res.data);
    } catch (error) {
      console.error("Failed to update availability", error);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // ─── Filter ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const tabMatch = activeTab === "all" || r.status === activeTab;
      const q = search.toLowerCase();
      const searchMatch =
        !q ||
        r.description?.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q);
      return tabMatch && searchMatch;
    });
  }, [requests, activeTab, search]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    active: requests.filter((r) => r.status === "in_progress" || r.status === "assigned").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
  }), [requests]);

  // ─── Submit new request ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim() || !form.location.trim()) {
      setSubmitError("Description and location are required.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("description", form.description.trim());
      fd.append("location", form.location.trim());
      fd.append("priority", form.priority);
      if (form.photo) fd.append("photo", form.photo);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const resp = await fetch(`${apiBase}/requests`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || "Failed to submit");

      setSubmitSuccess(true);
      setForm({ description: "", location: "", priority: "high", photo: null });
      await fetchRequests();
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowModal(false);
      }, 1800);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Load detail ─────────────────────────────────────────────────────────
  async function openDetail(id: number) {
    setDetailId(id);
    setDetailLoading(true);
    try {
      const res = await fetchApi(`/requests/${id}`);
      setDetailData(res.data);
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="fixed top-0 w-full z-50 h-16">
        <VolunteerNavBar 
          volunteer={volunteer}
          onToggleAvailability={() => handleAvailabilityToggle(volunteer?.availability_status === "AVAILABLE" ? "busy" : "available")}
          isUpdatingAvailability={updatingAvailability}
          onLogout={handleLogout}
        />
      </div>

      <main className="pt-20 pb-20 min-h-screen border-t border-transparent bg-background text-on-background">
        {/* ── Header ── */}
        <div className="relative overflow-hidden border-b border-outline-variant/10">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(255,68,68,0.07) 0%, transparent 60%)" }} />
          <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-error text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>sos</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Emergency Help Center</p>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-['Space_Grotesk'] text-on-surface">
                  My SOS <span className="text-error">Requests</span>
                </h1>
                <p className="text-on-surface-variant text-sm max-w-md">Submit emergency help requests and track their status in real-time.</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowModal(true); setSubmitError(""); setSubmitSuccess(false); }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 shadow-[0_0_30px_rgba(255,68,68,0.3)] hover:brightness-110"
                style={{ background: "linear-gradient(135deg,#ff4444,#ff6b35)" }}
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>add_alert</span>
                New Help Request
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[
                { label: "Total Requests", value: stats.total, color: "#ffb3ad", icon: "assignment" },
                { label: "Pending", value: stats.pending, color: "#94a3b8", icon: "schedule" },
                { label: "Active", value: stats.active, color: "#ff8c42", icon: "directions_run" },
                { label: "Resolved", value: stats.resolved, color: "#4ade80", icon: "check_circle" },
              ].map((s) => (
                <div key={s.label} className="bg-surface-container-low border border-outline-variant/10 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl" style={{ color: s.color, fontVariationSettings: '"FILL" 1' }}>{s.icon}</span>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
                    <p className="text-xl font-black font-['Space_Grotesk']" style={{ color: s.color }}>{loading ? "—" : s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
          {/* ── Search + Tabs ── */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15 text-sm placeholder-on-surface-variant/50 focus:outline-none focus:border-primary/30 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border"
                  style={{
                    background: activeTab === tab.key ? "rgba(255,68,68,0.12)" : "rgba(255,255,255,0.03)",
                    borderColor: activeTab === tab.key ? "rgba(255,68,68,0.4)" : "rgba(255,255,255,0.06)",
                    color: activeTab === tab.key ? "#ff4444" : "var(--color-on-surface-variant)",
                  }}
                >
                  {tab.label}
                  {tab.key !== "all" && (
                    <span className="ml-1.5 text-[9px] font-black opacity-70">
                      ({requests.filter((r) => tab.key === "all" || r.status === tab.key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── List ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-2 border-error border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Loading Requests...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-error">report_problem</span>
              <p className="text-error font-bold mt-2">{error}</p>
              <button type="button" onClick={fetchRequests} className="mt-4 text-primary text-xs font-bold uppercase hover:underline">Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant">inbox</span>
              <p className="text-on-surface-variant font-bold uppercase tracking-widest text-sm">No requests found</p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white"
                style={{ background: "linear-gradient(135deg,#ff4444,#ff6b35)" }}
              >
                <span className="material-symbols-outlined text-sm">add</span>
                File Your First Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((req) => {
                const pc = PRIORITY_CONFIG[req.priority] || PRIORITY_CONFIG.medium;
                const sc = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                return (
                  <article
                    key={req.id}
                    className="relative bg-surface-container-low rounded-2xl border border-outline-variant/10 overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_30px_rgba(255,179,173,0.05)] hover:-translate-y-0.5 flex flex-col"
                  >
                    {/* Priority top-border */}
                    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: pc.color }} />

                    <div className="p-5 flex-1 space-y-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border flex items-center gap-1.5"
                              style={{ color: pc.color, backgroundColor: pc.bg, borderColor: pc.border }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: pc.color }} />
                              {pc.label}
                            </span>
                            <span className="text-[10px] text-on-surface-variant">{timeAgo(req.created_at)}</span>
                          </div>
                          <h3 className="text-base font-black text-on-surface leading-snug">
                            {req.title || req.description?.slice(0, 60)}
                          </h3>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm" style={{ color: sc.dot, fontVariationSettings: '"FILL" 1' }}>{sc.icon}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: sc.dot }}>{sc.label}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">{req.description}</p>

                      {/* Location */}
                      {req.location && (
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                          <span>{req.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-outline-variant/10 px-5 py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {req.assigned_to ? (
                          <>
                            <div className="w-7 h-7 rounded-full border border-primary/30 overflow-hidden bg-surface-container-high flex-shrink-0">
                              {req.assigned_to.avatar_url ? (
                                <img src={req.assigned_to.avatar_url} alt={req.assigned_to.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center text-[10px] font-black text-primary">
                                  {req.assigned_to.name?.[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Responder</p>
                              <p className="text-xs font-bold text-on-surface truncate">{req.assigned_to.name}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-7 h-7 rounded-full border border-outline-variant/30 bg-surface-container-high flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-sm text-on-surface-variant">person_search</span>
                            </div>
                            <p className="text-xs text-on-surface-variant italic">Awaiting assignment</p>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openDetail(req.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-all flex-shrink-0"
                      >
                        View Details
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── New Request Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => !submitting && setShowModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-lg bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.7)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, rgba(255,68,68,0.1) 0%, transparent 60%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-error/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>sos</span>
                </div>
                <div>
                  <h2 className="text-base font-black text-on-surface uppercase tracking-tight font-['Space_Grotesk']">Request SOS Help</h2>
                  <p className="text-[10px] text-on-surface-variant">Submit your emergency request to responders</p>
                </div>
              </div>
              <button type="button" onClick={() => !submitting && setShowModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {submitSuccess ? (
              <div className="px-6 py-14 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                </div>
                <div>
                  <p className="text-lg font-black text-on-surface uppercase">Request Submitted!</p>
                  <p className="text-sm text-on-surface-variant mt-1">Help is on the way. We&apos;ve notified available responders.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Describe Your Emergency <span className="text-error">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the emergency situation in detail — type of help needed, number of people affected, any special circumstances..."
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm placeholder-on-surface-variant/40 focus:outline-none focus:border-error/40 resize-none transition-colors"
                    disabled={submitting}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    Your Location <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">location_on</span>
                    <input
                      required
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="Street, landmark, district, zone..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm placeholder-on-surface-variant/40 focus:outline-none focus:border-error/40 transition-colors"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Priority Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["low", "medium", "high", "critical"] as const).map((p) => {
                      const pc = PRIORITY_CONFIG[p];
                      const active = form.priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, priority: p }))}
                          disabled={submitting}
                          className="py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border"
                          style={{
                            background: active ? pc.bg : "rgba(255,255,255,0.03)",
                            borderColor: active ? pc.border : "rgba(255,255,255,0.06)",
                            color: active ? pc.color : "var(--color-on-surface-variant)",
                            boxShadow: active ? `0 0 12px ${pc.color}33` : "none",
                          }}
                        >
                          {pc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Attach Photo (Optional)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setForm((f) => ({ ...f, photo: e.target.files?.[0] || null }))}
                    disabled={submitting}
                  />
                  {form.photo ? (
                    <div className="flex items-center gap-3 bg-surface-container rounded-xl border border-outline-variant/15 px-4 py-3">
                      <span className="material-symbols-outlined text-primary text-sm">photo</span>
                      <span className="text-sm text-on-surface truncate flex-1">{form.photo.name}</span>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, photo: null }))}
                        className="material-symbols-outlined text-sm text-on-surface-variant hover:text-error transition-colors"
                      >close</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-outline-variant/20 text-sm text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">upload</span>
                      Click to upload photo
                    </button>
                  )}
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
                    <span className="material-symbols-outlined text-sm text-error">error</span>
                    <p className="text-sm text-error font-bold">{submitError}</p>
                  </div>
                )}

                {/* Submit */}
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
                    className="flex-2 flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#ff4444,#ff6b35)" }}
                  >
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    ) : (
                      <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>send</span> Submit SOS</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {detailId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end" onClick={() => setDetailId(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md h-full bg-surface-container-low border-l border-outline-variant/20 overflow-y-auto custom-scrollbar shadow-[0_0_80px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="sticky top-0 bg-surface-container-low/95 backdrop-blur-xl px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">Request Detail</h2>
              <button
                type="button"
                onClick={() => setDetailId(null)}
                className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors"
              >close</button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !detailData ? (
              <div className="text-center py-20 text-on-surface-variant text-sm">Could not load request detail.</div>
            ) : (() => {
              const pc = PRIORITY_CONFIG[detailData.priority] || PRIORITY_CONFIG.medium;
              const sc = STATUS_CONFIG[detailData.status] || STATUS_CONFIG.pending;
              return (
                <div className="p-6 space-y-6">
                  {/* Status + Priority */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5"
                      style={{ color: pc.color, backgroundColor: pc.bg, borderColor: pc.border }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pc.color }} />
                      {pc.label} Priority
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-1.5"
                      style={{ color: sc.dot }}>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>{sc.icon}</span>
                      {sc.label}
                    </span>
                  </div>

                  {/* Title / Description */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Request</p>
                    <p className="font-black text-on-surface text-base">{detailData.title}</p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{detailData.description}</p>
                  </div>

                  {/* Info grid */}
                  <div className="divide-y divide-outline-variant/10 rounded-xl border border-outline-variant/10 overflow-hidden">
                    {[
                      { label: "Request ID", value: `#REQ-${String(detailData.id).padStart(4, "0")}` },
                      { label: "Location", value: detailData.location || "—" },
                      { label: "Submitted", value: timeAgo(detailData.created_at) },
                    ].map((item) => (
                      <div key={item.label} className="px-4 py-3 flex justify-between bg-surface-container-low">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{item.label}</span>
                        <span className="text-xs font-bold text-on-surface">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Assigned Responder */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Assigned Responder</p>
                    {detailData.assigned_to ? (
                      <div className="flex items-center gap-3 bg-surface-container rounded-xl border border-outline-variant/10 p-4">
                        <div className="w-10 h-10 rounded-full border border-primary/30 bg-surface-container-high overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {detailData.assigned_to.avatar_url ? (
                            <img src={detailData.assigned_to.avatar_url} alt={detailData.assigned_to.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-black text-primary">{detailData.assigned_to.name?.[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">{detailData.assigned_to.name}</p>
                          <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Active Responder</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-surface-container rounded-xl border border-outline-variant/10 p-4 opacity-60">
                        <span className="material-symbols-outlined text-on-surface-variant">person_search</span>
                        <p className="text-sm text-on-surface-variant italic">No responder assigned yet</p>
                      </div>
                    )}
                  </div>

                  {/* Photo */}
                  {detailData.photo_url && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Attached Photo</p>
                      <img src={detailData.photo_url} alt="Request evidence" className="w-full rounded-xl border border-outline-variant/10 object-cover" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3 pt-2 border-t border-outline-variant/10">
                    <button
                      type="button"
                      onClick={() => { setDetailId(null); router.push("/volunteer"); }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">dashboard</span>
                      Back to Dashboard
                    </button>
                    {(detailData.status === "pending" || detailData.status === "assigned") && (
                      <button
                        type="button"
                        onClick={() => {
                          setDetailId(null);
                          setShowModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all"
                        style={{ background: "linear-gradient(135deg,#ff4444,#ff6b35)" }}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>add_alert</span>
                        New Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}

