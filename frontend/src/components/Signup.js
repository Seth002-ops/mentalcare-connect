import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import { useToast } from './ToastContext';

// ============ PROFESSIONAL ICONS ============
const IconLeaf = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>;
const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconMail = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconLock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconGradCap = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"></path></svg>;
const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconShield = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconStethoscope = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path><circle cx="20" cy="10" r="2"></circle></svg>;

// ============ KENYAN UNIVERSITIES DATABASE ============
const KENYAN_UNIVERSITIES = [
  { name: "University of Nairobi", domain: "uonbi.ac.ke" },
  { name: "Kenyatta University", domain: "ku.ac.ke" },
  { name: "Karatina University", domain: "karu.ac.ke" },
  { name: "Moi University", domain: "mu.ac.ke" },
  { name: "Egerton University", domain: "egerton.ac.ke" },
  { name: "Jomo Kenyatta University (JKUAT)", domain: "jkuat.ac.ke" },
  { name: "Maseno University", domain: "maseno.ac.ke" },
  { name: "Masinde Muliro University (MMUST)", domain: "mmust.ac.ke" },
  { name: "Dedan Kimathi University (DeKUT)", domain: "dkut.ac.ke" },
  { name: "Chuka University", domain: "chuka.ac.ke" },
  { name: "Pwani University", domain: "pu.ac.ke" },
  { name: "Laikipia University", domain: "laikipia.ac.ke" },
  { name: "Meru University (MUST)", domain: "must.ac.ke" },
  { name: "Embu University", domain: "embuni.ac.ke" },
  { name: "Kirinyaga University", domain: "kyu.ac.ke" },
  { name: "Machakos University", domain: "mksu.ac.ke" },
  { name: "Kisii University", domain: "kisiiuniversity.ac.ke" },
  { name: "South Eastern Kenya University (SEKU)", domain: "seku.ac.ke" },
  { name: "Multimedia University of Kenya", domain: "mmu.ac.ke" },
  { name: "Technical University of Kenya (TUK)", domain: "tukenya.ac.ke" },
  { name: "Technical University of Mombasa (TUM)", domain: "tum.ac.ke" },
  { name: "Jaramogi Oginga Odinga University (JOOUST)", domain: "jooust.ac.ke" },
  { name: "Garissa University", domain: "garissauniversity.ac.ke" },
  { name: "University of Eldoret", domain: "uoeld.ac.ke" },
  { name: "Kibabii University", domain: "kibu.ac.ke" },
  { name: "Maasai Mara University", domain: "mmarau.ac.ke" },
  { name: "Strathmore University", domain: "strathmore.edu" },
  { name: "USIU-Africa", domain: "usiu.ac.ke" },
  { name: "Catholic University of Eastern Africa (CUEA)", domain: "cuea.edu" },
  { name: "Kenya Methodist University (KeMU)", domain: "kemu.ac.ke" },
  { name: "Daystar University", domain: "daystar.ac.ke" },
  { name: "Kabarak University", domain: "kabarak.ac.ke" },
  { name: "Africa Nazarene University", domain: "anu.ac.ke" },
  { name: "Mount Kenya University (MKU)", domain: "mku.ac.ke" },
  { name: "KCA University", domain: "kca.ac.ke" },
  { name: "Zetech University", domain: "zetech.ac.ke" },
  { name: "Riara University", domain: "riarauniversity.ac.ke" },
  { name: "Scott Christian University", domain: "scott.ac.ke" },
  { name: "Presbyterian University of East Africa (PUEA)", domain: "puea.ac.ke" },
  { name: "Gretsa University", domain: "gretsauniversity.ac.ke" },
  { name: "Pioneer International University", domain: "piu.ac.ke" },
  { name: "East African University", domain: "eau.ac.ke" },
  { name: "Adventist University of Africa", domain: "aua.ac.ke" },
  { name: "International Centre for Mission Studies", domain: "icms.ac.ke" },
  { name: "Pan Africa Christian University", domain: "pac.ac.ke" },
  { name: "Nairobi Aviation College", domain: "nairobaviation.ac.ke" },
  { name: "Inoorero University", domain: "inu.ac.ke" },
  { name: "Management University of Africa", domain: "mua.ac.ke" },
  { name: "Kiriri Women's University", domain: "kwust.ac.ke" },
  { name: "Umma University", domain: "umma.ac.ke" },
  { name: "University of Kabianga", domain: "kabianga.ac.ke" },
];

const Signup = ({ onLogin }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [userRole, setUserRole] = useState('client');
  const [universities, setUniversities] = useState([]);
  const [uniSearch, setUniSearch] = useState('');
  const [showUniDropdown, setShowUniDropdown] = useState(false);
  const [selectedUni, setSelectedUni] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifySent, setVerifySent] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);

  useEffect(() => {
    if (userRole === 'student') {
      fetch(`${API_URL}/universities`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setUniversities(data))
        .catch(() => {
          setUniversities([]);
          addToast('Could not load verified universities.', 'error');
        });
    }
  }, [userRole]);

  const filteredUniversities = useMemo(() => {
    if (!uniSearch.trim()) return KENYAN_UNIVERSITIES;
    const search = uniSearch.toLowerCase();
    return KENYAN_UNIVERSITIES.filter(u =>
      u.name.toLowerCase().includes(search) || u.domain.toLowerCase().includes(search)
    );
  }, [uniSearch]);

  const isUniActive = useMemo(() => {
    if (!selectedUni) return false;
    return universities.some(u => u.email_domain.toLowerCase() === selectedUni.domain.toLowerCase());
  }, [selectedUni, universities]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSelectUniversity = (uni) => {
    setSelectedUni(uni);
    setUniSearch(uni.name);
    setShowUniDropdown(false);
    setError('');
  };

  const triggerShake = () => {
    setShakeCard(true);
    setTimeout(() => setShakeCard(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      triggerShake();
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      triggerShake();
      return;
    }

    if (userRole === 'student') {
      if (!selectedUni) {
        setError('Please select your university');
        triggerShake();
        return;
      }
      if (!isUniActive) {
        setError(`${selectedUni.name} is not yet registered on Mecac. Please contact your university counsellor or sign up as a regular client.`);
        triggerShake();
        return;
      }

      const emailDomain = formData.email.split('@')[1]?.toLowerCase() || '';
      if (!emailDomain.endsWith(selectedUni.domain.toLowerCase())) {
        setError(`Email must end with @${selectedUni.domain}`);
        triggerShake();
        return;
      }
    }

    setLoading(true);
    try {
      let endpoint, body;

      if (userRole === 'student') {
        const activeUni = universities.find(u => u.email_domain.toLowerCase() === selectedUni.domain.toLowerCase());
        if (!activeUni) {
          setError('Selected university is no longer active. Please choose another.');
          triggerShake();
          setLoading(false);
          return;
        }

        endpoint = `${API_URL}/auth/student-signup`;
        body = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          university_id: activeUni.id,
        };
      } else {
        endpoint = `${API_URL}/auth/register`;
        body = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          user_type: userRole,
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        if (userRole === 'student') {
          setVerifySent(true);
          addToast('Verification email sent! Check your inbox.', 'success');
        } else {
          onLogin(data.access_token, data.user_type, formData.email);
          return;
        }
      } else {
        if (Array.isArray(data.detail)) {
          const errorMsgs = data.detail.map(e => e.msg).join(', ');
          setError(errorMsgs || 'Validation failed');
        } else {
          setError(data.detail || 'Signup failed');
        }
        triggerShake();
      }
    } catch (err) {
      setError('Network error. Please try again.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: 'url(https://images.pexels.com/photos/32228687/pexels-photo-32228687.jpeg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#0A1226',
  };

  const overlayStyle = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(10, 18, 38, 0.76), rgba(46, 125, 50, 0.28))',
    pointerEvents: 'none',
  };

  const orbOneStyle = {
    position: 'absolute',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(102, 187, 106, 0.35), transparent 70%)',
    top: '8%',
    left: '-70px',
    filter: 'blur(12px)',
    pointerEvents: 'none',
  };

  const orbTwoStyle = {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 72%)',
    bottom: '5%',
    right: '-90px',
    filter: 'blur(16px)',
    pointerEvents: 'none',
  };

  const glassCardStyle = {
    position: 'relative',
    zIndex: 1,
    background: 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    borderRadius: '24px',
    padding: '2rem',
    maxWidth: '460px',
    width: '100%',
    boxShadow: '0 30px 70px rgba(0, 0, 0, 0.22)',
    border: '1px solid rgba(255, 255, 255, 0.45)',
    overflow: 'hidden',
  };

  const glassVerifyCardStyle = {
    ...glassCardStyle,
    maxWidth: '440px',
    padding: '2.5rem',
    textAlign: 'center',
  };

  const topAccentStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #2E7D32, #66BB6A, #A5D6A7)',
  };

  // ===== VERIFY EMAIL VIEW =====
  if (verifySent) {
    return (
      <div style={pageStyle}>
        <div style={overlayStyle} />
        <div style={orbOneStyle} />
        <div style={orbTwoStyle} />

        <div className="signup-entrance" style={glassVerifyCardStyle}>
          <div style={topAccentStyle} />

          <div className="verify-icon-float" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(232, 245, 233, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#2E7D32', boxShadow: '0 10px 25px rgba(46,125,50,0.18)' }}>
            <IconMail />
          </div>

          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: '700', color: '#111827' }}>Check Your University Email</h2>
          <p style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            We sent a verification link to <strong>{formData.email}</strong>.<br />
            Click it to activate your student account, then log in to unlock KSh 100/150/200 pricing.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="signup-btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              background: '#2E7D32',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.95rem',
              marginBottom: '0.75rem',
              transition: 'all 0.2s ease',
            }}
          >
            I've Verified — Go to Login
          </button>

          <button
            onClick={() => setVerifySent(false)}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'rgba(243, 244, 246, 0.9)',
              color: '#374151',
              border: '1px solid rgba(229, 231, 235, 0.9)',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
            }}
          >
            Use a different email
          </button>
        </div>

        <style>{`
          .verify-icon-float {
            animation: verifyFloat 3s ease-in-out infinite;
          }
          @keyframes verifyFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .signup-btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(46, 125, 50, 0.25);
          }
        `}</style>
      </div>
    );
  }

  // ===== MAIN SIGNUP VIEW =====
  return (
    <div style={pageStyle}>
      <div style={overlayStyle} />
      <div style={orbOneStyle} />
      <div style={orbTwoStyle} />

      <div
        className={`signup-entrance signup-glass-card ${shakeCard ? 'shake-error' : ''}`}
        style={glassCardStyle}
      >
        <div style={topAccentStyle} />

        {/* Brand badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div className="signup-badge-glow" style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 25px rgba(46,125,50,0.28)' }}>
            <IconLeaf />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 className="logo-breathe" style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#2E7D32', letterSpacing: '-0.02em' }}>MECAC</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#4B5563', fontSize: '0.85rem' }}>Care Connect — Create Account</p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[
            { key: 'client', label: 'Client', icon: <IconUser />, desc: 'Seek support' },
            { key: 'therapist', label: 'Therapist', icon: <IconStethoscope />, desc: 'Provide care' },
            { key: 'student', label: 'Student', icon: <IconGradCap />, desc: 'Uni pricing' },
          ].map(role => (
            <button
              key={role.key}
              type="button"
              onClick={() => { setUserRole(role.key); setSelectedUni(null); setUniSearch(''); setError(''); }}
              className="role-selector-btn"
              style={{
                padding: '0.75rem 0.5rem',
                borderRadius: '12px',
                border: userRole === role.key ? '2px solid #2E7D32' : '2px solid rgba(229, 231, 235, 0.9)',
                background: userRole === role.key ? 'rgba(232, 245, 233, 0.95)' : 'rgba(255, 255, 255, 0.72)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                transform: userRole === role.key ? 'scale(1.02)' : 'scale(1)',
                boxShadow: userRole === role.key ? '0 8px 18px rgba(46,125,50,0.12)' : 'none',
              }}
            >
              <div
                className={userRole === role.key ? 'icon-selected' : ''}
                style={{
                  color: userRole === role.key ? '#2E7D32' : '#6B7280',
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '0.3rem',
                  transition: 'transform 0.3s ease',
                }}
              >
                {role.icon}
              </div>
              <div style={{ fontWeight: '700', fontSize: '0.8rem', color: userRole === role.key ? '#2E7D32' : '#111827' }}>{role.label}</div>
              <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>{role.desc}</div>
            </button>
          ))}
        </div>

        {error && (
          <div
            className="error-slide-in"
            style={{
              padding: '0.75rem',
              background: 'rgba(254, 226, 226, 0.95)',
              color: '#991B1B',
              border: '1px solid rgba(254, 202, 202, 0.95)',
              borderRadius: '10px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              animation: 'errorSlideIn 0.3s ease-out',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
              <IconUser />
              {userRole === 'therapist' ? 'Full Name (Required)' : userRole === 'student' ? 'Name or Registration Number' : 'Name (Optional — stay anonymous)'}
            </label>
            <input
              className="signup-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={
                userRole === 'therapist'
                  ? 'e.g., Dr. Jane Ochieng'
                  : userRole === 'student'
                  ? 'e.g., John Doe or KAR/2024/001'
                  : 'Leave blank to stay anonymous'
              }
              required={userRole === 'therapist'}
              style={{
                width: '100%',
                padding: '0.7rem',
                border: '1px solid rgba(209, 213, 219, 0.95)',
                borderRadius: '10px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                outline: 'none',
                background: 'rgba(255,255,255,0.82)',
                transition: 'all 0.2s ease',
              }}
            />
            {userRole === 'client' && (
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <IconShield /> Your identity is protected. You can change this anytime.
              </div>
            )}
            {userRole === 'student' && (
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <IconGradCap /> Use your name or reg number — whichever you prefer.
              </div>
            )}
          </div>

          {userRole === 'student' && (
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
                <IconGradCap /> Your University
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}><IconSearch /></span>
                <input
                  className="signup-input"
                  type="text"
                  value={uniSearch}
                  onChange={(e) => { setUniSearch(e.target.value); setShowUniDropdown(true); setSelectedUni(null); }}
                  onFocus={() => setShowUniDropdown(true)}
                  placeholder="Type to search your university..."
                  autoComplete="off"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.7rem 0.7rem 2.25rem',
                    border: `1px solid ${selectedUni ? (isUniActive ? '#2E7D32' : '#F59E0B') : 'rgba(209, 213, 219, 0.95)'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    background: 'rgba(255,255,255,0.82)',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>

              {showUniDropdown && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setShowUniDropdown(false)} />
                  <div
                    className="uni-dropdown-slide"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      background: 'rgba(255,255,255,0.96)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(229, 231, 235, 0.95)',
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                      zIndex: 60,
                      marginTop: '4px',
                      animation: 'dropdownSlide 0.2s ease-out',
                    }}
                  >
                    {filteredUniversities.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>No universities found</div>
                    ) : (
                      filteredUniversities.map((uni, idx) => {
                        const active = universities.some(u => u.email_domain.toLowerCase() === uni.domain.toLowerCase());
                        return (
                          <button
                            key={idx}
                            type="button"
                            className="uni-option-hover"
                            onClick={() => handleSelectUniversity(uni)}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.75rem',
                              border: 'none',
                              borderBottom: '1px solid rgba(243, 244, 246, 0.95)',
                              background: selectedUni?.domain === uni.domain ? 'rgba(232, 245, 233, 0.95)' : 'transparent',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#111827' }}>{uni.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>@{uni.domain}</div>
                            </div>
                            {active ? (
                              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#2E7D32', background: '#E8F5E9', padding: '0.15rem 0.5rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><IconCheck /> Active</span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', fontWeight: '600', color: '#6B7280', background: '#F3F4F6', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>Coming Soon</span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {selectedUni && (
                <div
                  className="uni-confirmation-slide"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: isUniActive ? 'rgba(232, 245, 233, 0.95)' : 'rgba(254, 243, 199, 0.95)',
                    color: isUniActive ? '#1B5E20' : '#92400E',
                    border: `1px solid ${isUniActive ? 'rgba(200, 230, 201, 0.95)' : 'rgba(253, 230, 138, 0.95)'}`,
                    animation: 'uniConfirmSlide 0.3s ease-out',
                  }}
                >
                  <IconShield />
                  {isUniActive
                    ? `Verified — use your @${selectedUni.domain} email`
                    : `${selectedUni.name} is not yet on Mecac. Sign up as Client or Therapist instead.`}
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
              <IconMail /> Email
              {userRole === 'student' && selectedUni && (
                <span style={{ fontWeight: '400', color: '#6B7280', fontSize: '0.75rem' }}>(must be @{selectedUni.domain})</span>
              )}
            </label>
            <input
              className="signup-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={userRole === 'student' && selectedUni ? `you@${selectedUni.domain}` : 'your@email.com'}
              required
              style={{
                width: '100%',
                padding: '0.7rem',
                border: '1px solid rgba(209, 213, 219, 0.95)',
                borderRadius: '10px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                outline: 'none',
                background: 'rgba(255,255,255,0.82)',
                transition: 'all 0.2s ease',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
              <IconLock /> Password
            </label>
            <input
              className="signup-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              style={{
                width: '100%',
                padding: '0.7rem',
                border: '1px solid rgba(209, 213, 219, 0.95)',
                borderRadius: '10px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                outline: 'none',
                background: 'rgba(255,255,255,0.82)',
                transition: 'all 0.2s ease',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
              <IconLock /> Confirm Password
            </label>
            <input
              className="signup-input"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              required
              style={{
                width: '100%',
                padding: '0.7rem',
                border: '1px solid rgba(209, 213, 219, 0.95)',
                borderRadius: '10px',
                fontSize: '0.95rem',
                boxSizing: 'border-box',
                outline: 'none',
                background: 'rgba(255,255,255,0.82)',
                transition: 'all 0.2s ease',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="signup-submit-btn"
            style={{
              width: '100%',
              padding: '0.85rem',
              background: loading ? '#9CA3AF' : '#2E7D32',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 8px 20px rgba(46,125,50,0.18)',
            }}
          >
            {loading && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            {loading ? 'Creating Account...' : userRole === 'student' ? 'Sign Up as Student' : userRole === 'therapist' ? 'Sign Up as Therapist' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#4B5563' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="signup-link"
            style={{ color: '#2E7D32', fontWeight: '600', textDecoration: 'none', transition: 'opacity 0.2s' }}
          >
            Log In
          </Link>
        </p>
      </div>

      {/* ✅ ALL CSS ANIMATIONS */}
      <style>{`
        @keyframes cardSlideUp {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .signup-entrance {
          animation: cardSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes shakeError {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .shake-error {
          animation: shakeError 0.5s ease-in-out;
        }

        @keyframes errorSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes uniConfirmSlide {
          from {
            opacity: 0;
            transform: translateY(-5px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .logo-breathe {
          animation: breathe 4s ease-in-out infinite;
        }

        @keyframes iconBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .icon-selected {
          animation: iconBounce 0.4s ease-out;
        }

        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes badgeGlow {
          0%, 100% { box-shadow: 0 10px 25px rgba(46,125,50,0.28); }
          50% { box-shadow: 0 14px 34px rgba(46,125,50,0.42); }
        }
        .signup-badge-glow {
          animation: badgeFloat 3.5s ease-in-out infinite, badgeGlow 3.5s ease-in-out infinite;
        }

        .role-selector-btn:hover {
          transform: scale(1.03) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .uni-option-hover:hover {
          background: rgba(249, 250, 251, 0.95) !important;
        }

        .signup-input:focus {
          border-color: #2E7D32 !important;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15) !important;
          background: rgba(255,255,255,0.96) !important;
        }
        .signup-input:hover:not(:focus) {
          border-color: #9CA3AF !important;
        }
        .signup-input::placeholder {
          color: #9CA3AF;
        }

        .signup-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(46, 125, 50, 0.3);
        }
        .signup-submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
        }

        .signup-link:hover {
          text-decoration: underline !important;
          opacity: 0.85;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .signup-glass-card {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Signup;