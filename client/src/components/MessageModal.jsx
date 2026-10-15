import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MessageModal({ isOpen, onClose, templates, customerPhone }) {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  if (!isOpen || !templates) return null;

  const copyToClipboard = (text, type = 'body') => {
    navigator.clipboard.writeText(text);
    if (type === 'subject') {
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
      toast.success('Subject copied!');
    } else {
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
      toast.success(`${activeTab === 'whatsapp' ? 'WhatsApp message' : 'Email body'} copied!`);
    }
  };

  const cleanPhone = customerPhone ? customerPhone.replace(/[^0-9]/g, '') : '';
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(templates.whatsapp.body)}`
    : `https://wa.me/?text=${encodeURIComponent(templates.whatsapp.body)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl card-sheen rounded-[28px] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 truncate">
            <div className="p-2.5 rounded-full lime-btn-glow text-black shrink-0">
              <MessageSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="truncate">
              <h2 className="text-base sm:text-lg font-light tracking-tight text-white uppercase truncate">Smart Templates</h2>
              <p className="text-xs text-[#8A8A8A] truncate">
                For {templates.customerName} ({templates.orderId})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8A8A] hover:text-white rounded-full pill-dark-sheen transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pill Tab Switcher */}
        <div className="flex border-b border-white/[0.06] bg-[#141519] px-6 py-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 py-1.5 px-4 rounded-full text-xs font-bold transition-all ${
              activeTab === 'whatsapp'
                ? 'lime-btn-glow font-bold'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 py-1.5 px-4 rounded-full text-xs font-bold transition-all ${
              activeTab === 'email'
                ? 'lime-btn-glow font-bold'
                : 'text-[#8A8A8A] hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {activeTab === 'whatsapp' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#8A8A8A]">
                <span>Personalized WhatsApp Message:</span>
                <span className="text-[#B8F55A] font-semibold">Ready</span>
              </div>
              <div className="p-4 rounded-[20px] pill-dark-sheen text-[#EDEDED] text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans">
                {templates.whatsapp.body}
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  onClick={() => copyToClipboard(templates.whatsapp.body, 'body')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full pill-dark-sheen text-white font-semibold text-xs transition-colors"
                >
                  {copiedBody ? <Check className="w-4 h-4 text-[#B8F55A]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedBody ? 'Copied to Clipboard' : 'Copy Message'}</span>
                </button>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full lime-btn-glow font-bold text-xs transition-colors"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>Open WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#8A8A8A] block mb-1">
                  Subject Line:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={templates.email.subject}
                    className="flex-1 px-4 py-2 rounded-full input-sheen text-xs font-medium text-white"
                  />
                  <button
                    onClick={() => copyToClipboard(templates.email.subject, 'subject')}
                    className="px-4 py-2 rounded-full pill-dark-sheen text-xs font-semibold text-white transition-colors"
                  >
                    {copiedSubject ? <Check className="w-3.5 h-3.5 text-[#B8F55A]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8A8A8A] block mb-1">
                  Email Body:
                </label>
                <div className="p-4 rounded-[20px] pill-dark-sheen text-[#EDEDED] text-xs whitespace-pre-wrap leading-relaxed max-h-48 sm:max-h-56 overflow-y-auto">
                  {templates.email.body}
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => copyToClipboard(templates.email.body, 'body')}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full lime-btn-glow font-bold text-xs transition-colors"
                >
                  {copiedBody ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedBody ? 'Copied Email Body' : 'Copy Full Email Body'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
