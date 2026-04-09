export default function Page() {
  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 bg-[#0d131f]/70 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-[0_4px_20px_rgba(229,62,62,0.05)]">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold uppercase tracking-tighter text-[#E53E3E]">
            ReliefConnect
          </span>
          <nav className="hidden md:flex gap-6 items-center h-full">
            <a
              className="text-[#ffb3ad] font-bold border-b-2 border-[#E53E3E] h-20 flex items-center px-2 font-headline tracking-tight"
              href="#"
            >
              Disasters
            </a>
            <a
              className="text-[#dde2f3] opacity-70 hover:bg-[#242a36] transition-all duration-300 px-4 py-2 rounded font-headline tracking-tight"
              href="#"
            >
              Volunteers
            </a>
            <a
              className="text-[#dde2f3] opacity-70 hover:bg-[#242a36] transition-all duration-300 px-4 py-2 rounded font-headline tracking-tight"
              href="#"
            >
              SOS Requests
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-[#93000a] text-[#ffdad6] px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:scale-95 duration-150 ease-in-out">
            <span className="material-symbols-outlined" data-icon="emergency">
              emergency
            </span>
            Emergency Mode
          </button>
          <div className="flex gap-2">
            <span className="material-symbols-outlined p-2 text-[#ffb3ad] cursor-pointer hover:bg-[#242a36] rounded-full" data-icon="notifications">
              notifications
            </span>
            <span className="material-symbols-outlined p-2 text-[#ffb3ad] cursor-pointer hover:bg-[#242a36] rounded-full" data-icon="settings">
              settings
            </span>
          </div>
          <img
            alt="Admin User Avatar"
            className="w-10 h-10 rounded-full border-2 border-primary/20"
            data-alt="close-up of professional admin user avatar in a modern minimalist style with sharp focus and clean lines"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtxJVJremuuHYcDJGyrCBDllhMd001p0tBkkZpMOnKAlX4jlRrwYD1n-J24eQT5X5inq_fy8bUhHJM98OTiWOOgtOn2NC0T4bRJKH2hMLuJOm8kW0haMEp_-9Uh3fM7Asim9bd6XXpmQspVGZSMgEWb6pJvuYQ9llWHFRFzJoixq5Y-TEvUMSOkpJ6WMOW9Ex1WTeaxHzhgpnqaJcedKjJ1TssfTS26LEM0-GlWSCJy9iK7r8nzrE_p-HJqENSusTdoqHK9AzDwQ"
          />
        </div>
      </header>

      <div className="flex pt-20">
        {/* SideNavBar */}
        <aside className="fixed left-0 h-full w-64 bg-[#0d131f] flex flex-col py-6 space-y-2 border-r border-[#ffb3ad]/10 z-30">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#E53E3E] text-3xl" data-icon="shield">
                shield
              </span>
              <div>
                <h2 className="text-xl font-black text-[#E53E3E] leading-none">
                  SENTINEL
                </h2>
                <p className="font-headline uppercase text-[10px] tracking-[0.2em] text-[#ffb3ad] opacity-70">
                  COMMAND CENTER
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            <a
              className="flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-[#ffb3ad]/10 to-transparent text-[#ffb3ad] border-l-4 border-[#E53E3E] font-headline uppercase text-xs tracking-widest transition-transform duration-200 hover:translate-x-1"
              href="#"
            >
              <span className="material-symbols-outlined" data-icon="warning">
                warning
              </span>{" "}
              Disasters
            </a>
            <a
              className="flex items-center gap-4 px-6 py-3 text-[#dde2f3] opacity-50 hover:opacity-100 hover:bg-[#1a202c] font-headline uppercase text-xs tracking-widest transition-transform duration-200 hover:translate-x-1"
              href="#"
            >
              <span className="material-symbols-outlined" data-icon="group">
                group
              </span>{" "}
              Volunteers
            </a>
            <a
              className="flex items-center gap-4 px-6 py-3 text-[#dde2f3] opacity-50 hover:opacity-100 hover:bg-[#1a202c] font-headline uppercase text-xs tracking-widest transition-transform duration-200 hover:translate-x-1"
              href="#"
            >
              <span className="material-symbols-outlined" data-icon="emergency">
                emergency
              </span>{" "}
              SOS Requests
            </a>
            <a
              className="flex items-center gap-4 px-6 py-3 text-[#dde2f3] opacity-50 hover:opacity-100 hover:bg-[#1a202c] font-headline uppercase text-xs tracking-widest transition-transform duration-200 hover:translate-x-1"
              href="#"
            >
              <span className="material-symbols-outlined" data-icon="inventory_2">
                inventory_2
              </span>{" "}
              Resources
            </a>
            <a
              className="flex items-center gap-4 px-6 py-3 text-[#dde2f3] opacity-50 hover:opacity-100 hover:bg-[#1a202c] font-headline uppercase text-xs tracking-widest transition-transform duration-200 hover:translate-x-1"
              href="#"
            >
              <span className="material-symbols-outlined" data-icon="assignment">
                assignment
              </span>{" "}
              Tasks
            </a>
            <a
              className="flex items-center gap-4 px-6 py-3 text-[#dde2f3] opacity-50 hover:opacity-100 hover:bg-[#1a202c] font-headline uppercase text-xs tracking-widest transition-transform duration-200 hover:translate-x-1"
              href="#"
            >
              <span className="material-symbols-outlined" data-icon="verified">
                verified
              </span>{" "}
              Certificates
            </a>
          </nav>

          <div className="px-6 py-4 mt-auto">
            <button className="w-full bg-gradient-to-r from-[#ffb3ad] to-[#ff5450] text-on-primary-container font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" data-icon="add">
                add
              </span>{" "}
              New Dispatch
            </button>
          </div>

          <div className="border-t border-[#ffb3ad]/10 pt-4 pb-6 px-6 space-y-3">
            <a
              className="flex items-center gap-4 text-[#dde2f3] opacity-50 hover:opacity-100 font-headline uppercase text-[10px] tracking-widest"
              href="#"
            >
              <span className="material-symbols-outlined text-sm" data-icon="help">
                help
              </span>{" "}
              Support
            </a>
            <a
              className="flex items-center gap-4 text-[#dde2f3] opacity-50 hover:opacity-100 font-headline uppercase text-[10px] tracking-widest"
              href="#"
            >
              <span className="material-symbols-outlined text-sm" data-icon="history">
                history
              </span>{" "}
              Archive
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 w-full p-8 min-h-screen">
          <header className="mb-8">
            <h1 className="text-4xl font-black tracking-tight text-on-surface mb-6 uppercase">
              Manage Disasters
            </h1>

            {/* Controls Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-surface-container-low p-4 rounded-xl items-center border border-outline-variant/10">
              <div className="md:col-span-4 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">
                  search
                </span>
                <input
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg pl-10 py-3 text-sm"
                  placeholder="Search disasters by ID, name or location..."
                  type="text"
                />
              </div>
              <div className="md:col-span-2">
                <select className="w-full bg-surface-container-lowest border-none border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-3 text-sm">
                  <option>Type: All</option>
                  <option>Flood</option>
                  <option>Wildfire</option>
                  <option>Earthquake</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <select className="w-full bg-surface-container-lowest border-none border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-3 text-sm">
                  <option>Status: All</option>
                  <option>Active</option>
                  <option>Under Control</option>
                  <option>Resolved</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <select className="w-full bg-surface-container-lowest border-none border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-3 text-sm">
                  <option>Severity: All</option>
                  <option>Critical</option>
                  <option>High</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button className="w-full h-full bg-surface-container-high hover:bg-surface-container-highest transition-colors font-bold rounded-lg border border-outline/10 text-primary py-3 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined" data-icon="filter_alt">
                    filter_alt
                  </span>{" "}
                  Clear Filters
                </button>
              </div>
            </div>
          </header>

          {/* Table Container */}
          <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/10 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container text-outline uppercase text-[10px] font-black tracking-widest border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4">#ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-center">Severity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reported By</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                <tr className="hover:bg-surface-container-high transition-colors group">
                  <td className="px-6 py-4 font-mono text-primary text-xs">
                    DIS-8821
                  </td>
                  <td className="px-6 py-4 font-bold text-on-surface">
                    Flash Flood - Sector G
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-tertiary/10 text-tertiary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                      Flood
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs opacity-70">
                    Jakarta, Indonesia
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-[inset_0_0_8px_rgba(255,0,0,0.2)] border border-error/20">
                      Critical
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                      <span className="text-xs font-medium">Active Dispatch</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">Admin Alpha</td>
                  <td className="px-6 py-4 text-xs opacity-70">2023-10-24</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-primary/20 text-primary rounded-lg transition-all" title="View Detail">
                        <span className="material-symbols-outlined" data-icon="visibility">
                          visibility
                        </span>
                      </button>
                      <button className="p-2 hover:bg-secondary/20 text-secondary rounded-lg transition-all" title="Edit">
                        <span className="material-symbols-outlined" data-icon="edit">
                          edit
                        </span>
                      </button>
                      <button className="p-2 hover:bg-error/20 text-error rounded-lg transition-all" title="Delete">
                        <span className="material-symbols-outlined" data-icon="delete">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-high transition-colors group">
                  <td className="px-6 py-4 font-mono text-primary text-xs">
                    DIS-7402
                  </td>
                  <td className="px-6 py-4 font-bold text-on-surface">
                    Wildfire Threaten Zone 4
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-secondary/10 text-secondary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                      Wildfire
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs opacity-70">
                    California, USA
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-[#b15b00]/30 text-[#ffdcc5] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#b15b00]">
                      High
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="text-xs font-medium">Monitoring</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">Drone-04</td>
                  <td className="px-6 py-4 text-xs opacity-70">2023-10-23</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-primary/20 text-primary rounded-lg transition-all">
                        <span className="material-symbols-outlined" data-icon="visibility">
                          visibility
                        </span>
                      </button>
                      <button className="p-2 hover:bg-secondary/20 text-secondary rounded-lg transition-all">
                        <span className="material-symbols-outlined" data-icon="edit">
                          edit
                        </span>
                      </button>
                      <button className="p-2 hover:bg-error/20 text-error rounded-lg transition-all">
                        <span className="material-symbols-outlined" data-icon="delete">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-high transition-colors group">
                  <td className="px-6 py-4 font-mono text-primary text-xs">
                    DIS-6119
                  </td>
                  <td className="px-6 py-4 font-bold text-on-surface">
                    Structural Collapse
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-outline/10 text-outline px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                      Accident
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs opacity-70">
                    Mexico City, MX
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-[#242a36] text-[#dde2f3] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-outline/30">
                      Medium
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-xs font-medium">Contained</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">Local Auth</td>
                  <td className="px-6 py-4 text-xs opacity-70">2023-10-22</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-primary/20 text-primary rounded-lg transition-all">
                        <span className="material-symbols-outlined" data-icon="visibility">
                          visibility
                        </span>
                      </button>
                      <button className="p-2 hover:bg-secondary/20 text-secondary rounded-lg transition-all">
                        <span className="material-symbols-outlined" data-icon="edit">
                          edit
                        </span>
                      </button>
                      <button className="p-2 hover:bg-error/20 text-error rounded-lg transition-all">
                        <span className="material-symbols-outlined" data-icon="delete">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="mt-6 flex justify-between items-center text-xs opacity-60 px-2">
            <span>Showing 3 of 128 Mission Items</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-surface-container rounded hover:bg-surface-container-high">
                Previous
              </button>
              <button className="px-3 py-1 bg-primary text-on-primary-container font-bold rounded">
                1
              </button>
              <button className="px-3 py-1 bg-surface-container rounded hover:bg-surface-container-high">
                2
              </button>
              <button className="px-3 py-1 bg-surface-container rounded hover:bg-surface-container-high">
                3
              </button>
              <button className="px-3 py-1 bg-surface-container rounded hover:bg-surface-container-high">
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

