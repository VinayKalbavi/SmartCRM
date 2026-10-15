import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck2, Info, Moon, Sun, ShoppingBag, X } from 'lucide-react';

export default function Sidebar({ darkMode, toggleDarkMode, onOpenTechStack, mobileOpen, onCloseMobile }) {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/followups', icon: CalendarCheck2, label: 'Follow-ups' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:static lg:w-64 bg-[#101115] border-r border-white/[0.06] shadow-[4px_0_24px_rgba(0,0,0,0.45)] flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 shadow-none'
        }`}
      >
        {/* Brand & Logo */}
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl lime-btn-glow flex items-center justify-center text-black font-black shrink-0">
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="font-bold text-base tracking-tight text-white leading-tight">
                  Smart<span className="text-[#B8F55A]">CRM</span>
                </div>
                <div className="text-[10px] font-semibold text-[#8A8A8A] tracking-wider uppercase">
                  WooCommerce Hub
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-full text-[#8A8A8A] hover:text-white pill-dark-sheen transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            <div className="px-3 py-2 text-[11px] font-bold text-[#666666] uppercase tracking-wider">
              Workspace
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-full font-semibold text-sm transition-all duration-200 group ${
                    isActive
                      ? 'lime-btn-glow font-bold'
                      : 'text-[#8A8A8A] hover:bg-[#1A1C22] hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-black stroke-[2.5]' : 'text-[#8A8A8A] group-hover:text-white'
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-white/[0.06] space-y-2">
          <button
            onClick={() => {
              onCloseMobile();
              onOpenTechStack();
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold pill-dark-sheen text-[#8A8A8A] hover:text-[#B8F55A] transition-colors"
          >
            <Info className="w-4 h-4 shrink-0 text-[#B8F55A]" />
            <span>Tech Stack & Info</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold text-[#8A8A8A] hover:bg-[#1E1E1E] hover:text-white transition-colors border border-transparent hover:border-[#2E2E2E]"
          >
            <Moon className="w-4 h-4 shrink-0 text-[#B8F55A]" />
            <span>Dark Kit Mode</span>
          </button>
        </div>
      </aside>
    </>
  );
}
