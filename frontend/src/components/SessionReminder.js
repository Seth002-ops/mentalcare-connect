import React, { useEffect, useState } from 'react';

const SessionReminder = () => {
  const [reminder, setReminder] = useState(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/bookings/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const bookings = await res.json();
        const now = new Date();
        const twoHours = 2 * 60 * 60 * 1000;

        const upcoming = bookings
          .filter(b => b.status === 'confirmed' || b.status === 'pending')
          .filter(b => {
            const diff = new Date(b.scheduled_time) - now;
            return diff > 0 && diff <= twoHours;
          })
          .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));

        if (upcoming.length > 0) {
          const next = upcoming[0];
          const mins = Math.max(1, Math.round((new Date(next.scheduled_time) - now) / 60000));
          setReminder({
            name: next.therapist_name || next.client_name || 'your session',
            mins,
            time: new Date(next.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        } else {
          setReminder(null);
        }
      } catch (err) {
        console.error('Reminder check failed', err);
      }
    };

    fetchUpcoming();
    const interval = setInterval(fetchUpcoming, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  if (!reminder) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', marginBottom: '1.25rem' }}>
      <span style={{ fontSize: '1.5rem' }}>🔔</span>
      <div>
        <div style={{ fontWeight: '700', color: '#1E40AF', fontSize: '0.9rem' }}>Upcoming Session</div>
        <div style={{ fontSize: '0.8rem', color: '#1D4ED8' }}>
          {reminder.name} starts {reminder.mins <= 60 ? `in ${reminder.mins} min` : `in ${Math.round(reminder.mins / 60)} hr`} at {reminder.time}
        </div>
      </div>
    </div>
  );
};

export default SessionReminder;