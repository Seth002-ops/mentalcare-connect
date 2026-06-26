import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TherapistDashboard = ({ logout }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAppointments([
        { id: 1, client: 'Jane Mwangi', time: 'Today 3:00 PM', status: 'Upcoming' },
        { id: 2, client: 'Peter Otieno', time: 'Tomorrow 10:00 AM', status: 'Confirmed' }
      ]);
      setLoading(false);
    }, 1000);
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
    appointmentCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem',
      background: '#EFF6FF',
      borderRadius: '12px',
      borderLeft: '4px solid #2BB3A3'
    }
  };

  return (
    <>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <h1 style={styles.navTitle}>Therapist Dashboard</h1>
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
                    {appointment.client}
                  </div>
                  <div style={{ color: '#6B7280' }}>{appointment.time}</div>
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
