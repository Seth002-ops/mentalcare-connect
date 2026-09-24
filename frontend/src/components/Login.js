import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { stripEmoji } from '../utils/sanitizeText';
import { API_URL } from '../config';
import { useToast } from './ToastContext';

// ============ ICONS ============
const IconLeaf = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>;
const IconMail = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconLock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconEye = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconEyeOff = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

const Login = ({ onLogin }) => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ✅ NEW: password visibility
  const [shakeCard, setShakeCard] = useState(false); // ✅ NEW: error shake

  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: stripEmoji(email).trim(),
          password: stripEmoji(password),
        }),
      });

      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        // JSON parse failed
      }

      if (!response.ok) {
        setError((data && data.detail) || 'Login failed. Please check your credentials.');
        triggerShake(); // ✅ shake on bad credentials
        setLoading(false);
        return;
      }

      // ✅ BUG FIX: guard against null data / missing token before calling onLogin
      if (!data || !data.access_token) {
        setError('Unexpected response from server. Please try again.');
        triggerShake();
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.access_token);

      // Call onLogin and force page reload to sync state and route correctly
      onLogin(data.access_token, data.user_type, email);
      return;

    } catch (err) {
      console.error("Login error:", err);
      setError('Network error. Please try again.');
      triggerShake(); // ✅ shake on network failure
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(https://images.pexels.com/photos/32228687/pexels-photo-32228687.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', position: 'relative', padding: '2rem' },
    containerOverlay: { position: 'absolute', inset: 0, background: 'rgba(10, 18, 38, 0.45)', pointerEvents: 'none' },
    formContainer: { position: 'relative', background: 'rgba(255, 255, 255, 0.94)', padding: '3rem', borderRadius: '24px', boxShadow: '0 30px 70px rgba(0,0,0,0.18)', width: '100%', maxWidth: '450px', backdropFilter: 'blur(18px)' },
    title: { textAlign: 'center', color: '#2E7D32', fontSize: '2rem', marginBottom: '0.4rem', fontWeight: '700' },
    subtitle: { textAlign: 'center', color: '#6B7280', fontSize: '0.9rem', marginBottom: '2rem' }, // ✅ NEW
    inputGroup: { marginBottom: '1.5rem' },
    label: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontWeight: '600', color: '#111827', fontSize: '0.9rem' }, // ✅ icons in labels
    input: { width: '100%', padding: '1rem 1.2rem', border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s ease', fontFamily: 'inherit' },
    submitBtn: { width: '100%', padding: '1.2rem', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s ease' }, // ✅ harmonized green
    errorText: { color: '#991B1B', marginBottom: '1rem', textAlign: 'center', background: '#FEE2E2', border: '1px solid #FECACA', padding: '0.75rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '500' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.containerOverlay} />
      <div
        className={`login-entrance ${shakeCard ? 'shake-error' : ''}`}
        style={styles.formContainer}
      >
        {/* ✅ Floating brand badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div className="login-badge-glow" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 20px rgba(46,125,50,0.3)' }}>
            <IconLeaf />
          </div>
        </div>

        <div style={styles.title}>Welcome Back</div>
        <p style={styles.subtitle}>Sign in to continue your journey</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}><IconMail /> Email</label>
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(stripEmoji(e.target.value))}
              placeholder="you@example.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}><IconLock /> Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'} // ✅ toggle
                value={password}
                onChange={(e) => setPassword(stripEmoji(e.target.value))}
                placeholder="Enter your password"
                style={{ ...styles.input, paddingRight: '3rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="login-eye-btn"
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: '0.25rem', borderRadius: '6px', transition: 'color 0.2s ease' }}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
          </div>

          {error && <div className="error-slide-in" style={styles.errorText}>{error}</div>}

          <button type="submit" className="login-submit-btn" style={{ ...styles.submitBtn, opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
            {loading && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6B7280', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="login-link" style={{ color: '#2E7D32', fontWeight: '600', textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>

      {/* ✅ ALL CSS ANIMATIONS */}
      <style>{`
        @keyframes cardSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .login-entrance { animation: cardSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1); }

        @keyframes shakeError {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake-error { animation: shakeError 0.5s ease-in-out; }

        @keyframes errorSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .error-slide-in { animation: errorSlideIn 0.3s ease-out; }

        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes badgeGlow {
          0%, 100% { box-shadow: 0 8px 20px rgba(46,125,50,0.30); }
          50% { box-shadow: 0 12px 30px rgba(46,125,50,0.50); }
        }
        .login-badge-glow { animation: badgeFloat 3.5s ease-in-out infinite, badgeGlow 3.5s ease-in-out infinite; }

        .login-input:focus {
          border-color: #2E7D32 !important;
          box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.15) !important;
        }
        .login-input:hover:not(:focus) { border-color: #9CA3AF !important; }
        .login-input::placeholder { color: #B0B7C3; }

        .login-eye-btn:hover { color: #2E7D32 !important; background: #F0FDF4 !important; }

        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(46, 125, 50, 0.35);
          background-color: #1B5E20 !important;
        }
        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(46, 125, 50, 0.25);
        }

        .login-link:hover { text-decoration: underline !important; opacity: 0.85; }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .login-entrance { padding: 2rem 1.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;