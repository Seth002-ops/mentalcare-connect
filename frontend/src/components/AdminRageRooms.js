import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const AdminRageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    capacity: 4,
    price_per_hour: 3000,
    available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
    available_hours: '9:00 AM - 9:00 PM',
  });
  const [pkgForm, setPkgForm] = useState({ room_id: '', name: '', description: '', duration_minutes: 30, price: 1500, tier: 'standard' });

  const fetchRooms = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/rage-rooms`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setRooms(await res.json());
    } catch (err) {
      console.error('Failed to load rage rooms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image too large. Maximum size is 2MB.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const token = localStorage.getItem('token');
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (imageFile) data.append('image', imageFile);
    try {
      const res = await fetch(`${API_URL}/rage-rooms`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        setMessage('Rage room registered successfully.');
        setForm({ ...form, name: '', location: '', description: '' });
        setImageFile(null);
        setImagePreview(null);
        fetchRooms();
      } else {
        setMessage(result.detail || 'Failed to register rage room.');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPackage = async (e) => {
    e.preventDefault();
    if (!pkgForm.room_id) { setMessage('Select a rage room first.'); return; }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/rage-rooms/${pkgForm.room_id}/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: pkgForm.name,
          description: pkgForm.description,
          duration_minutes: parseInt(pkgForm.duration_minutes),
          price: parseFloat(pkgForm.price),
          tier: pkgForm.tier,
        }),
      });
      if (res.ok) {
        setMessage('Package added.');
        setPkgForm({ ...pkgForm, name: '', description: '' });
        fetchRooms();
      } else {
        const result = await res.json();
        setMessage(result.detail || 'Failed to add package.');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    }
  };

  const inputStyle = { width: '100%', padding: '0.7rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.92rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontWeight: '600', fontSize: '0.82rem', color: '#374151', marginBottom: '0.35rem' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', padding: '2rem 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827', margin: '0 0 0.5rem' }}>Rage Room Management</h1>
        <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>Register rage rooms with photos and locations, and manage their packages.</p>

        {message && (
          <div style={{ padding: '0.85rem 1rem', background: message.includes('success') || message.includes('added') ? '#E8F5E9' : '#FEE2E2', color: message.includes('success') || message.includes('added') ? '#1B5E20' : '#991B1B', borderRadius: '10px', marginBottom: '1.25rem', fontWeight: '600', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        {/* Registration form */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Register a Rage Room</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. MECAC Rage Room - Mombasa" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Location</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Nyali, Mombasa" required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the space, safety gear, and experience..." style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Capacity</label>
                <input name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Price per hour (KSh)</label>
                <input name="price_per_hour" type="number" min="0" value={form.price_per_hour} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Opening hours</label>
                <input name="available_hours" value={form.available_hours} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Photo of the space</label>
              <input type="file" accept="image/*" onChange={handleImage} style={{ fontSize: '0.88rem' }} />
              {imagePreview && (
                <img src={imagePreview} alt="Rage room preview" style={{ marginTop: '0.75rem', width: '180px', height: '120px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #E5E7EB', display: 'block' }} />
              )}
            </div>
            <button type="submit" disabled={saving} style={{ padding: '0.8rem 1.75rem', background: saving ? '#9CA3AF' : '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Registering...' : 'Register Rage Room'}
            </button>
          </form>
        </div>

        {/* Add package form */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Add a Package</h2>
          <form onSubmit={handleAddPackage}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Rage Room</label>
                <select value={pkgForm.room_id} onChange={(e) => setPkgForm({ ...pkgForm, room_id: e.target.value })} required style={inputStyle}>
                  <option value="">Select a rage room</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Package name</label>
                <input value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} placeholder="e.g. Quick Smash" required style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Duration (minutes)</label>
                <input type="number" min="5" value={pkgForm.duration_minutes} onChange={(e) => setPkgForm({ ...pkgForm, duration_minutes: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Price (KSh)</label>
                <input type="number" min="0" value={pkgForm.price} onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tier</label>
                <select value={pkgForm.tier} onChange={(e) => setPkgForm({ ...pkgForm, tier: e.target.value })} style={inputStyle}>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="group">Group</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Description</label>
              <input value={pkgForm.description} onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })} placeholder="What does this package include?" style={inputStyle} />
            </div>
            <button type="submit" style={{ padding: '0.8rem 1.75rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
              Add Package
            </button>
          </form>
        </div>

        {/* Existing rooms */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E7EB' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Registered Rage Rooms</h2>
          {loading ? (
            <p style={{ color: '#6B7280' }}>Loading...</p>
          ) : rooms.length === 0 ? (
            <p style={{ color: '#6B7280' }}>No rage rooms registered yet.</p>
          ) : (
            rooms.map(room => (
              <div key={room.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '12px', marginBottom: '0.75rem', alignItems: 'center' }}>
                {room.image_url ? (
                  <img src={room.image_url} alt={room.name} style={{ width: '90px', height: '70px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '90px', height: '70px', borderRadius: '10px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.7rem', flexShrink: 0 }}>No photo</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', color: '#111827' }}>{room.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>{room.location} | {room.packages.length} package(s)</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRageRooms;