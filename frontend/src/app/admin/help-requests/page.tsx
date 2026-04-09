import Link from "next/link";

export default function Page() {
  return (
    <>
      
{/* SideNavBar (Shared Component) */}
<aside className="fixed left-0 top-0 h-full w-64 z-40 bg-[#0d131f] flex flex-col py-6 border-r border-[#ffb3ad]/15 shadow-[32px_0_32px_rgba(255,179,173,0.06)]">
<div className="px-6 mb-10">
<h1 className="text-xl font-black text-[#ffb3ad] tracking-tighter font-headline">RELIEFCONNECT</h1>
<p className="text-[10px] tracking-[0.2em] font-headline font-bold text-[#ffb3ad]/60">SENTINEL COMMAND</p>
</div>
<nav className="flex-1 px-3 space-y-1">
<a className="flex items-center gap-3 px-4 py-3 font-['Space_Grotesk'] tracking-tight text-sm uppercase text-[#dde2f3]/60 hover:bg-[#1a202c] hover:text-[#dde2f3] transition-all duration-200" href="#">
<span className="material-symbols-outlined text-xl">dashboard</span> Dashboard
            </a>
<a className="flex items-center gap-3 px-4 py-3 font-['Space_Grotesk'] tracking-tight text-sm uppercase text-[#dde2f3]/60 hover:bg-[#1a202c] hover:text-[#dde2f3] transition-all duration-200" href="#">
<span className="material-symbols-outlined text-xl">warning</span> Disasters
            </a>
<a className="flex items-center gap-3 px-4 py-3 font-['Space_Grotesk'] tracking-tight text-sm uppercase text-[#dde2f3]/60 hover:bg-[#1a202c] hover:text-[#dde2f3] transition-all duration-200" href="#">
<span className="material-symbols-outlined text-xl">group</span> Volunteers
            </a>
<a className="flex items-center gap-3 px-4 py-3 font-['Space_Grotesk'] tracking-tight text-sm uppercase text-[#ffb3ad] bg-[#242a36] border-l-2 border-[#ffb3ad]" href="#">
<span className="material-symbols-outlined text-xl">support_agent</span> Help Requests
            </a>
<a className="flex items-center gap-3 px-4 py-3 font-['Space_Grotesk'] tracking-tight text-sm uppercase text-[#dde2f3]/60 hover:bg-[#1a202c] hover:text-[#dde2f3] transition-all duration-200" href="#">
<span className="material-symbols-outlined text-xl">inventory_2</span> Resources
            </a>
<a className="flex items-center gap-3 px-4 py-3 font-['Space_Grotesk'] tracking-tight text-sm uppercase text-[#dde2f3]/60 hover:bg-[#1a202c] hover:text-[#dde2f3] transition-all duration-200" href="#">
<span className="material-symbols-outlined text-xl">assignment</span> Tasks
            </a>
<a className="flex items-center gap-3 px-4 py-3 font-['Space_Grotesk'] tracking-tight text-sm uppercase text-[#dde2f3]/60 hover:bg-[#1a202c] hover:text-[#dde2f3] transition-all duration-200" href="#">
<span className="material-symbols-outlined text-xl">verified</span> Certificates
            </a>
<a className="flex items-center gap-3 px-4 py-3 font-['Space_Grotesk'] tracking-tight text-sm uppercase text-[#dde2f3]/60 hover:bg-[#1a202c] hover:text-[#dde2f3] transition-all duration-200" href="#">
<span className="material-symbols-outlined text-xl">settings</span> Settings
            </a>
</nav>
<div className="px-4 mt-auto">
<button className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-headline font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 duration-100 transition-all">
<span className="material-symbols-outlined">add_circle</span> NEW MISSION
            </button>
</div>
</aside>
{/* TopAppBar (Shared Component) */}
<header className="sticky top-0 z-30 flex justify-between items-center px-8 py-4 w-[calc(100%-16rem)] ml-64 bg-[#0d131f]/70 backdrop-blur-xl border-b border-[#ffb3ad]/15">
<div className="flex items-center gap-4 flex-1">
<div className="relative w-full max-w-md group">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
<input className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary text-sm py-2 pl-10 pr-4 rounded-lg placeholder-on-surface-variant/30" placeholder="Search mission IDs, volunteers, locations..." type="text"/>
</div>
</div>
<div className="flex items-center gap-6">
<div className="flex gap-2">
<button className="p-2 text-on-background hover:bg-[#242a36] rounded-lg transition-colors relative">
<span className="material-symbols-outlined">notifications</span>
<span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button className="p-2 text-on-background hover:bg-[#242a36] rounded-lg transition-colors">
<span className="material-symbols-outlined">admin_panel_settings</span>
</button>
</div>
<div className="flex items-center gap-3 pl-4 border-l border-[#ffb3ad]/10">
<div className="text-right">
<p className="text-sm font-bold font-headline text-on-surface uppercase tracking-tighter">Command_Admin</p>
<p className="text-[10px] text-primary font-bold uppercase tracking-widest">Level 5 Clearance</p>
</div>
<img alt="Administrator" className="w-10 h-10 rounded-full border-2 border-primary/20" data-alt="professional male administrator portrait in studio lighting with deep shadows and dark corporate attire" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiaKFrJuiEVHY6B75MPt3DndF4h4xeWF9Y8EUseZzarrSwrYVMPdNS9AJja6-IVz9Kv2reRQFjk-qG9eLrIwihXaMIOU4njzxkKaOECXRr4FWV77AFtRRwwFCHVrwXBnRfNXn5ff7ql_s-iFr_IDXZwgK28rPUwXABSTkhr5FkNwVLZ9xH2QuRJimJghEgF-GIRJJKWjvd_CFvBx4iZQQ0LT0HBvw_dLGfmjnZgGrEYr6IaLm8oLZbHD7R0td1Oq3BttbG98CR2g"/>
</div>
</div>
</header>
{/* Main Content Canvas */}
<main className="ml-64 p-8 w-[calc(100%-16rem)] min-h-screen">
{/* Dashboard Header & Controls */}
<div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
<div>
<h2 className="text-5xl font-black font-headline tracking-tighter text-on-background mb-2">HELP REQUESTS</h2>
<div className="flex gap-4 items-center">
<span className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant/30 text-xs font-bold tracking-widest uppercase">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        LIVE DISPATCH FEED
                    </span>
<span className="text-on-surface-variant/60 text-sm">34 Active incidents across 4 sectors</span>
</div>
</div>
<div className="flex flex-col gap-4 items-end">
<div className="bg-surface-container-low p-1 rounded-xl flex gap-1">
<button className="px-6 py-2 bg-surface-container-highest text-primary text-sm font-bold rounded-lg shadow-inner">All</button>
<button className="px-6 py-2 hover:bg-surface-container-high text-on-surface-variant/60 text-sm font-bold rounded-lg transition-all">Pending</button>
<button className="px-6 py-2 hover:bg-surface-container-high text-on-surface-variant/60 text-sm font-bold rounded-lg transition-all">Assigned</button>
<button className="px-6 py-2 hover:bg-surface-container-high text-on-surface-variant/60 text-sm font-bold rounded-lg transition-all">Resolved</button>
</div>
<div className="flex gap-3">
<select className="bg-surface-container border-none text-xs font-bold uppercase tracking-widest text-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-4 pr-10">
<option>SORT BY: PRIORITY</option>
<option>SORT BY: TIME</option>
<option>SORT BY: DISTANCE</option>
</select>
<button className="bg-surface-container-high p-2 rounded-lg text-on-surface hover:text-primary transition-colors">
<span className="material-symbols-outlined">filter_list</span>
</button>
</div>
</div>
</div>
{/* Kanban Board */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
{/* Column: Pending */}
<div className="flex flex-col gap-4">
<div className="flex items-center justify-between px-2 mb-2">
<div className="flex items-center gap-3">
<div className="w-2 h-6 bg-error"></div>
<h3 className="font-headline font-bold uppercase tracking-tighter text-xl">PENDING</h3>
</div>
<span className="bg-error/10 text-error text-[10px] font-black px-2 py-0.5 rounded-full border border-error/20">08</span>
</div>
<div className="space-y-4">
{/* Card 1 */}
<div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-error hover:translate-y-[-4px] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] group">
<div className="flex justify-between items-start mb-4">
<span className="bg-error/20 text-error text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">CRITICAL</span>
<span className="text-[10px] text-on-surface-variant/40 font-mono">#RQ-4092</span>
</div>
<h4 className="text-lg font-bold font-headline mb-1 group-hover:text-primary transition-colors">Elena Rodriguez</h4>
<div className="flex items-center gap-1 text-on-surface-variant/60 text-xs mb-3">
<span className="material-symbols-outlined text-sm">location_on</span> Sector 7G - High Ground
                        </div>
<p className="text-sm text-on-surface/80 leading-relaxed mb-6 line-clamp-3">Requesting immediate medical supplies and clean water for elderly residents. Road access blocked by debris.</p>
<button className="w-full py-2.5 bg-error text-on-error font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-colors">
<span className="material-symbols-outlined text-sm">person_add</span> Assign Volunteer
                        </button>
</div>
{/* Card 2 */}
<div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-error hover:translate-y-[-4px] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] group">
<div className="flex justify-between items-start mb-4">
<span className="bg-error/20 text-error text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">CRITICAL</span>
<span className="text-[10px] text-on-surface-variant/40 font-mono">#RQ-4101</span>
</div>
<h4 className="text-lg font-bold font-headline mb-1 group-hover:text-primary transition-colors">Marcus Thorne</h4>
<div className="flex items-center gap-1 text-on-surface-variant/60 text-xs mb-3">
<span className="material-symbols-outlined text-sm">location_on</span> Industrial Zone A
                        </div>
<p className="text-sm text-on-surface/80 leading-relaxed mb-6 line-clamp-3">Structural damage reported. Two people trapped in sub-level basement. Rapid response required.</p>
<button className="w-full py-2.5 bg-error text-on-error font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-colors">
<span className="material-symbols-outlined text-sm">person_add</span> Assign Volunteer
                        </button>
</div>
</div>
</div>
{/* Column: Assigned */}
<div className="flex flex-col gap-4">
<div className="flex items-center justify-between px-2 mb-2">
<div className="flex items-center gap-3">
<div className="w-2 h-6 bg-secondary"></div>
<h3 className="font-headline font-bold uppercase tracking-tighter text-xl">ASSIGNED</h3>
</div>
<span className="bg-secondary/10 text-secondary text-[10px] font-black px-2 py-0.5 rounded-full border border-secondary/20">12</span>
</div>
<div className="space-y-4">
<div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-secondary hover:translate-y-[-4px] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] group">
<div className="flex justify-between items-start mb-4">
<span className="bg-secondary/20 text-secondary text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">MODERATE</span>
<span className="text-[10px] text-on-surface-variant/40 font-mono">#RQ-3982</span>
</div>
<h4 className="text-lg font-bold font-headline mb-1">Sarah Jenkins</h4>
<div className="flex items-center gap-1 text-on-surface-variant/60 text-xs mb-4">
<span className="material-symbols-outlined text-sm">location_on</span> Riverside Shelter
                        </div>
<div className="bg-surface-container p-3 rounded-lg flex items-center gap-3">
<img alt="Volunteer" className="w-8 h-8 rounded-full" data-alt="volunteer male face close up with professional expression and neutral background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2AbWGyJ7aKtjkLptC8h5y-NKDPxKxoNZzpxTefV3_khr2h9CFWxszbb6ohbyu4ZX5RNwBREYS0KAMs0TIWkXLtJKCHRu14phAe7Ik_l7-psRMopZV_anXZTBrpse5tyk8u0ro9seoXVGvlRVnYEO_QorCG873hdbZvOSKYSXCTssdDJqABRu7jfYN-ewEPEaF2Up029ngry_6HJ0CyYf5xgJP54jK-W_FRGKzM_SzU9KHOFzUODj1kGZw4UYg_OVbBVHHTuN5cQ"/>
<div>
<p className="text-[10px] text-primary uppercase font-bold tracking-widest">ASSIGNED TO</p>
<p className="text-xs font-bold text-on-surface">Alex Chen</p>
</div>
</div>
</div>
</div>
</div>
{/* Column: In Progress */}
<div className="flex flex-col gap-4">
<div className="flex items-center justify-between px-2 mb-2">
<div className="flex items-center gap-3">
<div className="w-2 h-6 bg-blue-500"></div>
<h3 className="font-headline font-bold uppercase tracking-tighter text-xl">IN PROGRESS</h3>
</div>
<span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-500/20">05</span>
</div>
<div className="space-y-4">
<div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-blue-500 hover:translate-y-[-4px] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] group">
<div className="flex justify-between items-start mb-4">
<span className="bg-blue-500/20 text-blue-500 text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">HIGH</span>
<span className="text-[10px] text-on-surface-variant/40 font-mono">#RQ-3811</span>
</div>
<h4 className="text-lg font-bold font-headline mb-1">Davis Family (4)</h4>
<div className="flex items-center gap-1 text-on-surface-variant/60 text-xs mb-4">
<span className="material-symbols-outlined text-sm">location_on</span> Hillside Apartments
                        </div>
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-blue-500 text-sm" style={{"fontVariationSettings":"'FILL' 1"}}>pulse_alert</span>
<span className="text-xs text-blue-500 font-bold uppercase tracking-widest">EN ROUTE</span>
</div>
<span className="text-[10px] text-on-surface-variant/60">ETA: 12 MIN</span>
</div>
<div className="bg-surface-container p-3 rounded-lg flex items-center gap-3">
<img alt="Volunteer" className="w-8 h-8 rounded-full" data-alt="volunteer female face portrait with determined look against soft focused natural background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBghQSJikSt9-qa3ZcmKuYfAO4_SeTkJy2ybEv9jsRt0VXrKtYUxZ6JBHyE5ddTsfdEhABMEvzqkE2BE1-IoXxxQGJfo4-LoKevytOrei0aC04gWPqKx2Dc2AUFJzt-jtQ2nN5SX5iURzhGU99p8Lsiqej2-rzA6Ijdf1NoYxAQkbgBNG2Wdz0R0bpWVtfo58kbhUFeVBdY2ku9upz_vD3gjV6dnwNHv-eXHqAe5-IdL49n4-dU-tDVuhJfgkAaXTZReHaqgjYZCA"/>
<div>
<p className="text-[10px] text-primary uppercase font-bold tracking-widest">ASSIGNED TO</p>
<p className="text-xs font-bold text-on-surface">Maya Kaur</p>
</div>
</div>
</div>
</div>
</div>
{/* Column: Resolved */}
<div className="flex flex-col gap-4">
<div className="flex items-center justify-between px-2 mb-2">
<div className="flex items-center gap-3">
<div className="w-2 h-6 bg-emerald-500"></div>
<h3 className="font-headline font-bold uppercase tracking-tighter text-xl">RESOLVED</h3>
</div>
<span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">114</span>
</div>
<div className="space-y-4 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300">
<div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-emerald-500 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
<div className="flex justify-between items-start mb-4">
<span className="bg-emerald-500/20 text-emerald-500 text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">COMPLETE</span>
<span className="text-[10px] text-on-surface-variant/40 font-mono">#RQ-3745</span>
</div>
<h4 className="text-lg font-bold font-headline mb-1">Urban General</h4>
<div className="flex items-center gap-1 text-on-surface-variant/60 text-xs mb-4">
<span className="material-symbols-outlined text-sm">location_on</span> Medical Plaza
                        </div>
<div className="text-[10px] text-emerald-500 font-bold uppercase flex items-center gap-1">
<span className="material-symbols-outlined text-sm">check_circle</span> SUCCESS: MEDS DELIVERED
                        </div>
</div>
</div>
</div>
</div>
</main>
{/* Assign Volunteer Modal Overlay */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
<div className="w-full max-w-4xl bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[921px]">
{/* Modal Header */}
<div className="px-8 py-6 bg-surface-container-high border-b border-outline-variant/20 flex justify-between items-center">
<div>
<p className="text-[10px] text-primary font-bold tracking-[0.3em] uppercase mb-1">MISSION ALLOCATION SYSTEM</p>
<h3 className="text-2xl font-black font-headline tracking-tighter">ASSIGN VOLUNTEER: RQ-4092</h3>
</div>
<button className="p-2 hover:bg-surface-variant rounded-full transition-colors">
<span className="material-symbols-outlined">close</span>
</button>
</div>
<div className="flex flex-1 overflow-hidden">
{/* Left Side: Request Details */}
<div className="w-1/3 p-8 border-r border-outline-variant/20 bg-surface-container-lowest/50 overflow-y-auto">
<h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4">REQUEST PROFILE</h4>
<div className="mb-8">
<p className="text-sm font-bold text-on-surface mb-1">CIVILIAN</p>
<p className="text-lg text-primary font-headline font-bold">Elena Rodriguez</p>
</div>
<div className="mb-8">
<p className="text-sm font-bold text-on-surface mb-1">LOCATION</p>
<div className="rounded-lg overflow-hidden h-32 mb-2">
<img alt="Location Map" className="w-full h-full object-cover" data-alt="satellite view map of urban residential district with detailed street layout and building clusters" data-location="City Map View" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE9hvCfxlZGCVKZQ1-wuv9eW3RguxnJsLTe0znZA9LO0lbgpgVPFb9HjUpkb1_Xa0Odx-4EswQy7q26Kqy6_2FWYueUrF9QYJ1TRsA78yrplnGNbjPttLQcNBkv_CCjgncZfQPHTiWPr6_iDgFOpzIXf-CMOuGnDGm0js48Dl-i4gaEdcqxv0kkX470phR-xQbXdyM1tZUIJG881VHHAhjBwm50n2poWHrlh-2JZmISY3KsHD9qEDJTxOdDQcAuW2U15jUPHj4uQ"/>
</div>
<p className="text-xs text-on-surface-variant/80">Sector 7G - High Ground Area</p>
</div>
<div>
<p className="text-sm font-bold text-on-surface mb-1">PRIORITY INTEL</p>
<div className="p-3 bg-error/10 border border-error/20 rounded-lg">
<p className="text-xs text-on-error-container leading-relaxed italic">Elderly residents trapped. Water supply contaminated. Road blocked at the intersection of 5th and Main.</p>
</div>
</div>
</div>
{/* Right Side: Volunteer Search & Selection */}
<div className="flex-1 p-8 overflow-y-auto flex flex-col">
<div className="flex justify-between items-center mb-6">
<h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">AVAILABLE ASSETS</h4>
<span className="text-xs font-bold text-emerald-500">14 PERSONNEL ONLINE</span>
</div>
{/* Search Bar */}
<div className="relative mb-6">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">search</span>
<input className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary text-sm py-3 pl-10 pr-4 rounded-xl placeholder-on-surface-variant/30" placeholder="Filter by skills (Medical, Logistics, Rescue)..." type="text"/>
</div>
{/* Volunteer Cards Grid */}
<div className="grid grid-cols-2 gap-4">
{/* Volunteer Item 1 */}
<div className="p-4 bg-surface-container border border-outline-variant/10 rounded-xl hover:border-primary/50 transition-all cursor-pointer group">
<div className="flex items-center gap-3 mb-3">
<div className="relative">
<img alt="Asset" className="w-10 h-10 rounded-lg object-cover" data-alt="focused female volunteer face looking directly at camera with professional outdoor lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIktzzSHFkyBlyN5UNciToch1d3a5sElR7bVJEbYTzl1yBcMjm2Oc9W_JJ62djxozegvBEEtmkm3qrdKv_BG9SuFSmRt5e72Zr-dlTEZAVhnz5rOCmi3UDT9aEAPgMc2wBl11vykfkjQD9SMozTC3wPYENjQs-hJwZjz9bAKSZx5R5rh9OtDNP37b-nqGQpDfThs1J4Spmf1s_2cO0f8CuAcbHBMaUVQRqiJ50X5xoAeCf0Rkp110EI3t_xszcrLe0_K2b2GtIkw"/>
<span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-surface-container rounded-full"></span>
</div>
<div>
<p className="text-sm font-bold group-hover:text-primary transition-colors">Sarah Williams</p>
<p className="text-[10px] text-on-surface-variant/60 tracking-tighter">0.8km away • Active</p>
</div>
</div>
<div className="flex flex-wrap gap-1 mb-4">
<span className="text-[9px] font-bold uppercase tracking-tighter bg-surface-container-highest px-1.5 py-0.5 rounded text-primary">Medical</span>
<span className="text-[9px] font-bold uppercase tracking-tighter bg-surface-container-highest px-1.5 py-0.5 rounded text-on-surface-variant">Logistics</span>
</div>
<button className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">SELECT ASSET</button>
</div>
{/* Volunteer Item 2 */}
<div className="p-4 bg-surface-container border border-outline-variant/10 rounded-xl hover:border-primary/50 transition-all cursor-pointer group">
<div className="flex items-center gap-3 mb-3">
<div className="relative">
<img alt="Asset" className="w-10 h-10 rounded-lg object-cover" data-alt="mature male volunteer with experience showing in expression dark lighting style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWIWpaC1bTaF2k2yFB7bn7ZMrUrGRrptTbgNMryMOJThqU6UVQnGFIVN5BC3wvxz7-NrPeG6ujPE0tQnwq_umKuaD-bt1WjaFLBO1mAv_X9ftEWXtu7zN1z4YRxFgCs_dR7a-ai7ilgXMPhHMiaew41pHiifuGiMUIsM-yTUBJFe8sqi6yVQ9ufBtaiC5_CKOuvdkOJMKUFOc0Fb1cYYfcFbROoeLzdksoJ-8C_70nBre_BDvAhx9aGdx1TipX7WBO4r1V5o7ckw"/>
<span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-surface-container rounded-full"></span>
</div>
<div>
<p className="text-sm font-bold group-hover:text-primary transition-colors">David Miller</p>
<p className="text-[10px] text-on-surface-variant/60 tracking-tighter">1.2km away • Active</p>
</div>
</div>
<div className="flex flex-wrap gap-1 mb-4">
<span className="text-[9px] font-bold uppercase tracking-tighter bg-surface-container-highest px-1.5 py-0.5 rounded text-primary">Rescue</span>
<span className="text-[9px] font-bold uppercase tracking-tighter bg-surface-container-highest px-1.5 py-0.5 rounded text-primary">EMS</span>
</div>
<button className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">SELECT ASSET</button>
</div>
{/* Volunteer Item 3 */}
<div className="p-4 bg-surface-container border border-outline-variant/10 rounded-xl hover:border-primary/50 transition-all cursor-pointer group">
<div className="flex items-center gap-3 mb-3">
<div className="relative">
<img alt="Asset" className="w-10 h-10 rounded-lg object-cover" data-alt="confident female personnel portrait in uniform with dramatic tactical lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1BeIjr-Tb1vz5H-xPYFX436O1GO0sbh7Ketk9oybHgWVPAwHgPesOIORwMV3HUMrDc73V3eZz11-Gl4h5HXKCnyI6vnql2K9eZc9IxnyAFGHjgpMlqqtDXpQZJaKLvSwiEnCX9h7vMDq3eoYnAcjfk_lVo-avV4un_EllCUgSqERbKChmXmzBkmn63lS-nCHmr_VMX43j7ncxWG_guPcFbVNDn413DVcusFDMqKb2d1z2FHkHqcXS0bzLoHzQZtp-SoAosT_-eQ"/>
<span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-surface-container rounded-full"></span>
</div>
<div>
<p className="text-sm font-bold group-hover:text-primary transition-colors">Tanya Roberts</p>
<p className="text-[10px] text-on-surface-variant/60 tracking-tighter">2.5km away • Active</p>
</div>
</div>
<div className="flex flex-wrap gap-1 mb-4">
<span className="text-[9px] font-bold uppercase tracking-tighter bg-surface-container-highest px-1.5 py-0.5 rounded text-on-surface-variant">Spanish</span>
<span className="text-[9px] font-bold uppercase tracking-tighter bg-surface-container-highest px-1.5 py-0.5 rounded text-primary">Medical</span>
</div>
<button className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">SELECT ASSET</button>
</div>
{/* Volunteer Item 4 */}
<div className="p-4 bg-surface-container border border-outline-variant/10 rounded-xl hover:border-primary/50 transition-all cursor-pointer group">
<div className="flex items-center gap-3 mb-3">
<div className="relative">
<img alt="Asset" className="w-10 h-10 rounded-lg object-cover" data-alt="male volunteer portrait with equipment vest in low light environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtNq_5Pdbreo72-P8GzKBrV81cjXLj4CSu6GFWQqW_OV7W_p6iJ3opi2Y2tzZ_2nUdYiB6ssRSkV5It2fPTNCmmFU-ni_6VkMGumeWzRnZGPVegwo7c3C8u_baym3ktzuRv_ShTFfJvWvFETaQ6Gz-Ick_1jxwqUxVjw8iSYpTDyMn3rjhx9gsyecNzw5aKvu7HBXC8m2c4WRHPcrcVkFcblhQ7m1Jc89pVl9Obvp2JiXAShkdUUeq7vTg0yW-8WTJRQjDtJGG-A"/>
<span className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary border-2 border-surface-container rounded-full"></span>
</div>
<div>
<p className="text-sm font-bold group-hover:text-primary transition-colors">Jordan Lee</p>
<p className="text-[10px] text-on-surface-variant/60 tracking-tighter">0.5km away • Busy</p>
</div>
</div>
<div className="flex flex-wrap gap-1 mb-4">
<span className="text-[9px] font-bold uppercase tracking-tighter bg-surface-container-highest px-1.5 py-0.5 rounded text-primary">Supplies</span>
<span className="text-[9px] font-bold uppercase tracking-tighter bg-surface-container-highest px-1.5 py-0.5 rounded text-on-surface-variant">Driver</span>
</div>
<button className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all">SELECT ASSET</button>
</div>
</div>
</div>
</div>
{/* Modal Footer */}
<div className="px-8 py-4 bg-surface-container-lowest border-t border-outline-variant/20 flex justify-end gap-4">
<button className="px-6 py-2 text-on-surface-variant/60 font-bold uppercase tracking-widest text-xs hover:text-on-surface transition-colors">Cancel Dispatch</button>
<button className="px-8 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest text-xs rounded-lg shadow-lg active:scale-95 transition-all">CONFIRM ASSIGNMENT</button>
</div>
</div>
</div>

    </>
  );
}