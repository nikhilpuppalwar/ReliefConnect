"use client";

import Link from "next/link";
import { useState } from "react";
import { fetchApi } from "@/lib/api";

export default function Page() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await fetchApi("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      // Security best practice: always show success even if email not found
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <header className="fixed top-0 w-full z-50 bg-[#0d131f]/70 backdrop-blur-xl shadow-[0_0_20px_rgba(229,62,62,0.06)]">
          <div className="flex justify-between items-center px-6 h-16 w-full">
            <Link href="/" className="text-2xl font-black tracking-tighter text-[#E53E3E] uppercase font-headline">
              ReliefConnect
            </Link>
            <div className="hidden md:flex items-center space-x-6 font-['Space_Grotesk'] tracking-tighter uppercase text-sm font-bold">
              <span className="text-[#dde2f3] opacity-50">Status: Mission Ready</span>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center px-4 pt-20 pb-12 relative overflow-hidden">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-primary-container/5 rounded-full blur-[120px]" />
          </div>

          <div className="w-full max-w-md relative z-10">
            <div className="bg-surface-container border border-outline-variant/15 p-8 md:p-10 rounded-xl shadow-2xl">
              {/* Icon */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-lg bg-surface-container-high border border-outline-variant/30 rotate-45 group">
                  <span
                    className="material-symbols-outlined text-[#E53E3E] text-3xl -rotate-45"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    lock_reset
                  </span>
                </div>
                <h1 className="text-3xl font-headline font-bold tracking-tight text-on-surface mb-3 uppercase">
                  Recover Access
                </h1>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {sent
                    ? `Recovery instructions have been dispatched to ${email}.`
                    : "Enter your email to receive a secure recovery code."}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-lg text-sm border border-error/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-error">warning</span>
                  {error}
                </div>
              )}

              {/* Success state */}
              {sent ? (
                <div className="bg-surface-container-high p-6 rounded-xl border border-primary/20 text-center space-y-4">
                  <span
                    className="material-symbols-outlined text-primary text-5xl block"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    mark_email_read
                  </span>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-wider">RECOVERY CODE SENT</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    If <span className="text-primary font-semibold">{email}</span> is registered, a recovery code has been sent to that address.
                  </p>
                  <p className="text-xs text-on-surface-variant/60">
                    Check your inbox (and spam folder). The code expires in 15 minutes.
                  </p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit} id="forgot-password-form">
                  <div className="space-y-2">
                    <label
                      className="block font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                      htmlFor="forgot-email"
                    >
                      Email Address
                    </label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">
                        mail
                      </span>
                      <input
                        id="forgot-email"
                        className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant/30 focus:border-primary focus:ring-0 text-on-surface pl-12 pr-4 py-4 rounded-lg transition-all duration-300 placeholder:text-outline/50"
                        placeholder="your@email.com"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    id="send-recovery-code"
                    className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-headline font-bold py-4 rounded-xl uppercase tracking-widest text-sm shadow-[0_4px_20px_rgba(229,62,62,0.25)] active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center gap-3 disabled:opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        SENDING...
                      </>
                    ) : (
                      <>
                        <span>SEND RECOVERY CODE</span>
                        <span className="material-symbols-outlined text-xl">send</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Back to login */}
              <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
                <Link
                  id="back-to-login"
                  className="inline-flex items-center gap-2 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors group"
                  href="/login"
                >
                  <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  Back to Login
                </Link>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] font-bold text-outline/40">
              <div className="h-px w-8 bg-outline-variant/20" />
              SECURE ENCRYPTED CHANNEL
              <div className="h-px w-8 bg-outline-variant/20" />
            </div>
          </div>
        </main>

        <footer className="bg-[#0d131f] w-full py-8 mt-auto flex flex-col md:flex-row justify-between items-center px-8 border-t border-[#161c27]">
          <div className="font-['Inter'] text-xs tracking-widest uppercase text-[#dde2f3] opacity-50 mb-4 md:mb-0">
            © 2024 ReliefConnect Sentinel Command. All rights reserved.
          </div>
          <div className="flex space-x-6 font-['Inter'] text-xs tracking-widest uppercase">
            <a className="text-[#dde2f3] opacity-50 hover:text-[#E53E3E] transition-colors" href="#">Privacy Protocol</a>
            <a className="text-[#dde2f3] opacity-50 hover:text-[#E53E3E] transition-colors" href="#">Terms of Service</a>
            <a className="text-[#dde2f3] opacity-50 hover:text-[#E53E3E] transition-colors" href="#">Contact HQ</a>
          </div>
        </footer>
      </div>
    </>
  );
}