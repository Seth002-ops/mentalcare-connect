import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const TherapistSessionNotes = ({ logout }) => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSessions();
  }, [clientId]);

  const fetchSessions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/bookings/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const bookings = await res.json();
        const clientSessions = bookings.filter(b => b.client_id === parseInt(clientId));
        setSessions(clientSessions);
        if (clientSessions.length > 0) {
          setClientName(clientSessions[0].client_name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedSession || !noteText.trim()) return;

    setSaving(true);
    setMessage('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/bookings/${selectedSession.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: noteText }),
      });

      if (res.ok) {
        setMessage('Session note saved and marked as completed!');
        setNoteText('');
        setSelectedSession(null);
        fetchSessions();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save note');
      }
    } catch (err) {
      setMessage('Error saving note');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/bookings/${sessionId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to complete session', err);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <header style={{ background: '#2E7D32', color: 'white', padding: '1.25rem 0' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Session Notes - {clientName}</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <NotificationBell />
            <button onClick={() => navigate('/therapist/clients')} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
              Back to Clients
            </button>
            <button onClick={logout} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px' }}>
        {message && (
          <div style={{ padding: '1rem', background: message.includes('success') || message.includes('saved') ? '#E8F5E9' : '#FEE2E2', color: message.includes('success') || message.includes('saved') ? '#1B5E20' : '#991B1B', borderRadius: '8px', marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Sessions List */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>All Sessions</h2>
            {sessions.length === 0 ? (
              <p style={{ color: '#6B7280' }}>No sessions found for this client.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sessions.map(session => (
                  <div
                    key={session.id}
                    style={{
                      padding: '1rem',
                      background: selectedSession?.id === session.id ? '#E8F5E9' : '#F9FAFB',
                      borderRadius: '8px',
                      border: selectedSession?.id === session.id ? '2px solid #2E7D32' : '1px solid #E5E7EB',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedSession(session)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {new Date(session.scheduled_time).toLocaleDateString()} at{' '}
                          {new Date(session.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                          KSh {session.amount}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: session.status === 'completed' ? '#E8F5E9' : session.status === 'confirmed' ? '#E0F2FE' : '#FEF3C7',
                        color: session.status === 'completed' ? '#1B5E20' : session.status === 'confirmed' ? '#0369A1' : '#92400E',
                      }}>
                        {session.status}
                      </span>
                    </div>
                    {session.status !== 'completed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteSession(session.id);
                        }}
                        style={{ marginTop: '0.5rem', padding: '0.4rem 0.75rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note Editor */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
              {selectedSession ? 'Write Session Note' : 'Select a Session'}
            </h2>
            {selectedSession ? (
              <>
                <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Session Date:</div>
                  <div style={{ fontWeight: '600' }}>
                    {new Date(selectedSession.scheduled_time).toLocaleString()}
                  </div>
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write your session notes here... Include observations, progress, techniques used, and next steps."
                  rows={10}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem', resize: 'vertical', marginBottom: '1rem' }}
                />
                <button
                  onClick={handleSaveNote}
                  disabled={saving || !noteText.trim()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: saving || !noteText.trim() ? '#9CA3AF' : '#2E7D32',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: saving || !noteText.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Note & Mark Complete'}
                </button>
              </>
            ) : (
              <p style={{ color: '#6B7280' }}>Click on a session from the left to write notes.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TherapistSessionNotes;