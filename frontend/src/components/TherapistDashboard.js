import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TherapistDashboard = ({ logout }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load appointments from backend API; avoid hardcoded demo data
    const fetchAppointments = async () => {
      try {
        const res = await fetch('/bookings/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAppointments(data);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const styles = {
    header: {

      background: '#2E7D32',
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
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '2.5rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease'
    },
    cardTitle: {
      color: '#2E7D32',
      fontSize: '1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    btn: {
      backgroundColor: '#2196F3',
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
    appointmentCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem',
      background: '#E3F2FD',
      borderRadius: '12px',
      borderLeft: '4px solid #4CAF50'
    }
  };

  return (
    <>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={styles.navTitle}>Mecac</h1>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', opacity: 0.9 }}>Mental Care Connect</span>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Today's Schedule</h3>
          {loading ? (
            <p>Loading appointments...</p>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} style={styles.appointmentCard}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {appointment.client_name || 'Client'}
                  </div>
                  <div style={{ color: '#6B7280' }}>
                    {new Date(appointment.scheduled_time).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span style={{ fontWeight: '700', color: '#2BB3A3' }}>{appointment.status}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ ...styles.card, marginTop: '2rem' }}>
          <h3 style={styles.cardTitle}>Quick Actions</h3>
          <Link to="/chat/1" style={styles.btn}>Join Chat</Link>
          <Link to="/booking" style={styles.btn}>Book New Session</Link>
          <button style={{ ...styles.btn, backgroundColor: '#F97373' }}>Submit Notes</button>
          <button style={{ ...styles.btn, backgroundColor: '#A78BFA' }}>Patient Resources</button>
        </div>
      </main>
    </>
  );
};

export default TherapistDashboard;
