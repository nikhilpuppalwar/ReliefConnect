"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import VolunteerNavBar from "../components/VolunteerNavBar";

// --- Types ---
type Certificate = {
  id: number;
  title: string;
  description: string;
  issued_by: number;
  issued_on: string;
  certificate_url: string;
  created_at: string;
};

type VolunteerData = {
  id: number;
  user_id: number;
  skills: string | null;
  experience_years: number;
  zone: string | null;
  availability_status: string;
  certificates: Certificate[];
};

export default function VolunteerCertificates() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [volunteer, setVolunteer] = useState<VolunteerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("2026");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortFilter, setSortFilter] = useState("DATE");

  useEffect(() => {
    if (user) {
      fetchApi(`/volunteers/${user.id}`)
        .then((res) => {
          setVolunteer(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch volunteer data", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

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

  const certificates = volunteer?.certificates || [];

  // Filter & Sort
  const filteredCerts = useMemo(() => {
    let list = [...certificates];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q));
    }
    if (yearFilter && yearFilter !== "ALL") {
      list = list.filter(
        (c) => new Date(c.issued_on).getFullYear().toString() === yearFilter
      );
    }
    // sorting
    list.sort((a, b) => {
      if (sortFilter === "DATE") {
        return new Date(b.issued_on).getTime() - new Date(a.issued_on).getTime();
      }
      return a.title.localeCompare(b.title);
    });
    return list;
  }, [certificates, search, yearFilter, sortFilter]);

  // Derived Stats
  const latestCert = certificates.length > 0 ? [...certificates].sort((a,b) => new Date(b.issued_on).getTime() - new Date(a.issued_on).getTime())[0] : null;
  const thisYearCount = certificates.filter(c => new Date(c.issued_on).getFullYear() === new Date().getFullYear()).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d131f]">
        <span className="animate-spin material-symbols-outlined text-primary text-5xl">sync</span>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .hexagon {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        .bg-tech-pattern {
          background-image: linear-gradient(135deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(45deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}} />
      <div className="fixed top-0 w-full z-50 h-16">
        <VolunteerNavBar
          volunteer={volunteer}
          onToggleAvailability={() => handleAvailabilityToggle(volunteer?.availability_status === "AVAILABLE" ? "busy" : "available")}
          isUpdatingAvailability={updatingAvailability}
          onLogout={() => { logout(); router.push("/login"); }}
        />
      </div>

      <main className="min-h-screen bg-[#111622] pt-28 pb-32 text-on-surface">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-white uppercase font-['Space_Grotesk'] mb-2">MY CERTIFICATES</h1>
              <p className="text-on-surface-variant font-bold text-sm tracking-wide max-w-xl">
                Your deployment medals and mission completion records. Authenticated by ReliefConnect Command.
              </p>
            </div>
            
            <div className="bg-surface-container-low border border-outline-variant/10 px-6 py-4 flex items-center gap-4 rounded-sm border-l-4 border-l-[#ffb3ad]">
              <div className="text-4xl font-black text-white font-['Space_Grotesk'] tracking-tighter">
                {String(certificates.length).padStart(2, '0')}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-error tracking-[0.2em] mb-1">Record Status</p>
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">CERTIFICATES EARNED</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Stat: Total */}
            <div className="bg-surface-container-low border border-outline-variant/5 rounded-sm p-6 relative overflow-hidden group">
              <div className="absolute top-6 right-6 bg-surface-container-high border border-outline-variant/10 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]">ALL TIME</div>
              <div className="mb-8 p-1">
                <span className="material-symbols-outlined text-on-surface-variant">military_tech</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1">TOTAL EARNED</p>
              <div className="text-[40px] font-black text-white font-['Space_Grotesk'] tracking-tighter leading-none group-hover:text-primary transition-colors">
                {String(certificates.length).padStart(2, '0')}
              </div>
            </div>

            {/* Stat: This Year */}
            <div className="bg-surface-container-low border border-outline-variant/5 rounded-sm p-6 relative overflow-hidden group">
              <div className="absolute top-6 right-6 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-yellow-500">2026</div>
              <div className="mb-8 p-1">
                <span className="material-symbols-outlined text-on-surface-variant">calendar_today</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1">THIS YEAR</p>
              <div className="text-[40px] font-black text-white font-['Space_Grotesk'] tracking-tighter leading-none group-hover:text-yellow-500 transition-colors">
                {String(thisYearCount).padStart(2, '0')}
              </div>
            </div>

            {/* Stat: Latest */}
            <div className="bg-surface-container-low border border-outline-variant/5 rounded-sm p-6 relative overflow-hidden group">
              <div className="absolute top-6 right-6 bg-[#ff4444]/15 border border-[#ff4444]/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest text-[#ffb3ad]">ISSUED {latestCert ? "RECENTLY" : "N/A"}</div>
              <div className="mb-8 p-1">
                <span className="material-symbols-outlined text-on-surface-variant">verified</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-1">LATEST ACHIEVEMENT</p>
              <div className="text-xl font-black text-white uppercase tracking-tight line-clamp-1 group-hover:text-error transition-colors mt-2">
                {latestCert ? latestCert.title : "None earned yet"}
              </div>
            </div>

          </div>

          {/* Filters Bar */}
          <div className="bg-[#0b0f16] border border-outline-variant/5 rounded-sm flex flex-col md:flex-row md:items-center justify-between mb-8 overflow-hidden">
            <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-outline-variant/5">
              <span className="material-symbols-outlined text-on-surface-variant mr-3 text-lg">search</span>
              <input
                type="text"
                placeholder="SEARCH CERTIFICATES..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-xs font-black uppercase tracking-[0.1em] text-white placeholder-on-surface-variant/50 focus:outline-none focus:ring-0"
              />
            </div>
            
            <div className="flex bg-[#0b0f16]">
              {/* Year Dropdown */}
              <div className="flex items-center px-6 py-4 border-r border-outline-variant/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mr-2">YEAR:</span>
                <select 
                  value={yearFilter} 
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-black text-white focus:outline-none focus:ring-0 cursor-pointer uppercase appearance-none pr-4"
                >
                  <option value="ALL">All</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
                <span className="material-symbols-outlined text-sm -ml-4 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>
              
              {/* Type Dropdown */}
              <div className="flex items-center px-6 py-4 border-r border-outline-variant/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mr-2">TYPE:</span>
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-black text-white focus:outline-none focus:ring-0 cursor-pointer uppercase appearance-none pr-4"
                >
                  <option value="ALL">All</option>
                  <option value="MEDAL">Medal</option>
                  <option value="COMPLETION">Completion</option>
                </select>
                <span className="material-symbols-outlined text-sm -ml-4 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>

               {/* Sort Dropdown */}
               <div className="flex items-center px-6 py-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mr-2">SORT:</span>
                <select 
                  value={sortFilter} 
                  onChange={(e) => setSortFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-black text-white focus:outline-none focus:ring-0 cursor-pointer uppercase appearance-none pr-4"
                >
                  <option value="DATE">Date</option>
                  <option value="ALPHABETICAL">Alphabetical</option>
                </select>
                <span className="material-symbols-outlined text-sm -ml-4 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>
            </div>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCerts.map((cert) => (
               <div key={cert.id} className="bg-surface-container-low border border-outline-variant/5 rounded-sm flex flex-col group overflow-hidden">
                
                {/* Visual Header Banner */}
                <div className="h-44 bg-surface-container relative overflow-hidden bg-tech-pattern flex items-center px-6 border-b border-outline-variant/10">
                  {/* Subtle gradient overlay to mimic image/smoke background */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151a25] to-transparent opacity-90 z-0"/>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#ffb3ad]/10 mix-blend-overlay z-0"/>
                  
                  {/* Center Content in banner */}
                  <div className="relative z-10 flex items-center gap-4 mt-8">
                    <div className="w-14 h-16 bg-[#fed700] shadow-[0_0_20px_rgba(254,215,0,0.3)] hexagon flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-black font-black text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    </div>
                    <h3 className="font-['Space_Grotesk'] text-lg font-black uppercase tracking-tighter text-white drop-shadow-md leading-none line-clamp-2">
                      {cert.title}
                    </h3>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 space-y-4 flex-1 bg-[#151a25]">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#ffb3ad]/10 flex items-center justify-center border border-[#ff4444]/20 flex-shrink-0">
                      <span className="material-symbols-outlined text-[#ffb3ad] text-xs">location_on</span>
                    </div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{volunteer?.zone || "Central Command"}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-outline-variant/10 flex items-center justify-center border border-outline-variant/20 flex-shrink-0">
                      <span className="material-symbols-outlined text-slate-400 text-xs">calendar_today</span>
                    </div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {new Date(cert.issued_on).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-outline-variant/10 flex items-center justify-center border border-outline-variant/20 flex-shrink-0">
                      <span className="material-symbols-outlined text-slate-400 text-xs">verified_user</span>
                    </div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cmd. Admin</span>
                  </div>
                </div>

                {/* Actions bottom row */}
                <div className="grid grid-cols-2 gap-3 p-6 pt-0 bg-[#151a25]">
                  <a 
                    href={cert.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center py-3 border border-outline-variant/20 rounded-sm hover:bg-surface-container-high transition-colors"
                  >
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">PREVIEW</span>
                  </a>
                  <a 
                    href={cert.certificate_url}
                    download={`Certificate_${cert.id}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center items-center py-3 rounded-sm transition-all shadow-[0_0_15px_rgba(255,68,68,0.3)] hover:brightness-110 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #ff4444, #ff8c42)" }}
                  >
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">DOWNLOAD</span>
                  </a>
                </div>

               </div>
            ))}
            
            {filteredCerts.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16">
                 <span className="material-symbols-outlined text-5xl text-outline-variant/20 mb-4">folder_off</span>
                 <p className="text-slate-500 font-bold tracking-widest text-xs uppercase text-center">No certificates match your filters</p>
              </div>
            )}
          </div>
          
        </div>
      </main>

      {/* Global Footer Stats Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0b0f16] border-t border-outline-variant/10 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
         <div className="flex items-center flex-wrap gap-x-8 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-error tracking-[0.2em]">IMPACT POINTS:</span>
              <span className="text-xs font-black text-white">{(certificates.length * 125).toLocaleString()}</span>
            </div>
            <div className="hidden md:block w-px h-3 bg-outline-variant/20"></div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-error tracking-[0.2em]">HOURS LOGGED:</span>
              <span className="text-xs font-black text-white">{(volunteer?.experience_years ? volunteer.experience_years * 142 : certificates.length * 28).toLocaleString()}</span>
            </div>
            <div className="hidden lg:block w-px h-3 bg-outline-variant/20"></div>
            <div className="flex items-center gap-2 hidden sm:flex">
              <span className="text-[10px] font-black uppercase text-error tracking-[0.2em]">SUCCESS RATE:</span>
              <span className="text-xs font-black text-white">98%</span>
            </div>
         </div>
         
         <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded border border-outline-variant/5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">CURRENT SECTOR:</span>
            <span className="text-[10px] font-black text-white uppercase ml-1">{volunteer?.zone || "Unassigned"}</span>
         </div>
      </div>
    </>
  );
}
