import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const { user, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score, label: 'Weak (min. 6 characters)', color: 'bg-rose-500' };
    if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-400' };
    if (score === 3) return { score, label: 'Good', color: 'bg-emerald-400' };
    return { score, label: 'Strong', color: 'bg-[#B8F55A]' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (name.trim().length < 2) {
      setErrorMessage('Full name must be at least 2 characters long.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await register(name.trim(), email.trim(), password, confirmPassword);
    setSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setErrorMessage('Google did not provide a valid login credential.');
      return;
    }
    setSubmitting(true);
    const result = await googleLogin(credentialResponse.credential);
    setSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google sign-up was unsuccesful or cancelled. Please verify your Google Client ID.');
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#EDEDED] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#B8F55A]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[10%] w-[450px] h-[300px] bg-[#B8F55A]/5 rounded-full blur-[120px] pointer-events-none" />

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

      {/* Centered Auth Card */}
      <div className="w-full max-w-md card-sheen rounded-3xl p-7 sm:p-9 relative z-10 border border-white/10 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-xs text-[#8A8A8A] mt-1.5">
            Join SmartCRM to track WooCommerce leads, orders and customer lifetime value
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name input */}
          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full pl-11 pr-4 py-3 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all"
              />
            </div>
          </div>

          {/* Email input */}
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

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 px-1">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#8A8A8A]">Password strength:</span>
                  <span className="font-semibold text-white">{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-[#15161A] rounded-full overflow-hidden flex gap-1">
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

          {/* Confirm Password input */}
          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] mb-1.5 ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A8A8A] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-full input-sheen text-sm text-white placeholder-[#555] outline-none focus:border-[#B8F55A] focus:ring-1 focus:ring-[#B8F55A] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && password === confirmPassword && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#B8F55A] mt-1.5 ml-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passwords match</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-full lime-btn-glow font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-60"
          >
            <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
            {!submitting && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative px-3 bg-[#17181D] text-[11px] font-bold uppercase tracking-wider text-[#666]">
            or
          </span>
        </div>

        {/* Continue with Google */}
        <div className="flex justify-center w-full overflow-hidden rounded-full">
          <div className="w-full flex justify-center [&>div]:w-full [&>div>iframe]:mx-auto">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>
        </div>

        {/* Log in prompt */}
        <div className="mt-7 text-center text-xs text-[#8A8A8A]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#B8F55A] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
