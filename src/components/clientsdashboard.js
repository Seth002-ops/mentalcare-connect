import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ClientDashboard = ({ logout }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchSessions = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/bookings/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch sessions');
        const data = await response.json();
        setSessions(data.map(b => ({
          id: b.id,
          therapist: b.therapist_name || 'Therapist',
          time: new Date(b.scheduled_time).toLocaleString(),
          status: b.status || b.payment_status || 'Scheduled'
        })));
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const styles = {
    header: {
      background: 'linear-gradient(135deg, #2BB3A3 0%, #A78BFA 100%)',
      color: 'white',
      padding: '2rem 0'
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    },
    navTitle: {
      fontSize: '1.8rem',
      fontWeight: '700'
    },
    logoutBtn: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      color: 'white',
      border: 'none',
      padding: '0.8rem 1.5rem',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '3rem 20px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2rem',
      marginBottom: '3rem'
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '2.5rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease'
    },
    cardTitle: {
      color: '#2BB3A3',
      fontSize: '1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    btn: {
      backgroundColor: '#2BB3A3',
      color: 'white',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      textDecoration: 'none',
      display: 'inline-block',
      marginRight: '1rem',
      marginBottom: '0.5rem'
    },
    sessionCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem',
      background: '#F0FDF4',
      borderRadius: '12px',
      borderLeft: '4px solid #2BB3A3'
    }
  };

  return (
    <>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <h1 style={styles.navTitle}>Afya Care Connect</h1>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📅 Upcoming Sessions</h3>
            {loading ? (
              <p>Loading sessions...</p>
            ) : (
              sessions.map(session => (
                <div key={session.id} style={styles.sessionCard}>
                  <div>
                    <div style={{fontWeight: '600', marginBottom: '0.25rem'}}>
                      {session.therapist}
                    </div>
                    <div style={{color: '#6B7280'}}>{session.time}</div>
                  </div>
                  <Link to={`/chat/${session.id}`} style={styles.btn}>Join Chat</Link>
                </div>
              ))
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💬 Quick Actions</h3>
            <Link to={sessions.length > 0 ? `/chat/${sessions[0].id}` : '/chat'} style={styles.btn}>Open Chat</Link>
            <Link to="/booking" style={styles.btn}>Book Session</Link>
            <button style={{...styles.btn, backgroundColor: '#F97373'}}>Resources</button>
            <button style={{...styles.btn, backgroundColor: '#A78BFA'}}>Assessments</button>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🤖 AI Support</h3>
            <p style={{marginBottom: '1.5rem', color: '#6B7280'}}>
              Get instant coping strategies while you wait.
            </p>
            <button style={{...styles.btn, backgroundColor: '#A78BFA'}}>Ask AI for Tips</button>
          </div>
        </div>
      </main>
    </>
  );
};

export default ClientDashboard;