import React from 'react';
import { Link } from 'react-router-dom';

const TherapistPendingPage = () => {
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F9FAFB',
      padding: '2rem',
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '3rem',
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    },
    icon: { 
      fontSize: '4rem', 
      marginBottom: '1rem',
      display: 'inline-block',
      animation: 'float 3s ease-in-out infinite', // ✅ FLOATING ANIMATION
    },
    title: { fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' },
    message: { color: '#6B7280', lineHeight: '1.6', marginBottom: '2rem' },
    note: {
      background: '#FEF3C7',
      border: '1px solid #FDE68A',
      borderRadius: '10px',
      padding: '1rem',
      color: '#92400E',
      fontSize: '0.9rem',
      marginBottom: '2rem',
    },
    logoutBtn: {
      padding: '0.75rem 1.5rem',
      background: '#2E7D32',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('email');
    window.location.href = '/login';
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}></div>
        <h1 style={styles.title}>Application Under Review</h1>
        <p style={styles.message}>
          Thank you for submitting your therapist profile! Our team is currently reviewing your credentials.
          You'll receive a notification once approved.
        </p>
        <div style={styles.note}>
           You'll be able to access your dashboard and accept bookings once an admin approves your application.
        </div>
        <button 
          onClick={handleLogout} 
          style={styles.logoutBtn}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(46, 125, 50, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Logout
        </button>
      </div>

      {/* ✅ FLOATING ANIMATION CSS */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
};

export default TherapistPendingPage;