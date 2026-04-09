"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function redirectToDashboard(role: string, router: ReturnType<typeof useRouter>) {
  if (role === "admin") router.push("/admin/dashboard");
  else if (role === "volunteer") router.push("/volunteer/dashboard");
  else router.push("/civilian/dashboard");
}

export default function Page() {
  const router = useRouter();
  const { login, user, token } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // On mount: if already logged in, redirect to dashboard
  useEffect(() => {
    if (token && user?.role) {
      redirectToDashboard(user.role, router);
    }
  }, [token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (!email || !password) {
      setError("All fields are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const { token: newToken, user: newUser } = res.data;

      // Update AuthContext (also persists to localStorage internally)
      login(newToken, newUser);

      // Check for post-login redirect (set by protected pages or "Report a Disaster")
      const redirectAfter = sessionStorage.getItem("redirectAfter");
      if (redirectAfter) {
        sessionStorage.removeItem("redirectAfter");
        router.push(redirectAfter);
      } else {
        redirectToDashboard(newUser.role, router);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <main className="min-h-screen flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Visual & Brand Identity */}
        <section className="relative hidden md:flex md:w-7/12 bg-surface-container flex-col justify-between p-12 overflow-hidden border-r border-outline-variant/10">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              alt="Aerial view of rescue boats and emergency workers navigating a flooded residential area"
              className="w-full h-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmd32AghyzhG8mwq2uCO7tZ4vuQ43GQJo8CGImqBYtnd1EY3h75gTAeSBdcHBLAwicEFpsKdUs92r6cddGXInbTxUV84TePJ7YopJqJifqYfdYcx2YYdlqpC-Zr_B72yIysTXLP17vP_bwPzPtq5BavMlCE6OgvNjWYmmm5RVPYHPtkrxPypQRF39t1SJpbH82YCbIJfnbtWfJpPvYB_amU5ePE6AYlkaXlJ-P6dJJj4uGAofJ3bkwtbdBQuS0U6PqMFDLurvBuA"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
          </div>
          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-container flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(255,84,80,0.3)]">
                <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: '"FILL" 1' }}>
                  shield_with_heart
                </span>
              </div>
              <span className="font-headline font-black text-2xl tracking-tighter text-on-surface">ReliefConnect</span>
            </div>
          </div>
          {/* Hero Text */}
          <div className="relative z-10 max-w-xl">
            <h1 className="font-headline text-5xl lg:text-7xl font-bold tracking-tighter leading-none mb-6">
              COORDINATE RELIEF.<br />
              <span className="text-primary">SAVE LIVES.</span>
            </h1>
            <p className="text-on-surface-variant text-lg lg:text-xl font-light leading-relaxed max-w-md">
              The central nervous system for tactical disaster response and large-scale humanitarian logistics.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-outline-variant/20 pt-8">
              <div>
                <p className="font-headline text-3xl font-bold text-on-surface">14ms</p>
                <p className="text-label text-xs uppercase tracking-widest text-on-surface-variant">Sync Latency</p>
              </div>
              <div>
                <p className="font-headline text-3xl font-bold text-on-surface">2.4M</p>
                <p className="text-label text-xs uppercase tracking-widest text-on-surface-variant">Active Assets</p>
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <p className="font-label text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">
              Tactical Operations Interface // System v4.0.2
            </p>
          </div>
        </section>

        {/* Right Side: Login Interface */}
        <section className="flex-1 bg-surface flex flex-col items-center justify-center px-6 py-12 md:px-16 lg:px-24">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Header */}
            <div className="md:hidden flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-primary-container flex items-center justify-center rounded-lg mb-4">
                <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: '"FILL" 1' }}>
                  shield_with_heart
                </span>
              </div>
              <h2 className="font-headline font-black text-xl tracking-tighter">RELIEFCONNECT</h2>
            </div>

            <div className="text-center md:text-left space-y-2">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">Welcome Back</h2>
              <p className="text-on-surface-variant font-body">Access your secure tactical dashboard</p>
            </div>

            <div className="bg-surface-container p-8 rounded-xl shadow-xl border border-outline-variant/10">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">warning</span>
                  {error}
                </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit} id="login-form">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant" htmlFor="login-email">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">mail</span>
                    </div>
                    <input
                      className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 pl-12 py-4 transition-all"
                      id="login-email"
                      name="email"
                      placeholder="your@email.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant" htmlFor="login-password">
                    PASSWORD
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">lock</span>
                    </div>
                    <input
                      className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 pl-12 pr-12 py-4 transition-all"
                      id="login-password"
                      name="password"
                      placeholder="••••••••••••"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      id="toggle-password"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group" htmlFor="remember-me">
                    <input
                      id="remember-me"
                      className="w-4 h-4 rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary focus:ring-offset-surface"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Persistent Auth</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-tertiary-fixed-dim transition-colors font-medium"
                    id="forgot-access-link"
                  >
                    Forgot Access?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  id="login-submit"
                  className="w-full py-4 rounded-xl tactical-gradient text-on-primary font-headline font-bold text-lg tracking-wide uppercase shadow-[0_4px_20px_rgba(255,84,80,0.2)] hover:shadow-[0_4px_30px_rgba(255,84,80,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      AUTHENTICATING...
                    </span>
                  ) : "INITIALIZE COMMAND"}
                </button>
              </form>
            </div>

            {/* Footer Link */}
            <p className="text-center text-on-surface-variant text-sm">
              New operative?{" "}
              <Link
                id="register-link"
                href="/register"
                className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 ml-1"
              >
                Request Engagement Access
              </Link>
            </p>

            {/* Bottom Disclaimer */}
            <div className="text-center">
              <p className="font-label text-[10px] text-on-surface-variant/40 max-w-xs leading-relaxed uppercase tracking-tighter mx-auto">
                Restricted System. All activities are monitored and logged under ReliefConnect Security Protocol 9. Unauthorized access will be traced.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-center px-12 gap-4 bg-[#080e1a] border-t border-[#dde2f3]/5 py-6">
        <div className="font-['Inter'] text-xs tracking-widest uppercase text-[#dde2f3]/40">
          © 2024 RELIEFCONNECT. TACTICAL RELIEF OPERATIONS.
        </div>
        <div className="flex gap-8">
          <a className="font-['Inter'] text-xs tracking-widest uppercase text-[#dde2f3]/40 hover:text-[#dde2f3] transition-colors" href="#">Privacy Protocol</a>
          <a className="font-['Inter'] text-xs tracking-widest uppercase text-[#dde2f3]/40 hover:text-[#dde2f3] transition-colors" href="#">Terms of Engagement</a>
          <a className="font-['Inter'] text-xs tracking-widest uppercase text-[#dde2f3]/40 hover:text-[#dde2f3] transition-colors" href="#">Mission Support</a>
        </div>
      </footer>
    </>
  );
}