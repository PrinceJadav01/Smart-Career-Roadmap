import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

// Inline SVG logo mark
const LogoMark = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#00C896" fillOpacity="0.15" />
    <path d="M8 24L16 8L24 24" stroke="#00C896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.5 19H21.5" stroke="#00C896" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function Login({ onLoginSuccess, onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      await onLoginSuccess(email.trim().toLowerCase(), password, rememberMe);
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-[100dvh]">
      {/* ── Left brand panel ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex lg:w-[54%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B0D14 0%, #0F1117 60%, #111520 100%)' }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.07) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-60 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }}
        />

        {/* Top: Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <LogoMark />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F1F2F4', letterSpacing: '-0.01em' }}>
            SkillSathi
          </span>
        </div>

        {/* Middle: Value prop */}
        <div className="space-y-6 relative z-10">
          <div>
            <h2
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2.75rem', lineHeight: 1.1, color: '#F1F2F4', letterSpacing: '-0.03em' }}
            >
              Your career,<br />
              <span style={{ color: '#00C896' }}>mapped precisely.</span>
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: '#8A8FA8', lineHeight: 1.7, marginTop: '1rem', maxWidth: '36ch' }}>
              SkillSathi reads your current skills, targets your goal role, and generates an adaptive roadmap that updates as you grow.
            </p>
          </div>

          {/* Three proof points */}
          <div className="space-y-3">
            {[
              'Personalized skill gap analysis',
              'Curated learning resources per skill',
              'Weekly challenges to track momentum',
            ].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C896', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#8A8FA8' }}>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: footer text */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#4B5068', position: 'relative', zIndex: 10 }}>
          &copy; {new Date().getFullYear()} SkillSathi. All rights reserved.
        </p>
      </motion.div>

      {/* ── Right form panel ──────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ background: '#08090E' }}
      >
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-10">
          <LogoMark />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F1F2F4' }}>
            SkillSathi
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
          style={{ maxWidth: 400 }}
        >
          {/* Heading */}
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: '#F1F2F4', letterSpacing: '-0.02em', lineHeight: 1.2 }}
            >
              Welcome back
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.5rem' }}>
              Sign in to continue your career journey.
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 8,
                padding: '0.65rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.8125rem',
                color: '#F87171',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {serverError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Email */}
            <div>
              <label className="input-label" htmlFor="login-email">Email address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                  placeholder="you@example.com"
                  className={`input-field${errors.email ? ' error' : ''}`}
                  style={{ paddingRight: '2.75rem' }}
                />
                <Mail style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#4B5068', pointerEvents: 'none' }} />
              </div>
              {errors.email && <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.35rem', fontFamily: 'Inter, sans-serif' }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="input-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => alert("Please contact support at support@skillsathi.com to reset your password.")}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#00C896', fontFamily: 'Inter, sans-serif', padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="Enter your password"
                  className={`input-field${errors.password ? ' error' : ''}`}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  tabIndex={-1}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4B5068', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.35rem', fontFamily: 'Inter, sans-serif' }}>{errors.password}</p>}
            </div>

            {/* Remember me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#00C896', width: 15, height: 15, cursor: 'pointer' }}
              />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', color: '#8A8FA8' }}>Remember me</span>
            </label>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem', opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? (
                <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </motion.button>
          </form>

          {/* Switch to Sign Up */}
          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', color: '#8A8FA8' }}>
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00C896', fontWeight: 500, padding: 0, fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem' }}
            >
              Create one
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
