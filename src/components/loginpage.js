 siteimport React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('client');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password})
      });
      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userType', data.user_type);
      navigate('/dashboard');
    } catch (error) {
      alert('Login failed: ' + error.message);
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
      background: 'linear-gradient(135deg, #2BB3A3 0%, #A78BFA 100%)'
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
      color: '#2BB3A3',
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
    inputFocus: {
      borderColor: '#2BB3A3',
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(43, 179, 163, 0.1)'
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
      borderColor: '#2BB3A3',
      backgroundColor: '#2BB3A3',
      color: 'white'
    },
    submitBtn: {
      width: '100%',
      padding: '1.2rem',
      backgroundColor: '#2BB3A3',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{textAlign: 'center', marginTop: '1.5rem', color: '#6B7280'}}>
          Don't have an account? <Link to="/" style={{color: '#2BB3A3'}}>Get started</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;