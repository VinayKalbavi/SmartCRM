import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Login() {
  const { user, login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email.trim(), password, rememberMe);
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
    setErrorMessage('Google sign-in was unsuccesful or cancelled. Please verify your Google Client ID.');
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#EDEDED] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#B8F55A]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[450px] h-[300px] bg-[#B8F55A]/5 rounded-full blur-[120px] pointer-events-none" />

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
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-xs text-[#8A8A8A] mt-1.5">
            Log in to manage your WooCommerce customers and orders
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
            <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
              <label className="text-xs font-semibold text-[#8A8A8A]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#B8F55A] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center gap-2.5 pt-1 ml-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-[#15161A] text-[#B8F55A] focus:ring-[#B8F55A] focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer accent-[#B8F55A]"
            />
            <label htmlFor="rememberMe" className="text-xs font-medium text-[#8A8A8A] cursor-pointer select-none">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-full lime-btn-glow font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-60"
          >
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
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

        {/* Sign up prompt */}
        <div className="mt-7 text-center text-xs text-[#8A8A8A]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#B8F55A] font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
