"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function normalize(text: string) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
}

export default function ScreenActionsBridge() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const actionEl = target.closest("a,button") as HTMLAnchorElement | HTMLButtonElement | null;
      if (!actionEl) return;

      const text = normalize(actionEl.textContent || "");
      const href = actionEl.tagName === "A" ? (actionEl as HTMLAnchorElement).getAttribute("href") || "" : "";

      // Handle prototype placeholder links
      const isPlaceholderLink = actionEl.tagName === "A" && (href === "#" || href === "");
      if (isPlaceholderLink) {
        event.preventDefault();
      }

      // Generic nav mappings by visible label
      const go = (to: string) => {
        event.preventDefault();
        router.push(to);
      };

      const has = (value: string) => text.includes(value);

      // Landing/cross-role CTA mappings
      if ((has("report a disaster") || has("report incident")) && !pathname.startsWith("/admin")) return go("/civilian/report");
      if (has("request sos") || has("new help request") || has("file sos request")) return go("/civilian/sos");
      if (has("view all task stream")) return go("/volunteer/tasks");
      if (has("upload certificate")) return go("/admin/certificates");
      if (has("create task") || has("new dispatch") || has("deploy mission")) return go("/admin/deploy-mission");
      if (has("add resource")) return go("/admin/assets");
      if (has("view historical archives")) return go("/admin/disasters-reliefconnect");
      if (has("privacy")) return go("/legal/privacy");
      if (has("terms")) return go("/legal/terms");
      if (has("system status")) return go("/system-status");
      if (has("mission support") || has("contact hq") || has("emergency support")) return go("/support");

      // Role nav labels
      if (isPlaceholderLink) {
        if (has("home")) return go("/");
        if (has("dashboard")) {
          if (pathname.startsWith("/admin")) return go("/admin");
          if (pathname.startsWith("/volunteer")) return go("/volunteer");
          if (pathname.startsWith("/civilian")) return go("/civilian");
        }
        if (pathname.startsWith("/volunteer")) {
          if (has("operations")) return go("/volunteer");
          if (has("tasks")) return go("/volunteer/tasks");
          if (has("certificates") || has("certs")) return go("/volunteer/certificates");
        }
        if (pathname.startsWith("/civilian")) {
          if (has("reports") || has("report")) return go("/civilian/report");
          if (has("resources")) return go("/civilian/resources");
          if (has("profile")) return go("/civilian/profile");
        }

        if (pathname.startsWith("/admin")) {
          if (has("disasters")) return go("/admin/disasters");
          if (has("volunteers")) return go("/admin/volunteers");
          if (has("assets") || has("resources")) return go("/admin/assets");
          if (has("tasks")) return go("/admin/tasks");
          if (has("certificates")) return go("/admin/certificates");
          if (has("sos") || has("help requests")) return go("/admin/help-requests");
        }
      }

      // Check for generic link placeholder
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname, router]);

  return null;
}

