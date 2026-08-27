import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

// ============ PROFESSIONAL ICONS ============
const IconPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconToggle = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="16" cy="12" r="3"></circle></svg>;
const IconCreditCard = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const IconUsers = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconGradCap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"></path></svg>;
const IconX = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconGlobe = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;

const TIERS = [
  { value: 'starter', label: 'Starter', maxStudents: '2,000', price: 'KSh 150,000/sem' },
  { value: 'growth', label: 'Growth', maxStudents: '5,000', price: 'KSh 350,000/sem' },
  { value: 'enterprise', label: 'Enterprise', maxStudents: 'Unlimited', price: 'KSh 600,000/sem' },
];

const AdminUniversities = ({ logout }) => {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [selectedUni, setSelectedUni] = useState(null);
  const [creditsToAdd, setCreditsToAdd] = useState('');
  const [newUni, setNewUni] = useState({ name: '', email_domain: '', subscription_tier: 'starter', rage_room_credit_pool: 500 });
  const [message, setMessage] = useState('');

  useEffect(() => { fetchUniversities(); }, []);

  const fetchUniversities = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/admin/universities/list', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUniversities(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const handleAddUniversity = async () => {
    if (!newUni.name || !newUni.email_domain) { alert('Fill all fields'); return; }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUni),
      });
      if (res.ok) {
        showMessage('University added successfully!');
        setShowAddModal(false);
        setNewUni({ name: '', email_domain: '', subscription_tier: 'starter', rage_room_credit_pool: 500 });
        fetchUniversities();
      } else {
        const data = await res.json();
        alert(data.detail || 'Failed to add university');
      }
    } catch (err) { alert('Network error'); }
  };

  const handleToggleActive = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/admin/universities/${id}/toggle-active`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      fetchUniversities();
    } catch (err) { alert('Failed to toggle'); }
  };

  const handleAddCredits = async () => {
    if (!creditsToAdd || parseInt(creditsToAdd) <= 0) { alert('Enter a valid number'); return; }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/admin/universities/${selectedUni.id}/add-credits?credits=${parseInt(creditsToAdd)}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showMessage(`Added ${creditsToAdd} credits to ${selectedUni.name}`);
        setShowCreditsModal(false);
        setCreditsToAdd('');
        setSelectedUni(null);
        fetchUniversities();
      }
    } catch (err) { alert('Failed to add credits'); }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* HEADER */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.75rem 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: '#374151', display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111827', margin: 0 }}>University Management</h1>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Manage partner universities & subscriptions</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NotificationBell />
            <button onClick={logout} style={{ padding: '0.5rem 1rem', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px' }}>
        {message && (
          <div style={{ padding: '0.85rem 1.25rem', background: '#E8F5E9', color: '#1B5E20', borderRadius: '10px', marginBottom: '1.25rem', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconCheck /> {message}
          </div>
        )}

        {/* STATS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Active Universities', value: universities.filter(u => u.is_active).length, icon: <IconGradCap />, color: '#2E7D32', bg: '#E8F5E9' },
            { label: 'Total Students Verified', value: universities.reduce((sum, u) => sum + (u.student_count || 0), 0), icon: <IconUsers />, color: '#0369A1', bg: '#E0F2FE' },
            { label: 'Total Credits Pool', value: universities.reduce((sum, u) => sum + u.rage_room_credit_pool, 0).toLocaleString(), icon: <IconCreditCard />, color: '#92400E', bg: '#FEF3C7' },
            { label: 'Inactive', value: universities.filter(u => !u.is_active).length, icon: <IconToggle />, color: '#6B7280', bg: '#F3F4F6' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: '600' }}>{stat.label}</span>
                <span style={{ color: stat.color, background: stat.bg, padding: '0.3rem', borderRadius: '8px', display: 'flex' }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* ADD BUTTON */}
        <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          <IconPlus /> Add University
        </button>

        {/* UNIVERSITIES LIST */}
        {universities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
            <div style={{ color: '#9CA3AF', display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}><IconGradCap /></div>
            <p style={{ color: '#6B7280' }}>No universities registered yet. Click "Add University" to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {universities.map(uni => (
              <div key={uni.id} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: `1px solid ${uni.is_active ? '#E5E7EB' : '#FEE2E2'}`, opacity: uni.is_active ? 1 : 0.7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#111827' }}>{uni.name}</h3>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '999px', background: uni.is_active ? '#E8F5E9' : '#FEE2E2', color: uni.is_active ? '#1B5E20' : '#991B1B' }}>
                        {uni.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#6B7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><IconGlobe /> @{uni.email_domain}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><IconCreditCard /> {TIERS.find(t => t.value === uni.subscription_tier)?.label || uni.subscription_tier}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><IconUsers /> {uni.student_count || 0} students</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><IconCalendar /> Expires: {uni.subscription_expires ? new Date(uni.subscription_expires).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: '#FEF3C7', borderRadius: '10px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#92400E' }}>{uni.rage_room_credit_pool}</div>
                      <div style={{ fontSize: '0.65rem', color: '#B45309', fontWeight: '600' }}>Credits</div>
                    </div>
                    <button onClick={() => { setSelectedUni(uni); setShowCreditsModal(true); }} style={{ padding: '0.5rem', background: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '8px', cursor: 'pointer', color: '#2E7D32', display: 'flex' }} title="Add Credits"><IconCreditCard /></button>
                    <button onClick={() => handleToggleActive(uni.id)} style={{ padding: '0.5rem', background: uni.is_active ? '#FEF3C7' : '#E8F5E9', border: `1px solid ${uni.is_active ? '#FDE68A' : '#C8E6C9'}`, borderRadius: '8px', cursor: 'pointer', color: uni.is_active ? '#92400E' : '#2E7D32', display: 'flex' }} title="Toggle Active"><IconToggle /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD UNIVERSITY MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowAddModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', maxWidth: '480px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#111827' }}>Add University</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#374151', display: 'flex' }}><IconX /></button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>University Name</label>
              <input type="text" value={newUni.name} onChange={e => setNewUni({ ...newUni, name: e.target.value })} placeholder="e.g., Karatina University" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Email Domain</label>
              <input type="text" value={newUni.email_domain} onChange={e => setNewUni({ ...newUni, email_domain: e.target.value })} placeholder="e.g., karu.ac.ke" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Subscription Tier</label>
              <select value={newUni.subscription_tier} onChange={e => setNewUni({ ...newUni, subscription_tier: e.target.value })} style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', background: 'white' }}>
                {TIERS.map(t => <option key={t.value} value={t.value}>{t.label} — {t.maxStudents} students — {t.price}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Initial Rage Room Credits</label>
              <input type="number" value={newUni.rage_room_credit_pool} onChange={e => setNewUni({ ...newUni, rage_room_credit_pool: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleAddUniversity} style={{ width: '100%', padding: '0.85rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>Add University</button>
          </div>
        </div>
      )}

      {/* ADD CREDITS MODAL */}
      {showCreditsModal && selectedUni && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => { setShowCreditsModal(false); setSelectedUni(null); }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', maxWidth: '400px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#111827' }}>Add Credits — {selectedUni.name}</h3>
              <button onClick={() => { setShowCreditsModal(false); setSelectedUni(null); }} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#374151', display: 'flex' }}><IconX /></button>
            </div>
            <div style={{ padding: '1rem', background: '#FEF3C7', borderRadius: '10px', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#92400E' }}>Current Credits</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#92400E' }}>{selectedUni.rage_room_credit_pool}</div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600', fontSize: '0.85rem', color: '#374151' }}>Credits to Add</label>
              <input type="number" value={creditsToAdd} onChange={e => setCreditsToAdd(e.target.value)} placeholder="e.g., 500" style={{ width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleAddCredits} style={{ width: '100%', padding: '0.85rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>Add Credits</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUniversities;