import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authForgotPassword } from '../services/api';
import { Mail, ShoppingBag, ArrowLeft, Send, CheckCircle2, Terminal } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessInfo(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await authForgotPassword(email.trim());
      setSuccessInfo(data);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to generate reset link. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#EDEDED] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#B8F55A]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl lime-btn-glow flex items-center justify-center text-black font-black shadow-lg">
          <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="font-bold text-2xl tracking-tight text-white leading-tight">
            Smart<span className="text-[#B8F55A]">CRM</span>
          </div>
          <div className="text-[11px] font-semibold text-[#8A8A8A] tracking-wider uppercase">
            WooCommerce Customer Hub
          </div>
        </div>
      </div>

      {/* Centered Card */}
      <div className="w-full max-w-md card-sheen rounded-3xl p-7 sm:p-9 relative z-10 border border-white/10 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset password</h1>
          <p className="text-xs text-[#8A8A8A] mt-1.5">
            Enter your email to receive a 15-minute secure password reset link
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successInfo ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-200 text-xs space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reset Token Generated</span>
              </div>
              <p>
                A 15-minute reset token has been generated and printed to the server console.
              </p>
            </div>

            {successInfo.resetUrl && (
              <div className="p-3.5 rounded-2xl bg-[#14161C] border border-white/10 text-xs">
                <div className="flex items-center gap-1.5 text-[#B8F55A] font-semibold mb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Dev Shortcut:</span>
                </div>
                <a
                  href={successInfo.resetUrl}
                  className="text-xs text-white hover:text-[#B8F55A] underline break-all font-mono"
                >
                  Click here to proceed to Reset Page
                </a>
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-3 px-6 rounded-full pill-dark-sheen text-white font-semibold text-xs flex items-center justify-center gap-2 hover:border-[#B8F55A] hover:text-[#B8F55A] transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-full lime-btn-glow font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>{submitting ? 'Generating link...' : 'Send Reset Link'}</span>
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-[#8A8A8A] hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
