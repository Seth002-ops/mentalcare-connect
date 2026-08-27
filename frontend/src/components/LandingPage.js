import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const styles = {
    hero: {
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      backgroundImage: 'url(https://images.pexels.com/photos/6962625/pexels-photo-6962625.jpeg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '0 20px',
      color: 'white',
      overflow: 'hidden'
    },
    heroOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(10, 28, 34, 0.6), rgba(10, 28, 34, 0.75))',
      pointerEvents: 'none'
    },
    heroContent: {
      position: 'relative',
      maxWidth: '840px',
      animation: 'fadeInUp 1s ease-out',
      zIndex: 1
    },
    logoRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      marginBottom: '1rem'
    },
    brandShort: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#2E7D32'
    },
    brandFull: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#1565C0',
      letterSpacing: '0.03em'
    },
    headline: {
      fontSize: '3.5rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      lineHeight: '1.2'
    },
    description: {
      fontSize: '1.3rem',
      marginBottom: '3rem',
      opacity: 0.95
    },
    buttons: {
      display: 'flex',
      gap: '1.5rem',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    btnPrimary: {
      backgroundColor: '#2196F3',
      color: 'white',
      padding: '1.2rem 3rem',
      border: 'none',
      borderRadius: '50px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-block'
    },
    btnSecondary: {
      backgroundColor: 'transparent',
      color: 'white',
      padding: '1.2rem 3rem',
      border: '2px solid white',
      borderRadius: '50px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'inline-block'
    },
    features: {
      padding: '100px 0',
      backgroundColor: '#F9FAFB'
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '3rem',
      marginTop: '5rem',
      maxWidth: '1200px',
      margin: '5rem auto 0'
    },
    featureCard: {
      background: 'white',
      padding: '3rem 2rem',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      textAlign: 'center',
      transition: 'transform 0.3s ease'
    }
  };

  return (
    <>
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.logoRow}>
            <span style={styles.brandShort}>Mecac</span>
            <span style={styles.brandFull}>Mental Care Connect</span>
          </div>
          <h1 style={styles.headline}>Bridging You and Your Therapist, Safely</h1>
          <p style={styles.description}>
            Find licensed therapists who understand you. Secure, confidential mental health support at your fingertips.
          </p>
          <div style={styles.buttons}>
            <Link to="/therapists" style={styles.btnPrimary}>Find a Therapist</Link>
            <Link to="/signup" style={styles.btnSecondary}>Get Started</Link>
          </div>
        </div>
      </section>

      <section style={styles.features}>
        <div className="container">
          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}></div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Privacy First</h3>
              <p>All messages are end-to-end encrypted. Your conversations stay between you and your therapist.</p>
            </div>
            <div style={styles.featureCard}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}></div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Video & Voice</h3>
              <p>Connect face-to-face or by voice. Secure WebRTC calls with camera/microphone permissions.</p>
            </div>
            <div style={styles.featureCard}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}></div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>AI Support</h3>
              <p>Get instant coping tips while waiting for your therapist. Always gentle and encouraging.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;