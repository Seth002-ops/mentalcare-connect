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
      // FIXED: Changed to relative URL to use the React proxy and avoid CORS errors
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: stripEmoji(email).trim(),
          password: stripEmoji(password),
        }),
      });

      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        // JSON parse failed
      }

      if (!response.ok) {
        setError((data && data.detail) || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Save token to localStorage so the Booking page can find it later
      if (data && data.access_token) {
        localStorage.setItem('token', data.access_token);
      }

      onLogin(data.access_token, data.user_type, email);
      navigate('/dashboard');
    } catch (err) {
      console.error("Login error:", err);
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
      backgroundImage: 'url(https://images.pexels.com/photos/32228687/pexels-photo-32228687.jpeg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      padding: '2rem'
    },
    containerOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(10, 18, 38, 0.45)',
      pointerEvents: 'none'
    },
    formContainer: {
      position: 'relative',
      background: 'rgba(255, 255, 255, 0.94)',
      padding: '3rem',
      borderRadius: '24px',
      boxShadow: '0 30px 70px rgba(0,0,0,0.18)',
      width: '100%',
      maxWidth: '450px',
      backdropFilter: 'blur(18px)'
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
      <div style={styles.containerOverlay} />
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