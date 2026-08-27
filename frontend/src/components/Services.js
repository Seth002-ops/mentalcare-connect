import React from 'react';
import { Link } from 'react-router-dom';

const Services = () => {
  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F9FAFB', paddingBottom: '4rem', paddingTop: '5rem', boxSizing: 'border-box' },
    header: { background: '#2E7D32', color: 'white', padding: '2rem 0', marginTop: '-5rem', paddingTop: '7rem' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
    navTitle: { fontSize: '1.8rem', fontWeight: '700' },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '25px', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '3rem 20px' },
    pageTitle: { fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem', textAlign: 'center' },
    pageSubtitle: { color: '#6B7280', marginBottom: '3rem', fontSize: '1.1rem', textAlign: 'center' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
    card: { background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', transition: 'transform 0.2s' },
    iconBox: { width: '60px', height: '60px', borderRadius: '12px', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' },
    cardTitle: { fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '0.75rem' },
    cardText: { color: '#4B5563', lineHeight: '1.6' }
  };

  const services = [
    {
      title: 'Secure Chat',
      description: 'End-to-end encrypted messaging with your therapist for confidential discussions and daily check-ins.',
      icon: ''
    },
    {
      title: 'Audio & Video Calls',
      description: 'Face-to-face therapy sessions from the comfort of your home using our secure WebRTC video platform.',
      icon: ''
    },
    {
      title: 'Easy Booking',
      description: 'Browse our network of licensed therapists, view their profiles, and schedule appointments effortlessly.',
      icon: ''
    },
    {
      title: 'Mood Tracking',
      description: 'Log your daily moods and notes to help you and your therapist identify patterns and triggers over time.',
      icon: ''
    },
    {
      title: 'AI Support Assistant',
      description: 'Get instant, 24/7 coping strategies and emotional support from our clinical AI companion between sessions.',
      icon: ''
    },
    {
      title: 'Secure Payments',
      description: 'Safe and seamless payment processing via M-Pesa and other supported methods for all healthcare services.',
      icon: ''
    }
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={styles.navTitle}>Mecac</h1>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', opacity: 0.9 }}>Mental Care Connect</span>
          </div>
          <Link to="/" style={styles.backBtn}>Back to Home</Link>
        </nav>
      </header>

      <main style={styles.main}>
        <h2 style={styles.pageTitle}>Our Services</h2>
        <p style={styles.pageSubtitle}>
          Comprehensive mental health tools designed to support your journey to wellness.
        </p>

        <div style={styles.grid}>
          {services.map((service) => (
            <div key={service.title} style={styles.card}>
              <div style={styles.iconBox}>
                <span style={{ fontSize: '1.8rem' }}>{service.icon}</span>
              </div>
              <h3 style={styles.cardTitle}>{service.title}</h3>
              <p style={styles.cardText}>{service.description}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link 
            to="/therapists" 
            style={{ 
              background: '#2E7D32', 
              color: 'white', 
              padding: '1rem 2.5rem', 
              borderRadius: '12px', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '1.1rem',
              display: 'inline-block'
            }}
          >
            Find a Therapist Now
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Services;