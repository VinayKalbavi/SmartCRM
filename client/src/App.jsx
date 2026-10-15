import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import TechStackModal from './components/TechStackModal';

import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerProfile from './pages/CustomerProfile';
import Followups from './pages/Followups';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [techStackOpen, setTechStackOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Keep dark class consistently active for dark UI Kit
    document.documentElement.classList.add('dark');
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = () => {
    // In dark kit, stays dark or toggles state safely
    setDarkMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#EDEDED] flex transition-colors duration-200 overflow-x-hidden font-sans">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-[#1F1F1F] text-[#EDEDED] border border-[#2E2E2E] shadow-2xl rounded-2xl text-xs font-medium',
          duration: 3000,
          style: {
            background: '#1F1F1F',
            color: '#EDEDED',
            border: '1px solid #333333',
          }
        }}
      />

      {/* Sidebar with mobile drawer support */}
      <Sidebar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenTechStack={() => setTechStackOpen(true)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto bg-[#0B0B0B]">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 pb-16 w-full min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerProfile />} />
            <Route path="/followups" element={<Followups />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Tech Stack & Architecture Modal */}
      <TechStackModal
        isOpen={techStackOpen}
        onClose={() => setTechStackOpen(false)}
      />
    </div>
  );
}
