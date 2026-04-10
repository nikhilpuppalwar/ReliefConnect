"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";
import VolunteerNavBar from "../components/VolunteerNavBar";

export default function VolunteerTasks() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [volunteer, setVolunteer] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<any>(null);
  
  // Drawer states
  const [drawerStatus, setDrawerStatus] = useState("in_progress");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updateError, setUpdateError] = useState("");
  
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  // Fetch initial data
  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [volRes, taskRes] = await Promise.all([
        fetchApi(`\/volunteers/${user.id}`),
        fetchApi("/tasks/me")
      ]);
      setVolunteer(volRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Derived state
  const filteredTasks = useMemo(() => {
    if (filter === "pending") return tasks.filter(t => t.status === "pending" || t.status === "assigned");
    if (filter === "in_progress") return tasks.filter(t => t.status === "in_progress");
    if (filter === "completed") return tasks.filter(t => t.status === "completed");
    return tasks;
  }, [tasks, filter]);
  
  const handleToggleAvailability = async () => {
    if (!user || !volunteer) return;
    setIsUpdatingAvailability(true);
    try {
      const newStatus = (volunteer.availability_status || volunteer.availability)?.toUpperCase() === "AVAILABLE" ? "busy" : "available";
      const res = await fetchApi(`/volunteers/${user.id}/availability`, {
        method: "PUT",
        body: JSON.stringify({ availability_status: newStatus.toLowerCase() })
      });
      setVolunteer(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleOpenDrawer = (task: any) => {
    setSelectedTask(task);
    setDrawerStatus(task.status);
    setProofFile(null);
    setUpdateSuccess("");
    setUpdateError("");
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");
    
    try {
      const formData = new FormData();
      formData.append("status", drawerStatus);
      if (proofFile) {
        formData.append("proof", proofFile);
      }

      await fetchApi(`\/tasks/${selectedTask.id}/status`, {
        method: "PUT",
        body: formData,
      });

      setUpdateSuccess("Task updated successfully!");
      // Refresh tasks
      const taskRes = await fetchApi("/tasks/me");
      setTasks(taskRes.data);
      
      // Update local selected task so drawer reflects immediately
      setSelectedTask((prev: any) => ({ ...prev, status: drawerStatus }));
    } catch (err: any) {
      setUpdateError(err.message || "Failed to update task.");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d131f]">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
      </div>
    );
  }

  return (
    <>
      <VolunteerNavBar 
        volunteer={volunteer}
        onToggleAvailability={handleToggleAvailability}
        isUpdatingAvailability={isUpdatingAvailability}
        onLogout={handleLogout}
      />

      {/* Main Content Canvas */}
      <main className="pt-24 pb-12 px-6 min-h-screen bg-[#0d131f] text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="font-headline text-5xl font-bold tracking-tight text-on-surface mb-2">My Tasks</h1>
              <p className="text-on-surface-variant font-medium">
                {tasks.length} assigned assignments for <span className="text-secondary">Operations</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
                <input className="bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary transition-colors text-on-surface pl-10 pr-4 py-2 text-sm w-64 bg-transparent focus:outline-none" placeholder="Search operational tasks..." type="text"/>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                <button onClick={() => setFilter("all")} className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${filter === "all" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>All Tasks</button>
                <button onClick={() => setFilter("pending")} className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${filter === "pending" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>Pending</button>
                <button onClick={() => setFilter("in_progress")} className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${filter === "in_progress" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>In Progress</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Tactical Table (Main View) */}
            <div className={`col-span-12 ${selectedTask ? 'xl:col-span-8' : 'xl:col-span-12'} transition-all duration-300`}>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 bg-slate-800 flex justify-between items-center border-b border-slate-700/50">
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wide">Task Queue</h3>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                  {filteredTasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">task</span>
                      No tasks found for this filter.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                          <th className="px-6 py-4 border-b border-slate-800">Task Title</th>
                          <th className="px-6 py-4 border-b border-slate-800">Priority</th>
                          <th className="px-6 py-4 border-b border-slate-800 hidden md:table-cell">Location</th>
                          <th className="px-6 py-4 border-b border-slate-800">Status</th>
                          <th className="px-6 py-4 border-b border-slate-800 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {filteredTasks.map((task) => (
                          <tr key={task.id} className="hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => handleOpenDrawer(task)}>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-white group-hover:text-primary transition-colors">{task.title}</span>
                                <span className="text-[10px] text-slate-500 font-mono">ID: RC-{task.id}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                ${task.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                  task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-slate-800 text-slate-300'
                                }
                              `}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-slate-400 hidden md:table-cell text-xs">{task.disaster_location || "N/A"}</td>
                            <td className="px-6 py-5">
                              {task.status === "completed" ? (
                                <span className="flex items-center gap-1.5 text-green-400">
                                  <span className="material-symbols-outlined text-sm">check_circle</span>
                                  Completed
                                </span>
                              ) : task.status === "in_progress" ? (
                                <span className="flex items-center gap-1.5 text-secondary">
                                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                                  In Progress
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-slate-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                  {task.status}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right">
                              {task.status === "completed" ? (
                                <button className="text-slate-400 bg-slate-800 hover:bg-slate-700 transition-all px-4 py-1.5 rounded font-bold text-xs" onClick={(e) => { e.stopPropagation(); handleOpenDrawer(task); }}>
                                  View Log
                                </button>
                              ) : (
                                <button className="text-primary border border-primary/50 hover:bg-primary/10 hover:border-primary transition-all px-4 py-1.5 rounded font-bold text-xs" onClick={(e) => { e.stopPropagation(); handleOpenDrawer(task); }}>
                                  Update
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Task Detail Drawer */}
            {selectedTask && (
              <div className="col-span-12 xl:col-span-4 animate-in slide-in-from-right-8 duration-300">
                <div className="bg-slate-900 rounded-xl overflow-hidden border-l-4 border-primary shadow-[0_0_40px_rgba(255,179,173,0.03)] border-t border-r border-b border-t-slate-800 border-r-slate-800 border-b-slate-800 flex flex-col h-full relative">
                  <div className="p-6 border-b border-slate-800/50">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-primary/20 text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-tighter">Active Detail</span>
                      <button onClick={() => setSelectedTask(null)} className="text-slate-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <h2 className="font-headline text-2xl font-bold text-white leading-tight mb-2">{selectedTask.title}</h2>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">{selectedTask.description}</p>
                    
                    {selectedTask.requested_by && (
                      <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 text-lg font-bold">
                          {selectedTask.requested_by.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-black">Dispatcher / Requester</p>
                          <p className="text-sm font-bold text-white">{selectedTask.requested_by.name}</p>
                        </div>
                        {selectedTask.requested_by.phone && (
                          <div className="ml-auto text-primary px-3 py-1 bg-primary/10 rounded text-xs font-mono">
                            {selectedTask.requested_by.phone}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    {updateSuccess && (
                      <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-bold text-center">
                        {updateSuccess}
                      </div>
                    )}
                    {updateError && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-bold text-center">
                        {updateError}
                      </div>
                    )}

                    <div className="flex-grow">
                      <label className="block text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">Update Operational Status</label>
                      <div className="relative mb-6">
                        <select 
                          className="w-full bg-slate-900 border-0 border-b-2 border-slate-700 text-white py-3 pl-4 appearance-none focus:ring-0 focus:border-primary focus:outline-none font-bold text-sm"
                          value={drawerStatus}
                          onChange={(e) => setDrawerStatus(e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
                      </div>

                      {(drawerStatus === "completed" || selectedTask.status === "completed") && (
                         <div className="mb-8">
                           <label className="block text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">
                             Site Photo Documentation {selectedTask.status === 'completed' && selectedTask.photo_url ? '(Existing)' : ''}
                           </label>
                           
                           {/* If task is completed and has a photo, just show it */}
                           {selectedTask.status === 'completed' && selectedTask.photo_url ? (
                             <div className="w-full aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                               <img src={selectedTask.photo_url} alt="Proof" className="w-full h-full object-cover" />
                             </div>
                           ) : (
                             <label className={`w-full aspect-video bg-slate-900 border-2 border-dashed ${proofFile ? 'border-primary' : 'border-slate-700'} rounded-xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-primary hover:bg-slate-800/50 transition-colors`}>
                               {proofFile ? (
                                 <>
                                   <span className="material-symbols-outlined text-4xl text-primary data-icon=image">image</span>
                                   <span className="text-xs font-bold text-white text-center px-4 truncate w-full">{proofFile.name}</span>
                                 </>
                               ) : (
                                 <>
                                   <span className="material-symbols-outlined text-4xl text-slate-500 group-hover:text-primary transition-colors">add_a_photo</span>
                                   <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300">Upload Tactical Evidence</span>
                                 </>
                               )}
                               <input type="file" className="hidden" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} />
                             </label>
                           )}
                         </div>
                      )}
                    </div>

                    <button 
                      onClick={handleUpdateTask}
                      disabled={updating || selectedTask.status === "completed"}
                      className={`w-full font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg 
                        ${selectedTask.status === "completed" && drawerStatus === "completed" 
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                          : "bg-gradient-to-r from-primary to-primary-container text-[#0d131f] active:scale-95 shadow-primary/20 hover:shadow-primary/40"
                        }
                      `}
                    >
                      {updating ? (
                         <span className="material-symbols-outlined animate-spin text-xl">sync</span>
                      ) : (
                        <span className="material-symbols-outlined">security_update_good</span>
                      )}
                      {updating ? "UPDATING..." : selectedTask.status === "completed" && drawerStatus === "completed" ? "ALREADY LOGGED" : "SAVE UPDATE"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* BottomNavBar (Visible on Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0d131f] flex justify-around items-center h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] border-t border-slate-800">
        <Link href="/volunteer" className="flex flex-col items-center gap-1 text-[#dde2f3] opacity-60">
          <span className="material-symbols-outlined text-xl">rocket_launch</span>
          <span className="text-[10px] font-bold">Ops</span>
        </Link>
        <Link href="/volunteer/tasks" className="flex flex-col items-center gap-1 text-[#ffb3ad] font-bold">
          <span className="material-symbols-outlined text-xl">assignment</span>
          <span className="text-[10px]">Tasks</span>
        </Link>
        <Link href="/volunteer/profile" className="flex flex-col items-center gap-1 text-[#dde2f3] opacity-60">
          <span className="material-symbols-outlined text-xl">person</span>
          <span className="text-[10px]">Profile</span>
        </Link>
      </nav>

      {/* FAB */}
      <button className="fixed bottom-24 right-8 z-30 md:bottom-8 md:right-8 bg-secondary hover:bg-secondary/90 w-14 h-14 rounded-full shadow-lg shadow-secondary/20 flex items-center justify-center text-[#0d131f] active:scale-90 transition-transform duration-150">
        <span className="material-symbols-outlined text-2xl font-bold">add_task</span>
      </button>
    </>
  );
}
