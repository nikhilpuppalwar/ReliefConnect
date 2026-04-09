"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-2xl bg-surface-container border border-error/30 rotate-6 shadow-[0_0_40px_rgba(229,62,62,0.15)]">
          <span
            className="material-symbols-outlined text-error text-5xl -rotate-6"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            gpp_bad
          </span>
        </div>

        {/* Status code */}
        <p className="font-headline text-xs uppercase tracking-[0.4em] text-primary mb-4 font-bold">
          ACCESS DENIED · CODE 403
        </p>

        {/* Heading */}
        <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-on-surface mb-4 leading-none">
          INSUFFICIENT<br />
          <span className="text-primary">CLEARANCE</span>
        </h1>

        {/* Description */}
        <p className="text-on-surface-variant text-base leading-relaxed mb-10">
          You do not have the required authorisation level to access this sector. This incident has been logged.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-outline-variant/20" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-outline/40">SECTOR LOCKED</span>
          <div className="flex-1 h-px bg-outline-variant/20" />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            id="back-home-btn"
            href="/"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest text-sm hover:shadow-[0_4px_20px_rgba(255,84,80,0.3)] transition-all active:scale-95"
          >
            ← Return to Base
          </Link>
          <Link
            id="back-login-btn"
            href="/login"
            className="px-8 py-4 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant font-headline font-bold uppercase tracking-widest text-sm transition-all active:scale-95"
          >
            Re-authenticate
          </Link>
        </div>

        {/* Fine print */}
        <p className="mt-12 text-[10px] uppercase tracking-[0.2em] text-outline/30 font-bold">
          ReliefConnect Security Protocol · Unauthorised Access Logged
        </p>
      </div>
    </div>
  );
}
