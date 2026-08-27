import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const IconCamera = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const IconBack = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;

const TherapistProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
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
      const res = await fetch('/therapist/status', { headers: { Authorization: `Bearer ${token}` } });
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
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      setMessage('❌ Only JPG, PNG, or WEBP images are allowed.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Image too large. Maximum size is 5MB.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setPhotoUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/therapist/profile-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPhotoUrl(data.photo_url);
        setMessage('✅ Profile photo updated!');
      } else {
        setMessage(`❌ ${data.detail || 'Upload failed'}`);
      }
    } catch (err) {
      setMessage('❌ Upload failed. Please try again.');
    } finally {
      setPhotoUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/therapist/profile', {
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
        setMessage('✅ Profile saved successfully!');
      } else {
        const data = await res.json();
        if (Array.isArray(data.detail)) {
          setErrorSafe(data.detail.map(e => e.msg).join(', '));
        } else {
          setErrorSafe(data.detail || 'Failed to save profile');
        }
      }
    } catch (err) {
      setErrorSafe('Network error. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const setErrorSafe = (msg) => {
    setMessage(msg.startsWith('❌') ? msg : `❌ ${msg}`);
  };

  const statusColors = {
    approved: { bg: '#E8F5E9', color: '#1B5E20', label: 'Approved' },
    pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending Approval' },
    rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
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
        {message && (
          <div style={{ padding: '0.85rem 1rem', background: message.startsWith('✅') ? '#E8F5E9' : '#FEE2E2', color: message.startsWith('✅') ? '#1B5E20' : '#991B1B', borderRadius: '10px', marginBottom: '1.25rem', fontWeight: '600', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        {/* PHOTO CARD */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E7EB', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1rem' }}>
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #E8F5E9' }} />
            ) : (
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontSize: '2.5rem', fontWeight: '800' }}>
                {(profile?.name || 'T').charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={handlePhotoClick}
              disabled={photoUploading}
              style={{ position: 'absolute', bottom: '0', right: '0', width: '38px', height: '38px', borderRadius: '50%', background: '#2E7D32', color: 'white', border: '3px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Change photo"
            >
              <IconCamera />
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>

          <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>{profile?.name || 'Therapist'}</h2>
          <p style={{ margin: '0 0 0.75rem', color: '#6B7280', fontSize: '0.85rem' }}>{profile?.email}</p>
          <span style={{ padding: '0.3rem 0.9rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', background: status.bg, color: status.color }}>{status.label}</span>
          <p style={{ color: '#9CA3AF', fontSize: '0.78rem', marginTop: '1rem' }}>
            {photoUploading ? 'Uploading photo...' : 'Click the camera icon to upload your professional photo (max 5MB)'}
          </p>
        </div>

        {/* PROFILE FORM */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.05rem', fontWeight: '700', color: '#111827' }}>Professional Details</h3>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Specializations</label>
            <input type="text" name="specializations" value={form.specializations} onChange={handleChange} placeholder="e.g., CBT, Trauma Therapy, Couples Counseling" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Years of Experience</label>
              <input type="number" name="experience_years" value={form.experience_years} onChange={handleChange} placeholder="e.g., 5" min="0" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Session Rate (KSh)</label>
              <input type="number" name="hourly_rate" value={form.hourly_rate} onChange={handleChange} placeholder="e.g., 2500" min="0" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Languages</label>
            <input type="text" name="languages" value={form.languages} onChange={handleChange} placeholder="e.g., English, Swahili" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell clients about your approach and experience..." rows="4" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '0.85rem', background: saving ? '#9CA3AF' : '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default TherapistProfile;