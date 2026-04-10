"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function AdminNavLinks() {
  const router = useRouter();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { label: "Dashboard", href: "/admin" },
    { label: "Disasters", href: "/admin/disasters" },
    { label: "Volunteers", href: "/admin/volunteers" },
    { label: "SOS Requests", href: "/admin/sos" },
    { label: "Tasks", href: "/admin/tasks" },
    { label: "Assets", href: "/admin/assets" },
    { label: "Certificates", href: "/admin/certificates" },
  ];

  const mainLinks = links.slice(0, 4);
  const moreLinks = links.slice(4);

  return (
    <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
      {mainLinks.map((link) => (
        <button
          key={link.label}
          onClick={() => router.push(link.href)}
          className={`px-3 py-1.5 font-black text-xs tracking-wider uppercase whitespace-nowrap transition-all rounded-lg hover:text-primary hover:bg-primary/5 ${
            pathname === link.href ? "text-primary border-b-2 border-primary bg-primary/5" : "text-on-surface/60"
          }`}
        >
          {link.label}
        </button>
      ))}

      {/* More Options Dropdown */}
      <div className="relative" ref={moreRef}>
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex items-center justify-center p-1.5 rounded-lg transition-all hover:bg-primary/10 hover:text-primary ${
            moreOpen ? "bg-primary/10 text-primary" : "text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>

        {moreOpen && (
          <div className="absolute top-full -left-1/2 mt-2 w-48 bg-[#0d131f] border border-[#ffb3ad]/15 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 py-1 flex flex-col gap-0.5">
            {moreLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  setMoreOpen(false);
                  router.push(link.href);
                }}
                className={`w-full text-left px-4 py-3 text-xs font-black tracking-wider uppercase transition-colors hover:bg-surface-container ${
                  pathname === link.href ? "text-primary bg-primary/5" : "text-on-surface/80 hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
