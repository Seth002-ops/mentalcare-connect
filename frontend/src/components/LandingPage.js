import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css'; // Ensure this file exists in same folder
import { 
  IconShield, IconVideo, IconSparkle, IconHeart, IconCalendar, 
  IconGradCap, IconCheck, IconChevronDown, IconArrowRight, 
  IconLock, IconUsers, IconZap, IconServer, IconEye, IconBan 
} from './Icons'; // Ensure Icons.jsx exists in same folder

// ============ DATA CONSTANTS ============
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

const TRUST_BADGES = [
  {
    icon: <IconServer />,
    label: 'Redis Protected',
    sublabel: 'Real-time rate limiting',
    color: '#DC2626',
  },
  {
    icon: <IconBan />,
    label: 'IP Quarantine',
    sublabel: 'Automatic threat blocking',
    color: '#EA580C',
  },
  {
    icon: <IconEye />,
    label: 'Live Monitoring',
    sublabel: '24/7 security feed',
    color: '#2563EB',
  },
  {
    icon: <IconZap />,
    label: 'Instant Response',
    sublabel: 'Sub-millisecond checks',
    color: '#16A34A',
  },
];

// ============ COMPONENT ============
const LandingPage = ({ user }) => {
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Scroll Listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Intersection Observer for Reveal Animations
  useEffect(() => {
    const elements = document.querySelectorAll(`.${styles['lp-reveal']}`);
    
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add(styles['lp-visible']));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles['lp-visible']);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
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
      <header className={`${styles['lp-nav']} ${scrolled ? styles['lp-nav-scrolled'] : ''}`}>
        <div className={styles['lp-nav-inner']}>
          <Link to="/" className={styles['lp-brand']} aria-label="Mecac home">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="Mecac logo"
                className={styles['lp-logo']}
                onError={() => setLogoError(true)}
                width="38"
                height="38"
              />
            ) : (
              <span className={styles['lp-logo-fallback']}>M</span>
            )}
            <span className={styles['lp-brand-text']}>
              Mecac
              <span>Mental Care Connect</span>
            </span>
          </Link>

          <nav className={styles['lp-nav-links']} aria-label="Main navigation">
            <Link to="/services" className={styles['lp-hide-mobile']}>Services</Link>
            <Link to="/privacy" className={styles['lp-hide-mobile']}>Privacy</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className={styles['lp-nav-login']}>
                  My Dashboard
                </Link>
                <Link to="/dashboard" className={`${styles['lp-btn']} ${styles['lp-btn-primary']}`}>
                  Continue Care
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className={styles['lp-nav-login']}>Sign In</Link>
                <Link to="/signup" className={styles['lp-nav-cta']}>Create Account</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className={styles['lp-hero']}>
        <div className={styles['lp-hero-media']}>
          <img 
            src="/assets/hero-nature.webp" // Ensure this file is in public/assets/
            alt="A peaceful swing hanging from a tree by a serene lake, symbolizing mental clarity and rest" 
            className={styles['lp-hero-img']}
            loading="eager" 
            decoding="async"
            width="1920" 
            height="1080"
          />
        </div>
        
        <div className={styles['lp-hero-overlay']} />
        <div className={`${styles['lp-hero-orb']} ${styles['lp-hero-orb-one']}`} />
        <div className={`${styles['lp-hero-orb']} ${styles['lp-hero-orb-two']}`} />

        <div className={`${styles['lp-hero-content']} ${styles['lp-reveal']}`}>
          <span className={styles['lp-eyebrow']}>
            <IconShield /> Kenya's secure mental wellness platform
          </span>

          <h1 className={styles['lp-headline']}>
            Bridging You and Your Therapist,{' '}
            <span className={styles['lp-headline-accent']}>Safely</span>
          </h1>

          <p className={styles['lp-subhead']}>
            Find licensed therapists who understand you. Secure, confidential mental health support
            at your fingertips — whether you are a client, therapist, or university student.
          </p>

          <div className={styles['lp-hero-actions']}>
            <Link to="/signup" className={`${styles['lp-btn']} ${styles['lp-btn-primary']}`}>
              Get Started
            </Link>
            <Link to="/login" className={`${styles['lp-btn']} ${styles['lp-btn-secondary']}`}>
              Sign In
            </Link>
          </div>

          <div className={styles['lp-trust-row']}>
            <span className={styles['lp-trust-pill']}>
              <IconLock /> Encrypted chats
            </span>
            <span className={styles['lp-trust-pill']}>
              <IconCheck /> Verified therapists
            </span>
            <span className={styles['lp-trust-pill']}>
              <IconGradCap /> Student pricing
            </span>
          </div>
        </div>

        <button
          type="button"
          className={styles['lp-scroll-cue']}
          onClick={() => scrollToSection('features')}
          aria-label="Scroll to features"
        >
          <IconChevronDown />
        </button>
      </section>

      {/* TRUST STRIP */}
      <section className={styles['lp-trust-strip']}>
        <div className={styles['lp-trust-strip-inner']}>
          <div className={styles['lp-trust-strip-header']}>
            <IconShield />
            <span>Enterprise-Grade Security — Powered by Redis</span>
          </div>
          <div className={styles['lp-trust-badges-grid']}>
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label} className={styles['lp-trust-badge-card']}>
                <div 
                  className={styles['lp-trust-badge-icon']} 
                  style={{ background: `${badge.color}15`, color: badge.color }}
                >
                  {badge.icon}
                </div>
                <div className={styles['lp-trust-badge-text']}>
                  <span className={styles['lp-trust-badge-label']}>{badge.label}</span>
                  <span className={styles['lp-trust-badge-sub']}>{badge.sublabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={`${styles['lp-section']} ${styles['lp-section-light']}`}>
        <div className={styles['lp-container']}>
          <div className={`${styles['lp-section-head']} ${styles['lp-reveal']}`}>
            <span className={styles['lp-kicker']}>Why Mecac</span>
            <h2>Care that feels safe, human, and accessible</h2>
            <p>
              Mecac brings together therapy booking, secure communication, mood tracking, AI support,
              and practitioner tools in one calm, trusted environment.
            </p>
          </div>

          <div className={styles['lp-feature-grid']}>
            {FEATURES.map((feature) => (
              <article key={feature.title} className={`${styles['lp-feature-card']} ${styles['lp-reveal']}`}>
                <div className={styles['lp-feature-icon']}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className={`${styles['lp-section']} ${styles['lp-section-white']}`}>
        <div className={styles['lp-container']}>
          <div className={`${styles['lp-section-head']} ${styles['lp-reveal']}`}>
            <span className={styles['lp-kicker']}>How it works</span>
            <h2>Three simple steps to supported wellbeing</h2>
            <p>
              Whether you are seeking care or providing it, Mecac is designed to reduce friction and
              increase trust.
            </p>
          </div>

          <div className={styles['lp-steps']}>
            {STEPS.map((step, index) => (
              <article key={step.title} className={`${styles['lp-step']} ${styles['lp-reveal']}`}>
                <div className={styles['lp-step-number']}>{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCES */}
      <section id="audiences" className={`${styles['lp-section']} ${styles['lp-section-tint']}`}>
        <div className={styles['lp-container']}>
          <div className={`${styles['lp-section-head']} ${styles['lp-reveal']}`}>
            <span className={styles['lp-kicker']}>Who it's for</span>
            <h2>Built for clients, therapists, students, and universities</h2>
            <p>
              Mental health is an ecosystem. Mecac connects the people who need support with the
              professionals and institutions that provide it.
            </p>
          </div>

          <div className={styles['lp-audience-grid']}>
            {AUDIENCES.map((audience) => (
              <article
                key={audience.title}
                className={`${styles['lp-audience-card']} ${styles['lp-reveal']} ${audience.dark ? styles['lp-audience-dark'] : ''}`}
              >
                <div className={styles['lp-audience-icon']}>{audience.icon}</div>
                <h3>{audience.title}</h3>
                <p>{audience.text}</p>

                <ul>
                  {audience.points.map((point) => (
                    <li key={point}>
                      <IconCheck /> {point}
                    </li>
                  ))}
                </ul>

                <Link to={audience.to} className={styles['lp-audience-link']}>
                  {audience.cta} <IconArrowRight />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section id="safety" className={`${styles['lp-section']} ${styles['lp-section-white']}`}>
        <div className={styles['lp-container']}>
          <div className={`${styles['lp-safety-panel']} ${styles['lp-reveal']}`}>
            <div>
              <span className={styles['lp-kicker']}>Safety & privacy</span>
              <h2 className={styles['lp-safety-title']}>Your mental health data deserves protection</h2>
              <p className={styles['lp-safety-copy']}>
                Mecac is built with privacy as a core principle, not an afterthought. From encrypted
                messaging to controlled clinical notes and verified therapist access, every layer is
                designed to help people seek help without fear.
              </p>

              <div className={styles['lp-safety-list']}>
                {SAFETY_POINTS.map((point) => (
                  <div key={point} className={styles['lp-safety-item']}>
                    <span className={styles['lp-safety-check']}>
                      <IconCheck />
                    </span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles['lp-safety-visual']}>
              <div className={styles['lp-safety-stat']}>
                <span className={styles['lp-safety-stat-icon']}>
                  <IconLock />
                </span>
                <div>
                  <strong>Secure messaging</strong>
                  <p>Private conversations between client and therapist</p>
                </div>
              </div>

              <div className={styles['lp-safety-stat']}>
                <span className={styles['lp-safety-stat-icon']}>
                  <IconShield />
                </span>
                <div>
                  <strong>Verified care</strong>
                  <p>Therapists reviewed before platform approval</p>
                </div>
              </div>

              <div className={styles['lp-safety-stat']}>
                <span className={styles['lp-safety-stat-icon']}>
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
      <section className={styles['lp-cta']}>
        <div className={`${styles['lp-cta-orb']} ${styles['lp-cta-orb-one']}`} />
        <div className={`${styles['lp-cta-orb']} ${styles['lp-cta-orb-two']}`} />

        <div className={`${styles['lp-container']} ${styles['lp-cta-content']} ${styles['lp-reveal']}`}>
          <h2>Ready to take the first step?</h2>
          <p>
            Join Mecac today and experience mental health support that is secure, compassionate, and
            built for Kenya.
          </p>

          <div className={styles['lp-hero-actions']}>
            <Link to="/signup" className={`${styles['lp-btn']} ${styles['lp-btn-white']}`}>
              Create Account
            </Link>
            <Link to="/services" className={`${styles['lp-btn']} ${styles['lp-btn-outline-white']}`}>
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles['lp-footer']}>
        <div className={styles['lp-container']}>
          <div className={styles['lp-footer-inner']}>
            <div className={styles['lp-footer-brand']}>
              <div className={styles['lp-brand']} style={{ color: 'white' }}>
                {!logoError ? (
                  <img
                    src="/logo.png"
                    alt="Mecac logo"
                    className={styles['lp-logo']}
                    onError={() => setLogoError(true)}
                    width="38"
                    height="38"
                  />
                ) : (
                  <span className={styles['lp-logo-fallback']}>M</span>
                )}
                <span className={styles['lp-brand-text']}>
                  Mecac
                  <span>Mental Care Connect</span>
                </span>
              </div>

              <p>
                Secure mental wellness platform connecting clients, therapists, students, and
                universities across Kenya.
              </p>
            </div>

            <div className={styles['lp-footer-links']}>
              <Link to="/services">Services</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/login">Sign In</Link>
              <Link to="/signup">Create Account</Link>
            </div>
          </div>

          <div className={styles['lp-footer-bottom']}>
            <span>© {new Date().getFullYear()} Mecac. All rights reserved.</span>
            <span>Built with care for safer mental health support.</span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;