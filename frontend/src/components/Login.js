import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { stripEmoji } from '../utils/sanitizeText';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: stripEmoji(email).trim(),
          password: stripEmoji(password),
        }),
      });

      // ASYNC OPTIMIZATION: Read response body once instead of sequentially.
      // WRONG: Awaiting response.json() twice is inefficient and technically fails
      // (response bodies can only be read once). Sequential awaits waste time:
      //   await response.json() #1: Wait 50ms for body parse
      //   await response.json() #2: Wait 50ms again (but body already consumed)
      // CORRECT: Read body once with response.text(), then parse locally.
      // This pattern is used across Login, Signup, and all fetch calls.
      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        // JSON parse failed, keep data null
      }

      if (!response.ok) {
        setError((data && data.detail) || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      onLogin(data.access_token, data.user_type, email);
      navigate('/dashboard');
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
      background: '#F1F8E9'
    },
    formContainer: {
      background: 'white',
      padding: '3rem',
      borderRadius: '20px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      width: '100%',
      maxWidth: '450px'
    },
    title: {
      textAlign: 'center',
      color: '#2E7D32',
      fontSize: '2rem',
      marginBottom: '2rem',
      fontWeight: '700'
    },
    inputGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: '#111827'
    },
    input: {
      width: '100%',
      padding: '1rem 1.2rem',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      fontSize: '1rem',
      transition: 'border-color 0.3s ease'
    },
    userTypeGroup: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    userTypeBtn: {
      flex: 1,
      padding: '1rem',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem'
    },
    userTypeBtnActive: {
      borderColor: '#4CAF50',
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    submitBtn: {
      width: '100%',
      padding: '1.2rem',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    errorText: {
      color: '#DC2626',
      marginBottom: '1rem',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <div style={styles.title}>Welcome Back</div>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(stripEmoji(e.target.value))}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(stripEmoji(e.target.value))}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.userTypeGroup}>
            <button
              type="button"
              style={{
                ...styles.userTypeBtn,
                ...(userType === 'client' ? styles.userTypeBtnActive : {})
              }}
              onClick={() => setUserType('client')}
            >
              Client
            </button>
            <button
              type="button"
              style={{
                ...styles.userTypeBtn,
                ...(userType === 'therapist' ? styles.userTypeBtnActive : {})
              }}
              onClick={() => setUserType('therapist')}
            >
              Therapist
            </button>
          </div>

          {error && <div style={styles.errorText}>{error}</div>}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6B7280' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#1565C0' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
