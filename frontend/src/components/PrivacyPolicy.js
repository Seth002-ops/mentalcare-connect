import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F9FAFB', paddingBottom: '4rem' },
    header: { background: '#2E7D32', color: 'white', padding: '2rem 0' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto', padding: '0 20px' },
    navTitle: { fontSize: '1.8rem', fontWeight: '700' },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '25px', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' },
    main: { maxWidth: '900px', margin: '0 auto', padding: '3rem 20px' },
    title: { fontSize: '2.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' },
    lastUpdated: { color: '#6B7280', marginBottom: '2.5rem', fontSize: '0.95rem' },
    section: { background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
    sectionTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#2E7D32', marginBottom: '1rem' },
    paragraph: { fontSize: '1rem', lineHeight: '1.8', color: '#4B5563', marginBottom: '1rem' },
    list: { paddingLeft: '1.5rem', color: '#4B5563', lineHeight: '1.8', marginBottom: '1rem' },
    highlight: { background: '#E8F5E9', borderLeft: '4px solid #2E7D32', padding: '1.25rem', borderRadius: '8px', marginBottom: '1rem' }
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
        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.lastUpdated}>Last Updated: February 2026</p>

        <div style={styles.section}>
          <div style={styles.highlight}>
            <p style={{ ...styles.paragraph, marginBottom: 0, fontWeight: '600', color: '#1B5E20' }}>
              Your privacy is our top priority. This policy explains how we collect, use, protect, and handle your personal data in compliance with the Kenya Data Protection Act, 2019.
            </p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Introduction</h2>
          <p style={styles.paragraph}>
            Mecac Mental Care Connect ("Mecac", "we", "us", or "our") is committed to protecting your personal data. As a mental health platform, we understand the sensitive nature of the information you share with us. This Privacy Policy explains how we handle your data in accordance with the <strong>Kenya Data Protection Act, 2019</strong> and other applicable data protection laws.
          </p>
          <p style={styles.paragraph}>
            By using our platform, you consent to the collection and use of your information as described in this policy.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Data We Collect</h2>
          <p style={styles.paragraph}>We collect the following types of information:</p>
          <ul style={styles.list}>
            <li><strong>Account Information:</strong> Email address, name (or nickname for clients), password, and user type (client or therapist)</li>
            <li><strong>Session Data:</strong> Booking details, appointment times, and payment information</li>
            <li><strong>Communication Data:</strong> Encrypted messages exchanged between you and your therapist</li>
            <li><strong>Wellness Data:</strong> Mood entries and self-reported emotional states</li>
            <li><strong>Technical Data:</strong> Device information, IP address, and usage patterns</li>
            <li><strong>Payment Data:</strong> Transaction details processed securely via M-Pesa or other payment providers</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>3. How We Use Your Data</h2>
          <p style={styles.paragraph}>We use your personal data for the following purposes:</p>
          <ul style={styles.list}>
            <li>To provide and maintain our mental health services</li>
            <li>To connect you with licensed therapists</li>
            <li>To facilitate secure communication between you and your therapist</li>
            <li>To process bookings and payments</li>
            <li>To provide AI-powered support tools</li>
            <li>To send you important notifications about your sessions</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Legal Basis for Processing</h2>
          <p style={styles.paragraph}>
            Under the Kenya Data Protection Act, 2019, we process your personal data based on the following legal grounds:
          </p>
          <ul style={styles.list}>
            <li><strong>Consent:</strong> You have given explicit consent for us to process your data for mental health services</li>
            <li><strong>Contract Performance:</strong> Processing is necessary to fulfill your therapy bookings and service agreements</li>
            <li><strong>Legal Obligation:</strong> Processing is required to comply with applicable laws and regulations</li>
            <li><strong>Vital Interests:</strong> In rare cases, to protect your life or the life of another person</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Data Security & Encryption</h2>
          <p style={styles.paragraph}>
            We implement industry-standard security measures to protect your sensitive mental health data:
          </p>
          <ul style={styles.list}>
            <li><strong>Encryption in Transit:</strong> All data transmitted between your device and our servers is encrypted using HTTPS/TLS</li>
            <li><strong>Message Encryption:</strong> Chat messages between you and your therapist are encrypted before storage</li>
            <li><strong>Secure Authentication:</strong> We use JWT tokens with secure hashing for account protection</li>
            <li><strong>Access Controls:</strong> Only you and your assigned therapist can access your session communications</li>
            <li><strong>Regular Security Audits:</strong> We regularly review our security practices</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Data Sharing & Disclosure</h2>
          <p style={styles.paragraph}>
            We do not sell your personal data. We may share your information only in the following limited circumstances:
          </p>
          <ul style={styles.list}>
            <li><strong>With Your Therapist:</strong> To provide your therapy services</li>
            <li><strong>Payment Providers:</strong> To process transactions (e.g., M-Pesa/Safaricom)</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental regulation</li>
            <li><strong>Safety Concerns:</strong> If we believe there is an imminent risk of harm to you or others</li>
            <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our platform, bound by confidentiality agreements</li>
          </ul>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Data Retention</h2>
          <p style={styles.paragraph}>
            We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy:
          </p>
          <ul style={styles.list}>
            <li><strong>Account Data:</strong> Retained while your account is active and for 2 years after deletion</li>
            <li><strong>Session Records:</strong> Retained for 7 years in accordance with healthcare record-keeping standards</li>
            <li><strong>Payment Records:</strong> Retained for 7 years for tax and legal compliance</li>
            <li><strong>Mood Entries:</strong> Retained while your account is active; deleted upon account deletion</li>
          </ul>
          <p style={styles.paragraph}>
            You may request earlier deletion of your data, subject to legal retention requirements.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>8. Your Rights Under the Kenya Data Protection Act</h2>
          <p style={styles.paragraph}>
            As a data subject, you have the following rights:
          </p>
          <ul style={styles.list}>
            <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
            <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal requirements)</li>
            <li><strong>Right to Data Portability:</strong> Export your data in a machine-readable format</li>
            <li><strong>Right to Object:</strong> Object to certain types of processing</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
          </ul>
          <p style={styles.paragraph}>
            To exercise any of these rights, please contact our Data Protection Officer at <strong>privacy@mecac.co.ke</strong>.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>9. Children's Privacy</h2>
          <p style={styles.paragraph}>
            Our services are not directed to children under 13. We do not knowingly collect personal data from children under 13 without parental consent. If you believe a child has provided us with personal data, please contact us immediately and we will delete it.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>10. Cookies & Tracking</h2>
          <p style={styles.paragraph}>
            We use essential cookies and local storage to maintain your session and preferences. We do not use third-party advertising trackers. You can control cookie settings through your browser, though disabling essential cookies may affect platform functionality.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>11. International Data Transfers</h2>
          <p style={styles.paragraph}>
            Your data is primarily stored and processed in Kenya. If we transfer data internationally, we ensure appropriate safeguards are in place in compliance with the Kenya Data Protection Act, 2019, including standard contractual clauses and adequacy assessments.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>12. AI Support & Data Processing</h2>
          <p style={styles.paragraph}>
            When you interact with our AI Support Assistant, your messages may be processed by third-party AI services to generate responses. We minimize the data shared with these services and do not include personally identifiable information where possible. AI interactions are not stored as part of your therapy record unless you explicitly share them with your therapist.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>13. Changes to This Policy</h2>
          <p style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the "Last Updated" date at the top of this page. For significant changes, we will provide additional notice through the platform. Your continued use of Mecac after changes constitutes acceptance of the updated policy.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>14. Contact & Data Protection Officer</h2>
          <p style={styles.paragraph}>
            If you have questions about this Privacy Policy or wish to exercise your data protection rights, please contact us:
          </p>
          <p style={styles.paragraph}>
            <strong>Mecac Mental Care Connect</strong><br />
            Data Protection Officer<br />
            Email: privacy@mecac.co.ke<br />
            Support: support@mecac.co.ke<br />
            Phone: +254 700 000 000<br />
            Nairobi, Kenya
          </p>
          <p style={styles.paragraph}>
            You also have the right to lodge a complaint with the <strong>Office of the Data Protection Commissioner (ODPC)</strong> of Kenya if you believe your data protection rights have been violated.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;