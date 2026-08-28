import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TherapistSessionNotes = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(bookingId || '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    private_notes: '',
    risk_level: 'low',
    follow_up_required: false,
    treatment_approach: '',
    techniques_used: '',
  });

  useEffect(() => { fetchBookings(); }, []);
  useEffect(() => { if (selectedBookingId) fetchNote(selectedBookingId); }, [selectedBookingId]);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/bookings/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        // Sort descending so newest are at the top
        data.sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));
        setBookings(data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNote = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/therapist/session-notes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setForm({
          subjective: data.subjective || '',
          objective: data.objective || '',
          assessment: data.assessment || '',
          plan: data.plan || '',
          private_notes: data.private_notes || '',
          risk_level: data.risk_level || 'low',
          follow_up_required: Boolean(data.follow_up_required),
          treatment_approach: data.treatment_approach || '',
          techniques_used: data.techniques_used || '',
        });
      } else if (res.status === 404) {
        // Clear form if no note exists yet
        setForm({
          subjective: '', objective: '', assessment: '', plan: '', private_notes: '',
          risk_level: 'low', follow_up_required: false, treatment_approach: '', techniques_used: '',
        });
      }
    } catch (err) {
      console.error('Failed to load note', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async () => {
    if (!selectedBookingId) { alert('Please select a session first.'); return; }
    setSaving(true);
    setMessage('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/therapist/session-notes/${selectedBookingId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage('✅ Clinical notes saved successfully.');
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.detail || 'Failed to save notes.'}`);
      }
    } catch (err) {
      setMessage('❌ Failed to save notes.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const selectedBooking = bookings.find((b) => String(b.id) === String(selectedBookingId));

  const styles = {
    page: { minHeight: '100vh', background: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    header: { background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '1rem 20px', position: 'sticky', top: 0, zIndex: 50 },
    headerInner: { maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { padding: '0.55rem 0.9rem', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: '#374151' },
    main: { maxWidth: '900px', margin: '0 auto', padding: '2rem 20px' },
    card: { background: 'white', borderRadius: '18px', padding: '1.5rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
    label: { display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: '700', color: '#374151' },
    input: { width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box' },
    textarea: { width: '100%', minHeight: '90px', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical' },
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Clinical Session Notes</h1>
            <p style={{ margin: '0.25rem 0 0', color: '#6B7280', fontSize: '0.85rem' }}>Private, encrypted SOAP notes & treatment tracking</p>
          </div>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>Back</button>
        </div>
      </header>

      <main style={styles.main}>
        {message && (
          <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1rem', background: message.startsWith('✅') ? '#E8F5E9' : '#FEE2E2', color: message.startsWith('✅') ? '#1B5E20' : '#991B1B', fontWeight: '700' }}>
            {message}
          </div>
        )}

        <div style={styles.card}>
          <label style={styles.label}>Select Session</label>
          {loading ? (
            <p style={{ color: '#6B7280' }}>Loading sessions...</p>
          ) : bookings.length === 0 ? (
            <p style={{ color: '#B91C1C', fontWeight: '600' }}>No sessions found yet.</p>
          ) : (
            <select value={selectedBookingId} onChange={(e) => setSelectedBookingId(e.target.value)} style={styles.input}>
              <option value="">Choose a session...</option>
              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  #{booking.id} — {booking.client_name || 'Client'} — {new Date(booking.scheduled_time).toLocaleString()}
                </option>
              ))}
            </select>
          )}
          {selectedBooking && (
            <div style={{ marginTop: '1rem', padding: '0.9rem', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
              <strong>Client:</strong> {selectedBooking.client_name || 'Client'}<br />
              <strong>Status:</strong> {selectedBooking.status}<br />
              <strong>Time:</strong> {new Date(selectedBooking.scheduled_time).toLocaleString()}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={{ marginTop: 0, fontSize: '1rem', color: '#111827' }}>Treatment Approach & Techniques</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={styles.label}>Treatment Approach</label>
              <select name="treatment_approach" value={form.treatment_approach} onChange={handleChange} style={styles.input}>
                <option value="">Select approach...</option>
                <option value="CBT">CBT (Cognitive Behavioral)</option>
                <option value="DBT">DBT (Dialectical Behavior)</option>
                <option value="EMDR">EMDR (Eye Movement Desensitization)</option>
                <option value="Psychodynamic">Psychodynamic</option>
                <option value="Person-Centered">Person-Centered</option>
                <option value="Play Therapy">Play Therapy</option>
                <option value="Art/Music Therapy">Art/Music Therapy</option>
                <option value="Faith-Based">Faith-Based Counseling</option>
                <option value="Custom">Custom / Integrative</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Risk Level</label>
              <select name="risk_level" value={form.risk_level} onChange={handleChange} style={styles.input}>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={styles.label}>Techniques Used in this Session</label>
            <textarea name="techniques_used" value={form.techniques_used} onChange={handleChange} placeholder="e.g., Grounding exercises, exposure therapy, guided imagery, active listening..." style={styles.textarea} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" name="follow_up_required" checked={form.follow_up_required} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
            <span style={{ fontWeight: '600', color: '#374151' }}>Follow-up or safety plan required</span>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={{ marginTop: 0, fontSize: '1rem', color: '#111827' }}>SOAP Notes</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Subjective (Client's reported experience)</label>
            <textarea name="subjective" value={form.subjective} onChange={handleChange} placeholder="What the client says they are feeling/experiencing..." style={styles.textarea} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Objective (Therapist's observations)</label>
            <textarea name="objective" value={form.objective} onChange={handleChange} placeholder="Observable behavior, affect, mood, appearance..." style={styles.textarea} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Assessment (Clinical impression)</label>
            <textarea name="assessment" value={form.assessment} onChange={handleChange} placeholder="Progress towards goals, clinical formulation..." style={styles.textarea} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Plan (Next steps)</label>
            <textarea name="plan" value={form.plan} onChange={handleChange} placeholder="Homework, focus for next session, referrals..." style={styles.textarea} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={styles.label}>Private Supervisor / Personal Notes</label>
            <textarea name="private_notes" value={form.private_notes} onChange={handleChange} placeholder="Strictly confidential notes not for official records..." style={{ ...styles.textarea, background: '#FFF9E6' }} />
          </div>

          <button onClick={handleSave} disabled={saving || !selectedBookingId} style={{ width: '100%', padding: '0.9rem', background: saving || !selectedBookingId ? '#9CA3AF' : '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: saving || !selectedBookingId ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Clinical Notes'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default TherapistSessionNotes;