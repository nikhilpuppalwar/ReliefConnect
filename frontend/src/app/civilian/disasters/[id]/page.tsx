"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

type DisasterDetail = {
  id: number;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  reported_by?: { name?: string; avatar_url?: string } | null;
  media?: Array<{ media_url?: string; file_url?: string }>;
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; glow: string; bar: number }> = {
  critical: { label: "CRITICAL", color: "#ff4444", bg: "rgba(255,68,68,0.12)", border: "rgba(255,68,68,0.4)", glow: "rgba(255,68,68,0.25)", bar: 100 },
  high: { label: "HIGH RISK", color: "#ff8c42", bg: "rgba(255,140,66,0.12)", border: "rgba(255,140,66,0.4)", glow: "rgba(255,140,66,0.2)", bar: 75 },
  medium: { label: "MODERATE", color: "#ffc300", bg: "rgba(255,195,0,0.12)", border: "rgba(255,195,0,0.4)", glow: "rgba(255,195,0,0.15)", bar: 50 },
  low: { label: "LOW RISK", color: "#4ade80", bg: "rgba(74,222,128,0.10)", border: "rgba(74,222,128,0.3)", glow: "rgba(74,222,128,0.1)", bar: 25 },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "ACTIVE THREAT", color: "#ff4444", dot: "#ff4444" },
  responding: { label: "RESPONDING", color: "#ff8c42", dot: "#ff8c42" },
  contained: { label: "CONTAINED", color: "#ffc300", dot: "#ffc300" },
  resolved: { label: "RESOLVED", color: "#4ade80", dot: "#4ade80" },
};

const TYPE_ICONS: Record<string, string> = {
  flood: "water",
  earthquake: "crisis_alert",
  fire: "local_fire_department",
  cyclone: "cyclone",
  landslide: "landslide",
  other: "emergency",
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return "Unknown";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DisasterDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<DisasterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchApi(`/disasters/${params.id}`);
        if (!mounted) return;
        setData(res.data);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load disaster");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold">Loading Incident Data...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-background text-on-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-error">report_problem</span>
          <p className="text-error font-bold uppercase tracking-widest">{error || "Incident not found"}</p>
          <button onClick={() => router.push("/civilian/dashboard")} className="btn-primary mt-2" type="button">
            Return to Command
          </button>
        </div>
      </main>
    );
  }

  const sev = SEVERITY_CONFIG[data.severity?.toLowerCase()] || SEVERITY_CONFIG.low;
  const stat = STATUS_CONFIG[data.status?.toLowerCase()] || STATUS_CONFIG.active;
  const typeIcon = TYPE_ICONS[data.type?.toLowerCase()] || "emergency";
  const mediaList = (data.media || []).map(m => m.media_url || m.file_url).filter(Boolean) as string[];
  const hasMedia = mediaList.length > 0;

  return (
    <>
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0d131f]/80 backdrop-blur-xl flex items-center px-6 h-16 border-b border-white/5 shadow-[0_0_30px_rgba(255,68,68,0.06)]">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.push("/civilian/dashboard")}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
            type="button"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Command Center</span>
          </button>
          <div className="h-5 w-px bg-outline-variant/30 hidden sm:block" />
          <span className="text-xl font-bold tracking-tighter text-primary font-['Space_Grotesk'] uppercase hidden sm:block">ReliefConnect</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">INCIDENT DISPATCH</span>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: stat.dot }} />
        </div>
      </nav>

      <main className="pt-20 pb-16 min-h-screen bg-background text-on-background">
        {/* Hero Section */}
        <div
          className="relative overflow-hidden border-b"
          style={{ borderColor: sev.border, boxShadow: `0 0 60px ${sev.glow}` }}
        >
          {/* Background bleed from media */}
          {hasMedia && (
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center scale-105 blur-xl"
              style={{ backgroundImage: `url(${mediaList[0]})` }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${sev.bg} 0%, rgba(13,19,31,0.95) 60%)` }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {/* Breadcrumb ID */}
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                INC-{String(data.id).padStart(4, "0")} · {timeAgo(data.created_at)}
              </p>

              {/* Type + Status Row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-surface-container-low/80 border rounded-full px-3 py-1.5" style={{ borderColor: sev.border }}>
                  <span className="material-symbols-outlined text-sm" style={{ color: sev.color }}>{typeIcon}</span>
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: sev.color }}>{data.type?.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ backgroundColor: sev.bg, borderColor: sev.border }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: sev.color }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: sev.color }}>{sev.label}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-surface-container-low/60">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: stat.dot }} />
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: stat.color }}>{stat.label}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-tight font-['Space_Grotesk'] text-on-surface">
                {data.title}
              </h1>

              {/* Location */}
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                <span className="text-sm">{data.location || "Location unknown"}</span>
                {data.latitude && data.longitude && (
                  <span className="text-[10px] text-on-surface-variant/50 font-mono">
                    ({data.latitude.toFixed(4)}, {data.longitude.toFixed(4)})
                  </span>
                )}
              </div>

              {/* Severity Meter */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Threat Level</span>
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: sev.color }}>{sev.bar}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${sev.bar}%`, backgroundColor: sev.color, boxShadow: `0 0 8px ${sev.color}` }}
                  />
                </div>
              </div>
            </div>

            {/* Media Preview */}
            <div className="relative">
              {hasMedia ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: sev.border, height: "240px" }}>
                    <img
                      src={mediaList[activeImg]}
                      alt={`Incident media ${activeImg + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md rounded px-2 py-1">
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE FEED · CAM {activeImg + 1}</span>
                    </div>
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-3 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-black text-white">REC</span>
                    </div>
                  </div>
                  {mediaList.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {mediaList.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImg(i)}
                          type="button"
                          className="flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all"
                          style={{ borderColor: i === activeImg ? sev.color : "transparent" }}
                        >
                          <img src={url} alt={`thumb ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="rounded-xl border flex flex-col items-center justify-center h-52 gap-3"
                  style={{ borderColor: sev.border, backgroundColor: sev.bg }}
                >
                  <span className="material-symbols-outlined text-6xl" style={{ color: sev.color }}>{typeIcon}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">No Media Captured</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Brief */}
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-sm">description</span>
                <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Incident Brief</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-on-surface leading-relaxed text-sm">
                  {data.description || "No description provided for this incident."}
                </p>
              </div>
            </div>

            {/* Media Gallery */}
            {hasMedia && (
              <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-sm">photo_library</span>
                    <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Evidence Gallery</h2>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant">{mediaList.length} FILE{mediaList.length !== 1 ? "S" : ""}</span>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaList.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className="relative group rounded-lg overflow-hidden aspect-video border border-outline-variant/10 hover:border-primary/40 transition-all"
                    >
                      <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl">open_in_full</span>
                      </div>
                      <div className="absolute bottom-1 left-1 text-[9px] font-black text-white bg-black/60 rounded px-1.5">
                        CAM {i + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/civilian/sos")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                style={{ background: sev.bg, border: `1px solid ${sev.border}`, color: sev.color }}
                type="button"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>emergency</span>
                Request SOS Help
              </button>
              <button
                onClick={() => router.push("/civilian/report")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-black text-xs uppercase tracking-widest transition-all border border-outline-variant/20 active:scale-95"
                type="button"
              >
                <span className="material-symbols-outlined text-sm">campaign</span>
                Report Update
              </button>
              <Link
                href="/civilian/dashboard"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-black text-xs uppercase tracking-widest transition-all border border-outline-variant/20"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                All Incidents
              </Link>
            </div>
          </div>

          {/* Right: Sidebar Info */}
          <div className="space-y-5">
            {/* Incident Metadata */}
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant/10">
                <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Incident Metadata</h2>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {[
                  { label: "Incident ID", value: `INC-${String(data.id).padStart(4, "0")}` },
                  { label: "Type", value: data.type?.toUpperCase() || "—" },
                  { label: "Severity", value: sev.label, color: sev.color },
                  { label: "Status", value: stat.label, color: stat.color },
                  { label: "Location", value: data.location || "Unknown" },
                  { label: "Reported", value: timeAgo(data.created_at) },
                  { label: "Last Update", value: timeAgo(data.updated_at || data.created_at) },
                  ...(data.reported_by?.name ? [{ label: "Reported By", value: data.reported_by.name }] : []),
                ].map((item) => (
                  <div key={item.label} className="px-5 py-3 flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{item.label}</span>
                    <span
                      className="text-xs font-bold text-right max-w-32 truncate"
                      style={{ color: (item as { color?: string }).color || "var(--color-on-surface)" }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordinates Card */}
            {data.latitude && data.longitude && (
              <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-sm">my_location</span>
                  <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Coordinates</h2>
                </div>
                <div className="px-5 py-4 space-y-2">
                  <div className="font-mono text-sm text-on-surface">{data.latitude.toFixed(6)}° N</div>
                  <div className="font-mono text-sm text-on-surface">{data.longitude.toFixed(6)}° E</div>
                  <a
                    href={`https://maps.google.com/?q=${data.latitude},${data.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mt-2 hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Open in Maps
                  </a>
                </div>
              </div>
            )}

            {/* Response Status */}
            <div
              className="rounded-xl border p-5 space-y-3"
              style={{ backgroundColor: sev.bg, borderColor: sev.border }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: stat.dot }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: stat.color }}>Response Status</span>
              </div>
              <p className="text-sm font-bold text-on-surface">
                {data.status === "active"
                  ? "Emergency response teams are being mobilized to this location."
                  : data.status === "responding"
                  ? "Active response teams on ground. Relief operations underway."
                  : data.status === "contained"
                  ? "Situation is being stabilized. Monitoring continues."
                  : "Incident resolved. Recovery operations in progress."}
              </p>
              <button
                onClick={() => router.push("/civilian/sos")}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                style={{ backgroundColor: stat.dot + "22", border: `1px solid ${stat.dot}55`, color: stat.dot }}
                type="button"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>sos</span>
                Request Help
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
