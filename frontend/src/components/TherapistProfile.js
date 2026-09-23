import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { API_URL } from '../config'; // ✅ ADDED
import { useToast } from './ToastContext'; // ✅ ADDED

const IconCamera = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const IconBack = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;

const TherapistProfile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast(); // ✅ ADDED
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoKey, setPhotoKey] = useState(0); // ✅ For fade-in animation trigger
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    specializations: '',
    experience_years: '',
    hourly_rate: '',
    languages: '',
    bio: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      // ✅ FIXED: Using API_URL
      const res = await fetch(`${API_URL}/therapist/status`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setPhotoUrl(data.profile_photo_url || '');
        setForm({
          specializations: data.specializations || '',
          experience_years: data.experience_years ?? '',
          hourly_rate: data.hourly_rate ?? '',
          languages: data.languages || '',
          bio: data.bio || '',
        });
      } else {
        addToast('Failed to load profile.', 'error');
      }
    } catch (err) {
      console.error('Failed to load profile', err);
      addToast('Network error. Could not load profile.', 'error');
    }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      addToast('Only JPG, PNG, or WEBP images are allowed.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image too large. Maximum size is 5MB.', 'error');
      return;
    }

    setPhotoUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      // ✅ FIXED: Using API_URL
      const res = await fetch(`${API_URL}/therapist/profile-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPhotoUrl(data.photo_url);
        setPhotoKey(prev => prev + 1); // ✅ Triggers fade-in animation
        addToast('Profile photo updated!', 'success');
      } else {
        addToast(data.detail || 'Upload failed', 'error');
      }
    } catch (err) {
      addToast('Upload failed. Please try again.', 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      // ✅ FIXED: Using API_URL
      const res = await fetch(`${API_URL}/therapist/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          specializations: form.specializations,
          experience_years: form.experience_years === '' ? null : Number(form.experience_years),
          hourly_rate: form.hourly_rate === '' ? null : Number(form.hourly_rate),
          languages: form.languages,
          bio: form.bio,
        }),
      });

      if (res.ok) {
        addToast('Profile saved successfully!', 'success');
      } else {
        const data = await res.json();
        if (Array.isArray(data.detail)) {
          addToast(data.detail.map(e => e.msg).join(', '), 'error');
        } else {
          addToast(data.detail || 'Failed to save profile', 'error');
        }
      }
    } catch (err) {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const statusColors = {
    approved: { bg: '#E8F5E9', color: '#1B5E20', label: 'Approved', pulse: false },
    pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending Approval', pulse: true }, // ✅ Pulse enabled
    rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected', pulse: false },
  };
  const status = statusColors[profile?.verification_status] || statusColors.pending;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0.75rem 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: '#374151', display: 'flex' }}><IconBack /></button>
            <h1 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111827', margin: 0 }}>My Professional Profile</h1>
          </div>
          <NotificationBell />
        </div>
      </header>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 20px' }}>
        {/* ✅ CARD ENTRANCE ANIMATION applied */}
        <div className="profile-card-entrance" style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E7EB', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1rem' }}>
            {photoUrl ? (
              // ✅ FADE-IN ANIMATION: key changes when photoUrl updates, triggering animation
              <img 
                key={photoKey} 
                src={photoUrl} 
                alt="Profile" 
                className="profile-photo-fade"
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #E8F5E9', display: 'block' }} 
              />
            ) : (
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontSize: '2.5rem', fontWeight: '800' }}>
                {(profile?.name || 'T').charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={handlePhotoClick}
              disabled={photoUploading}
              className="camera-btn-hover"
              style={{ 
                position: 'absolute', 
                bottom: '0', 
                right: '0', 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                background: photoUploading ? '#6B7280' : '#2E7D32', 
                color: 'white', 
                border: '3px solid white', 
                cursor: photoUploading ? 'not-allowed' : 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'background 0.2s ease',
              }}
              title="Change photo"
            >
              {/* ✅ SPINNER: Shows while uploading */}
              {photoUploading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <IconCamera />
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>

          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>{profile?.name || 'Therapist'}</h2>
          <p style={{ margin: '0 0 0.75rem', color: '#6B7280', fontSize: '0.85rem' }}>{profile?.email}</p>
          <span 
            style={{ 
              padding: '0.3rem 0.9rem', 
              borderRadius: '999px', 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              background: status.bg, 
              color: status.color,
              display: 'inline-block',
              animation: status.pulse ? 'statusPulse 2s ease-in-out infinite' : 'none', // ✅ PULSE for pending
            }}
          >
            {status.label}
          </span>
          <p style={{ color: '#9CA3AF', fontSize: '0.78rem', marginTop: '1rem' }}>
            {photoUploading ? 'Uploading photo...' : 'Click the camera icon to upload your professional photo (max 5MB)'}
          </p>
        </div>

        {/* ✅ CARD ENTRANCE ANIMATION with delay */}
        <div className="profile-card-entrance-delayed" style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.05rem', fontWeight: '700', color: '#111827' }}>Professional Details</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Specializations</label>
            <input className="profile-input" type="text" name="specializations" value={form.specializations} onChange={handleChange} placeholder="e.g., CBT, Trauma Therapy, Couples Counseling" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s ease' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Years of Experience</label>
              <input className="profile-input" type="number" name="experience_years" value={form.experience_years} onChange={handleChange} placeholder="e.g., 5" min="0" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s ease' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Session Rate (KSh)</label>
              <input className="profile-input" type="number" name="hourly_rate" value={form.hourly_rate} onChange={handleChange} placeholder="e.g., 2500" min="0" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s ease' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Languages</label>
            <input className="profile-input" type="text" name="languages" value={form.languages} onChange={handleChange} placeholder="e.g., English, Swahili" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s ease' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Bio</label>
            <textarea className="profile-input" name="bio" value={form.bio} onChange={handleChange} placeholder="Tell clients about your approach and experience..." rows="4" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical', outline: 'none', transition: 'all 0.2s ease' }} />
          </div>

          <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '0.85rem', background: saving ? '#9CA3AF' : '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(46, 125, 50, 0.25)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </main>

      {/* ✅ ALL CSS ANIMATIONS */}
      <style>{`
        /* Smooth fade-in when a new photo uploads */
        @keyframes photoFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .profile-photo-fade {
          animation: photoFadeIn 0.4s ease-out;
        }

        /* Card entrance - slide up with fade */
        @keyframes cardSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .profile-card-entrance {
          animation: cardSlideUp 0.5s ease-out;
        }
        .profile-card-entrance-delayed {
          animation: cardSlideUp 0.5s ease-out 0.15s both;
        }

        /* Pulse effect for Pending status badge */
        @keyframes statusPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(146, 64, 14, 0.3);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(146, 64, 14, 0);
          }
        }

        /* Camera button hover scale */
        .camera-btn-hover:not(:disabled):hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }
        .camera-btn-hover {
          transition: transform 0.2s ease, background 0.2s ease;
        }

        /* Spinner for photo upload */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Form input focus glow effect */
        .profile-input:focus {
          border-color: #2E7D32 !important;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.15) !important;
        }
        .profile-input:hover:not(:focus) {
          border-color: #9CA3AF !important;
        }
      `}</style>
    </div>
  );
};

export default TherapistProfile;