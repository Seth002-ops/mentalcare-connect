import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DAYS = [
  { id: 0, name: 'Monday' },
  { id: 1, name: 'Tuesday' },
  { id: 2, name: 'Wednesday' },
  { id: 3, name: 'Thursday' },
  { id: 4, name: 'Friday' },
  { id: 5, name: 'Saturday' },
  { id: 6, name: 'Sunday' },
];

const TIME_OPTIONS = [];
for (let hour = 6; hour <= 22; hour++) {
  TIME_OPTIONS.push(`${hour.toString().padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${hour.toString().padStart(2, '0')}:30`);
}

const TherapistAvailability = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/therapist/availability', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const newSchedule = {};
        data.forEach(slot => {
          if (!newSchedule[slot.day_of_week]) {
            newSchedule[slot.day_of_week] = [];
          }
          newSchedule[slot.day_of_week].push({
            start_time: slot.start_time,
            end_time: slot.end_time,
          });
        });
        setSchedule(newSchedule);
      }
    } catch (err) {
      console.error('Failed to fetch availability', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (dayId) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      if (newSchedule[dayId]) {
        delete newSchedule[dayId];
      } else {
        newSchedule[dayId] = [{ start_time: '09:00', end_time: '17:00' }];
      }
      return newSchedule;
    });
  };

  const handleTimeChange = (dayId, slotIndex, field, value) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      newSchedule[dayId][slotIndex][field] = value;
      return newSchedule;
    });
  };

  const addTimeSlot = (dayId) => {
    setSchedule(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), { start_time: '13:00', end_time: '17:00' }]
    }));
  };

  const removeTimeSlot = (dayId, slotIndex) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      newSchedule[dayId] = newSchedule[dayId].filter((_, i) => i !== slotIndex);
      if (newSchedule[dayId].length === 0) {
        delete newSchedule[dayId];
      }
      return newSchedule;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    const slots = [];
    Object.entries(schedule).forEach(([dayId, daySlots]) => {
      daySlots.forEach(slot => {
        slots.push({
          day_of_week: parseInt(dayId),
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: true,
        });
      });
    });

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/therapist/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(slots)
      });

      if (res.ok) {
        setMessage('✅ Schedule saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(`❌ ${data.detail || 'Failed to save schedule'}`);
      }
    } catch (err) {
      setMessage('❌ Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <p style={{ color: '#6B7280' }}>Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => navigate('/therapist-dashboard')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: '#374151', display: 'flex' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>Set Your Availability</h1>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ padding: '0.6rem 1.5rem', background: saving ? '#9CA3AF' : '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}>
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 20px' }}>
        {message && (
          <div style={{ padding: '1rem', background: message.includes('✅') ? '#E8F5E9' : '#FEE2E2', color: message.includes('✅') ? '#1B5E20' : '#991B1B', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: '600' }}>
            {message}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0 0 1rem 0', lineHeight: 1.6 }}>
            Set the days and times you're available for sessions. Clients will only see these slots when booking. You can update this anytime.
          </p>
        </div>

        {DAYS.map(day => {
          const isActive = !!schedule[day.id];
          return (
            <div key={day.id} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: `2px solid ${isActive ? '#2E7D32' : '#E5E7EB'}`, marginBottom: '1rem', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isActive ? '1rem' : '0' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>{day.name}</h3>
                <button
                  onClick={() => handleDayToggle(day.id)}
                  style={{
                    width: '50px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                    background: isActive ? '#2E7D32' : '#D1D5DB', position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px',
                    left: isActive ? '25px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>

              {isActive && schedule[day.id].map((slot, slotIndex) => (
                <div key={slotIndex} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', padding: '0.75rem', background: '#F9FAFB', borderRadius: '10px' }}>
                  <select
                    value={slot.start_time}
                    onChange={(e) => handleTimeChange(day.id, slotIndex, 'start_time', e.target.value)}
                    style={{ flex: 1, padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', background: 'white' }}
                  >
                    {TIME_OPTIONS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  <span style={{ color: '#6B7280', fontWeight: '600' }}>to</span>
                  <select
                    value={slot.end_time}
                    onChange={(e) => handleTimeChange(day.id, slotIndex, 'end_time', e.target.value)}
                    style={{ flex: 1, padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', background: 'white' }}
                  >
                    {TIME_OPTIONS.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {schedule[day.id].length > 1 && (
                    <button
                      onClick={() => removeTimeSlot(day.id, slotIndex)}
                      style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.6rem', cursor: 'pointer', color: '#991B1B', display: 'flex' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  )}
                </div>
              ))}

              {isActive && (
                <button
                  onClick={() => addTimeSlot(day.id)}
                  style={{ padding: '0.5rem 1rem', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', color: '#374151', fontWeight: '600', fontSize: '0.85rem', marginTop: '0.5rem' }}
                >
                  + Add time slot
                </button>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default TherapistAvailability;