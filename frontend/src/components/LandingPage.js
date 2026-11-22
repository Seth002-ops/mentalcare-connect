import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ============ DATA CONSTANTS ============
const FEATURES = [
  { title: 'Secure Video Sessions', desc: 'End-to-end encrypted calls. No recordings stored unless you consent.' },
  { title: 'Verified Therapists', desc: 'Every provider is licensed and vetted by our clinical team before joining.' },
  { title: 'Mood Tracking', desc: 'Log daily sentiments privately. Share insights with your therapist only when ready.' },
  { title: 'Student Pricing', desc: 'Discounted rates automatically applied after university email verification.' },
];

const STEPS = [
  { num: '01', title: 'Create Account', desc: 'Sign up with your email. Verify identity if required.' },
  { num: '02', title: 'Find Care', desc: 'Browse therapists by specialty, availability, and price.' },
  { num: '03', title: 'Book Session', desc: 'Schedule instantly. Receive calendar invite and secure link.' },
];

const AUDIENCES = {
  clients: {
    label: 'For Clients',
    headline: 'Access care without friction.',
    points: [
      'Search by specialization (anxiety, depression, trauma).',
      'View real-time availability calendars.',
      'Cancel or reschedule sessions up to 24 hours prior.',
      'Receive post-session summaries and homework assignments.'
    ],
    cta: '/signup'
  },
  therapists: {
    label: 'For Therapists',
    headline: 'Manage your practice digitally.',
    points: [
      'Set custom hourly rates and availability windows.',
      'Automated payout processing via M-Pesa/Bank Transfer.',
      'Digital SOAP notes storage with HIPAA-compliant encryption.',
      'Client intake forms handled automatically.'
    ],
    cta: '/signup'
  },
  students: {
    label: 'For Students',
    headline: 'Affordable mental health support.',
    points: [
      'Verify via Karatina, UoN, KU, MMUST, and other partner emails.',
      'Subsidized session costs covered partially by university partnerships.',
      'Confidential access independent of campus counseling centers.',
      'Peer support groups available within verified networks.'
    ],
    cta: '/signup'
  },
  universities: {
    label: 'For Institutions',
    headline: 'Scalable wellbeing infrastructure.',
    points: [
      'Centralized dashboard for student mental health metrics (anonymized).',
      'Bulk credit allocation for financial aid programs.',
      'Integration with existing student portals via API.',
      'Dedicated account manager for implementation support.'
    ],
    cta: '/services'
  }
};

const LandingPage = ({ user }) => { // Keep user prop for future use, but we won't conditionally render buttons based on it now
  const [activeTab, setActiveTab] = useState('clients');

  return (
    <div className="app-container">
      
      {/* NAVBAR - Fixed to show "Sign In" as requested */}
      <header className="navbar container">
        <Link to="/" className="nav-brand">Mecac</Link>
        
        <nav className="nav-links">
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/privacy" className="nav-link">Privacy</Link>
          
          {/*  CHANGED: Always show "Sign In" linking to /login */}
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
        </nav>
      </header>

      {/* HERO SECTION - Full Width Background */}
      <section className="hero-bg">
        {/* 1. The Background Image */}
        <img 
          src="/assets/hero-nature.webp" 
          alt="" 
          aria-hidden="true" 
          className="hero-bg-image"
          loading="eager"
          decoding="async"
        />
        
        {/* 2. The Green Overlay */}
        <div className="hero-bg-overlay"></div>

        {/* 3. The Content */}
        <div className="hero-content-wrapper">
          <h1>Mental healthcare,<br/>delivered securely.</h1>
          
          <p>
            Connect with licensed therapists in Kenya. Book video sessions, track moods, 
            and manage payments in one platform. Verified for students and professionals.
          </p>
          
          <div className="hero-actions-dark">
            {/*  CHANGED: Always show "Create Account Now" linking to /signup */}
            <Link to="/signup" className="btn btn-white-solid">
              Create Account Now
            </Link>
            
            {/* Optional: You can keep a secondary link if you want, but I removed the conditional logic */}
            {/* If you want a "Sign In" here too, uncomment below: */}
            {/* <Link to="/login" className="btn btn-outline-light">Sign In</Link> */}
          </div>
          
          <p className="small" style={{ marginTop: 'var(--sp-6)', color: '#CBD5E1' }}>
            Data encrypted at rest and in transit. GDPR/Kenya DPA compliant.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container section-padding bg-alt">
        <h2>Core Capabilities</h2>
        <div className="features-grid">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container section-padding">
        <h2>Getting Started</h2>
        <div className="steps-list">
          {STEPS.map((step, idx) => (
            <div key={idx} className="step-item">
              <span className="step-num">{step.num}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="container section-padding bg-alt">
        <h2>Who we serve</h2>
        
        <div className="audience-tabs">
          {Object.keys(AUDIENCES).map(key => (
            <button 
              key={key}
              className={`tab-btn ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {AUDIENCES[key].label}
            </button>
          ))}
        </div>

        <div className="audience-content">
          <div className="audience-text">
            <h3>{AUDIENCES[activeTab].headline}</h3>
            <ul>
              {AUDIENCES[activeTab].points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
            <Link to={AUDIENCES[activeTab].cta} className="btn btn-primary" style={{ marginTop: 'var(--sp-6)' }}>
              {activeTab === 'universities' ? 'Contact Sales' : 'Join Now'}
            </Link>
          </div>
          
          <div className="hero-image-wrapper" style={{ minHeight: '300px', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
             <span className="small" style={{ color: '#ccc' }}>Visual Representation Area</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container section-padding" style={{ textAlign: 'left' }}>
        <div style={{ background: 'var(--brand-primary)', color: 'white', padding: 'var(--sp-12)', borderRadius: '8px' }}>
          <h2 style={{ color: 'white' }}>Ready to prioritize your wellbeing?</h2>
          <p style={{ color: '#cbd5e1', maxWidth: '600px' }}>
            Join thousands of Kenyans accessing affordable, professional mental health support today.
          </p>
          <div className="hero-actions" style={{ marginTop: 'var(--sp-6)' }}>
            <Link to="/signup" className="btn" style={{ background: 'white', color: 'var(--brand-primary)' }}>
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="container footer">
        <div className="footer-inner">
          <span>© {new Date().getFullYear()} Mecac Mental Care Connect.</span>
          <div style={{ display: 'flex', gap: 'var(--sp-6)' }}>
            <Link to="/terms" className="nav-link">Terms</Link>
            <Link to="/privacy" className="nav-link">Privacy</Link>
            <Link to="/contact" className="nav-link">Support</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;