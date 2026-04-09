import Link from "next/link";

export default function Page() {
  return (
    <>
      
{/* TopNavBar */}
<nav className="bg-[#0d131f] dark:bg-[#0d131f] backdrop-blur-xl bg-opacity-70 docked full-width top-0 sticky z-50 shadow-[0_0_20px_rgba(229,62,62,0.06)] flex justify-between items-center w-full px-8 py-4 max-w-none">
<div className="text-2xl font-bold tracking-tighter text-[#E53E3E] uppercase font-headline" >ReliefConnect</div>
<div className="hidden md:flex gap-8 items-center">
<a className="text-[#dde2f3] opacity-80 font-['Space_Grotesk'] tracking-tighter uppercase hover:text-[#ffb3ad] transition-all duration-300" href="#" >Emergency Support</a>
<button className="text-[#ffb3ad] font-['Space_Grotesk'] tracking-tighter uppercase hover:bg-[#242a36] px-4 py-2 transition-all duration-300 scale-95 active:scale-90" >Login</button>
</div>
</nav>
<main className="flex-grow flex flex-col items-center justify-center px-4 py-12 md:py-20">
<div className="w-full max-w-4xl space-y-12">
{/* Progress Indicator */}
<div className="flex items-center justify-center gap-10">
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center">
<span
  className="material-symbols-outlined text-sm text-primary"
  style={{ fontVariationSettings: '"FILL" 1' }}
>
  check
</span>
</div>
<span className="font-headline text-sm tracking-widest uppercase opacity-60" >Step 01</span>
</div>
<div className="h-[1px] w-12 bg-outline-variant opacity-30"></div>
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary-container border border-primary flex items-center justify-center">
<div className="w-2.5 h-2.5 rounded-full bg-on-primary-container"></div>
</div>
<span className="font-headline text-sm tracking-widest uppercase text-primary font-bold" >Step 02</span>
</div>
</div>
{/* Header Section */}
<div className="text-center space-y-2">
<h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tighter uppercase text-on-surface" >WHO ARE YOU?</h1>
<p className="text-on-surface-variant font-body text-lg opacity-80" >Select your operational role within the Sentinel Command network.</p>
</div>
{/* Role Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{/* Civilian Card */}
<div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-xl flex flex-col items-center gap-6 hover:bg-surface-container transition-all cursor-pointer group">
<div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-4xl text-outline" data-icon="person" >person</span>
</div>
<div className="text-center">
<h3 className="font-headline text-xl font-bold tracking-tight uppercase" >CIVILIAN</h3>
<p className="text-xs text-on-surface-variant mt-1 font-label tracking-widest" >OBSERVE &amp; REPORT</p>
</div>
</div>
{/* Volunteer Card (Selected) */}
<div className="bg-surface-container-low border-2 border-primary-container p-8 rounded-xl flex flex-col items-center gap-6 relative shadow-[0_0_30px_rgba(255,84,80,0.15)] group">
<div className="absolute top-4 right-4 w-6 h-6 bg-primary-container rounded-full flex items-center justify-center">
<span className="material-symbols-outlined text-[14px] text-on-primary-container font-bold" data-icon="check" >check</span>
</div>
<div className="w-16 h-16 rounded-lg bg-primary-container/10 border border-primary-container flex items-center justify-center">
<span
  className="material-symbols-outlined text-4xl text-primary"
  data-icon="front_hand"
  style={{ fontVariationSettings: '"FILL" 1' }}
>
  front_hand
</span>
</div>
<div className="text-center">
<h3 className="font-headline text-xl font-bold tracking-tight uppercase text-primary" >VOLUNTEER</h3>
<p className="text-xs text-primary/70 mt-1 font-label tracking-widest" >ACTIVE RESPONSE</p>
</div>
</div>
{/* Admin Card */}
<div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-xl flex flex-col items-center gap-6 hover:bg-surface-container transition-all cursor-pointer group">
<div className="w-16 h-16 rounded-lg bg-surface-container-high flex items-center justify-center group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-4xl text-outline" data-icon="shield" >shield</span>
</div>
<div className="text-center">
<h3 className="font-headline text-xl font-bold tracking-tight uppercase" >ADMIN</h3>
<p className="text-xs text-on-surface-variant mt-1 font-label tracking-widest" >SYSTEM COMMAND</p>
</div>
</div>
</div>
{/* Conditional Fields: Volunteer Operative Details */}
<div className="bg-surface-container-low/50 p-8 rounded-xl space-y-8 border-l-4 border-primary">
<div>
<h4 className="font-headline text-sm font-bold tracking-[0.2em] uppercase text-primary mb-6" >OPERATIVE SKILLS</h4>
<div className="flex flex-wrap gap-3">
<span className="px-4 py-2 bg-primary-container text-on-primary-container font-label text-xs font-bold rounded-full cursor-pointer hover:brightness-110 transition-all" >MEDICAL</span>
<span className="px-4 py-2 bg-surface-container-highest text-on-surface-variant border border-outline-variant font-label text-xs font-bold rounded-full cursor-pointer hover:bg-primary-container/20 transition-all" >RESCUE</span>
<span className="px-4 py-2 bg-primary-container text-on-primary-container font-label text-xs font-bold rounded-full cursor-pointer hover:brightness-110 transition-all" >LOGISTICS</span>
<span className="px-4 py-2 bg-surface-container-highest text-on-surface-variant border border-outline-variant font-label text-xs font-bold rounded-full cursor-pointer hover:bg-primary-container/20 transition-all" >COMMUNICATIONS</span>
<span className="px-4 py-2 bg-surface-container-highest text-on-surface-variant border border-outline-variant font-label text-xs font-bold rounded-full cursor-pointer hover:bg-primary-container/20 transition-all" >TACTICAL</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="space-y-2">
<label className="font-headline text-xs font-bold tracking-widest uppercase text-on-surface-variant" >FIELD EXPERIENCE</label>
<div className="relative">
<select className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-3 px-0 font-body transition-colors appearance-none" defaultValue="2-5 Years Professional">
<option>Less than 2 years</option>
<option>2-5 Years Professional</option>
<option>5+ Years Expert</option>
<option>Military Background</option>
</select>
<span className="material-symbols-outlined absolute right-0 top-3 text-on-surface-variant pointer-events-none" >expand_more</span>
</div>
</div>
<div className="space-y-2">
<label className="font-headline text-xs font-bold tracking-widest uppercase text-on-surface-variant" >DEPLOYMENT ZONE</label>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-0 text-primary" data-icon="location_on" >location_on</span>
<input className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface py-3 pl-8 px-0 font-body transition-colors" placeholder="Enter sector code or city..." type="text" />
</div>
</div>
</div>
</div>
{/* Action Buttons */}
<div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
<button className="w-full md:w-auto px-8 py-4 border border-outline text-on-surface-variant font-headline font-bold tracking-widest uppercase hover:bg-surface-container-high hover:text-on-surface transition-all rounded-xl flex items-center justify-center gap-2" >
<span className="material-symbols-outlined text-xl" >arrow_back</span>
                    BACK TO STEP 01
                </button>
<button className="w-full md:w-auto px-12 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold tracking-widest uppercase rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2" >
                    DEPLOY OPERATIVE
                    <span className="material-symbols-outlined text-xl" >bolt</span>
</button>
</div>
</div>
</main>
{/* Footer */}
<footer className="bg-[#080e1a] dark:bg-[#080e1a] full-width relative border-t border-white/5 flex flex-col md:flex-row justify-between items-center w-full px-12 py-10 gap-6">
<div className="font-['Inter'] text-sm tracking-widest uppercase text-[#dde2f3]/50" >© 2024 SENTINEL COMMAND. ALL RIGHTS RESERVED.</div>
<div className="flex flex-wrap justify-center gap-8">
<a className="font-['Inter'] text-sm tracking-widest uppercase text-[#dde2f3]/50 hover:text-[#ffb3ad] transition-colors" href="#" >Privacy Protocol</a>
<a className="font-['Inter'] text-sm tracking-widest uppercase text-[#dde2f3]/50 hover:text-[#ffb3ad] transition-colors" href="#" >Terms of Deployment</a>
<a className="font-['Inter'] text-sm tracking-widest uppercase text-[#dde2f3]/50 hover:text-[#ffb3ad] transition-colors" href="#" >System Status</a>
<a className="font-['Inter'] text-sm tracking-widest uppercase text-[#dde2f3]/50 hover:text-[#ffb3ad] transition-colors" href="#" >Global Grid</a>
</div>
</footer>

    </>
  );
}