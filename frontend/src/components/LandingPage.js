import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    title: 'Private by design',
    text: 'Messages between you and your therapist are encrypted, and your records stay under role-based access controls.',
  },
  {
    title: 'Video and voice sessions',
    text: 'Meet face-to-face or by voice from anywhere in Kenya, on a schedule that works for both of you.',
  },
  {
    title: 'Support between sessions',
    text: 'Gentle coping prompts and mood reflections help you hold the work you do in therapy between visits.',
  },
  {
    title: 'Mood tracking',
    text: 'Check in with yourself daily, notice patterns over time, and share what you choose with your therapist.',
  },
  {
    title: 'Straightforward booking',
    text: 'Browse verified therapists, see real availability, and confirm a session in a few clicks.',
  },
  {
    title: 'Student pricing',
    text: 'Verified university students pay less for care through partnerships with their institutions.',
  },
];

const STEPS = [
  {
    title: 'Create your account',
    text: 'Sign up as a client, therapist, or student and accept the terms in a secure environment.',
  },
  {
    title: 'Choose your care path',
    text: 'Browse therapists, check who is available when you are, and book a time that fits your week.',
  },
  {
    title: 'Connect securely',
    text: 'Chat, call, or meet by video. Track your mood and review your progress at your own pace.',
  },
];

const AUDIENCES = [
  {
    title: 'Clients',
    text: 'Find licensed support without the friction of traditional booking systems. Book, pay, and meet in one place.',
    points: ['Browse verified therapists', 'Book secure sessions', 'Track your mood privately'],
    to: '/signup',
    cta: 'Create a client account',
  },
  {
    title: 'Therapists',
    text: 'Run your practice from one portal: clients, availability, earnings, and clinical notes.',
    points: ['Set your weekly schedule', 'Manage clients and notes', 'Withdraw earnings'],
    to: '/signup',
    cta: 'Join as a therapist',
  },
  {
    title: 'Students',
    text: 'Access affordable care with your verified university email. Support stays confidential.',
    points: ['University verification', 'Student-friendly pricing', 'Confidential support'],
    to: '/signup',
    cta: 'Check student pricing',
  },
  {
    title: 'Universities',
    text: 'Partner with Mecac to offer scalable wellbeing support to your student community.',
    points: ['Institutional dashboard', 'Credit pools', 'Wellbeing reporting'],
    to: '/services',
    cta: 'Explore partnerships',
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
  return (
    <div className="lp">
      <a href="#main" className="lp-skip">
        Skip to content
      </a>

      <header className="lp-header">
        <div className="lp-shell lp-header-inner">
          <Link to="/" className="lp-brand">
            Mecac
            <span>Mental Care Connect</span>
          </Link>
          <nav className="lp-header-nav" aria-label="Main">
            <Link to="/services" className="lp-nav-link lp-hide-mobile">
              Services
            </Link>
            <Link to="/privacy" className="lp-nav-link lp-hide-mobile">
              Privacy
            </Link>
            <Link to="/login" className="lp-nav-link">
              Sign in
            </Link>
            <Link to="/signup" className="lp-btn lp-btn-primary lp-btn-small">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="lp-hero">
          <div className="lp-shell lp-hero-grid">
            <div className="lp-hero-copy">
              <h1>
                Talk to a licensed therapist, safely and on your schedule.
              </h1>
              <p className="lp-lede">
                Mecac connects you to verified mental health professionals across
                Kenya. Book a session, meet by video or chat, and keep your
                journey private.
              </p>
              <div className="lp-hero-actions">
                <Link to="/signup" className="lp-btn lp-btn-primary">
                  Create your account
                </Link>
                <Link to="/login" className="lp-btn lp-btn-ghost">
                  Sign in
                </Link>
              </div>
              <ul className="lp-trust">
                <li>Encrypted sessions</li>
                <li>Verified therapists</li>
                <li>Student pricing</li>
              </ul>
            </div>

            <aside className="lp-slip" aria-label="Example session confirmation">
              <p className="lp-slip-label">Session confirmation</p>
              <p className="lp-slip-name">Dr. Amina Yusuf</p>
              <p className="lp-slip-meta">Clinical psychologist, Nairobi</p>
              <dl className="lp-slip-rows">
                <div>
                  <dt>Day</dt>
                  <dd>Thursday</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>4:30 pm</dd>
                </div>
                <div>
                  <dt>Session</dt>
                  <dd>Video, 50 minutes</dd>
                </div>
                <div>
                  <dt>Fee</dt>
                  <dd>KSh 1,500</dd>
                </div>
              </dl>
              <p className="lp-slip-status">
                Confirmed. Your join link is in your email.
              </p>
            </aside>
          </div>
        </section>

        <section className="lp-section" id="features">
          <div className="lp-shell">
            <h2 className="lp-title">What Mecac does</h2>
            <div className="lp-feature-grid">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="lp-feature">
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-section-tint" id="how-it-works">
          <div className="lp-shell">
            <h2 className="lp-title">How it works</h2>
            <ol className="lp-steps">
              {STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className="lp-step-num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="lp-section" id="audiences">
          <div className="lp-shell">
            <h2 className="lp-title">Built for everyone in the room</h2>
            <div className="lp-audience-list">
              {AUDIENCES.map((audience) => (
                <article key={audience.title} className="lp-audience">
                  <h3>{audience.title}</h3>
                  <div className="lp-audience-body">
                    <p>{audience.text}</p>
                    <ul>
                      {audience.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <Link to={audience.to} className="lp-audience-cta">
                      {audience.cta}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-section-tint" id="safety">
          <div className="lp-shell lp-safety-grid">
            <div>
              <h2 className="lp-title">Your data deserves protection</h2>
              <p className="lp-safety-copy">
                Privacy is a principle here, not a feature. From encrypted
                messaging to controlled clinical notes, every layer exists so
                people can seek help without fear.
              </p>
            </div>
            <ul className="lp-safety-list">
              {SAFETY_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lp-cta-band">
          <div className="lp-shell">
            <h2>Start with one conversation.</h2>
            <div className="lp-hero-actions">
              <Link to="/signup" className="lp-btn lp-btn-white">
                Create your account
              </Link>
              <Link to="/services" className="lp-cta-link">
                Explore services
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-shell">
          <div className="lp-footer-inner">
            <div className="lp-footer-brand">
              <span className="lp-brand lp-brand-footer">Mecac</span>
              <p>
                A secure mental wellness platform connecting clients, therapists,
                students, and universities across Kenya.
              </p>
            </div>
            <nav className="lp-footer-links" aria-label="Footer">
              <Link to="/services">Services</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/login">Sign in</Link>
              <Link to="/signup">Create account</Link>
            </nav>
          </div>
          <div className="lp-footer-bottom">
            <span>© {new Date().getFullYear()} Mecac. All rights reserved.</span>
            <span>Built for safer mental health support.</span>
          </div>
        </div>
      </footer>

      <style>{`
        .lp {
          background: #F8F7F4;
          color: #1A2E22;
          font-family: "Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
        }

        .lp *,
        .lp *::before,
        .lp *::after {
          box-sizing: border-box;
        }

        .lp-shell {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .lp h1,
        .lp h2,
        .lp h3,
        .lp-brand,
        .lp-step-num,
        .lp-slip-name {
          font-family: "Fraunces", Georgia, "Times New Roman", serif;
          letter-spacing: -0.01em;
        }

        /* Skip link */
        .lp-skip {
          position: absolute;
          left: -9999px;
          top: 0;
          background: #14532D;
          color: #fff;
          padding: 0.6rem 1rem;
          z-index: 100;
          text-decoration: none;
        }

        .lp-skip:focus {
          left: 8px;
          top: 8px;
        }

        /* Header */
        .lp-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(248, 247, 244, 0.96);
          border-bottom: 1px solid #E2E0D8;
        }

        .lp-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          height: 68px;
        }

        .lp-brand {
          font-size: 1.35rem;
          font-weight: 600;
          color: #14532D;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .lp-brand span {
          font-family: "Public Sans", sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          color: #5B7A66;
          letter-spacing: 0.02em;
        }

        .lp-header-nav {
          display: flex;
          align-items: center;
          gap: 1.4rem;
        }

        .lp-nav-link {
          color: #1A2E22;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.15s ease;
        }

        .lp-nav-link:hover {
          color: #14532D;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        /* Buttons */
        .lp-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.98rem;
          text-decoration: none;
          border: 1px solid transparent;
          transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
          cursor: pointer;
        }

        .lp-btn-small {
          min-height: 40px;
          padding: 0 1rem;
          font-size: 0.9rem;
        }

        .lp-btn-primary {
          background: #14532D;
          color: #fff;
        }

        .lp-btn-primary:hover {
          background: #0F3D22;
        }

        .lp-btn-ghost {
          background: transparent;
          color: #14532D;
          border-color: #C9CDBF;
        }

        .lp-btn-ghost:hover {
          border-color: #14532D;
        }

        .lp-btn-white {
          background: #fff;
          color: #14532D;
        }

        .lp-btn-white:hover {
          background: #E8F0E4;
        }

        .lp :is(a, button):focus-visible {
          outline: 2px solid #14532D;
          outline-offset: 2px;
          border-radius: 4px;
        }

        .lp-cta-band :is(a):focus-visible,
        .lp-footer :is(a):focus-visible {
          outline-color: #fff;
        }

        /* Hero */
        .lp-hero {
          padding: 5.5rem 0 4.5rem;
        }

        .lp-hero-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 4rem;
          align-items: center;
        }

        .lp-hero-copy {
          animation: lpRise 0.6s ease both;
        }

        .lp-hero-copy h1 {
          font-size: clamp(2.1rem, 4.6vw, 3.4rem);
          line-height: 1.12;
          font-weight: 600;
          margin: 0 0 1.25rem;
          max-width: 15ch;
          text-wrap: balance;
        }

        .lp-lede {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #3E4C42;
          max-width: 52ch;
          margin: 0 0 2rem;
        }

        .lp-hero-actions {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .lp-trust {
          list-style: none;
          display: flex;
          gap: 1.75rem;
          flex-wrap: wrap;
          padding: 1.1rem 0 0;
          margin: 2.25rem 0 0;
          border-top: 1px solid #E2E0D8;
          color: #5B7A66;
          font-size: 0.88rem;
          font-weight: 500;
        }

        .lp-trust li {
          position: relative;
          padding-left: 0.9rem;
        }

        .lp-trust li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #14532D;
        }

        /* Session slip */
        .lp-slip {
          background: #fff;
          border: 1px solid #E2E0D8;
          border-radius: 14px;
          padding: 1.75rem 1.75rem 1.5rem;
          box-shadow: 0 12px 32px rgba(26, 46, 34, 0.08);
          animation: lpRise 0.6s ease 0.12s both;
        }

        .lp-slip-label {
          margin: 0 0 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #5B7A66;
        }

        .lp-slip-name {
          margin: 0;
          font-size: 1.45rem;
          font-weight: 600;
          color: #1A2E22;
        }

        .lp-slip-meta {
          margin: 0.2rem 0 1.25rem;
          color: #5B7A66;
          font-size: 0.92rem;
        }

        .lp-slip-rows {
          margin: 0;
          border-top: 1px solid #E9E7E0;
        }

        .lp-slip-rows > div {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.6rem 0;
          border-bottom: 1px solid #E9E7E0;
        }

        .lp-slip-rows dt {
          color: #5B7A66;
          font-size: 0.9rem;
        }

        .lp-slip-rows dd {
          margin: 0;
          font-weight: 600;
          font-size: 0.9rem;
          color: #1A2E22;
          font-variant-numeric: tabular-nums;
        }

        .lp-slip-status {
          margin: 1.1rem 0 0;
          font-size: 0.85rem;
          color: #14532D;
          font-weight: 600;
        }

        /* Sections */
        .lp-section {
          padding: 5rem 0;
        }

        .lp-section-tint {
          background: #EFEDE6;
        }

        .lp-title {
          font-size: clamp(1.7rem, 3.4vw, 2.4rem);
          font-weight: 600;
          line-height: 1.15;
          margin: 0 0 2.5rem;
          max-width: 24ch;
          text-wrap: balance;
        }

        /* Features */
        .lp-feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0 2.5rem;
        }

        .lp-feature {
          border-top: 1px solid #D8D5CB;
          padding: 1.5rem 0 0;
          margin-bottom: 2rem;
        }

        .lp-feature h3 {
          margin: 0 0 0.6rem;
          font-size: 1.15rem;
          font-weight: 600;
        }

        .lp-feature p {
          margin: 0;
          color: #3E4C42;
          font-size: 0.96rem;
        }

        /* Steps */
        .lp-steps {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
        }

        .lp-steps li {
          position: relative;
        }

        .lp-step-num {
          display: block;
          font-size: 2.6rem;
          font-weight: 600;
          color: #14532D;
          line-height: 1;
          margin-bottom: 0.9rem;
          font-variant-numeric: tabular-nums;
        }

        .lp-steps h3 {
          margin: 0 0 0.5rem;
          font-size: 1.15rem;
          font-weight: 600;
        }

        .lp-steps p {
          margin: 0;
          color: #3E4C42;
          font-size: 0.96rem;
        }

        /* Audiences */
        .lp-audience-list {
          border-top: 1px solid #D8D5CB;
        }

        .lp-audience {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 2rem;
          padding: 2rem 0;
          border-bottom: 1px solid #D8D5CB;
        }

        .lp-audience h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #14532D;
        }

        .lp-audience-body p {
          margin: 0 0 1rem;
          color: #3E4C42;
          max-width: 58ch;
        }

        .lp-audience-body ul {
          list-style: none;
          margin: 0 0 1.25rem;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem 1.5rem;
          color: #5B7A66;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .lp-audience-cta {
          color: #14532D;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: #C9CDBF;
          transition: text-decoration-color 0.15s ease;
        }

        .lp-audience-cta:hover {
          text-decoration-color: #14532D;
        }

        /* Safety */
        .lp-safety-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .lp-safety-copy {
          color: #3E4C42;
          font-size: 1.02rem;
          line-height: 1.7;
          max-width: 52ch;
          margin: 0;
        }

        .lp-safety-list {
          list-style: none;
          margin: 0;
          padding: 0;
          border-top: 1px solid #D8D5CB;
        }

        .lp-safety-list li {
          padding: 0.95rem 0;
          border-bottom: 1px solid #D8D5CB;
          font-weight: 500;
          color: #1A2E22;
        }

        /* CTA band */
        .lp-cta-band {
          background: #14532D;
          color: #fff;
          padding: 4.5rem 0;
        }

        .lp-cta-band h2 {
          font-family: "Fraunces", Georgia, serif;
          font-size: clamp(1.8rem, 3.6vw, 2.6rem);
          font-weight: 600;
          margin: 0 0 1.75rem;
          text-wrap: balance;
        }

        .lp-cta-link {
          color: #fff;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: rgba(255, 255, 255, 0.4);
          align-self: center;
          transition: text-decoration-color 0.15s ease;
        }

        .lp-cta-link:hover {
          text-decoration-color: #fff;
        }

        /* Footer */
        .lp-footer {
          background: #0F2418;
          color: rgba(255, 255, 255, 0.78);
          padding: 3.5rem 0 2rem;
        }

        .lp-footer-inner {
          display: flex;
          justify-content: space-between;
          gap: 2.5rem;
          flex-wrap: wrap;
        }

        .lp-brand-footer {
          color: #fff;
          font-size: 1.3rem;
        }

        .lp-footer-brand p {
          margin: 0.9rem 0 0;
          max-width: 40ch;
          font-size: 0.92rem;
          line-height: 1.7;
        }

        .lp-footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .lp-footer-links a {
          color: rgba(255, 255, 255, 0.78);
          text-decoration: none;
          font-size: 0.92rem;
          transition: color 0.15s ease;
        }

        .lp-footer-links a:hover {
          color: #fff;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .lp-footer-bottom {
          margin-top: 2.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.6);
        }

        @keyframes lpRise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 920px) {
          .lp-hero-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .lp-feature-grid,
          .lp-steps {
            grid-template-columns: repeat(2, 1fr);
          }

          .lp-audience {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .lp-safety-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 640px) {
          .lp-hide-mobile {
            display: none;
          }

          .lp-header-nav {
            gap: 0.9rem;
          }

          .lp-hero {
            padding: 3.5rem 0 3rem;
          }

          .lp-section {
            padding: 3.5rem 0;
          }

          .lp-feature-grid,
          .lp-steps {
            grid-template-columns: 1fr;
          }

          .lp-footer-bottom {
            flex-direction: column;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lp-hero-copy,
          .lp-slip {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
