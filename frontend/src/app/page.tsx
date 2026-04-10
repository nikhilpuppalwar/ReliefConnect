"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleReportDisaster = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      router.push("/civilian/reports");
    } else {
      // Save redirect destination then send to login (spec: redirectAfter: '/civilian/reports')
      sessionStorage.setItem("redirectAfter", "/civilian/reports");
      router.push("/login");
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0d131f]/70 backdrop-blur-xl shadow-[0_0_20px_rgba(229,62,62,0.05)] h-20 transition-all duration-300">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-full">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container flex items-center justify-center rounded-lg rotate-45">
              <span
                className="material-symbols-outlined text-on-primary-container -rotate-45"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                shield
              </span>
            </div>
            <span className="text-2xl font-bold tracking-tighter text-[#dde2f3] font-headline uppercase">ReliefConnect</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-headline uppercase tracking-wider text-sm">
            <Link className="text-[#ffb3ad] border-b-2 border-[#ff5450] pb-1" href="#home">Home</Link>
            <Link className="text-[#dde2f3] hover:text-[#ffb3ad] transition-colors" href="#about">About</Link>
            <Link className="text-[#dde2f3] hover:text-[#ffb3ad] transition-colors" href="#how-it-works">How It Works</Link>
            <Link className="text-[#dde2f3] hover:text-[#ffb3ad] transition-colors" href="#contact">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              id="nav-login"
              className="px-6 py-2 rounded-xl border border-outline text-[#dde2f3] font-headline uppercase text-sm tracking-widest hover:bg-surface-container transition-all active:scale-95 duration-150 text-center"
            >
              Login
            </Link>
            <Link
              href="/register"
              id="nav-register"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold uppercase text-sm tracking-widest hover:opacity-80 transition-all active:scale-95 duration-150 text-center"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error-container/30 border border-error/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Live Emergency Monitoring</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-[0.9] tracking-tight mb-6 text-on-background">
              Coordinate Relief.<br />
              <span className="text-primary-container">Save Lives</span> Together.
            </h1>
            <p className="text-xl text-on-background/70 mb-10 max-w-xl leading-relaxed">
              A mission-critical command platform connecting specialized volunteers, agency admins, and affected civilians during disaster situations in real time.
            </p>
            <div className="flex flex-wrap gap-4">
              {/* Join as Volunteer — passes role via query param */}
              <Link
                id="join-volunteer-btn"
                href="/register?role=volunteer"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-black uppercase tracking-widest shadow-lg shadow-primary-container/20 hover:scale-105 transition-transform active:scale-95 inline-block text-center"
              >
                Join as Volunteer
              </Link>
              {/* Report a Disaster — auth-gated */}
              <button
                id="report-disaster-btn"
                onClick={handleReportDisaster}
                className="px-8 py-4 rounded-xl border-2 border-outline-variant text-on-background font-headline font-black uppercase tracking-widest hover:bg-surface-container transition-colors active:scale-95 text-center"
              >
                Report a Disaster
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 blur-[100px] rounded-full" />
            <div className="relative rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl">
              <img
                alt="Emergency response center with large digital maps and professional personnel coordinating disaster relief"
                className="w-full h-[500px] object-cover grayscale-[0.3] contrast-[1.1]"
                src="/langing_img.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
            {/* Tactical Overlay */}
            <div className="absolute -bottom-6 -left-6 bg-surface-container-high p-6 rounded-xl border border-outline-variant/50 backdrop-blur-md shadow-xl hidden md:block">
              <div className="flex items-center gap-4 mb-4">
                <span className="material-symbols-outlined text-primary-container text-3xl">radar</span>
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-60">Status Scan</p>
                  <p className="font-headline font-bold text-lg">Active Missions: 24</p>
                </div>
              </div>
              <div className="w-full bg-surface-variant h-1 rounded-full overflow-hidden">
                <div className="bg-primary-container h-full w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-surface-container-lowest border-y border-outline-variant/10 relative z-10">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "1,200+", label: "Disasters Reported" },
              { value: "3,500+", label: "Volunteers Registered" },
              { value: "8,000+", label: "Resources Deployed" },
              { value: "950+", label: "Disasters Resolved" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl md:text-5xl font-headline font-bold text-primary mb-1">{value}</p>
                <p className="text-xs uppercase tracking-[0.2em] opacity-60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-surface relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 uppercase tracking-tight">
              How It <span className="text-primary-container">Works</span>
            </h2>
            <div className="w-24 h-1 bg-primary-container" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", icon: "map", title: "Report", desc: "Affected individuals or observers log critical incidents with GPS data and multimedia evidence immediately." },
              { num: "02", icon: "person_raised_hand", title: "Volunteer", desc: "Certified responders receive real-time notifications and deploy to priority zones based on their specific skills." },
              { num: "03", icon: "task_alt", title: "Resolve", desc: "Command centers track resource allocation and mission progress until the situation is officially stabilized." },
            ].map(({ num, icon, title, desc }) => (
              <div key={num} className="bg-surface-container-low p-8 rounded-xl border-t-4 border-primary-container hover:bg-surface-container transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-surface-container-high rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-container text-3xl">{icon}</span>
                  </div>
                  <span className="text-5xl font-black text-outline-variant/30 group-hover:text-primary/20 transition-colors">{num}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 font-headline">{title}</h3>
                <p className="text-on-background/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Is It For */}
      <section id="about" className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center font-headline uppercase">
            Who Can Use This <span className="text-primary-container">Platform?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: "person", title: "Civilian", features: ["Quick SOS help requests", "Real-time safety alerts", "Access to local resource maps"] },
              {
                icon: "volunteer_activism", title: "Volunteer", features: ["Task management dashboard", "Skill-based mission matching", "Performance certification"],
                highlight: true
              },
              { icon: "admin_panel_settings", title: "Admin", features: ["Full resource oversight", "Verified response analytics", "System-wide broadcast tools"] },
            ].map(({ icon, title, features, highlight }) => (
              <div key={title} className={`bg-surface p-8 rounded-xl border transition-all duration-300 shadow-xl group hover:-translate-y-2 ${highlight ? "border-primary-container/30 hover:border-primary-container/80 shadow-[0_0_30px_rgba(255,84,80,0.1)]" : "border-transparent hover:border-primary-container/50"}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${highlight ? "bg-primary-container" : "bg-surface-container-high"}`}>
                  <span className={`material-symbols-outlined text-4xl ${highlight ? "text-white" : "text-primary"}`} style={highlight ? { fontVariationSettings: '"FILL" 1' } : undefined}>{icon}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 font-headline uppercase tracking-wide">{title}</h3>
                <ul className="space-y-4">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-on-background/70">
                      <span className="material-symbols-outlined text-primary-container text-sm mt-1">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-primary-container font-headline font-bold uppercase tracking-[0.3em] mb-2 text-sm">Tech Infrastructure</p>
              <h2 className="text-4xl md:text-6xl font-bold font-headline uppercase tracking-tight">
                Everything <br />You <span className="text-primary-container">Need</span>
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-on-background/50 leading-relaxed">Built on industrial-grade technology to ensure 99.9% uptime when it matters most.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {[
              { icon: "cloud_upload", title: "S3 Media Uploads", desc: "Securely upload high-res imagery and video for accurate damage assessment." },
              { icon: "lock", title: "Secure JWT Auth", desc: "Industry standard encryption protecting sensitive volunteer and victim data." },
              { icon: "assignment", title: "Task Management", desc: "Dynamic assignment engine that routes help to the nearest available volunteer." },
              { icon: "inventory_2", title: "Resource Tracking", desc: "Real-time inventory of medical supplies, food, and water across sectors." },
              { icon: "emergency", title: "SOS Help Requests", desc: "One-tap critical alerts that bypass queues for immediate life-saving intervention." },
              { icon: "workspace_premium", title: "Volunteer Certificates", desc: "Automated verification of service hours and expertise for relief professionals." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-surface-container p-10 border border-outline-variant/10 hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined text-primary-container text-4xl mb-6 block">{icon}</span>
                <h4 className="text-xl font-bold mb-3 font-headline">{title}</h4>
                <p className="text-on-background/60 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disaster Types */}
      <section className="py-16 bg-surface-container-lowest overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <h3 className="text-xs uppercase tracking-[0.4em] font-bold text-center mb-10 opacity-60">Operations Capability</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: "water_drop", label: "Flood" },
              { icon: "local_fire_department", label: "Fire" },
              { icon: "cyclone", label: "Cyclone" },
              { icon: "terrain", label: "Landslide" },
              { icon: "vibration", label: "Earthquake" },
              { icon: "more_horiz", label: "Other" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-3 rounded-full bg-surface-container-high border border-outline-variant/20 hover:border-primary-container transition-all cursor-default">
                <span className="material-symbols-outlined text-primary-container">{icon}</span>
                <span className="font-headline font-bold uppercase text-xs tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-container to-on-primary-container p-12 md:p-20 shadow-2xl">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black font-headline mb-6 text-white leading-none">Ready to Make a Difference?</h2>
              <p className="text-xl text-white/80 mb-10 leading-relaxed font-light">
                Join thousands of specialized volunteers and coordinators helping communities recover faster from large-scale crises.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  id="cta-register-now"
                  href="/register"
                  className="px-10 py-5 rounded-full bg-white text-on-primary-container font-headline font-black uppercase tracking-widest hover:bg-opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl inline-block text-center"
                >
                  Register Now
                </Link>
                <a
                  href="#how-it-works"
                  className="px-10 py-5 rounded-full border-2 border-white/30 text-white font-headline font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 inline-block text-center"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#080e1a] border-t border-[#1a202c] py-20 font-body">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary-container flex items-center justify-center rounded-md rotate-45">
                <span className="material-symbols-outlined text-white -rotate-45 text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>shield</span>
              </div>
              <span className="font-['Space_Grotesk'] font-black text-xl text-[#ff5450]">SENTINEL</span>
            </div>
            <p className="text-[#dde2f3]/60 text-sm leading-relaxed mb-6">
              Real-time disaster response and relief management. Mission critical software for a safer tomorrow.
            </p>
            <div className="flex gap-4">
              {["public", "group", "chat"].map((icon) => (
                <a key={icon} className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary hover:bg-primary-container hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined">{icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-headline font-bold uppercase tracking-widest text-sm mb-6 text-primary">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link className="text-[#dde2f3]/60 hover:text-[#ffb3ad] transition-colors text-sm" href="/">Home</Link></li>
              <li><a className="text-[#dde2f3]/60 hover:text-[#ffb3ad] transition-colors text-sm" href="#how-it-works">About</a></li>
              <li><Link className="text-[#dde2f3]/60 hover:text-[#ffb3ad] transition-colors text-sm" href="/login">Login</Link></li>
              <li><Link className="text-[#dde2f3]/60 hover:text-[#ffb3ad] transition-colors text-sm" href="/register">Register</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="font-headline font-bold uppercase tracking-widest text-sm mb-6 text-primary">Portals</h4>
            <ul className="space-y-4">
              <li><Link className="text-[#dde2f3]/60 hover:text-[#ffb3ad] transition-colors text-sm" href="/civilian">Civilian Portal</Link></li>
              <li><Link className="text-[#dde2f3]/60 hover:text-[#ffb3ad] transition-colors text-sm" href="/volunteer">Volunteer Portal</Link></li>
              <li><Link className="text-[#dde2f3]/60 hover:text-[#ffb3ad] transition-colors text-sm" href="/admin">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-headline font-bold uppercase tracking-widest text-sm mb-6 text-primary">Contact</h4>
            <ul className="space-y-4 text-sm text-[#dde2f3]/60">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container text-lg">mail</span>
                dispatch@sentinelcommand.org
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container text-lg">call</span>
                +1 (555) MISSION-1
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary-container text-lg">location_on</span>
                Global Operations Center<br />Tactical Node Alpha-7
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs tracking-widest text-[#dde2f3]/40 uppercase">© 2024 SENTINEL COMMAND. MISSION CRITICAL DISPATCH.</p>
          <div className="flex gap-8">
            <a className="text-[10px] uppercase tracking-[0.2em] text-[#dde2f3]/40 hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-[10px] uppercase tracking-[0.2em] text-[#dde2f3]/40 hover:text-primary transition-colors" href="#">Terms of Engagement</a>
          </div>
        </div>
      </footer>
    </>
  );
}