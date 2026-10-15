import React from 'react';

export const SegmentBadge = ({ segment }) => {
  const seg = segment || 'Active';
  
  const styles = {
    VIP: 'bg-[#B8F55A]/15 text-[#B8F55A] border-[#B8F55A]/30 shadow-[inset_0_1px_0_rgba(184,245,90,0.2)]',
    Loyal: 'bg-white/10 text-white border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
    Active: 'bg-[#22242B] text-[#EDEDED] border-[#343742] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
    New: 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-[inset_0_1px_0_rgba(56,189,248,0.2)]',
    'At-Risk': 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[inset_0_1px_0_rgba(245,158,11,0.2)]',
    Churned: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[inset_0_1px_0_rgba(244,63,94,0.2)]',
  };

  const currentStyle = styles[seg] || styles.Active;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${currentStyle} tracking-wide`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-90 shadow-sm" />
      {seg}
    </span>
  );
};

export const HealthScorePill = ({ score }) => {
  const val = Number(score) || 0;
  
  // Row of 5 indicator dots like the reference design
  const filledDots = Math.min(5, Math.max(1, Math.ceil(val / 20)));

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-bold text-white tabular-nums drop-shadow-sm">
        {val}
      </span>
      {/* 5 Glowing LED indicator dots from UI Kit */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#18191E] border border-white/5 shadow-inner">
        {[1, 2, 3, 4, 5].map((dot) => {
          let dotStyle = 'bg-[#282A33]';
          if (dot <= filledDots) {
            if (dot === 1) dotStyle = 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]';
            else if (dot === 2) dotStyle = 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.8)]';
            else if (dot === 3) dotStyle = 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]';
            else dotStyle = 'bg-[#B8F55A] shadow-[0_0_6px_rgba(184,245,90,0.9)]';
          }
          return (
            <span
              key={dot}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${dotStyle}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export const OrderStatusBadge = ({ status }) => {
  const s = (status || 'pending').toLowerCase();
  
  const map = {
    completed: 'bg-[#B8F55A]/15 text-[#B8F55A] border-[#B8F55A]/30 shadow-[inset_0_1px_0_rgba(184,245,90,0.2)]',
    processing: 'bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-[inset_0_1px_0_rgba(59,130,246,0.2)]',
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[inset_0_1px_0_rgba(245,158,11,0.2)]',
    cancelled: 'bg-[#22242B] text-[#8A8A8A] border-[#343742] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
    refunded: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[inset_0_1px_0_rgba(244,63,94,0.2)]',
  };

  const style = map[s] || map.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize tracking-wide ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current shadow-sm" />
      {s}
    </span>
  );
};
