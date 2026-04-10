"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { useRef } from "react";

export default function AdminProfilePage() {
  const { user, token, login, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
      });
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetchApi(`/users/${user?.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: form.name, phone: form.phone, location: form.location }),
      });
      if (res.success && token && user) {
        // Update context so the UI reflects changes immediately
        login(token, { ...user, name: res.data.name, phone: res.data.phone, location: res.data.location });
      }
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetchApi(`/users/${user.id}/avatar`, {
        method: "POST",
        body: formData,
      });

      if (res.success && token) {
        login(token, { ...user, avatar_url: res.data.avatar_url });
        setSuccess("Profile picture updated!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f16] text-on-surface">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#0d131f]/95 backdrop-blur-xl border-b border-[#ffb3ad]/10">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/admin")} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span className="text-xs font-black uppercase tracking-widest hidden sm:block">Dashboard</span>
            </button>
            <div className="h-5 w-px bg-outline-variant/20 hidden sm:block" />
            <span className="text-xl font-black text-[#E53E3E] font-['Space_Grotesk'] uppercase">ReliefConnect</span>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-error border border-error/20 hover:bg-error/10 px-3 py-1.5 rounded-lg transition-all">
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden sm:block">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white uppercase font-['Space_Grotesk'] tracking-tight">Admin Profile</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage your administrator account settings and credentials.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-center">
              
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-24 h-24 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4 text-3xl font-black text-primary shadow-[0_0_30px_rgba(229,62,62,0.2)] cursor-pointer overflow-hidden transition-all hover:scale-105"
              >
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || "A"
                )}
                
                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
              </div>
              <p className="text-lg font-black text-white">{user?.name || "Admin"}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-sm">shield</span>
                <span className="text-sm font-black text-primary uppercase tracking-widest">Global Overseer</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-3">{user?.email}</p>

              <div className="mt-6 pt-6 border-t border-outline-variant/10 space-y-3">
                {[
                  { label: "Role", value: "Administrator" },
                  { label: "Access Level", value: "Level 5 — Full" },
                  { label: "Status", value: "Active", color: "#4ade80" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-on-surface-variant font-bold">{item.label}</span>
                    <span className="font-black" style={{ color: item.color || "white" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2">
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6 pb-4 border-b border-outline-variant/10">Account Information</h3>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white focus:outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-surface-container/50 border border-outline-variant/10 text-sm text-on-surface-variant cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Location / Base</label>
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="Command HQ, Mumbai"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/15 text-sm text-white placeholder-on-surface-variant/40 focus:outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 border border-error/25">
                    <span className="material-symbols-outlined text-sm text-error">error</span>
                    <p className="text-sm text-error font-bold">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/25">
                    <span className="material-symbols-outlined text-sm text-green-400">check_circle</span>
                    <p className="text-sm text-green-400 font-bold">{success}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-60 transition-all active:scale-95"
                    style={{ background: "linear-gradient(135deg, #E53E3E, #ff6b35)" }}>
                    {saving ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <><span className="material-symbols-outlined text-sm">save</span> Save Changes</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
