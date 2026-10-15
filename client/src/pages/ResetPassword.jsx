import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authResetPassword } from '../services/api';
import { Eye, EyeOff, Lock, Key, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!token.trim()) {
      setErrorMessage('A valid reset token is required.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await authResetPassword({
        token: token.trim(),
        newPassword,
        confirmNewPassword,
      });
      setSuccessMessage(data.message || 'Password reset successfully! You can now log in.');
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Password reset failed. The token may be expired or invalid.');
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Set new password</h1>
          <p className="text-xs text-[#8A8A8A] mt-1.5">
            Enter your reset token and your new password
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
        {successMessage ? (
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-200 text-xs space-y-2 leading-relaxed">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-semibold text-emerald-300">{successMessage}</p>
            </div>
            <Link
              to="/login"
              className="w-full py-3.5 px-6 rounded-full lime-btn-glow font-bold text-sm flex items-center justify-center gap-2"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reset token input */}
            <div>
              <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
                Reset Token
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token from console / email"
                  className="w-full pl-11 pr-4 py-3 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all font-mono text-xs"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-11 pr-11 py-3 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-11 pr-11 py-3 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-full lime-btn-glow font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-60"
            >
              <span>{submitting ? 'Updating password...' : 'Reset Password'}</span>
              {!submitting && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-[#8A8A8A] hover:text-white transition-colors">
                Cancel and return to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
