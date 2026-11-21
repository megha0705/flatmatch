import React, { useState } from 'react';
import { X, Heart, Lock, Mail, ArrowRight, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerUser, loginUser, verifyOtp, resendOtp } from '../api/auth';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  if (!isOpen) return null;

  // Handle OTP box changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Submit Sign Up
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(email, password);
      setIsDemoMode(result.isMock);
      setNotice(result.message || 'Verification code sent to your email!');
      setMode('otp');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const fullOtp = otp.join('');

    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp(email, fullOtp);
      setNotice(result.message || 'Email verified! Logging you in...');
      // Automatically log the user in after verification
      setTimeout(async () => {
        try {
          const loginResult = await loginUser(email, password);
          onAuthSuccess(loginResult.user);
          onClose();
        } catch (loginErr) {
          setMode('login');
          setNotice('Email verified! Please enter your password to log in.');
        }
      }, 800);
    } catch (err) {
      setError(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const result = await resendOtp(email);
      setNotice(result.message || 'New verification code sent!');
    } catch (err) {
      setError(err.message || 'Could not resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Log In
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email, password);
      onAuthSuccess(result.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid credentials or unverified email.');
      if (err.message && err.message.toLowerCase().includes('verify')) {
        setNotice('Looks like your email needs verification. Click here to verify.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-stone-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#DE5737] flex items-center justify-center shadow-md mb-3">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#211B17] flex items-baseline">
            roomie
            <span className="text-[#DE5737] font-extrabold text-3xl ml-0.5 leading-none">.</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            {mode === 'login' && 'Welcome back! Sign in to find your flatmate.'}
            {mode === 'signup' && 'Create your free account & meet compatible flatmates.'}
            {mode === 'otp' && 'Verify your email address to activate your account.'}
          </p>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <span>{error}</span>
            </div>
          </div>
        )}

        {notice && (
          <div className="mb-4 p-3 rounded-2xl bg-[#FDF1EC] border border-[#DE5737]/30 text-[#DE5737] text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{notice}</span>
            </div>
          </div>
        )}

        {/* Tab switchers (only between login & signup) */}
        {mode !== 'otp' && (
          <div className="flex rounded-full bg-stone-100 p-1 mb-6 border border-stone-200/60">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setNotice(''); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setNotice(''); }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                mode === 'signup'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Sign up
            </button>
          </div>
        )}

        {/* 1. LOG IN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] focus:ring-2 focus:ring-[#DE5737]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] focus:ring-2 focus:ring-[#DE5737]/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <span className="text-xs text-stone-500">Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setNotice(''); }}
                className="text-xs font-bold text-[#DE5737] hover:underline"
              >
                Sign up
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] focus:ring-2 focus:ring-[#DE5737]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] focus:ring-2 focus:ring-[#DE5737]/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:border-[#DE5737] focus:ring-2 focus:ring-[#DE5737]/20 outline-none transition-all"
                />
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-normal">
              By joining, you agree to Roomie's Community Guidelines, respectful housemate pledge, and privacy policy.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <span className="text-xs text-stone-500">Already have an account? </span>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setNotice(''); }}
                className="text-xs font-bold text-[#DE5737] hover:underline"
              >
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* 3. OTP VERIFICATION FORM */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <p className="text-xs text-stone-600">
                We sent a 6-digit verification code to:
              </p>
              <p className="text-sm font-bold text-stone-900 mt-0.5">{email}</p>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="flex justify-between gap-2 my-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-13 text-center text-xl font-bold rounded-xl border border-stone-300 focus:border-[#DE5737] focus:ring-2 focus:ring-[#DE5737]/20 outline-none transition-all bg-[#FAF7F2]"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#DE5737] hover:bg-[#CA4929] text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Log In</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-stone-500 hover:text-stone-800"
              >
                ← Back to signup
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="font-bold text-[#DE5737] hover:underline"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
