import Link from "next/link";
import { LogOut, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

interface VolunteerNavBarProps {
  volunteer: any;
  onToggleAvailability: () => void;
  isUpdatingAvailability: boolean;
  onLogout: () => void;
}

export default function VolunteerNavBar({
  volunteer,
  onToggleAvailability,
  isUpdatingAvailability,
  onLogout,
}: VolunteerNavBarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAvailable = (volunteer?.availability_status || volunteer?.availability)?.toUpperCase() === "AVAILABLE";

  const renderNavLink = (href: string, label: string) => {
    // Basic active state check
    const isActive = 
      (href === "/volunteer" && pathname === "/volunteer") ||
      (href !== "/volunteer" && pathname.startsWith(href));
      
    return (
      <Link 
        href={href} 
        className={`px-1 py-4 font-bold tracking-tight transition-colors border-b-2
          ${isActive 
            ? "text-[#ff4e4e] border-[#ff4e4e]" 
            : "text-slate-400 border-transparent hover:text-slate-300"
          }
        `}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0A0E17]/95 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-6 h-16">
      {/* Logo & Portal Badge */}
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold tracking-tight text-[#ff4e4e] font-sans">
          RELIEFCONNECT
        </span>
        <span className="bg-[#052e16] text-[#4ade80] text-[10px] font-black uppercase px-3 py-1 rounded border border-[#166534] tracking-widest">
          VOLUNTEER PORTAL
        </span>
      </div>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8 h-full">
        {renderNavLink("/volunteer", "Operations")}
        {renderNavLink("/volunteer/tasks", "Tasks")}
        {renderNavLink("/volunteer/certificates", "Certificates")}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-8">
        
        {/* Availability Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            AVAILABILITY
          </span>
          
          <button 
            onClick={onToggleAvailability} 
            disabled={isUpdatingAvailability}
            className="flex items-center bg-[#131B2B] rounded-full p-1 border border-white/5 relative"
          >
            {isUpdatingAvailability && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10 text-white text-xs">
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
              </span>
            )}
            
            <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest transition-all ${
              isAvailable 
                ? "bg-[#22c55e] text-black" 
                : "text-slate-500 hover:text-slate-400"
            }`}>
              AVAILABLE
            </div>
            
            <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest transition-all ${
              !isAvailable 
                ? "bg-slate-700 text-white" 
                : "text-slate-500 hover:text-slate-400"
            }`}>
              BUSY
            </div>
          </button>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          <button className="text-slate-400 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-white leading-none">{user?.name || "Volunteer"}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">ID: RC-{user?.id?.toString().slice(-4) || "0000"}</p>
            </div>
            
            <Link href="/volunteer/profile" className="relative group">
              <div className="w-10 h-10 rounded border border-white/10 overflow-hidden bg-slate-800">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    {user?.name?.charAt(0) || "V"}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0A0E17] rounded-full"></div>
            </Link>
          </div>
          
          <button 
            onClick={onLogout} 
            className="text-slate-400 hover:text-red-400 transition-colors ml-2"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
