"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Disaster = {
  id: number;
  title: string;
  type: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  created_at: string;
  media_url?: string;
};

type HelpRequest = {
  id: number;
  title?: string;
  description?: string;
  location?: string;
  status: string;
  priority: string;
  assigned_to?: { name?: string | null } | null;
};

export default function Page() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [myRequests, setMyRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [disRes, reqRes] = await Promise.all([
          fetchApi("/disasters?status=active&limit=5"),
          fetchApi("/requests?requested_by=me&limit=10"),
        ]);

        const disData = Array.isArray(disRes?.data)
          ? disRes.data
          : Array.isArray(disRes?.data?.disasters)
            ? disRes.data.disasters
            : [];

        const reqData = Array.isArray(reqRes?.data)
          ? reqRes.data
          : Array.isArray(reqRes?.data?.requests)
            ? reqRes.data.requests
            : [];

        if (!mounted) return;
        setDisasters(disData);
        setMyRequests(reqData);
      } catch {
        if (!mounted) return;
        setDisasters([]);
        setMyRequests([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const open = myRequests.filter((r) => r.status !== "resolved").length;
    const resolved = myRequests.filter((r) => r.status === "resolved").length;
    return {
      activeDisasters: disasters.length,
      openRequests: open,
      resolvedRequests: resolved,
    };
  }, [disasters, myRequests]);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#0d131f]/70 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-[0_0_20px_rgba(255,179,173,0.06)]">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold tracking-tighter text-[#ffb3ad] font-['Space_Grotesk'] uppercase tracking-tight">ReliefConnect</span>
          <span className="bg-surface-container-high text-primary text-[10px] font-black px-2 py-0.5 rounded-sm border border-primary/20 tracking-widest">CIVILIAN PORTAL</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link className="text-[#ffb3ad] border-b-2 border-[#ff5450] pb-1 font-['Space_Grotesk'] uppercase tracking-tight text-sm font-bold" href="/civilian/dashboard">Dashboard</Link>
          <Link className="text-[#dde2f3] opacity-70 hover:opacity-100 hover:text-[#ffb3ad] transition-all font-['Space_Grotesk'] uppercase tracking-tight text-sm" href="/civilian/report">Reports</Link>
          <Link className="text-[#dde2f3] opacity-70 hover:opacity-100 hover:text-[#ffb3ad] transition-all font-['Space_Grotesk'] uppercase tracking-tight text-sm" href="/civilian/resources">Resources</Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-on-surface hover:text-primary transition-colors" type="button">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute text-[8px] font-bold text-white w-4 h-4 -top-1 -right-1 bg-primary-container rounded-full flex items-center justify-center">3</span>
          </button>
          <button
            className="flex items-center gap-3 pl-4 border-l border-surface-container-highest"
            type="button"
            onClick={() => router.push("/civilian/profile")}
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface">{user?.name || "Civilian User"}</p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Verified Civilian</p>
            </div>
            <img
              alt="Civilian User Profile"
              className="w-8 h-8 rounded-full border border-primary/30 object-cover"
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

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-error">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2">Active Disasters Near You</p>
            <div className="flex items-end justify-between">
              <h2 className="text-5xl font-headline font-bold text-on-surface">{loading ? "..." : stats.activeDisasters}</h2>
              <span className="text-error bg-error-container/20 px-2 py-1 rounded text-[10px] font-bold">CRITICAL AREA</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-secondary">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2">My Help Requests</p>
            <div className="flex items-end justify-between">
              <h2 className="text-5xl font-headline font-bold text-on-surface">{loading ? "..." : stats.openRequests}</h2>
              <span className="text-secondary bg-secondary-container/20 px-2 py-1 rounded text-[10px] font-bold">PENDING ACTION</span>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-2">Resolved Requests</p>
            <div className="flex items-end justify-between">
              <h2 className="text-5xl font-headline font-bold text-on-surface">{loading ? "..." : stats.resolvedRequests}</h2>
              <span className="text-primary bg-primary-container/20 px-2 py-1 rounded text-[10px] font-bold">COMMUNITY IMPACT</span>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report a Disaster — red */}
          <button
            className="pulsing-red group relative p-8 rounded-2xl flex items-center justify-between overflow-hidden active:scale-[0.98] transition-all duration-200 text-left"
            onClick={() => router.push("/civilian/report")}
            type="button"
          >
            {/* subtle inner glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="relative z-10 text-left space-y-1">
              <h3 className="text-xl font-black text-white uppercase tracking-widest leading-tight font-['Space_Grotesk']">
                Report a Disaster
              </h3>
              <p className="text-white/75 text-sm font-medium leading-snug max-w-[220px]">
                Alert authorities about immediate threats in your vicinity.
              </p>
            </div>
            <span
              className="material-symbols-outlined text-white/25 group-hover:text-white/35 group-hover:scale-110 transition-all duration-300 flex-shrink-0 ml-4"
              style={{ fontSize: "72px", fontVariationSettings: '"FILL" 1' }}
            >
              campaign
            </span>
          </button>

          {/* Request SOS Help — orange */}
          <button
            className="pulsing-orange group relative p-8 rounded-2xl flex items-center justify-between overflow-hidden active:scale-[0.98] transition-all duration-200 text-left"
            onClick={() => router.push("/civilian/sos")}
            type="button"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            <div className="relative z-10 text-left space-y-1">
              <h3 className="text-xl font-black text-white uppercase tracking-widest leading-tight font-['Space_Grotesk']">
                Request SOS Help
              </h3>
              <p className="text-white/75 text-sm font-medium leading-snug max-w-[220px]">
                Emergency assistance for yourself or those trapped near you.
              </p>
            </div>
            <span
              className="material-symbols-outlined text-white/25 group-hover:text-white/35 group-hover:scale-110 transition-all duration-300 flex-shrink-0 ml-4"
              style={{ fontSize: "72px", fontVariationSettings: '"FILL" 1' }}
            >
              warning
            </span>
          </button>
        </section>


        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          <section className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-headline font-bold uppercase tracking-tighter flex items-center gap-3">
                <span className="w-2 h-8 bg-error rounded-full"></span>
                Active Disasters
              </h2>
              <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline" onClick={() => router.push("/civilian/disasters/map")} type="button">
                Global Map View
              </button>
            </div>
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {disasters.length === 0 ? (
                <div className="bg-surface-container border border-outline-variant/10 p-5 rounded-lg text-sm text-on-surface-variant">
                  No active disasters found.
                </div>
              ) : (
                disasters.map((d) => (
                  <div key={d.id} className="bg-surface-container border border-outline-variant/10 p-5 rounded-lg group hover:border-primary/40 transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-surface-container-highest relative flex-shrink-0">
                        <img alt={d.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={d.media_url || "https://images.unsplash.com/photo-1527489377706-5bf97e608852?q=80&w=900&auto=format&fit=crop"} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="material-symbols-outlined text-primary text-lg">warning</span>
                              <span className="text-xs font-bold text-primary-fixed uppercase tracking-wider">{d.type}</span>
                            </div>
                            <h4 className="text-xl font-headline font-bold">{d.title}</h4>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-[10px] font-black uppercase">{d.severity}</span>
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{d.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{d.location || "Unknown location"}</span>
                        </div>
                        <div className="pt-2 flex gap-3">
                          <button className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold py-2 px-4 rounded transition-colors flex items-center gap-2" onClick={() => router.push(`/civilian/disasters/${d.id}`)} type="button">
                            View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-headline font-bold uppercase tracking-tighter">My Requests</h2>
              <button className="material-symbols-outlined text-on-surface-variant" onClick={() => router.push("/civilian/sos")} type="button">history</button>
            </div>
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-high/50 text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Volunteer</th>
                      <th className="px-4 py-3 text-right">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {myRequests.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-sm text-on-surface-variant" colSpan={4}>No requests yet.</td>
                      </tr>
                    ) : (
                      myRequests.slice(0, 10).map((r) => (
                        <tr key={r.id} className="hover:bg-surface-container transition-colors">
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium">{r.description || r.title || "Help request"}</p>
                            <p className="text-[10px] opacity-60">{r.location || "Unknown location"}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded">{r.status}</span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-xs font-medium opacity-80">{r.assigned_to?.name || "Awaiting Assignment"}</p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-error text-[10px] font-bold uppercase tracking-tighter">{r.priority}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}