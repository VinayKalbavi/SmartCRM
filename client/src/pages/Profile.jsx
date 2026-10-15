import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Save,
  KeyRound,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Profile name state
  const [name, setName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // Handle Edit Name
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }
    setUpdatingName(true);
    await updateProfile(name.trim());
    setUpdatingName(false);
  };

  // Handle Password Change/Set
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (user?.hasPassword && !oldPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setUpdatingPassword(true);
    const result = await changePassword(oldPassword, newPassword, confirmNewPassword);
    setUpdatingPassword(false);

    if (result.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setPasswordError(result.error || 'Failed to update password');
    }
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score, label: 'Weak (min 6 chars)', color: 'bg-rose-500' };
    if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-400' };
    if (score === 3) return { score, label: 'Good', color: 'bg-emerald-400' };
    return { score, label: 'Strong', color: 'bg-[#B8F55A]' };
  };

  const strength = getPasswordStrength();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#EDEDED] py-10 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-[#B8F55A]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation */}
      <div className="w-full max-w-xl flex items-center justify-between mb-8 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full pill-dark-sheen text-xs font-semibold text-[#8A8A8A] hover:text-[#B8F55A] hover:border-[#B8F55A] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full pill-dark-sheen text-xs font-semibold text-rose-400 hover:border-rose-500 hover:bg-rose-950/30 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Centered Profile Card */}
      <div className="w-full max-w-xl card-sheen rounded-3xl p-6 sm:p-9 relative z-10 border border-white/10 shadow-2xl space-y-8">
        {/* Header with Avatar and Basic Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-white/10">
          <div className="relative shrink-0">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-20 h-20 rounded-full ring-2 ring-[#B8F55A]/70 shadow-[0_0_20px_rgba(184,245,90,0.35)] object-cover bg-[#222]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full ring-2 ring-[#B8F55A]/70 shadow-[0_0_20px_rgba(184,245,90,0.35)] bg-gradient-to-br from-[#2A2D37] to-[#17181D] flex items-center justify-center text-3xl font-black text-[#B8F55A]">
                {initial}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#B8F55A] rounded-full border-2 border-[#121212]" />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
            <p className="text-xs text-[#8A8A8A] flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#B8F55A]" />
              <span>{user?.email}</span>
            </p>
            <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold pill-dark-sheen text-[#B8F55A] inline-flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                {user?.hasPassword ? 'Password & Credentials' : 'Google Authentication'}
              </span>
            </div>
          </div>
        </div>

        {/* Form 1: Edit Name */}
        <form onSubmit={handleUpdateName} className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#B8F55A]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">General Information</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-full bg-[#15161A]/80 border border-white/5 text-xs text-[#888] cursor-not-allowed select-none"
            />
            <span className="text-[10px] text-[#666] ml-2 mt-1 block">
              Email address cannot be modified.
            </span>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={updatingName}
              className="px-6 py-2.5 rounded-full lime-btn-glow font-bold text-xs tracking-wide flex items-center gap-2 transition-all disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{updatingName ? 'Saving...' : 'Save Name'}</span>
            </button>
          </div>
        </form>

        {/* Form 2: Change Password or Set Password */}
        <form onSubmit={handleChangePassword} className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#B8F55A]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                {user?.hasPassword ? 'Change Password' : 'Set a Password'}
              </h2>
            </div>
            {!user?.hasPassword && (
              <span className="text-[10px] bg-[#B8F55A]/10 text-[#B8F55A] px-2.5 py-1 rounded-full font-semibold">
                Google-only account
              </span>
            )}
          </div>

          {!user?.hasPassword && (
            <p className="text-xs text-[#8A8A8A] leading-relaxed">
              You registered using Google OAuth. You can set a password below to allow signing in with both Google and your email/password.
            </p>
          )}

          {passwordError && (
            <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {/* Current Password (only required if user already has a password) */}
          {user?.hasPassword && (
            <div>
              <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full pl-11 pr-11 py-2.5 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {newPassword && (
              <div className="mt-2 px-1">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#8A8A8A]">Strength:</span>
                  <span className="font-semibold text-white">{strength.label}</span>
                </div>
                <div className="w-full h-1 bg-[#15161A] rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        step <= strength.score ? strength.color : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
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
                placeholder="Confirm new password"
                className="w-full pl-11 pr-11 py-2.5 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmNewPassword && newPassword === confirmNewPassword && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#B8F55A] mt-1.5 ml-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passwords match</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={updatingPassword}
              className="px-6 py-2.5 rounded-full lime-btn-glow font-bold text-xs tracking-wide flex items-center gap-2 transition-all disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {updatingPassword
                  ? 'Saving...'
                  : user?.hasPassword
                  ? 'Update Password'
                  : 'Set Password'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
