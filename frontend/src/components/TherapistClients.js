import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const TherapistClients = ({ logout }) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://mecac-backend.onrender.com/mport.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || '') + '/bookings/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const bookings = await res.json();
        
        // Group by client
        const clientMap = {};
        bookings.forEach(booking => {
          if (!clientMap[booking.client_id]) {
            clientMap[booking.client_id] = {
              id: booking.client_id,
              name: booking.client_name,
              sessions: [],
              completedSessions: 0,
              lastSession: null,
            };
          }
          clientMap[booking.client_id].sessions.push(booking);
          if (booking.status === 'completed') {
            clientMap[booking.client_id].completedSessions++;
          }
          const sessionDate = new Date(booking.scheduled_time);
          if (!clientMap[booking.client_id].lastSession || sessionDate > clientMap[booking.client_id].lastSession) {
            clientMap[booking.client_id].lastSession = sessionDate;
          }
        });

        setClients(Object.values(clientMap));
      }
    } catch (err) {
      console.error('Failed to fetch clients', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading clients...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <header style={{ background: '#2E7D32', color: 'white', padding: '1.25rem 0' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>My Clients</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <NotificationBell />
            <button onClick={() => navigate('/dashboard')} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
              Back to Dashboard
            </button>
            <button onClick={logout} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px' }}>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px' }}>
            <p style={{ color: '#6B7280' }}>No clients yet. Once clients book sessions with you, they'll appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {clients.map(client => (
              <div key={client.id} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>{client.name}</h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                      <span>Total Sessions: {client.sessions.length}</span>
                      <span>Completed: {client.completedSessions}</span>
                      {client.lastSession && (
                        <span>Last Session: {client.lastSession.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate(`/therapist/session-notes/${client.id}`)}
                    style={{ padding: '0.6rem 1.25rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Session Notes
                  </button>
                  <button
                    onClick={() => navigate(`/therapist/chat/${client.id}`)}
                    style={{ padding: '0.6rem 1.25rem', background: '#0284C7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TherapistClients;