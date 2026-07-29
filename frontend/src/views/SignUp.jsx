import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff, Phone, GraduationCap, BookOpen,
  Loader2, ArrowLeft, CheckCircle2
} from 'lucide-react';

const EDUCATION_LEVELS = [
  'High School',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD / Doctorate',
  'Other'
];

// Shared LogoMark
const LogoMark = () => (
  <img src="/logo.png" alt="SkillSathi Logo" style={{ width: 38, height: 38, objectFit: 'contain' }} />
);

export default function SignUp({ onRegisterSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    educationLevel: '',
    fieldOfStudy: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    // Normalizing email check
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Strong password check
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else {
      if (form.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(form.password)) {
        newErrors.password = 'Must contain at least 1 uppercase letter';
      } else if (!/[a-z]/.test(form.password)) {
        newErrors.password = 'Must contain at least 1 lowercase letter';
      } else if (!/[0-9]/.test(form.password)) {
        newErrors.password = 'Must contain at least 1 number';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
        newErrors.password = 'Must contain at least 1 special character';
      }
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.educationLevel) {
      newErrors.educationLevel = 'Please select education level';
    }

    if (!form.fieldOfStudy.trim()) {
      newErrors.fieldOfStudy = 'Field of study is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      await onRegisterSuccess({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        phoneNumber: form.phoneNumber.trim() || null,
        educationLevel: form.educationLevel,
        fieldOfStudy: form.fieldOfStudy.trim()
      });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    background: '#161822',
    border: `1px solid ${errors[field] ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 8,
    padding: '0.65rem 2.75rem 0.65rem 1rem',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    color: '#F1F2F4',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    WebkitAppearance: 'none',
  });

  const fieldErr = (field) => errors[field] ? (
    <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '0.3rem', fontFamily: 'Inter, sans-serif' }}>{errors[field]}</p>
  ) : null;

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] } })
  };

  return (
    <div className="flex w-full min-h-[100dvh]">
      {/* ── Left brand panel ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex lg:w-[44%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B0D14 0%, #0F1117 60%, #111520 100%)' }}
      >
        <div
          className="absolute -top-40 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,200,150,0.07) 0%, transparent 70%)' }}
        />

        {/* Top: Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <LogoMark />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F1F2F4' }}>
            SkillSathi
          </span>
        </div>

        {/* Middle */}
        <div className="space-y-4 relative z-10">
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '2.25rem', lineHeight: 1.15, color: '#F1F2F4', letterSpacing: '-0.03em' }}>
            Start your<br />
            <span style={{ color: '#00C896' }}>career roadmap.</span>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#8A8FA8', lineHeight: 1.7, maxWidth: '34ch' }}>
            Create your profile in under two minutes and get a personalized learning path based on where you are today.
          </p>

          <div className="space-y-3" style={{ paddingTop: '0.5rem' }}>
            {[
              'Instant skill gap analysis',
              'Role-matched resource curation',
              'Progress tracked over time',
            ].map((point) => (
              <div key={point} className="flex items-center gap-3">
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C896', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#8A8FA8' }}>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#4B5068', position: 'relative', zIndex: 10 }}>
          Your data is encrypted and protected with industry-standard security.
        </p>
      </motion.div>

      {/* ── Right form panel ──────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto"
        style={{ background: '#08090E' }}
      >
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <LogoMark />
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#F1F2F4' }}>
            SkillSathi
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 480 }}
        >
          {/* Heading */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: '#F1F2F4', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Create your account
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#8A8FA8', marginTop: '0.5rem' }}>
              Get your personalized career roadmap in minutes.
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Row: Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                <label className="input-label" htmlFor="su-name">Full name</label>
                <div style={{ position: 'relative' }}>
                  <input id="su-name" type="text" value={form.name} onChange={set('name')} placeholder="Jane Smith" style={inputStyle('name')} />
                  <User style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#4B5068', pointerEvents: 'none' }} />
                </div>
                {fieldErr('name')}
              </motion.div>

              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                <label className="input-label" htmlFor="su-email">Email address</label>
                <div style={{ position: 'relative' }}>
                  <input id="su-email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" style={inputStyle('email')} />
                  <Mail style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#4B5068', pointerEvents: 'none' }} />
                </div>
                {fieldErr('email')}
              </motion.div>
            </div>

            {/* Row: Password + Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                <label className="input-label" htmlFor="su-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="su-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min 8 chars, 1 uppercase, 1 symbol" style={inputStyle('password')} />
                  <button type="button" onClick={() => setShowPassword(p => !p)} tabIndex={-1} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4B5068', display: 'flex' }}>
                    {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
                {fieldErr('password')}
              </motion.div>

              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <label className="input-label" htmlFor="su-confirm">Confirm password</label>
                <div style={{ position: 'relative' }}>
                  <input id="su-confirm" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Re-enter password" style={inputStyle('confirmPassword')} />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} tabIndex={-1} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4B5068', display: 'flex' }}>
                    {showConfirm ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
                {fieldErr('confirmPassword')}
              </motion.div>
            </div>

            {/* Phone */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <label className="input-label" htmlFor="su-phone">
                Phone number <span style={{ color: '#4B5068', fontWeight: 400 }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input id="su-phone" type="tel" value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="9876543210" style={inputStyle('phoneNumber')} />
                <Phone style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#4B5068', pointerEvents: 'none' }} />
              </div>
              {fieldErr('phoneNumber')}
            </motion.div>

            {/* Row: Education + Field */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
                <label className="input-label" htmlFor="su-edu">Education level</label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="su-edu"
                    value={form.educationLevel}
                    onChange={set('educationLevel')}
                    style={{ ...inputStyle('educationLevel'), appearance: 'none', cursor: 'pointer', color: form.educationLevel ? '#F1F2F4' : '#4B5068' }}
                  >
                    <option value="" disabled>Select level</option>
                    {EDUCATION_LEVELS.map(lvl => (
                      <option key={lvl} value={lvl} style={{ background: '#161822', color: '#F1F2F4' }}>{lvl}</option>
                    ))}
                  </select>
                  <GraduationCap style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#4B5068', pointerEvents: 'none' }} />
                </div>
                {fieldErr('educationLevel')}
              </motion.div>

              <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
                <label className="input-label" htmlFor="su-field">Field of study</label>
                <div style={{ position: 'relative' }}>
                  <input id="su-field" type="text" value={form.fieldOfStudy} onChange={set('fieldOfStudy')} placeholder="e.g. Computer Science" style={inputStyle('fieldOfStudy')} />
                  <BookOpen style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#4B5068', pointerEvents: 'none' }} />
                </div>
                {fieldErr('fieldOfStudy')}
              </motion.div>
            </div>

            {/* Submit */}
            <motion.button
              custom={7}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem', opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? (
                <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Creating account...</>
              ) : (
                <><CheckCircle2 style={{ width: 16, height: 16 }} /> Create account</>
              )}
            </motion.button>
          </form>

          {/* Switch to Login */}
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', color: '#8A8FA8' }}>
            <button
              onClick={onSwitchToLogin}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00C896', fontWeight: 500, padding: 0, fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <ArrowLeft style={{ width: 13, height: 13 }} /> Back to sign in
            </button>
            {' '}— already have an account.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
