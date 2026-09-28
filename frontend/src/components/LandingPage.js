import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ============ ICONS ============
const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconVideo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const IconSparkle = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9z" />
    <line x1="19" y1="3" x2="19" y2="7" />
    <line x1="17" y1="5" x2="21" y2="5" />
    <line x1="5" y1="17" x2="5" y2="21" />
    <line x1="3" y1="19" x2="7" y2="19" />
  </svg>
);

const IconHeart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IconCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconGradCap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// ============ DATA ============
const FEATURES = [
  {
    icon: <IconShield />,
    title: 'Privacy First',
    text: 'Your conversations are protected with encryption and strict access rules. Therapy should feel safe, not exposed.',
  },
  {
    icon: <IconVideo />,
    title: 'Video & Voice Sessions',
    text: 'Connect face-to-face or by voice from anywhere in Kenya. Secure sessions designed for real therapeutic conversations.',
  },
  {
    icon: <IconSparkle />,
    title: 'AI Support Between Sessions',
    text: 'Get gentle coping prompts, mood reflections, and guidance while you wait for your next therapist session.',
  },
  {
    icon: <IconHeart />,
    title: 'Mood Tracking',
    text: 'Check in daily, notice patterns, and share meaningful insights with your therapist when you are ready.',
  },
  {
    icon: <IconCalendar />,
    title: 'Simple Booking',
    text: 'Browse available therapists, choose a time that works for you, and confirm your session in a few clicks.',
  },
  {
    icon: <IconGradCap />,
    title: 'Student Pricing',
    text: 'Verified university students can access more affordable mental health support through institutional partnerships.',
  },
];

const STEPS = [
  {
    title: 'Create your account',
    text: 'Sign up as a client, therapist, or student. Accept our terms and start in a secure environment.',
  },
  {
    title: 'Choose your care path',
    text: 'Browse therapists, check availability, and book a session that fits your schedule and budget.',
  },
  {
    title: 'Connect securely',
    text: 'Chat, call, or meet by video. Track your mood, review sessions, and grow at your own pace.',
  },
];

const AUDIENCES = [
  {
    title: 'For Clients',
    text: 'Find compassionate support without the friction of traditional booking systems.',
    icon: <IconHeart />,
    points: ['Browse licensed therapists', 'Book secure sessions', 'Track mood privately'],
    to: '/signup',
    cta: 'Start your journey',
    dark: false,
  },
  {
    title: 'For Therapists',
    text: 'Manage your practice, clients, availability, earnings, and clinical notes in one portal.',
    icon: <IconUsers />,
    points: ['Set your schedule', 'Manage clients', 'Withdraw earnings'],
    to: '/signup',
    cta: 'Join as therapist',
    dark: true,
  },
  {
    title: 'For Students',
    text: 'Access affordable mental health care using your verified university email.',
    icon: <IconGradCap />,
    points: ['University verification', 'Student-friendly pricing', 'Confidential support'],
    to: '/signup',
    cta: 'Check eligibility',
    dark: false,
  },
  {
    title: 'For Universities',
    text: 'Partner with Mecac to provide scalable wellbeing support for your student community.',
    icon: <IconShield />,
    points: ['Institutional dashboard', 'Credit pools', 'Student wellbeing reporting'],
    to: '/services',
    cta: 'Explore partnership',
    dark: true,
  },
];

const SAFETY_POINTS = [
  'End-to-end encrypted messaging',
  'Role-based access to clinical records',
  'Therapist verification before approval',
  'Private mood tracking and session notes',
  'University email verification for student pricing',
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll('.lp-reveal');

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('lp-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <header className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <Link to="/" className="lp-brand" aria-label="Mecac home">
            {!logoError ? (
              <img
                src="/logo.PNG"
                alt="Mecac logo"
                className="lp-logo"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="lp-logo-fallback">M</span>
            )}
            <span className="lp-brand-text">
              Mecac
              <span>Mental Care Connect</span>
            </span>
          </Link>

          <nav className="lp-nav-links" aria-label="Main navigation">
            <Link to="/services" className="lp-hide-mobile">
              Services
            </Link>
            <Link to="/privacy" className="lp-hide-mobile">
              Privacy
            </Link>
            <Link to="/login" className="lp-nav-login">
              Sign In
            </Link>
            <Link to="/signup" className="lp-nav-cta">
              Create Account
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="lp-hero-overlay" />
        <div className="lp-hero-orb lp-hero-orb-one" />
        <div className="lp-hero-orb lp-hero-orb-two" />

        <div className="lp-hero-content lp-reveal">
          <span className="lp-eyebrow">
            <IconShield /> Kenya’s secure mental wellness platform
          </span>

          <h1 className="lp-headline">
            Bridging You and Your Therapist,{' '}
            <span className="lp-headline-accent">Safely</span>
          </h1>

          <p className="lp-subhead">
            Find licensed therapists who understand you. Secure, confidential mental health support
            at your fingertips — whether you are a client, therapist, or university student.
          </p>

          <div className="lp-hero-actions">
            <Link to="/signup" className="lp-btn lp-btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="lp-btn lp-btn-secondary">
              Sign In
            </Link>
          </div>

          <div className="lp-trust-row">
            <span className="lp-trust-pill">
              <IconLock /> Encrypted chats
            </span>
            <span className="lp-trust-pill">
              <IconCheck /> Verified therapists
            </span>
            <span className="lp-trust-pill">
              <IconGradCap /> Student pricing
            </span>
          </div>
        </div>

        <button
          type="button"
          className="lp-scroll-cue"
          onClick={() => scrollToSection('features')}
          aria-label="Scroll to features"
        >
          <IconChevronDown />
        </button>
      </section>

      {/* FEATURES */}
      <section id="features" className="lp-section lp-section-light">
        <div className="lp-container">
          <div className="lp-section-head lp-reveal">
            <span className="lp-kicker">Why Mecac</span>
            <h2>Care that feels safe, human, and accessible</h2>
            <p>
              Mecac brings together therapy booking, secure communication, mood tracking, AI support,
              and practitioner tools in one calm, trusted environment.
            </p>
          </div>

          <div className="lp-feature-grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="lp-feature-card lp-reveal">
                <div className="lp-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="lp-section lp-section-white">
        <div className="lp-container">
          <div className="lp-section-head lp-reveal">
            <span className="lp-kicker">How it works</span>
            <h2>Three simple steps to supported wellbeing</h2>
            <p>
              Whether you are seeking care or providing it, Mecac is designed to reduce friction and
              increase trust.
            </p>
          </div>

          <div className="lp-steps">
            {STEPS.map((step, index) => (
              <article key={step.title} className="lp-step lp-reveal">
                <div className="lp-step-number">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCES */}
      <section id="audiences" className="lp-section lp-section-tint">
        <div className="lp-container">
          <div className="lp-section-head lp-reveal">
            <span className="lp-kicker">Who it’s for</span>
            <h2>Built for clients, therapists, students, and universities</h2>
            <p>
              Mental health is a ecosystem. Mecac connects the people who need support with the
              professionals and institutions that provide it.
            </p>
          </div>

          <div className="lp-audience-grid">
            {AUDIENCES.map((audience) => (
              <article
                key={audience.title}
                className={`lp-audience-card lp-reveal ${audience.dark ? 'lp-audience-dark' : ''}`}
              >
                <div className="lp-audience-icon">{audience.icon}</div>
                <h3>{audience.title}</h3>
                <p>{audience.text}</p>

                <ul>
                  {audience.points.map((point) => (
                    <li key={point}>
                      <IconCheck /> {point}
                    </li>
                  ))}
                </ul>

                <Link to={audience.to} className="lp-audience-link">
                  {audience.cta} <IconArrowRight />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section id="safety" className="lp-section lp-section-white">
        <div className="lp-container">
          <div className="lp-safety-panel lp-reveal">
            <div>
              <span className="lp-kicker">Safety & privacy</span>
              <h2 className="lp-safety-title">Your mental health data deserves protection</h2>
              <p className="lp-safety-copy">
                Mecac is built with privacy as a core principle, not an afterthought. From encrypted
                messaging to controlled clinical notes and verified therapist access, every layer is
                designed to help people seek help without fear.
              </p>

              <div className="lp-safety-list">
                {SAFETY_POINTS.map((point) => (
                  <div key={point} className="lp-safety-item">
                    <span className="lp-safety-check">
                      <IconCheck />
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lp-safety-visual">
              <div className="lp-safety-stat">
                <span className="lp-safety-stat-icon">
                  <IconLock />
                </span>
                <div>
                  <strong>Secure messaging</strong>
                  <p>Private conversations between client and therapist</p>
                </div>
              </div>

              <div className="lp-safety-stat">
                <span className="lp-safety-stat-icon">
                  <IconShield />
                </span>
                <div>
                  <strong>Verified care</strong>
                  <p>Therapists reviewed before platform approval</p>
                </div>
              </div>

              <div className="lp-safety-stat">
                <span className="lp-safety-stat-icon">
                  <IconGradCap />
                </span>
                <div>
                  <strong>Student trust</strong>
                  <p>University email verification for pricing access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-cta">
        <div className="lp-cta-orb lp-cta-orb-one" />
        <div className="lp-cta-orb lp-cta-orb-two" />

        <div className="lp-container lp-cta-content lp-reveal">
          <h2>Ready to take the first step?</h2>
          <p>
            Join Mecac today and experience mental health support that is secure, compassionate, and
            built for Kenya.
          </p>

          <div className="lp-hero-actions">
            <Link to="/signup" className="lp-btn lp-btn-white">
              Create Account
            </Link>
            <Link to="/services" className="lp-btn lp-btn-outline-white">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-inner">
            <div className="lp-footer-brand">
              <div className="lp-brand" style={{ color: 'white' }}>
                {!logoError ? (
                  <img
                    src="/logo.PNG"
                    alt="Mecac logo"
                    className="lp-logo"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="lp-logo-fallback">M</span>
                )}
                <span className="lp-brand-text">
                  Mecac
                  <span>Mental Care Connect</span>
                </span>
              </div>

              <p>
                Secure mental wellness platform connecting clients, therapists, students, and
                universities across Kenya.
              </p>
            </div>

            <div className="lp-footer-links">
              <Link to="/services">Services</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/login">Sign In</Link>
              <Link to="/signup">Create Account</Link>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <span>© {new Date().getFullYear()} Mecac. All rights reserved.</span>
            <span>Built with care for safer mental health support.</span>
          </div>
        </div>
      </footer>

      <style>{`
        .lp-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 0.9rem 0;
          transition: all 0.25s ease;
        }

        .lp-nav-scrolled {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
        }

        .lp-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .lp-brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          color: white;
        }

        .lp-nav-scrolled .lp-brand {
          color: #111827;
        }

        .lp-logo {
          width: 38px;
          height: 38px;
          object-fit: contain;
          border-radius: 10px;
          background: white;
          padding: 2px;
          box-sizing: border-box;
        }

        .lp-logo-fallback {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2E7D32, #66BB6A);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          box-shadow: 0 8px 18px rgba(46, 125, 50, 0.22);
        }

        .lp-brand-text {
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .lp-brand-text span {
          font-size: 0.7rem;
          font-weight: 700;
          opacity: 0.75;
          letter-spacing: 0.02em;
        }

        .lp-nav-links {
          display: flex;
          align-items: center;
          gap: 1.1rem;
        }

        .lp-nav-links a {
          color: rgba(255, 255, 255, 0.86);
          text-decoration: none;
          font-weight: 650;
          font-size: 0.92rem;
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .lp-nav-scrolled .lp-nav-links a {
          color: #374151;
        }

        .lp-nav-links a:hover {
          color: white;
        }

        .lp-nav-scrolled .lp-nav-links a:hover {
          color: #2E7D32;
        }

        .lp-nav-login {
          padding: 0.55rem 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 999px;
        }

        .lp-nav-scrolled .lp-nav-login {
          border-color: #D1D5DB;
        }

        .lp-nav-cta {
          background: #2E7D32;
          color: white !important;
          padding: 0.62rem 1.05rem;
          border-radius: 999px;
          box-shadow: 0 10px 22px rgba(46, 125, 50, 0.22);
        }

        .lp-nav-cta:hover {
          transform: translateY(-1px);
          background: #1B5E20;
        }

        .lp-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 7rem 20px 5rem;
          color: white;
        }

        .lp-hero-bg {
          position: absolute;
          inset: 0;
          background-image: url('https://images.pexels.com/photos/6962625/pexels-photo-6962625.jpeg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transform: scale(1.03);
          animation: lpHeroZoom 18s ease-in-out infinite alternate;
        }

        .lp-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(10, 28, 34, 0.78),
            rgba(46, 125, 50, 0.42),
            rgba(10, 28, 34, 0.82)
          );
        }

        .lp-hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(16px);
          pointer-events: none;
          animation: lpFloat 8s ease-in-out infinite;
        }

        .lp-hero-orb-one {
          width: 280px;
          height: 280px;
          top: 10%;
          left: -80px;
          background: radial-gradient(circle, rgba(102, 187, 106, 0.34), transparent 70%);
        }

        .lp-hero-orb-two {
          width: 320px;
          height: 320px;
          bottom: 8%;
          right: -100px;
          background: radial-gradient(circle, rgba(144, 202, 249, 0.24), transparent 72%);
          animation-delay: 1.2s;
        }

        .lp-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          text-align: center;
        }

        .lp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.9rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          margin-bottom: 1.25rem;
          color: rgba(255, 255, 255, 0.94);
        }

        .lp-headline {
          font-size: clamp(2.4rem, 6vw, 4.2rem);
          line-height: 1.05;
          margin: 0 0 1.25rem;
          font-weight: 900;
          letter-spacing: -0.035em;
        }

        .lp-headline-accent {
          background: linear-gradient(90deg, #A5D6A7, #FFFFFF, #90CAF9);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .lp-subhead {
          font-size: clamp(1rem, 2.2vw, 1.25rem);
          line-height: 1.7;
          max-width: 760px;
          margin: 0 auto 2.25rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .lp-hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .lp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          min-height: 52px;
          padding: 0 1.75rem;
          border-radius: 999px;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.22s ease;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .lp-btn-primary {
          background: #2E7D32;
          color: white;
          box-shadow: 0 14px 30px rgba(46, 125, 50, 0.32);
        }

        .lp-btn-primary:hover {
          transform: translateY(-2px);
          background: #1B5E20;
          box-shadow: 0 18px 36px rgba(46, 125, 50, 0.38);
        }

        .lp-btn-secondary {
          background: rgba(255, 255, 255, 0.10);
          color: white;
          border-color: rgba(255, 255, 255, 0.34);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .lp-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: translateY(-2px);
        }

        .lp-btn-white {
          background: white;
          color: #1B5E20;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
        }

        .lp-btn-white:hover {
          transform: translateY(-2px);
        }

        .lp-btn-outline-white {
          background: transparent;
          color: white;
          border-color: rgba(255, 255, 255, 0.45);
        }

        .lp-btn-outline-white:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
        }

        .lp-trust-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
        }

        .lp-trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 0.9rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.10);
          border: 1px solid rgba(255, 255, 255, 0.18);
          font-size: 0.82rem;
          font-weight: 650;
          color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .lp-scroll-cue {
          position: absolute;
          bottom: 1.75rem;
          left: 50%;
          margin-left: -22px;
          z-index: 3;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.10);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          animation: lpBounce 2s infinite;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .lp-section {
          padding: 6rem 0;
        }

        .lp-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .lp-section-light {
          background: #F9FAFB;
        }

        .lp-section-white {
          background: white;
        }

        .lp-section-tint {
          background: linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%);
        }

        .lp-section-head {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 3.5rem;
        }

        .lp-kicker {
          display: inline-block;
          color: #2E7D32;
          font-weight: 800;
          font-size: 0.82rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .lp-section-head h2,
        .lp-safety-title {
          font-size: clamp(1.9rem, 4vw, 2.75rem);
          line-height: 1.15;
          margin: 0 0 1rem;
          color: #111827;
          letter-spacing: -0.03em;
        }

        .lp-section-head p,
        .lp-safety-copy {
          color: #4B5563;
          font-size: 1.05rem;
          line-height: 1.7;
          margin: 0;
        }

        .lp-feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .lp-feature-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 22px;
          padding: 2rem 1.75rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .lp-feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #2E7D32, #66BB6A, #90CAF9);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .lp-feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 22px 45px rgba(0, 0, 0, 0.09);
          border-color: #C8E6C9;
        }

        .lp-feature-card:hover::before {
          opacity: 1;
        }

        .lp-feature-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          background: #E8F5E9;
          color: #2E7D32;
        }

        .lp-feature-card h3 {
          margin: 0 0 0.65rem;
          font-size: 1.2rem;
          color: #111827;
        }

        .lp-feature-card p {
          margin: 0;
          color: #4B5563;
          line-height: 1.65;
          font-size: 0.98rem;
        }

        .lp-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }

        .lp-step {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          padding: 2rem 1.75rem;
          position: relative;
          transition: all 0.25s ease;
        }

        .lp-step:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.07);
          border-color: #C8E6C9;
        }

        .lp-step-number {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: #2E7D32;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          margin-bottom: 1rem;
          box-shadow: 0 10px 20px rgba(46, 125, 50, 0.2);
        }

        .lp-step h3 {
          margin: 0 0 0.65rem;
          font-size: 1.15rem;
          color: #111827;
        }

        .lp-step p {
          margin: 0;
          color: #4B5563;
          line-height: 1.65;
        }

        .lp-audience-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.25rem;
        }

        .lp-audience-card {
          border-radius: 22px;
          padding: 2rem 1.75rem;
          border: 1px solid #E5E7EB;
          background: white;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.25s ease;
        }

        .lp-audience-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 42px rgba(0, 0, 0, 0.08);
        }

        .lp-audience-dark {
          background: linear-gradient(135deg, #0A1C22, #153A2A);
          color: white;
          border-color: rgba(255, 255, 255, 0.12);
        }

        .lp-audience-dark h3,
        .lp-audience-dark p,
        .lp-audience-dark li {
          color: white;
        }

        .lp-audience-dark p {
          opacity: 0.86;
        }

        .lp-audience-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #E8F5E9;
          color: #2E7D32;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lp-audience-dark .lp-audience-icon {
          background: rgba(255, 255, 255, 0.12);
          color: #A5D6A7;
        }

        .lp-audience-card h3 {
          margin: 0;
          font-size: 1.2rem;
          color: #111827;
        }

        .lp-audience-card p {
          margin: 0;
          color: #4B5563;
          line-height: 1.65;
        }

        .lp-audience-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.6rem;
        }

        .lp-audience-card li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          color: #374151;
          font-size: 0.92rem;
          line-height: 1.5;
        }

        .lp-audience-card li svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #2E7D32;
        }

        .lp-audience-dark li svg {
          color: #A5D6A7;
        }

        .lp-audience-link {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: #2E7D32;
          font-weight: 800;
          text-decoration: none;
          transition: gap 0.2s ease, color 0.2s ease;
        }

        .lp-audience-dark .lp-audience-link {
          color: #A5D6A7;
        }

        .lp-audience-link:hover {
          gap: 0.7rem;
        }

        .lp-safety-panel {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2rem;
          align-items: center;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 28px;
          padding: 2.5rem;
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.06);
        }

        .lp-safety-list {
          display: grid;
          gap: 1rem;
          margin-top: 1.75rem;
        }

        .lp-safety-item {
          display: flex;
          gap: 0.85rem;
          align-items: flex-start;
          color: #374151;
          font-weight: 650;
          line-height: 1.5;
        }

        .lp-safety-check {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #E8F5E9;
          color: #2E7D32;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .lp-safety-visual {
          border-radius: 22px;
          background: linear-gradient(135deg, #E8F5E9, #E0F2FE);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 320px;
          justify-content: center;
        }

        .lp-safety-stat {
          background: white;
          border-radius: 18px;
          padding: 1.15rem;
          border: 1px solid #E5E7EB;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
          display: flex;
          gap: 0.85rem;
          align-items: center;
        }

        .lp-safety-stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #F0FDF4;
          color: #2E7D32;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .lp-safety-stat strong {
          display: block;
          color: #111827;
          margin-bottom: 2px;
        }

        .lp-safety-stat p {
          margin: 0;
          color: #6B7280;
          font-size: 0.88rem;
          line-height: 1.45;
        }

        .lp-cta {
          position: relative;
          overflow: hidden;
          padding: 5.5rem 0;
          background: linear-gradient(135deg, #1B5E20, #2E7D32 55%, #1565C0);
          color: white;
          text-align: center;
        }

        .lp-cta-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(18px);
          pointer-events: none;
        }

        .lp-cta-orb-one {
          width: 260px;
          height: 260px;
          top: -60px;
          left: -60px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 70%);
        }

        .lp-cta-orb-two {
          width: 300px;
          height: 300px;
          bottom: -80px;
          right: -80px;
          background: radial-gradient(circle, rgba(165, 214, 167, 0.22), transparent 72%);
        }

        .lp-cta-content {
          position: relative;
          z-index: 2;
          max-width: 760px;
        }

        .lp-cta h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          margin: 0 0 1rem;
          line-height: 1.12;
          letter-spacing: -0.03em;
        }

        .lp-cta p {
          font-size: 1.08rem;
          line-height: 1.7;
          opacity: 0.92;
          margin: 0 0 2rem;
        }

        .lp-footer {
          background: #0A1C22;
          color: rgba(255, 255, 255, 0.72);
          padding: 3rem 0 2rem;
        }

        .lp-footer-inner {
          display: flex;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .lp-footer-brand {
          max-width: 420px;
        }

        .lp-footer-brand p {
          margin: 1rem 0 0;
          line-height: 1.7;
          font-size: 0.92rem;
        }

        .lp-footer-links {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
          align-items: flex-start;
        }

        .lp-footer-links a {
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          font-weight: 650;
          font-size: 0.92rem;
          transition: color 0.2s ease;
        }

        .lp-footer-links a:hover {
          color: white;
        }

        .lp-footer-bottom {
          margin-top: 2rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.10);
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.82rem;
        }

        .lp-reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }

        .lp-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes lpHeroZoom {
          from {
            transform: scale(1.03);
          }
          to {
            transform: scale(1.08);
          }
        }

        @keyframes lpFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes lpBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(8px);
          }
        }

        @media (max-width: 900px) {
          .lp-safety-panel {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 860px) {
          .lp-hide-mobile {
            display: none;
          }

          .lp-nav-links {
            gap: 0.7rem;
          }

          .lp-nav-login {
            padding: 0.5rem 0.75rem;
            font-size: 0.85rem;
          }

          .lp-nav-cta {
            padding: 0.58rem 0.9rem;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 640px) {
          .lp-hero {
            padding: 6.5rem 16px 4rem;
          }

          .lp-section {
            padding: 4.5rem 0;
          }

          .lp-safety-panel {
            padding: 1.75rem;
          }

          .lp-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lp-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .lp-hero-bg,
          .lp-hero-orb,
          .lp-scroll-cue {
            animation: none !important;
          }

          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </>
  );
};

export default LandingPage;