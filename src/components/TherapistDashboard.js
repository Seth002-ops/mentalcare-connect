import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TherapistDashboard = ({ logout }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch clients/bookings from backend; do not hardcode demo data
    const fetchData = async () => {
      try {
        const res = await fetch('/bookings/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        } else {
          setClients([]);
        }
      } catch (err) {
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    clientCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem',
      background: '#F0FDF4',
      borderRadius: '12px',
      borderLeft: '4px solid #2BB3A3'
    },
    notesInput: {
      width: '100%',
      padding: '0.8rem',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      marginTop: '0.5rem',
      resize: 'vertical'
    }
  };

  return (
    <>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <h1 style={styles.navTitle}>Afya Care Connect - Therapist</h1>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📅 Upcoming Sessions</h3>
            {loading ? (
              <p>Loading clients...</p>
            ) : (
              clients.map((session) => (
                <div key={session.id} style={styles.clientCard}>
                  <div>
                    <div style={{fontWeight: '600', marginBottom: '0.25rem'}}>
                      {session.client_name || 'Client'}
                    </div>
                    <div style={{color: '#6B7280'}}>
                      {new Date(session.scheduled_time).toLocaleString()} • {session.status}
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <Link to={`/chat/${session.id}`} style={styles.btn}>Join Chat</Link>
                    <button style={{...styles.btn, backgroundColor: '#F59E0B', fontSize: '0.9rem', padding: '0.8rem 1.5rem'}}>
                      Add Notes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📊 Quick Stats</h3>
            <div style={{marginBottom: '1.5rem'}}>
              <div style={{fontSize: '2rem', fontWeight: '700', color: '#2BB3A3'}}>2</div>
              <div style={{color: '#6B7280'}}>Active Clients</div>
            </div>
            <div style={{marginBottom: '1.5rem'}}>
              <div style={{fontSize: '2rem', fontWeight: '700', color: '#10B981'}}>14</div>
              <div style={{color: '#6B7280'}}>Sessions This Week</div>
            </div>
            <Link to="/booking" style={{...styles.btn, backgroundColor: '#A78BFA'}}>View All Clients</Link>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📝 Session Notes</h3>
            <textarea 
              placeholder="Quick notes for your next session..."
              style={styles.notesInput}
              rows="6"
            />
            <button style={{...styles.btn, backgroundColor: '#F97373', marginTop: '1rem'}}>
              Save Notes
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default TherapistDashboard;

