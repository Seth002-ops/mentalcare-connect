import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F9FAFB', paddingBottom: '4rem', paddingTop: '5rem', boxSizing: 'border-box' },
    header: { background: '#2E7D32', color: 'white', padding: '2rem 0', marginTop: '-5rem', paddingTop: '7rem' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto', padding: '0 20px' },
    navTitle: { fontSize: '1.8rem', fontWeight: '700' },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '25px', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' },
    main: { maxWidth: '900px', margin: '0 auto', padding: '3rem 20px' },
    title: { fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' },
    lastUpdated: { color: '#6B7280', marginBottom: '2.5rem', fontSize: '0.95rem' },
    section: { background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
    sectionTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#2E7D32', marginBottom: '1rem' },
    paragraph: { fontSize: '1rem', lineHeight: '1.8', color: '#4B5563', marginBottom: '1rem' },
    list: { paddingLeft: '1.5rem', color: '#4B5563', lineHeight: '1.8', marginBottom: '1rem' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <h1 style={styles.navTitle}>Mecac</h1>
          <Link to="/" style={styles.backBtn}>Back to Home</Link>
        </nav>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>Terms of Service</h1>
        <p style={styles.lastUpdated}>Last Updated: February 2026</p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Acceptance of Terms</h2>
          <p style={styles.paragraph}>
            Welcome to Mecac Mental Care Connect ("Mecac", "we", "us", or "our"). By accessing or using our platform, creating an account, or engaging with our services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Description of Services</h2>
          <p style={styles.paragraph}>
            Mecac provides a digital platform that connects clients with licensed mental health professionals for therapy sessions, secure messaging, and AI-powered support tools. Our services include:
          </p>
          <ul style={styles.list}>
            <li>Booking and scheduling therapy sessions with licensed therapists</li>
            <li>Secure, encrypted messaging between clients and therapists</li>
            <li>Audio and video consultation sessions</li>
            <li>AI-powered mental health support assistant</li>
            <li>Mood tracking and wellness tools</li>
            <li>Secure payment processing for services</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Not an Emergency Service</h2>
          <p style={styles.paragraph}>
            <strong>Mecac is not a crisis or emergency service.</strong> If you are experiencing a mental health emergency, having thoughts of self-harm, or are in immediate danger, please contact emergency services or a crisis hotline immediately:
          </p>
          <ul style={styles.list}>
            <li><strong>Kenya Emergency Services:</strong> 999 or 112</li>
            <li><strong>Befrienders Kenya:</strong> +254 722 178 177</li>
            <li><strong>Kenya Red Cross Toll-Free:</strong> 1199</li>
          </ul>
          <p style={styles.paragraph}>
            Do not use this platform to seek help during a crisis. Our response times may not be immediate.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>4. User Accounts & Eligibility</h2>
          <p style={styles.paragraph}>
            To use Mecac, you must be at least 18 years of age, or have parental/guardian consent if you are between 13 and 17 years old. You are responsible for:
          </p>
          <ul style={styles.list}>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and truthful information during registration</li>
            <li>Notifying us immediately of any unauthorized use of your account</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>5. User Conduct</h2>
          <p style={styles.paragraph}>
            You agree not to use Mecac to:
          </p>
          <ul style={styles.list}>
            <li>Harass, abuse, or threaten therapists or other users</li>
            <li>Share content that is unlawful, harmful, or discriminatory</li>
            <li>Impersonate another person or misrepresent your identity</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Record therapy sessions without explicit consent from all parties</li>
            <li>Use the platform for any commercial purpose without authorization</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Payments & Refunds</h2>
          <p style={styles.paragraph}>
            Session fees are displayed before booking and are payable via M-Pesa or other supported payment methods. By booking a session, you authorize us to process the payment. Refund policies are as follows:
          </p>
          <ul style={styles.list}>
            <li>Cancellations made more than 24 hours before the session are eligible for a full refund</li>
            <li>Cancellations made within 24 hours may be subject to a 50% cancellation fee</li>
            <li>No-shows are generally non-refundable</li>
            <li>Technical issues on our end that prevent a session will result in a full refund or rescheduling</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>7. AI Support Disclaimer</h2>
          <p style={styles.paragraph}>
            The Mecac AI Support Assistant is a supplementary tool designed to provide general coping strategies and emotional support. <strong>It is not a replacement for professional therapy, medical advice, diagnosis, or treatment.</strong> Always consult with a qualified mental health professional for personalized care. The AI assistant may occasionally provide inaccurate information and should not be relied upon for critical mental health decisions.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>8. Confidentiality</h2>
          <p style={styles.paragraph}>
            We take your privacy seriously. All communications between you and your therapist are encrypted and confidential, subject to the exceptions outlined in our Privacy Policy. Therapists are bound by professional ethics and confidentiality obligations. However, confidentiality may be breached in cases where there is an imminent risk of harm to yourself or others, or where required by law.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>9. Intellectual Property</h2>
          <p style={styles.paragraph}>
            All content on the Mecac platform, including but not limited to text, graphics, logos, and software, is the property of Mecac or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>10. Limitation of Liability</h2>
          <p style={styles.paragraph}>
            To the maximum extent permitted by law, Mecac shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid for the specific service giving rise to the claim. Mecac does not guarantee specific therapeutic outcomes, as mental health treatment varies by individual.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>11. Termination</h2>
          <p style={styles.paragraph}>
            We reserve the right to suspend or terminate your account if you violate these Terms of Service. You may deactivate your account at any time by contacting our support team. Upon termination, your right to use the platform ceases immediately, though certain provisions (such as confidentiality and liability) shall survive.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>12. Governing Law</h2>
          <p style={styles.paragraph}>
            These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of Kenya.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>13. Changes to These Terms</h2>
          <p style={styles.paragraph}>
            We may update these Terms of Service from time to time. We will notify you of any material changes by posting the new terms on this page and updating the "Last Updated" date. Your continued use of the platform after such changes constitutes acceptance of the revised terms.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>14. Contact Us</h2>
          <p style={styles.paragraph}>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p style={styles.paragraph}>
            <strong>Mecac Mental Care Connect</strong><br />
            Email: support@mecac.co.ke<br />
            Phone: +254 114 900 024<br />
            Nairobi, Kenya
          </p>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;