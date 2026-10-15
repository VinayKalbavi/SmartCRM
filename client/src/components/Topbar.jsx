import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, AlertTriangle, Menu, ShieldCheck, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWooStatus, syncWoo } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Topbar({ onOpenMobileMenu }) {
  const [status, setStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      const data = await getWooStatus();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching woo status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncWoo();
      toast.success(res.message || 'WooCommerce data synced!');
      await fetchStatus();
      window.dispatchEvent(new Event('smartcrm:refresh'));
    } catch (err) {
      toast.error('Sync failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/customers?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 bg-[#101115]/90 backdrop-blur-md border-b border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
      {/* Alert banner if WooCommerce connection fails */}
      {status && !status.isMock && !status.connected && (
        <div className="bg-rose-900/80 text-rose-200 border-b border-rose-800 px-4 py-2 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">
              <strong>WooCommerce Error:</strong> {status.error || 'Connection failed'}
            </span>
          </div>
          <button
            onClick={fetchStatus}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold uppercase shrink-0 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="h-16 sm:h-20 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3 sm:gap-4">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-full text-[#8A8A8A] hover:text-white pill-dark-sheen transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Pill Search Bar matching reference UI */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xs sm:max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search leads, customers, orders..."
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-full input-sheen text-xs sm:text-sm text-white placeholder-[#666666] outline-none transition-all duration-200"
            />
          </div>
        </form>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mode Pill Badge */}
          {status && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full pill-dark-sheen text-xs font-semibold ${
                status.isMock
                  ? 'text-[#EDEDED]'
                  : status.connected
                  ? 'text-[#B8F55A]'
                  : 'text-rose-300 border-rose-800'
              }`}
              title={status.isMock ? 'Mock Mode (Simulated Data)' : `Connected: ${status.storeUrl}`}
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  status.isMock
                    ? 'bg-[#B8F55A] shadow-[0_0_8px_rgba(184,245,90,0.8)]'
                    : status.connected
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                }`}
              />
              <span className="hidden md:inline truncate max-w-[180px]">
                {status.isMock
                  ? 'Mock Mode (Simulated)'
                  : status.connected
                  ? `Live: ${status.storeUrl}`
                  : 'Disconnected'}
              </span>
              <span className="md:hidden">
                {status.isMock ? 'Mock' : status.connected ? 'Live' : 'Off'}
              </span>
            </div>
          )}

          {/* Sync Pill Button */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full pill-dark-sheen text-[#EDEDED] hover:border-[#B8F55A] hover:text-[#B8F55A] text-xs font-semibold transition-all duration-200 disabled:opacity-50"
            title="Sync WooCommerce Store"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-[#B8F55A]' : ''}`} />
            <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* User profile avatar with dropdown menu */}
          <div className="relative pl-2 border-l border-white/10" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 focus:outline-none group rounded-full p-0.5"
              aria-label="User profile menu"
            >
              <div className="relative">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-[#B8F55A]/60 shadow-[0_0_12px_rgba(184,245,90,0.35)] object-cover bg-[#222]"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-[#B8F55A]/60 shadow-[0_0_12px_rgba(184,245,90,0.35)] bg-gradient-to-br from-[#292A32] to-[#18191E] flex items-center justify-center font-bold text-xs sm:text-sm text-[#B8F55A]">
                    {userInitial}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#B8F55A] rounded-full border-2 border-[#121212]" />
              </div>

              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-white leading-tight group-hover:text-[#B8F55A] transition-colors truncate max-w-[120px]">
                  {user?.name || 'My Account'}
                </div>
                <div className="text-[10px] text-[#8A8A8A] flex items-center gap-1">
                  <span>SmartCRM</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl card-sheen border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.8)] py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                {/* User info banner */}
                <div className="px-4 py-2.5 border-b border-white/10">
                  <div className="font-bold text-white text-xs truncate">{user?.name}</div>
                  <div className="text-[11px] text-[#8A8A8A] truncate">{user?.email}</div>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EDEDED] hover:bg-white/10 hover:text-[#B8F55A] transition-colors text-left"
                  >
                    <UserIcon className="w-4 h-4 text-[#B8F55A]" />
                    <span className="font-medium">Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
