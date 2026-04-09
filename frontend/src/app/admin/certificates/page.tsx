"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────────
type Certificate = {
  id: number;
  volunteer_id: number;
  title: string;
  issued_on: string;
  certificate_url: string | null;
  issued_by: number | null;
  created_at: string;
  volunteer_name: string | null;
  volunteer_avatar: string | null;
  volunteer_email: string | null;
  issued_by_name: string | null;
};

type Volunteer = { id: number; user_id: number; user: { name: string; email: string; avatar_url?: string } };

const CERT_TITLES = [
  "Disaster Medical First Responder",
  "Crisis Coordination Specialist",
  "Search & Rescue Operations",
  "Logistics Operations Specialist",
  "Emergency Medical Lead",
  "Field Communications Officer",
  "Hazardous Materials Handling",
  "Humanitarian Assistance Lead",
  "Water & Sanitation Specialist",
  "Community Resilience Trainer",
];

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Admin Nav (shared pattern) ─────────────────────────────────────────────────
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

// ─── PDF Preview Modal ───────────────────────────────────────────────────────────
function PdfPreviewModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <div className="relative z-10 w-full max-w-4xl bg-[#0e1420] border border-[#ffb3ad]/20 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>description</span>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">{cert.title}</h3>
              <p className="text-[10px] text-on-surface-variant">{cert.volunteer_name || `Volunteer #${cert.volunteer_id}`} · Issued {formatDate(cert.issued_on)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cert.certificate_url && (
              <a href={cert.certificate_url} download target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                <span className="material-symbols-outlined text-sm">download</span>Download
              </a>
            )}
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        {/* PDF viewer or mock cert */}
        <div className="m-6 rounded-xl overflow-hidden bg-[#060910]" style={{ height: "580px" }}>
          {cert.certificate_url ? (
            <iframe src={cert.certificate_url} className="w-full h-full border-0" title="Certificate PDF" />
          ) : (
            /* Visual certificate mockup when no PDF uploaded */
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)", backgroundSize: "28px 28px" }} />
              <div className="z-10 text-center space-y-6 max-w-lg px-12 py-10 border-2 border-primary/20 rounded-2xl bg-[#0d131f]/80 backdrop-blur-sm mx-8">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>workspace_premium</span>
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-black text-[#E53E3E] tracking-tighter uppercase block mb-1">ReliefConnect</span>
                  <div className="w-16 h-px bg-primary/30 mx-auto" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Certificate of Completion</h2>
                <p className="text-on-surface-variant italic text-sm">This is to certify that</p>
                <h3 className="text-2xl font-black text-white border-b border-white/10 pb-2">{cert.volunteer_name || "Volunteer"}</h3>
                <p className="text-on-surface-variant text-sm">has successfully completed the training module for</p>
                <h4 className="text-lg font-black text-primary uppercase">{cert.title}</h4>
                <div className="flex justify-between items-end pt-6 border-t border-white/5">
                  <div className="text-left">
                    <p className="font-mono text-[9px] text-on-surface-variant/50 mb-1">CERT-{String(cert.id).padStart(6, "0")}</p>
                    <p className="text-[10px] font-bold text-white">Director Signature</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-on-surface-variant mb-1">ISSUED: {formatDate(cert.issued_on)}</p>
                    <p className="text-[10px] font-bold text-white">Official Seal</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ cert, onClose, onSuccess }: { cert: Certificate; onClose: () => void; onSuccess: () => void }) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    setDeleting(true);
    try { await fetchApi(`/certificates/${cert.id}`, { method: "DELETE" }); onSuccess(); onClose(); }
    catch { setDeleting(false); }
  }
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => !deleting && onClose()}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm bg-[#0e1420] border border-error/30 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-error/15 border border-error/30 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl text-error" style={{ fontVariationSettings: '"FILL" 1' }}>gpp_bad</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase">Revoke Certificate?</h3>
            <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">This will permanently invalidate <span className="text-white font-bold">{cert.title}</span> issued to <span className="text-white font-bold">{cert.volunteer_name || "this volunteer"}</span>. This cannot be undone.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={deleting} className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-error hover:brightness-110 disabled:opacity-60 transition-all active:scale-95">
              {deleting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Revoking...</>
                : <><span className="material-symbols-outlined text-sm">gpp_bad</span>Revoke</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Issue Certificate Panel ───────────────────────────────────────────────────
function IssueCertPanel({ onSuccess }: { onSuccess: () => void }) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [volSearch,  setVolSearch]  = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedVol, setSelectedVol]  = useState<Volunteer | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file,     setFile]     = useState<File | null>(null);
  const [form, setForm] = useState({ title: CERT_TITLES[0], issued_on: new Date().toISOString().slice(0, 10) });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);
  const [dragOver,   setDragOver]   = useState(false);

  useEffect(() => {
    fetchApi("/volunteers").then(res => {
      const raw = res?.data;
      setVolunteers(Array.isArray(raw) ? raw : (raw?.volunteers || []));
    }).catch(() => {});
  }, []);

  const filteredVols = useMemo(() => {
    if (!volSearch) return volunteers.slice(0, 8);
    const q = volSearch.toLowerCase();
    return volunteers.filter(v => v.user.name.toLowerCase().includes(q) || v.user.email.toLowerCase().includes(q)).slice(0, 8);
  }, [volunteers, volSearch]);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVol) { setError("Please select a volunteer."); return; }
    if (!file)        { setError("Please upload a PDF certificate."); return; }
    setSubmitting(true); setError("");
    try {
      const fd = new FormData();
      fd.append("volunteer_id", String(selectedVol.user_id));
      fd.append("title", form.title);
      fd.append("issued_on", form.issued_on);
      fd.append("certificate", file);
      // Use raw fetch because fetchApi sets Content-Type and breaks multipart
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/certificates`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Upload failed");
      }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setSelectedVol(null); setFile(null); setVolSearch(""); onSuccess(); }, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to issue certificate");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="bg-[#0e1420] border border-[#ffb3ad]/15 rounded-2xl overflow-hidden shadow-2xl sticky top-24">
      <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.08), #0e1420)" }}>
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: '"FILL" 1' }}>add_moderator</span>
        </div>
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-tight">Issue New Certificate</h2>
          <p className="text-[10px] text-on-surface-variant">Assign and upload deployment credentials</p>
        </div>
      </div>

      {success ? (
        <div className="px-8 py-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
          </div>
          <p className="text-lg font-black text-white uppercase">Certificate Issued!</p>
          <p className="text-xs text-on-surface-variant">PDF uploaded and saved to DB.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Volunteer search */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Assign to Volunteer <span className="text-error">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-lg">person_search</span>
              <input value={volSearch} onChange={e => { setVolSearch(e.target.value); setShowDropdown(true); setSelectedVol(null); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
              {showDropdown && filteredVols.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-[#0e1420] border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {filteredVols.map(v => (
                    <button key={v.id} type="button" onClick={() => { setSelectedVol(v); setVolSearch(v.user.name); setShowDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors text-left">
                      <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xs flex-shrink-0 overflow-hidden">
                        {v.user.avatar_url ? <img src={v.user.avatar_url} alt="" className="w-full h-full object-cover" /> : v.user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{v.user.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{v.user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedVol && (
              <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl mt-1">
                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm overflow-hidden flex-shrink-0">
                  {selectedVol.user.avatar_url ? <img src={selectedVol.user.avatar_url} alt="" className="w-full h-full object-cover" /> : selectedVol.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{selectedVol.user.name}</p>
                  <p className="text-[10px] text-primary">VOL-{String(selectedVol.user_id).padStart(4, "0")} · Selected</p>
                </div>
                <button type="button" onClick={() => { setSelectedVol(null); setVolSearch(""); }}
                  className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-white transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Certificate Title <span className="text-error">*</span></label>
            <select value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 appearance-none" disabled={submitting}>
              {CERT_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Issue Date */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Issue Date <span className="text-error">*</span></label>
            <div className="relative">
              <input type="date" value={form.issued_on} onChange={e => setForm(f => ({ ...f, issued_on: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors" disabled={submitting} />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Upload PDF Document <span className="text-error">*</span></label>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)} />
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver ? "border-primary bg-primary/5" : file ? "border-green-500/50 bg-green-500/5" : "border-outline-variant/30 hover:border-primary/40"}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}>
              {file ? (
                <div className="flex items-center gap-3 justify-center">
                  <span className="material-symbols-outlined text-green-400 text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>picture_as_pdf</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-green-400 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                    className="ml-2 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-error transition-colors flex-shrink-0">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">upload_file</span>
                  <p className="text-xs text-on-surface-variant">Drag & drop PDF or <span className="text-primary font-bold">browse files</span></p>
                  <p className="text-[9px] text-on-surface-variant/50 mt-1 uppercase font-black tracking-widest">Max 10MB · PDF only</p>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
              <span className="material-symbols-outlined text-sm text-error">error</span>
              <p className="text-sm text-error font-bold">{error}</p>
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95 shadow-[0_4px_20px_rgba(229,62,62,0.3)] hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading & Issuing...</>
            ) : (
              <><span className="material-symbols-outlined">verified</span>Upload & Issue Certificate</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
const SORT_OPTIONS = ["newest", "oldest", "name_asc", "name_desc"] as const;
type SortOption = typeof SORT_OPTIONS[number];

export default function AdminCertificatesPage() {
  const [certs,   setCerts]   = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Filters
  const [search,      setSearch]      = useState("");
  const [sortFilter,  setSortFilter]  = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [deleteCert,  setDeleteCert]  = useState<Certificate | null>(null);

  const loadCerts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/certificates");
      const raw = res?.data;
      setCerts(Array.isArray(raw) ? raw : (raw?.certificates || []));
    } catch (e: any) {
      setError(e?.message || "Failed to load certificates");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCerts(); }, [loadCerts]);

  // Stats
  const stats = useMemo(() => ({
    total:    certs.length,
    pending:  0,  // No pending concept — all issued
    uniqueVols: new Set(certs.map(c => c.volunteer_id)).size,
  }), [certs]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = certs.filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.volunteer_name?.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        String(c.volunteer_id).includes(q)
      );
    });
    switch (sortFilter) {
      case "oldest":    return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "name_asc":  return list.sort((a, b) => (a.volunteer_name || "").localeCompare(b.volunteer_name || ""));
      case "name_desc": return list.sort((a, b) => (b.volunteer_name || "").localeCompare(a.volunteer_name || ""));
      default:          return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [certs, search, sortFilter]);

  return (
    <>
      {previewCert && <PdfPreviewModal cert={previewCert} onClose={() => setPreviewCert(null)} />}
      {deleteCert  && <DeleteConfirm  cert={deleteCert}  onClose={() => setDeleteCert(null)} onSuccess={loadCerts} />}

      <AdminNav active="/admin/certificates" />

      <main className="min-h-screen bg-[#0b0f16] text-on-surface">
        <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">

          {/* Header */}
          <div>
            <p className="text-primary font-black uppercase tracking-widest text-[10px] mb-1">MISSION VERIFICATION & CREDENTIALING MODULE</p>
            <h1 className="text-4xl font-black tracking-tight uppercase font-['Space_Grotesk'] text-white">Certificate Issuance</h1>
            <p className="text-on-surface-variant text-sm mt-1">Issue, manage, and track volunteer deployment credentials.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Issued",          value: stats.total,      badge: "ALL TIME",  color: "#ffb3ad", icon: "workspace_premium" },
              { label: "Volunteers Credentialed",value: stats.uniqueVols, badge: "UNIQUE",    color: "#4ade80", icon: "verified_user"     },
              { label: "Filtered Results",       value: filtered.length,  badge: "SHOWING",   color: "#60a5fa", icon: "filter_list"       },
              { label: "DB Sync",                value: "LIVE",           badge: "ONLINE",    color: "#34d399", icon: "database"          },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-low p-5 rounded-xl border-l-4 relative overflow-hidden" style={{ borderLeftColor: s.color }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">{s.label}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded" style={{ color: s.color, background: `${s.color}18` }}>{s.badge}</span>
                </div>
                <span className="text-3xl font-black text-white font-['Space_Grotesk']">{loading ? "—" : s.value}</span>
                <div className="absolute -bottom-2 -right-2 opacity-5">
                  <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1", color: s.color }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main layout: table + issue panel */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* LEFT: Issued Certificates Table */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-2xl border border-outline-variant/5">

                {/* Table Header */}
                <div className="px-6 py-4 border-b border-outline-variant/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Issued Certificates</h2>
                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
                      <input className="bg-surface-container pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/40 w-56 transition-all"
                        placeholder="Search volunteer or title..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    {/* Filter dropdown */}
                    <div className="relative">
                      <button onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-xl transition-all ${showFilters ? "bg-primary/20 text-primary" : "bg-surface-container text-on-surface-variant hover:text-white"}`}>
                        <span className="material-symbols-outlined text-xl">filter_list</span>
                      </button>
                      {showFilters && (
                        <div className="absolute top-full right-0 mt-1 z-20 bg-[#0e1420] border border-outline-variant/20 rounded-xl shadow-2xl overflow-hidden w-56" onClick={e => e.stopPropagation()}>
                          <p className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">Sort By</p>
                          {([["newest", "Newest First"], ["oldest", "Oldest First"], ["name_asc", "Name A→Z"], ["name_desc", "Name Z→A"]] as [SortOption, string][]).map(([val, label]) => (
                            <button key={val} onClick={() => { setSortFilter(val); setShowFilters(false); }}
                              className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-surface-container transition-colors ${sortFilter === val ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                              {label}
                              {sortFilter === val && <span className="material-symbols-outlined text-sm text-primary">check</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container border-b border-outline-variant/10">
                        {["Volunteer", "Certificate Title", "Issue Date", "Issued By", "File", "Action"].map((h, i) => (
                          <th key={h} className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest text-on-surface-variant ${i >= 4 ? "text-center" : ""}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            {Array.from({ length: 6 }).map((_, j) => (
                              <td key={j} className="px-5 py-4"><div className="h-4 bg-surface-container-high rounded w-3/4" /></td>
                            ))}
                          </tr>
                        ))
                      ) : error ? (
                        <tr><td colSpan={6} className="px-5 py-12 text-center text-error font-bold">{error}</td></tr>
                      ) : filtered.length === 0 ? (
                        <tr><td colSpan={6} className="px-5 py-16 text-center">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-2">workspace_off</span>
                          <p className="text-on-surface-variant font-bold text-sm">No certificates found</p>
                        </td></tr>
                      ) : (
                        filtered.map(cert => (
                          <tr key={cert.id} className="hover:bg-surface-container-high/20 transition-colors group">
                            {/* Volunteer */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-sm overflow-hidden flex-shrink-0">
                                  {cert.volunteer_avatar ? <img src={cert.volunteer_avatar} alt="" className="w-full h-full object-cover" /> : (cert.volunteer_name?.[0]?.toUpperCase() || "?")}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{cert.volunteer_name || `Volunteer #${cert.volunteer_id}`}</p>
                                  <p className="text-[10px] text-on-surface-variant font-mono">VOL-{String(cert.volunteer_id).padStart(4, "0")}</p>
                                </div>
                              </div>
                            </td>
                            {/* Title */}
                            <td className="px-5 py-4">
                              <p className="text-sm font-bold text-white">{cert.title}</p>
                              <p className="text-[9px] font-black text-primary/70 uppercase tracking-widest mt-0.5">CERT-{String(cert.id).padStart(6, "0")}</p>
                            </td>
                            {/* Issue Date */}
                            <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">{formatDate(cert.issued_on)}</td>
                            {/* Issued By */}
                            <td className="px-5 py-4 text-xs text-on-surface-variant">{cert.issued_by_name || "Admin"}</td>
                            {/* PDF File */}
                            <td className="px-5 py-4 text-center">
                              <button onClick={() => setPreviewCert(cert)}
                                className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors hover:scale-110 active:scale-95"
                                title="Preview / Open PDF">
                                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>picture_as_pdf</span>
                              </button>
                            </td>
                            {/* Delete */}
                            <td className="px-5 py-4 text-center">
                              <button onClick={() => setDeleteCert(cert)}
                                className="inline-flex items-center gap-1 text-on-surface-variant hover:text-error transition-colors opacity-50 group-hover:opacity-100"
                                title="Revoke certificate">
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                {!loading && filtered.length > 0 && (
                  <div className="px-6 py-4 border-t border-outline-variant/10 bg-surface-container/20 flex items-center justify-between">
                    <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">
                      {filtered.length} certificate{filtered.length !== 1 ? "s" : ""} {search ? "matched" : "total"}
                    </p>
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      DB Synced
                    </div>
                  </div>
                )}
              </div>

              {/* Command Protocol Note */}
              <div className="bg-surface-container-low border border-primary/10 p-5 rounded-xl flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>security</span>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Command Protocol</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">All certificates issued are stored in the ReliefConnect central database. Revocation is permanently logged and volunteer credentials are immediately invalidated.</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Issue New Certificate */}
            <div className="w-full lg:w-[380px] shrink-0">
              <IssueCertPanel onSuccess={loadCerts} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}