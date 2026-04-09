"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import UpdateTaskModal from "./components/UpdateTaskModal";
import VolunteerNavBar from "./components/VolunteerNavBar";
import { LogOut, Bell, User as UserIcon } from "lucide-react";

export default function VolunteerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [volunteer, setVolunteer] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [sosRequests, setSosRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  // Modal state
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      // Fetch Volunteer Profile
      const volRes = await fetchApi(`\/volunteers/${user.id}`);
      setVolunteer(volRes.data);

      // Fetch all tasks for this volunteer for accurate stats
      const tasksRes = await fetchApi("/tasks/me");
      setTasks(tasksRes.data);

      // Fetch SOS Requests assigned to this volunteer (or all open if applicable, but /api/requests filters by role)
      const sosRes = await fetchApi("/requests");
      setSosRequests(sosRes.data.requests || sosRes.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleAvailabilityToggle = async (status: string) => {
    if (!user || updatingAvailability) return;
    setUpdatingAvailability(true);
    try {
      await fetchApi(`\/volunteers/${user.id}/availability`, {
        method: "PUT",
        body: JSON.stringify({ availability_status: status }),
        headers: { "Content-Type": "application/json" },
      });
      setVolunteer((prev: any) => ({ ...prev, availability: status }));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <span className="animate-spin material-symbols-outlined text-primary text-5xl">sync</span>
      </div>
    );
  }

  // Calculate stats
  const assignedTasks = tasks.filter((t: any) => t.status === "assigned").length;
  const activeTasks = tasks.filter((t: any) => t.status === "in_progress").length;
  const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
  const certificateCount = volunteer?.certificates?.length || 0;

  // Filter Active Tasks for the list (Show only assigned and in_progress)
  const displayTasks = tasks.filter(t => t.status === "assigned" || t.status === "in_progress").slice(0, 6);
  // Recent SOS
  const recentSos = Array.isArray(sosRequests) ? sosRequests.slice(0, 5) : [];

  return (
    <>
      <VolunteerNavBar 
        volunteer={volunteer}
        onToggleAvailability={() => handleAvailabilityToggle(volunteer?.availability === "available" ? "busy" : "available")}
        isUpdatingAvailability={updatingAvailability}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="pt-28 px-8 pb-24 lg:pb-12 min-h-screen">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-white mb-2">Volunteer Dashboard</h1>
            <p className="text-on-surface-variant max-w-2xl font-body">
              Welcome back, {user?.name}. {activeTasks} missions are active in your sector. Stay vigilant.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/civilian/sos")}
              className="gradient-primary text-on-primary font-bold px-6 py-3 rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-container/20 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">emergency_home</span>
              SOS Request
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 transition-all hover:bg-surface-container">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">assignment</span>
              <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-1 rounded">PENDING</span>
            </div>
            <h3 className="text-4xl font-headline font-bold mb-1">{assignedTasks < 10 ? `0${assignedTasks}` : assignedTasks}</h3>
            <p className="text-on-surface-variant text-xs lg:text-sm font-semibold uppercase tracking-wider">Assigned Tasks</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 transition-all hover:bg-surface-container">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary text-3xl">pending_actions</span>
              <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-1 rounded">ACTIVE</span>
            </div>
            <h3 className="text-4xl font-headline font-bold mb-1">{activeTasks < 10 ? `0${activeTasks}` : activeTasks}</h3>
            <p className="text-on-surface-variant text-xs lg:text-sm font-semibold uppercase tracking-wider">In Progress</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 transition-all hover:bg-surface-container">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
              <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-1 rounded">HISTORY</span>
            </div>
            <h3 className="text-4xl font-headline font-bold mb-1">{completedTasks}</h3>
            <p className="text-on-surface-variant text-xs lg:text-sm font-semibold uppercase tracking-wider">Completed Tasks</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 transition-all hover:bg-surface-container">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-tertiary text-3xl">workspace_premium</span>
              <span className="text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-1 rounded">LEVEL 4</span>
            </div>
            <h3 className="text-4xl font-headline font-bold mb-1">{certificateCount < 10 ? `0${certificateCount}` : certificateCount}</h3>
            <p className="text-on-surface-variant text-xs lg:text-sm font-semibold uppercase tracking-wider">Certificates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Active Tasks Section */}
          <div className="xl:col-span-9 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">dynamic_feed</span>
                Active Operational Tasks
              </h2>
            </div>

            {displayTasks.length === 0 ? (
              <div className="bg-surface-container-low rounded-2xl p-12 border border-outline-variant/5 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-border text-6xl mb-4">task</span>
                <h3 className="text-xl font-bold text-white mb-2">No Active Tasks</h3>
                <p className="text-on-surface-variant text-sm max-w-md">
                  You currently have no pending operational tasks. Change your availability to <strong>AVAILABLE</strong> to accept new missions from coordination control.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {displayTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10 group transition-all hover:border-primary/30 flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      {task.status === "in_progress" ? (
                        <span className="bg-orange-600/10 text-orange-400 text-[10px] font-black px-3 py-1 rounded-sm tracking-widest uppercase border border-orange-600/20">
                          Active Operation
                        </span>
                      ) : (
                        <span className="bg-blue-600/10 text-blue-400 text-[10px] font-black px-3 py-1 rounded-sm tracking-widest uppercase border border-blue-600/20">
                          Pending Assignment
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold mb-1 truncate" title={task.title}>{task.title}</h4>
                    <p className="text-secondary text-xs font-bold uppercase mb-4 truncate">
                      Disaster: {task.disaster_title || "Unknown Emergency"}
                    </p>

                    <div className="space-y-3 mb-6 flex-grow">
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        Due: {task.due_date ? new Date(task.due_date).toLocaleString() : "TBD"}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {task.disaster_location || "Location Not Specified"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10 mt-auto">
                      <span className={`flex items-center gap-2 text-[10px] font-bold ${
                        task.status === "in_progress" ? "text-orange-400" : "text-blue-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          task.status === "in_progress" ? "bg-orange-400 animate-pulse" : "bg-blue-400"
                        }`}></span>
                        {task.status.replace("_", " ").toUpperCase()}
                      </span>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-4 py-2 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary hover:text-slate-950 transition-colors"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Recent SOS */}
          <div className="xl:col-span-3 space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="font-headline text-xl font-bold">Recent SOS Assigned</h2>
            </div>
            
            <div className="bg-surface-container-low rounded-xl border border-outline-variant/5 overflow-hidden">
              {recentSos.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant border-b border-outline-variant/10">
                  <p className="text-xs">No active SOS assigned to you right now.</p>
                </div>
              ) : (
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900/50 border-b border-outline-variant/10">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-widest">Type/Loc</th>
                      <th className="px-4 py-2 font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {recentSos.map((sos: any) => (
                      <tr key={sos.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-white truncate max-w-[120px]">
                          {sos.location || `SOS #${sos.id}`}
                        </td>
                        <td className={`px-4 py-3 font-bold ${
                          sos.status === "resolved" ? "text-green-400" :
                          sos.status === "in_progress" ? "text-orange-400" :
                          sos.status === "pending" ? "text-red-400" : "text-slate-400"
                        }`}>
                          {sos.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => router.push("/volunteer/sos")}
                className="w-full group relative overflow-hidden bg-red-600 hover:bg-red-700 p-6 rounded-2xl border border-red-500/20 transition-all text-center"
              >
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-white text-3xl mb-2">emergency_share</span>
                  <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">File SOS Request</h4>
                  <p className="text-[10px] text-white/70 mt-1">If you require immediate assistance</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-lg border-t border-outline-variant/10 px-6 py-4 flex justify-between items-center z-40">
        <button onClick={() => router.push("/volunteer")} className="text-primary flex flex-col items-center gap-1">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase">Main</span>
        </button>
        <button onClick={() => router.push("/volunteer/profile")} className="text-slate-500 flex flex-col items-center gap-1">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
      </div>

      {/* Modals */}
      {selectedTask && (
        <UpdateTaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={loadDashboardData} 
        />
      )}
    </>
  );
}
