"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { ArrowLeft, Save, User as UserIcon, ShieldCheck, MapPin } from "lucide-react";

import VolunteerNavBar from "../components/VolunteerNavBar";

export default function VolunteerProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [volunteer, setVolunteer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    skills: "",
    experience_years: 0,
    zone: "",
  });

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetchApi(`/users/${user.id}/avatar`, {
        method: "POST",
        body: fd,
      });
      if (res.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload avatar");
    }
  }

  async function handlePasswordUpdate() {
    if (newPassword.length < 8) return alert("Password must be at least 8 characters");
    try {
      await fetchApi(`/users/${user?.id}/password`, {
        method: "PUT",
        body: JSON.stringify({ newPassword }),
      });
      alert("Password updated successfully");
      setPasswordModalOpen(false);
      setNewPassword("");
    } catch (err: any) {
      alert(err.message || "Failed to update password");
    }
  }

  const handleAvailabilityToggle = async (status: string) => {
    if (!user || updatingAvailability) return;
    setUpdatingAvailability(true);
    try {
      const res = await fetchApi(`\/volunteers/${user.id}/availability`, {
        method: "PUT",
        body: JSON.stringify({ availability_status: status.toLowerCase() }),
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

  useEffect(() => {
    if (user) {
      fetchApi(`\/volunteers/${user.id}`)
        .then((res) => {
          setVolunteer(res.data);
          setFormData({
            skills: res.data.skills || "",
            experience_years: res.data.experience_years || 0,
            zone: res.data.zone || "",
          });
        })
        .catch((err) => {
          console.error("Failed to fetch volunteer data", err);
          // Assuming the volunteer might not exist yet, we will just leave fields empty
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetchApi(`\/volunteers/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      setSuccess("Profile updated successfully!");
      setVolunteer(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <span className="animate-spin material-symbols-outlined text-primary text-5xl">sync</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background pt-16 pb-24">
      <VolunteerNavBar 
        volunteer={volunteer}
        onToggleAvailability={() => handleAvailabilityToggle(volunteer?.availability_status === "AVAILABLE" ? "busy" : "available")}
        isUpdatingAvailability={updatingAvailability}
        onLogout={handleLogout}
      />

      {/* Profile Hero */}
      <div className="relative overflow-hidden border-b border-outline-variant/10">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(74, 222, 128, 0.07) 0%, transparent 60%)" }}
        />
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-5xl mx-auto px-6 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-2xl border-2 border-green-400/30 overflow-hidden bg-surface-container-high flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.15)] relative text-green-500">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={48} />
                )}
                <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={avatarInputRef}
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center ${volunteer?.availability_status?.toUpperCase() === 'AVAILABLE' ? 'bg-green-500' : 'bg-slate-500'}`}>
                <span className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Name + Status */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-['Space_Grotesk'] text-on-surface uppercase">
                  {user?.name || "Volunteer Agent"}
                </h1>
                <span className={`inline-flex items-center gap-1.5 self-center sm:self-auto px-3 py-1 rounded-full border ${volunteer?.verified ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400"}`}>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>{volunteer?.verified ? "verified" : "pending_actions"}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{volunteer?.verified ? "Verified Volunteer" : "Unverified"}</span>
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-4 text-sm font-mono text-on-surface-variant">
                <span>{user?.email}</span>
                {user?.phone && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-outline-variant/50"></span>
                    <span>{user.phone}</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-2">
                <span className="flex items-center gap-1.5 text-xs text-on-surface-variant px-3 py-1 rounded-lg bg-surface-container-low border border-outline-variant/10">
                  <ShieldCheck size={14} className="text-green-400" />
                  Active Field Agent
                </span>
                <button 
                  onClick={() => setPasswordModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container border border-outline-variant/20 hover:bg-surface-container-high transition-colors text-xs font-black uppercase tracking-widest text-on-surface hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">key</span>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Stats */}
        <div className="space-y-6">
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/10">
              <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-green-400">bar_chart</span>
                Activity Overview
              </h2>
            </div>
            <div className="divide-y divide-outline-variant/8">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10">
                    <span className="material-symbols-outlined text-sm text-green-400" style={{ fontVariationSettings: '"FILL" 1' }}>task_alt</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">Completed Ops</span>
                </div>
                <span className="text-2xl font-black text-on-surface font-['Space_Grotesk']">{volunteer?.tasks ? volunteer.tasks.filter((t: any) => t.status === "completed").length : 0}</span>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10">
                    <span className="material-symbols-outlined text-sm text-blue-400" style={{ fontVariationSettings: '"FILL" 1' }}>workspace_premium</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">Certifications</span>
                </div>
                <span className="text-2xl font-black text-on-surface font-['Space_Grotesk']">{volunteer?.certificates?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Operational Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-sm">badge</span>
                <h2 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Operational Credentials</h2>
              </div>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error text-sm font-bold">
                  <span className="material-symbols-outlined">error</span>
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 text-sm font-bold">
                  <span className="material-symbols-outlined">check_circle</span>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">
                    Operating Zone / District
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={18} />
                    <input
                      type="text"
                      className="w-full bg-surface-container border border-outline-variant/20 focus:border-green-400/50 rounded-xl py-3 pl-12 pr-4 text-sm text-on-surface transition-colors focus:ring-1 focus:ring-green-400/20 focus:outline-none"
                      placeholder="e.g. Sector 7, Outer Rimini"
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">
                    Specialized Skills (Comma separated)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">medical_services</span>
                    <input
                      type="text"
                      className="w-full bg-surface-container border border-outline-variant/20 focus:border-green-400/50 rounded-xl py-3 pl-12 pr-4 text-sm text-on-surface font-mono transition-colors focus:ring-1 focus:ring-green-400/20 focus:outline-none"
                      placeholder="e.g. First Aid, Triage, Logistics"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant/50 mt-2 ml-1">Command uses these skills to assign targeted operational tasks.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">
                    Years of Field Experience
                  </label>
                  <div className="relative max-w-[200px]">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg">military_tech</span>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-surface-container border border-outline-variant/20 focus:border-green-400/50 rounded-xl py-3 pl-12 pr-4 text-sm text-on-surface transition-colors focus:ring-1 focus:ring-green-400/20 focus:outline-none"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-outline-variant/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary-container rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(255,179,173,0.15)] hover:shadow-[0_0_30px_rgba(255,179,173,0.25)]"
                  >
                    {saving ? (
                      <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? "Deploying..." : "Update Credentials"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPasswordModalOpen(false)} />
          <div className="relative z-10 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 mx-4 max-w-sm w-full shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <h3 className="text-xl font-black text-on-surface uppercase tracking-tight font-['Space_Grotesk'] mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface-container border border-primary/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  className="flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-primary text-on-primary-container hover:bg-primary/90 transition-all active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
