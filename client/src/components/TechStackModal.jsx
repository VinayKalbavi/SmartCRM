import React from 'react';
import { X, Layers, Cpu, Database, Globe, CheckCircle } from 'lucide-react';

export default function TechStackModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const stack = [
    {
      category: 'Frontend',
      icon: <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#B8F55A]" />,
      items: [
        { name: 'React 18', desc: 'Modern component-based UI with hooks' },
        { name: 'Vite 5', desc: 'Ultra-fast build tooling and HMR dev server' },
        { name: 'React Router 6', desc: 'Declarative client-side routing' },
        { name: 'Tailwind CSS 3', desc: 'Dark CRM UI Kit with Lime (#B8F55A) tokens' },
        { name: 'Recharts', desc: 'Custom responsive charts matching dark theme' },
        { name: 'Lucide React', desc: 'Clean geometric icons' },
        { name: 'React Hot Toast', desc: 'Dark theme toast notifications' },
        { name: 'Axios & Date-fns', desc: 'HTTP client and date manipulation' },
      ],
    },
    {
      category: 'Backend',
      icon: <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />,
      items: [
        { name: 'Node.js 18+ & Express 4', desc: 'High-performance RESTful API' },
        { name: 'Zod & Express Validator', desc: 'Strict schema and request validation' },
        { name: 'Morgan & CORS', desc: 'HTTP request logging and cross-origin sharing' },
        { name: 'Dotenv & UUID', desc: 'Config management and unique identifiers' },
      ],
    },
    {
      category: 'Database & Repository',
      icon: <Database className="w-4 h-4 sm:w-5 sm:h-5 text-[#B8F55A]" />,
      items: [
        { name: 'MongoDB Atlas', desc: 'Cloud Mongoose 8 database (Connected & verified)' },
        { name: 'JSON-File Store (db.json)', desc: 'Zero-config default fallback persistence' },
        { name: 'Unified Repository Pattern', desc: 'Decoupled data access layer' },
      ],
    },
    {
      category: 'WooCommerce Integration',
      icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />,
      items: [
        { name: 'WooCommerce REST API v3', desc: 'Direct /wp-json/wc/v3 paged endpoint integration' },
        { name: 'Dual Adapter Layer', desc: 'Identical interface for Live WooCommerce & Mock' },
        { name: 'Guest Order Linking', desc: 'Matches guest checkouts via billing email' },
        { name: 'In-Memory Smart Cache', desc: '60-second TTL with manual POST /api/sync' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl card-sheen rounded-[28px] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2.5 rounded-full lime-btn-glow text-black shrink-0">
              <Layers className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="truncate">
              <h2 className="text-lg font-light tracking-tight text-white uppercase truncate">SmartCRM Architecture</h2>
              <p className="text-xs text-[#8A8A8A] truncate">Tech Stack Specification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8A8A] hover:text-white rounded-full pill-dark-sheen transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="p-4 rounded-2xl pill-dark-sheen text-xs text-[#A0A0A0] leading-relaxed">
            <span className="font-bold text-white">Decoupled Repository:</span> Built to seamlessly bridge WooCommerce store checkouts and customer records with zero-dependency local JSON stores and live MongoDB Atlas clusters.
          </div>

          <div className="space-y-6">
            {stack.map((sec, i) => (
              <div key={i} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wide uppercase">
                  {sec.icon}
                  <span>{sec.category}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sec.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl pill-dark-sheen flex items-start gap-2.5"
                    >
                      <CheckCircle className="w-4 h-4 text-[#B8F55A] mt-0.5 shrink-0 shadow-[0_0_8px_rgba(184,245,90,0.5)]" />
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white truncate">{it.name}</div>
                        <div className="text-[11px] text-[#8A8A8A] leading-tight mt-0.5">{it.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#141519] border-t border-white/[0.06] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full lime-btn-glow font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
