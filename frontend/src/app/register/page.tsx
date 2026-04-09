"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchApi, ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const SKILLS = ["Medical", "Rescue", "Logistics", "Communications", "Tactical"];

const EXPERIENCE_OPTIONS = [
  { label: "No Experience", value: 0 },
  { label: "< 1 Year", value: 0 },
  { label: "1–2 Years", value: 1 },
  { label: "2–5 Years Professional", value: 3 },
  { label: "5–10 Years", value: 7 },
  { label: "10+ Years Expert", value: 10 },
];

function getPasswordStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "WEAK", "FAIR", "STRONG", "VERY STRONG"];
const STRENGTH_COLORS = ["", "#ef4444", "#f97316", "#22c55e", "#16a34a"];

function redirectToDashboard(role: string, router: ReturnType<typeof useRouter>) {
  if (role === "admin") router.push("/admin/dashboard");
  else if (role === "volunteer") router.push("/volunteer/dashboard");
  else router.push("/civilian/dashboard");
}

export default function Page() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
    role: "",
    skills: [] as string[],
    experience_years: 0,
    zone: "",
    adminCode: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Read ?role=volunteer from URL (Landing "Join as Volunteer")
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get("role");
    if (roleParam && ["civilian", "volunteer", "admin"].includes(roleParam)) {
      setFormData((prev) => ({ ...prev, role: roleParam as "civilian" | "volunteer" | "admin" }));
      // Preselect role only; keep Step 01 active so required account fields are collected.
    }
  }, []);

  const passwordStrength = getPasswordStrength(formData.password);

  const updateField = (key: string, value: unknown) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  // Step 1 → Step 2 (no API call)
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errors: Record<string, string> = {};
    if (!formData.name || formData.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Enter a valid email address.";
    if (!formData.location.trim()) errors.location = "Location is required.";
    if (!formData.password || formData.password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setStep(2);
  };

  // Step 2 — Final submit (API call)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.role) {
      setError("Please select your role.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone || null,
        location: formData.location || null,
        adminCode: formData.adminCode || null,
      };

      const res = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const { token, user } = res.data;

      // Sync to AuthContext (also persists to localStorage internally)
      login(token, user);

      // If volunteer — POST volunteer profile data
      if (formData.role === "volunteer" && user.id) {
        try {
          await fetchApi(`/volunteers/${user.id}`, {
            method: "PUT",
            body: JSON.stringify({
              skills: formData.skills.join(","),
              experience_years: formData.experience_years,
              zone: formData.zone || null,
              availability: "available",
            }),
          });
        } catch {
          // Non-fatal: profile data can be updated later
          console.warn("Could not save volunteer profile data");
        }
      }

      redirectToDashboard(user.role, router);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        // Duplicate email — go back to step 1 and highlight email field
        setStep(1);
        setFieldErrors({ email: "This email is already registered. Try logging in." });
        return;
      }
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-[#0d131f]/90 backdrop-blur-xl sticky top-0 z-50 shadow-[0_0_20px_rgba(229,62,62,0.06)] flex justify-between items-center w-full px-8 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-[#E53E3E] uppercase font-['Space_Grotesk']">
          ReliefConnect
        </Link>
        <div className="hidden md:flex items-center gap-8 font-['Space_Grotesk'] tracking-tighter uppercase">
          <Link className="text-[#ffb3ad] font-bold border-b-2 border-[#ffb3ad] pb-1 transition-all" href="/login">
            Login
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center p-6 md:p-12 bg-surface min-h-screen">
        <div className="w-full max-w-[900px] bg-surface-container-low rounded-xl border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase block mb-2">SYSTEM ENROLLMENT</span>
              <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-on-surface uppercase">MISSION REGISTRATION</h1>
            </div>
            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step > 1 ? "bg-surface-container-highest border border-outline-variant text-primary" : step === 1 ? "bg-primary text-on-primary shadow-[0_0_15px_rgba(229,62,62,0.5)]" : "bg-surface-container-highest border border-outline-variant text-on-surface-variant"}`}>
                  {step > 1 ? <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>check</span> : "01"}
                </div>
                <span className={`hidden sm:inline text-xs font-bold tracking-widest ${step === 1 ? "text-primary" : "text-on-surface-variant/50"}`}>ACCOUNT</span>
              </div>
              <div className={`w-12 h-[2px] transition-colors ${step === 2 ? "bg-primary/50" : "bg-outline-variant/30"}`} />
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === 2 ? "bg-primary text-on-primary shadow-[0_0_15px_rgba(229,62,62,0.5)]" : "bg-surface-container-highest border border-outline-variant text-on-surface-variant"}`}>
                  02
                </div>
                <span className={`hidden sm:inline text-xs font-bold tracking-widest ${step === 2 ? "text-primary" : "text-on-surface-variant/50"}`}>CLEARANCE</span>
              </div>
            </div>
          </div>

          {/* Global error */}
          {error && (
            <div className="mb-6 p-4 bg-error-container/20 border border-error/50 rounded-lg text-error text-sm flex items-center gap-2 font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-base">warning</span>
              {error}
            </div>
          )}

          {/* ───── STEP 1 ───── */}
          {step === 1 ? (
            <form className="space-y-8" onSubmit={handleStep1Next} id="register-step1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {/* Full Name */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">person</span>FULL NAME
                  </label>
                  <div className="relative bg-surface-container-lowest border-b border-outline-variant/30 transition-all duration-300 group-hover:border-outline-variant">
                    <input
                      id="reg-name"
                      className="w-full bg-transparent border-none py-3 px-0 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 font-medium"
                      placeholder="OPERATIVE NAME"
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                    />
                  </div>
                  {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">mail</span>EMAIL ADDRESS
                  </label>
                  <div className="relative bg-surface-container-lowest border-b border-outline-variant/30 transition-all duration-300 group-hover:border-outline-variant">
                    <input
                      id="reg-email"
                      className="w-full bg-transparent border-none py-3 px-0 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 font-medium"
                      placeholder="YOUR@EMAIL.COM"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>
                  {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">phone</span>PHONE NUMBER
                  </label>
                  <div className="bg-surface-container-lowest border-b border-outline-variant/30 transition-all duration-300 group-hover:border-outline-variant">
                    <input
                      id="reg-phone"
                      className="w-full bg-transparent border-none py-3 px-0 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 font-medium"
                      placeholder="+00 000 000 000"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">location_on</span>CITY / LOCATION
                  </label>
                  <div className="bg-surface-container-lowest border-b border-outline-variant/30 transition-all duration-300 group-hover:border-outline-variant">
                    <input
                      id="reg-location"
                      className="w-full bg-transparent border-none py-3 px-0 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 font-medium"
                      placeholder="ENTER YOUR CITY"
                      type="text"
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                    />
                  </div>
                  {fieldErrors.location && <p className="text-red-400 text-xs mt-1">{fieldErrors.location}</p>}
                </div>

                {/* Password */}
                <div className="space-y-2 group md:col-span-2">
                  <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">lock</span>SECURITY KEY
                  </label>
                  <div className="relative bg-surface-container-lowest border-b border-outline-variant/30 transition-all duration-300 group-hover:border-outline-variant flex items-center">
                    <input
                      id="reg-password"
                      className="w-full bg-transparent border-none py-3 px-0 pr-10 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 font-medium"
                      placeholder="MIN. 8 CHARACTERS"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 pr-2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
                  {/* Password strength bar */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{ backgroundColor: i <= passwordStrength ? STRENGTH_COLORS[passwordStrength] : "#374151" }}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: STRENGTH_COLORS[passwordStrength] || "#6b7280" }}>
                        SIGNAL STRENGTH: {STRENGTH_LABELS[passwordStrength] || "VERY WEAK"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2 group md:col-span-2">
                  <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">shield</span>CONFIRM KEY
                  </label>
                  <div className="relative bg-surface-container-lowest border-b border-outline-variant/30 transition-all duration-300 group-hover:border-outline-variant flex items-center">
                    <input
                      id="reg-confirm-password"
                      className="w-full bg-transparent border-none py-3 px-0 pr-10 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-0 font-medium"
                      placeholder="REPEAT SECURITY KEY"
                      type={showConfirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-0 pr-2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showConfirm ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
                <Link href="/login" className="text-sm font-bold tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors">
                  Already have an account? Login →
                </Link>
                <button
                  id="step1-next"
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary-container px-8 py-4 rounded-xl font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(255,84,80,0.3)] transition-all active:scale-95 group ml-auto"
                  type="submit"
                >
                  INITIALIZE STEP 02
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </form>

          ) : (
            /* ───── STEP 2 ───── */
            <form className="space-y-8" onSubmit={handleRegister} id="register-step2">
              <h2 className="text-xl font-headline font-bold uppercase tracking-widest text-primary mb-4 border-b border-outline-variant/20 pb-2">
                WHO ARE YOU?
              </h2>

              {/* Role Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { value: "civilian", icon: "person", label: "Civilian", desc: "Report emergencies and request immediate assistance." },
                  { value: "volunteer", icon: "volunteer_activism", label: "Volunteer", desc: "Respond to crises and provide specialized skills." },
                  { value: "admin", icon: "admin_panel_settings", label: "Admin", desc: "Oversee logistics and system commands." },
                ].map(({ value, icon, label, desc }) => (
                  <div
                    key={value}
                    id={`role-${value}`}
                    onClick={() => updateField("role", value)}
                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 ${formData.role === value ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(229,62,62,0.2)]" : "border-outline-variant/20 hover:border-outline-variant/50 bg-surface-container"}`}
                  >
                    <span className="material-symbols-outlined text-3xl mb-3 text-primary block" style={value === "volunteer" ? { fontVariationSettings: '"FILL" 1' } : undefined}>{icon}</span>
                    <h3 className="font-bold tracking-widest uppercase text-sm mb-2">{label}</h3>
                    <p className="text-xs text-on-surface-variant/70 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Volunteer Extra Fields */}
              {formData.role === "volunteer" && (
                <div className="space-y-6 bg-surface-container-low p-6 rounded-xl border border-primary/20 transition-all">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">OPERATIVE SKILLS</h3>

                  {/* Skills chips */}
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-3 block">SELECT SKILLS (MULTI-SELECT)</label>
                    <div className="flex flex-wrap gap-2">
                      {SKILLS.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          id={`skill-${skill.toLowerCase()}`}
                          onClick={() => toggleSkill(skill)}
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border-2 transition-all ${formData.skills.includes(skill) ? "border-primary bg-primary/20 text-primary" : "border-outline-variant/30 text-on-surface-variant hover:border-outline-variant"}`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {/* Experience */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">timer</span>FIELD EXPERIENCE
                      </label>
                      <select
                        id="reg-experience"
                        className="w-full bg-surface-container-lowest border-b border-outline-variant/30 py-3 px-0 text-on-surface focus:outline-none focus:border-primary font-medium appearance-none"
                        value={formData.experience_years}
                        onChange={(e) => updateField("experience_years", Number(e.target.value))}
                      >
                        {EXPERIENCE_OPTIONS.map((opt, i) => (
                          <option key={i} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Zone */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">map</span>DEPLOYMENT ZONE
                      </label>
                      <input
                        id="reg-zone"
                        className="w-full bg-surface-container-lowest border-b border-outline-variant/30 py-3 px-0 text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary font-medium"
                        placeholder="Enter sector code or city..."
                        type="text"
                        value={formData.zone}
                        onChange={(e) => updateField("zone", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Extra Fields */}
              {formData.role === "admin" && (
                <div className="space-y-6 bg-surface-container-low p-6 rounded-xl border border-primary/20 transition-all">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">ADMIN CLEARANCE</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">key</span>SECRET CODE
                    </label>
                    <input
                      id="reg-admin-code"
                      className="w-full bg-surface-container-lowest border-b border-outline-variant/30 py-3 px-0 text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary font-medium"
                      placeholder="Enter admin secret code..."
                      type="password"
                      value={formData.adminCode}
                      onChange={(e) => updateField("adminCode", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-6">
                <button
                  id="step2-back"
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-bold tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span> BACK TO STEP 01
                </button>
                <button
                  id="deploy-operative"
                  className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary-container px-8 py-4 rounded-xl font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(255,84,80,0.3)] transition-all active:scale-95 disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      DEPLOYING...
                    </>
                  ) : (
                    <>DEPLOY OPERATIVE ⚡</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#080e1a] border-t border-white/5 flex flex-col md:flex-row justify-between items-center w-full px-12 py-10 gap-6">
        <div className="font-['Inter'] text-sm tracking-widest uppercase text-[#dde2f3]/50">
          © 2024 SENTINEL COMMAND. ALL RIGHTS RESERVED.
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-['Inter'] text-sm tracking-widest uppercase">
          <a className="text-[#dde2f3]/50 hover:text-[#ffb3ad] transition-colors" href="#">Privacy Protocol</a>
          <a className="text-[#dde2f3]/50 hover:text-[#ffb3ad] transition-colors" href="#">Terms of Deployment</a>
          <a className="text-[#dde2f3]/50 hover:text-[#ffb3ad] transition-colors" href="#">System Status</a>
        </div>
      </footer>
    </>
  );
}