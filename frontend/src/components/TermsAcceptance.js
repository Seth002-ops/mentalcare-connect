import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TermsAcceptance = ({ onAccept }) => {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAccept = async () => {
    if (!checked) {
      setError('You must check the box to continue.');
      return;
    }

    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://mecac-backend.onrender.com/terms/accept', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        if (onAccept) onAccept();
        navigate('/dashboard');
      } else {
        setError('Failed to accept terms. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F9FAFB',
      padding: '2rem',
      paddingTop: '7rem',
      boxSizing: 'border-box',
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: '3rem',
      boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '600px',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '1rem',
    },
    subtitle: {
      color: '#6B7280',
      marginBottom: '2rem',
      lineHeight: '1.6',
    },
    checkboxRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '1.5rem',
      background: '#F0FDF4',
      borderRadius: '12px',
      border: '1px solid #BBF7D0',
      marginBottom: '2rem',
      cursor: 'pointer',
    },
    checkbox: {
      width: '20px',
      height: '20px',
      marginTop: '2px',
      accentColor: '#2E7D32',
      cursor: 'pointer',
      flexShrink: 0,
    },
    checkboxLabel: {
      fontSize: '0.95rem',
      color: '#374151',
      lineHeight: '1.6',
    },
    link: {
      color: '#2E7D32',
      fontWeight: '600',
      textDecoration: 'underline',
    },
    acceptBtn: {
      width: '100%',
      padding: '1rem',
      background: checked ? '#2E7D32' : '#D1D5DB',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: checked ? 'pointer' : 'not-allowed',
      transition: 'background 0.2s',
    },
    error: {
      color: '#DC2626',
      fontSize: '0.9rem',
      marginBottom: '1rem',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Terms & Conditions</h1>
        <p style={styles.subtitle}>
          Before you can access your dashboard, please review and accept our
          Terms of Service and Privacy Policy. These documents explain how we
          protect your mental health data in compliance with the Kenya Data
          Protection Act, 2019.
        </p>

        <div
          style={styles.checkboxRow}
          onClick={() => setChecked(!checked)}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.checkboxLabel}>
            I have read and agree to the{' '}
            <Link
              to="/terms"
              style={styles.link}
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              style={styles.link}
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </Link>
            . I understand that my mental health data will be encrypted and
            handled confidentially.
          </span>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          onClick={handleAccept}
          disabled={!checked || loading}
          style={styles.acceptBtn}
        >
          {loading ? 'Accepting...' : 'Accept & Continue to Dashboard'}
        </button>
      </div>
    </div>
  );
};

export default TermsAcceptance;