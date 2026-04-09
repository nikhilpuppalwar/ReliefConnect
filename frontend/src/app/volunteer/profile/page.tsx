"use client";

import { useEffect, useState } from "react";
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

  const [formData, setFormData] = useState({
    skills: "",
    experience_years: 0,
    zone: "",
  });

  const handleAvailabilityToggle = async (status: string) => {
    if (!user || updatingAvailability) return;
    setUpdatingAvailability(true);
    try {
      const res = await fetchApi(`\/volunteers/${user.id}/availability`, {
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
    <div className="min-h-screen bg-slate-950 pt-16 text-white pb-24">
      <VolunteerNavBar 
        volunteer={volunteer}
        onToggleAvailability={() => handleAvailabilityToggle(volunteer?.availability_status === "AVAILABLE" ? "busy" : "available")}
        isUpdatingAvailability={updatingAvailability}
        onLogout={handleLogout}
      />
      <div className="max-w-4xl mx-auto px-8 mt-8">
        <button 
          onClick={() => router.push("/volunteer")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest hidden"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <header className="mb-10 flex items-center gap-6">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="Avatar"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/20 shadow-xl shadow-primary/10"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-primary/20 flex items-center justify-center shadow-xl shadow-primary/10 text-slate-500">
              <UserIcon size={48} />
            </div>
          )}
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-white mb-2">{user?.name}</h1>
            <div className="flex items-center gap-4 text-sm font-mono text-slate-400">
              <span>{user?.email}</span>
              {user?.phone && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span>{user.phone}</span>
                </>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] font-black tracking-widest rounded-sm uppercase border border-green-500/20 flex items-center gap-1">
                <ShieldCheck size={12} /> VOLUNTEER
              </span>
              <span className={`px-3 py-1 text-[10px] font-black tracking-widest rounded-sm uppercase border flex items-center gap-1 ${
                volunteer?.verified ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
              }`}>
                {volunteer?.verified ? "VERIFIED" : "UNVERIFIED"}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface-container rounded-2xl p-8 border border-outline-variant/10 shadow-lg">
              <h2 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_check</span>
                Operational Credentials
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Operating Zone
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-outline-variant/20 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                      placeholder="e.g. District 9 Sector C"
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Specialized Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-outline-variant/20 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                    placeholder="e.g. First Aid, Search & Rescue, Logistics"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-2">These skills help command assign you to the right operational tasks.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Years of Field Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full max-w-[200px] bg-slate-950 border border-outline-variant/20 rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="pt-6 border-t border-outline-variant/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="gradient-primary text-on-primary font-bold px-8 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-primary-container/20 disabled:opacity-50 disabled:scale-100"
                  >
                    {saving ? (
                      <span className="animate-spin material-symbols-outlined text-lg">sync</span>
                    ) : (
                      <Save size={18} />
                    )}
                    {saving ? "SAVING..." : "UPDATE PROFILE"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/5">
              <h3 className="font-headline font-bold text-lg mb-4 text-slate-300">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Completed Ops</span>
                  <span className="text-xl font-black text-green-400">{volunteer?.tasks ? volunteer.tasks.filter((t: any) => t.status === "completed").length : 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Certifications</span>
                  <span className="text-xl font-black text-blue-400">{volunteer?.certificates?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
