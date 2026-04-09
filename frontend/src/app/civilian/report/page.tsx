"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "video/mp4"];
const MAX_MB = 25;

export default function Page() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("flood");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("high");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const firstPreview = useMemo(() => {
    if (!files.length) return "";
    return URL.createObjectURL(files[0]);
  }, [files]);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = Array.from(incoming).filter((f) => {
      if (!ALLOWED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_MB * 1024 * 1024) return false;
      return true;
    });
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (title.trim().length < 10) return setError("Disaster title must be at least 10 characters.");
    if (description.trim().length < 20) return setError("Description must be at least 20 characters.");
    if (!location.trim()) return setError("Location is required.");

    const token = localStorage.getItem("token");
    if (!token) {
      sessionStorage.setItem("redirectAfter", "/civilian/report");
      router.push("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("severity", severity);
    formData.append("description", description);
    formData.append("location", location);
    if (latitude.trim()) formData.append("latitude", latitude);
    if (longitude.trim()) formData.append("longitude", longitude);
    files.forEach((file) => formData.append("media", file));

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/disasters`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload?.message || "Failed to submit disaster report.");
        return;
      }

      setSuccess("Disaster report submitted successfully.");
      setTimeout(() => router.push("/civilian/dashboard"), 2500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#0d131f]/70 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold tracking-tighter text-[#ffb3ad] font-['Space_Grotesk'] uppercase tracking-tight">ReliefConnect</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-['Space_Grotesk'] uppercase tracking-tight text-sm">
          <Link className="text-[#dde2f3] opacity-70 hover:text-[#ffb3ad] transition-all" href="/civilian/dashboard">Dashboard</Link>
          <Link className="text-[#ffb3ad] border-b-2 border-[#ff5450] pb-1" href="/civilian/report">Reports</Link>
          <Link className="text-[#dde2f3] opacity-70 hover:text-[#ffb3ad] transition-all" href="/civilian/resources">Resources</Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-[#ffb3ad] p-2 hover:bg-surface-container rounded-full transition-all" type="button">
            notifications
          </button>
          <button
            className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant/30"
            onClick={() => router.push("/civilian/profile")}
            title="Open Profile"
            type="button"
          >
            <img
              alt="Civilian User Profile"
              className="w-full h-full object-cover"
              src={user?.avatar_url || "https://ui-avatars.com/api/?name=Civilian&background=1f2937&color=ffffff"}
            />
          </button>
          <button
            className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            type="button"
            title="Logout"
          >
            logout
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="font-headline font-extrabold text-5xl md:text-6xl tracking-tighter text-on-background mb-2">INCIDENT DISPATCH</h1>
          <p className="font-body text-outline uppercase tracking-widest text-xs opacity-80">Mission Critical • Civilian Portal • Real-time Uplink</p>
        </header>

        {error && <div className="mb-6 p-3 bg-error/10 border border-error/30 rounded text-error text-sm">{error}</div>}

        <form className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start" onSubmit={handleSubmit}>
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-surface-container-low rounded-xl p-8 border-l-4 border-primary shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">assignment_late</span>
                <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">BASIC INCIDENT DATA</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-label uppercase text-outline mb-2 tracking-widest">Disaster Title</label>
                  <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 py-3 px-0 text-on-surface" placeholder="Briefly describe the emergency (min 10 chars)" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-label uppercase text-outline mb-2 tracking-widest">Disaster Type</label>
                    <select className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 py-3 px-0 text-on-surface" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="flood">Flood</option>
                      <option value="earthquake">Earthquake</option>
                      <option value="fire">Fire</option>
                      <option value="cyclone">Cyclone</option>
                      <option value="landslide">Landslide</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase text-outline mb-2 tracking-widest">Severity Level</label>
                    <select className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 py-3 px-0 text-on-surface" value={severity} onChange={(e) => setSeverity(e.target.value as "low" | "medium" | "high" | "critical")}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-label uppercase text-outline mb-2 tracking-widest">Detailed Description</label>
                  <textarea className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 py-3 px-0 text-on-surface resize-none" placeholder="Provide as much tactical detail as possible... (min 20 chars)" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
            </section>

            <section className="bg-surface-container-low rounded-xl p-8 border-l-4 border-outline shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-outline">location_on</span>
                <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">GEOSPATIAL COORDINATES</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-label uppercase text-outline mb-2 tracking-widest">Location Name</label>
                  <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 py-3 px-0 text-on-surface" placeholder="Intersection, Landmark, or District" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-label uppercase text-outline mb-2 tracking-widest">Latitude</label>
                    <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 py-3 px-0 text-on-surface" placeholder="00.0000" type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-label uppercase text-outline mb-2 tracking-widest">Longitude</label>
                    <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 py-3 px-0 text-on-surface" placeholder="00.0000" type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-low rounded-xl p-8 border-l-4 border-outline-variant shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-outline">cloud_upload</span>
                <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">VISUAL INTELLIGENCE</h2>
              </div>

              <label className="border-2 border-dashed border-outline-variant/40 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-surface-container-lowest block">
                <span className="material-symbols-outlined text-5xl text-outline/40 mb-2 block">add_photo_alternate</span>
                <p className="font-headline text-lg text-on-surface font-medium">Upload photos/videos</p>
                <p className="text-outline text-xs mt-2 uppercase tracking-widest">Max 25MB each • JPG, PNG, MP4</p>
                <input
                  accept=".jpg,.jpeg,.png,.mp4"
                  className="hidden"
                  multiple
                  type="file"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </label>

              {files.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                  {files.map((file, idx) => (
                    <div key={`${file.name}-${idx}`} className="aspect-square bg-surface-container-high rounded-lg overflow-hidden relative border border-outline-variant/20">
                      <img className="w-full h-full object-cover" src={URL.createObjectURL(file)} alt={file.name} />
                      <button
                        className="absolute top-1 right-1 bg-error-container text-on-error-container material-symbols-outlined text-xs p-1 rounded"
                        onClick={() => removeFile(idx)}
                        type="button"
                      >
                        close
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="space-y-4">
              <button className="block w-full py-5 bg-gradient-to-r from-primary-container to-tertiary-container text-on-primary-container font-headline font-black text-xl uppercase tracking-tighter rounded-xl text-center disabled:opacity-60" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Disaster Report"}
              </button>
            </div>
          </div>

          <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            <div className="bg-surface-container rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10">
              <div className="bg-surface-container-highest px-6 py-4 border-b border-outline-variant/20">
                <h3 className="font-headline font-bold text-sm tracking-widest text-on-surface uppercase">Live Transmission Preview</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                    {severity.toUpperCase()} SEVERITY
                  </span>
                  <span className="text-[10px] text-outline font-mono">STATUS: DRAFT</span>
                </div>
                <h4 className="font-headline text-2xl font-black text-primary leading-none uppercase tracking-tighter">
                  {title || "UNNAMED INCIDENT"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-surface-container-highest text-on-surface text-[10px] px-2 py-1 rounded-sm uppercase tracking-widest">
                    TYPE: {type || "---"}
                  </span>
                  <span className="bg-surface-container-highest text-on-surface text-[10px] px-2 py-1 rounded-sm uppercase tracking-widest">
                    LOC: {location || "---"}
                  </span>
                </div>
                <div className="h-40 w-full bg-surface-container-lowest rounded-lg border border-outline-variant/20 overflow-hidden relative">
                  {firstPreview ? (
                    <img className="w-full h-full object-cover" src={firstPreview} alt="Preview" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-mono text-outline/50">AWAITING VISUAL FEED</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant italic">
                  Live preview updates as you type. Submission stores disaster data in DB and media links in DB after upload.
                </p>
              </div>
            </div>
          </aside>
        </form>
      </main>

      {/* Success Popup Modal */}
      {success && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm bg-[#0e1420] border border-green-500/30 rounded-2xl shadow-[0_0_80px_rgba(74,222,128,0.2)] p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-green-400">check_circle</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-2">Report Submitted</h2>
            <p className="text-sm text-on-surface-variant mb-6">{success}</p>
            <button onClick={() => router.push("/civilian/dashboard")} className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold uppercase tracking-widest rounded-xl transition-colors">
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}