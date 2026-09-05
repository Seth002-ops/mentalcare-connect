import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// ============ PROFESSIONAL ICONS ============
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

  useEffect(() => {
    if (userRole === 'student') {
      fetch('https://mecac-backend.onrender.com/mport.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || '') + '/universities')
        .then(res => res.ok ? res.json() : [])
        .then(data => setUniversities(data))
        .catch(() => setUniversities([]));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (userRole === 'student') {
      if (!selectedUni) {
        setError('Please select your university');
        return;
      }
      if (!isUniActive) {
        setError(`${selectedUni.name} is not yet registered on Mecac. Please contact your university counsellor or sign up as a regular client.`);
        return;
      }
      const emailDomain = formData.email.split('@')[1]?.toLowerCase();
      if (!emailDomain.endsWith(selectedUni.domain.toLowerCase())) {
        setError(`Email must end with @${selectedUni.domain}`);
        return;
      }
    }

    setLoading(true);
    try {
      let endpoint, body;

      if (userRole === 'student') {
        const activeUni = universities.find(u => u.email_domain.toLowerCase() === selectedUni.domain.toLowerCase());
        endpoint = '/auth/student-signup';
        body = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          university_id: activeUni.id,
        };
      } else {
        endpoint = '/auth/register';
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
        } else {
          onLogin(data.access_token, data.user_type, formData.email);
          navigate(userRole === 'therapist' ? '/therapist-register' : '/dashboard');
        }
      } else {
        if (Array.isArray(data.detail)) {
          // Pydantic validation errors — extract readable messages
          const errorMsgs = data.detail.map(e => e.msg).join(', ');
          setError(errorMsgs || 'Validation failed');
        } else {
          setError(data.detail || 'Signup failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== VERIFICATION SENT SCREEN =====
  if (verifySent) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#2E7D32' }}>
            <IconMail />
          </div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: '700', color: '#111827' }}>Check Your University Email</h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            We sent a verification link to <strong>{formData.email}</strong>.<br />
            Click it to activate your student account, then log in to unlock KSh 100/150/200 pricing.
          </p>
          <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '0.85rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
            I've Verified — Go to Login
          </button>
          <button onClick={() => setVerifySent(false)} style={{ width: '100%', padding: '0.85rem', background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN SIGNUP FORM =====
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '460px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#2E7D32', letterSpacing: '-0.02em' }}>MECAC</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#6B7280', fontSize: '0.85rem' }}>Care Connect — Create Account</p>
        </div>

        {/* ROLE SELECTION */}
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
              style={{
                padding: '0.75rem 0.5rem',
                borderRadius: '12px',
                border: userRole === role.key ? '2px solid #2E7D32' : '2px solid #E5E7EB',
                background: userRole === role.key ? '#E8F5E9' : 'white',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ color: userRole === role.key ? '#2E7D32' : '#6B7280', display: 'flex', justifyContent: 'center', marginBottom: '0.3rem' }}>{role.icon}</div>
              <div style={{ fontWeight: '700', fontSize: '0.8rem', color: userRole === role.key ? '#2E7D32' : '#111827' }}>{role.label}</div>
              <div style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{role.desc}</div>
            </button>
          ))}
        </div>

        {error && <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
              <IconUser />
              {userRole === 'therapist' ? 'Full Name (Required)' : userRole === 'student' ? 'Name or Registration Number' : 'Name (Optional — stay anonymous)'}
            </label>
            <input
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
              style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
            {userRole === 'client' && (
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <IconShield /> Your identity is protected. You can change this anytime.
              </div>
            )}
            {userRole === 'student' && (
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <IconGradCap /> Use your name or reg number — whichever you prefer.
              </div>
            )}
          </div>

          {/* UNIVERSITY SEARCH (Student only) */}
          {userRole === 'student' && (
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
                <IconGradCap /> Your University
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}><IconSearch /></span>
                <input
                  type="text"
                  value={uniSearch}
                  onChange={(e) => { setUniSearch(e.target.value); setShowUniDropdown(true); setSelectedUni(null); }}
                  onFocus={() => setShowUniDropdown(true)}
                  placeholder="Type to search your university..."
                  autoComplete="off"
                  style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.25rem', border: `1px solid ${selectedUni ? (isUniActive ? '#2E7D32' : '#F59E0B') : '#D1D5DB'}`, borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>

              {showUniDropdown && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setShowUniDropdown(false)} />
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '220px', overflowY: 'auto', background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 60, marginTop: '4px' }}>
                    {filteredUniversities.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>No universities found</div>
                    ) : (
                      filteredUniversities.map((uni, idx) => {
                        const active = universities.some(u => u.email_domain.toLowerCase() === uni.domain.toLowerCase());
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectUniversity(uni)}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', border: 'none', borderBottom: '1px solid #F3F4F6', background: selectedUni?.domain === uni.domain ? '#E8F5E9' : 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#111827' }}>{uni.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>@{uni.domain}</div>
                            </div>
                            {active ? (
                              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#2E7D32', background: '#E8F5E9', padding: '0.15rem 0.5rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><IconCheck /> Active</span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', fontWeight: '600', color: '#9CA3AF', background: '#F3F4F6', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>Coming Soon</span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {selectedUni && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: isUniActive ? '#E8F5E9' : '#FEF3C7', color: isUniActive ? '#1B5E20' : '#92400E' }}>
                  <IconShield />
                  {isUniActive
                    ? `Verified — use your @${selectedUni.domain} email`
                    : `${selectedUni.name} is not yet on Mecac. Sign up as Client or Therapist instead.`}
                </div>
              )}
            </div>
          )}

          {/* EMAIL */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
              <IconMail /> Email
              {userRole === 'student' && selectedUni && (
                <span style={{ fontWeight: '400', color: '#9CA3AF', fontSize: '0.75rem' }}>(must be @{selectedUni.domain})</span>
              )}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={userRole === 'student' && selectedUni ? `you@${selectedUni.domain}` : 'your@email.com'}
              required
              style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
              <IconLock /> Password
            </label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" required style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>

          {/* CONFIRM PASSWORD */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>
              <IconLock /> Confirm Password
            </label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" required style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>

          {/* SUBMIT */}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: loading ? '#9CA3AF' : '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}>
            {loading ? 'Creating Account...' : userRole === 'student' ? 'Sign Up as Student' : userRole === 'therapist' ? 'Sign Up as Therapist' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#6B7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#2E7D32', fontWeight: '600', textDecoration: 'none' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;