import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const TherapistMessages = ({ logout }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/bookings/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const bookings = await res.json();
        
        // Group bookings by client to create conversation list
        const clientMap = {};
        bookings.forEach(booking => {
          if (!clientMap[booking.client_id]) {
            clientMap[booking.client_id] = {
              clientId: booking.client_id,
              clientName: booking.client_name,
              lastBooking: booking,
              bookingCount: 0,
            };
          }
          clientMap[booking.client_id].bookingCount++;
          const bookingDate = new Date(booking.scheduled_time);
          const lastDate = new Date(clientMap[booking.client_id].lastBooking.scheduled_time);
          if (bookingDate > lastDate) {
            clientMap[booking.client_id].lastBooking = booking;
          }
        });

        // Sort by most recent
        const sortedConversations = Object.values(clientMap).sort((a, b) => {
          return new Date(b.lastBooking.scheduled_time) - new Date(a.lastBooking.scheduled_time);
        });

        setConversations(sortedConversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading messages...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <header style={{ background: '#2E7D32', color: 'white', padding: '1.25rem 0' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Messages</h1>
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

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 20px' }}>
        {conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px' }}>
            <p style={{ color: '#6B7280' }}>No conversations yet. Conversations will appear here when clients book sessions with you.</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {conversations.map((conv, index) => (
              <div
                key={conv.clientId}
                onClick={() => navigate(`/chat/${conv.lastBooking.id}`)}
                style={{
                  padding: '1.25rem',
                  borderBottom: index < conversations.length - 1 ? '1px solid #E5E7EB' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1rem', color: '#111827', marginBottom: '0.25rem' }}>
                      {conv.clientName}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                      {conv.bookingCount} session{conv.bookingCount !== 1 ? 's' : ''} booked
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    {new Date(conv.lastBooking.scheduled_time).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  Last session: {new Date(conv.lastBooking.scheduled_time).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TherapistMessages;