import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { stripEmoji } from '../utils/sanitizeText';

// Professional SVG Icons
const IconMobile = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
const IconCard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const IconLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconAlert = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;

const Payment = () => {
  const [formData, setFormData] = useState({
    amount: 0,
    phone: '',
    method: 'mpesa'
  });
  const [therapistName, setTherapistName] = useState('your therapist');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    
    const cleanPhone = stripEmoji(formData.phone).trim();
    setFormData((prev) => ({ ...prev, phone: cleanPhone }));
    
    const { bookingId } = location.state || {};
    
    if (!bookingId) {
      setStatus('failed');
      setLoading(false);
      alert('Booking reference is missing. Please return to the booking page.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('failed');
      setLoading(false);
      alert('Please log in before submitting payment.');
      return;
    }

    try {
      const response = await fetch('/payments/simulate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // FIX: Force bookingId and amount to be Numbers so FastAPI accepts them
        body: JSON.stringify({
          booking_id: Number(bookingId),
          phone: cleanPhone,
          amount: Number(formData.amount)
        })
      });
      
      const data = await response.json();
      
      // If backend returns 200 OK and success is true
      if (response.ok && data.success) {
        setStatus('success');
        setTimeout(() => {
          alert('Payment successful! Session booked.');
          navigate('/dashboard');
        }, 1500);
      } else {
        // Log the exact error from the backend to the browser console
        console.error("Backend Payment Rejection:", data);
        setStatus('failed');
        setLoading(false);
      }
    } catch (error) {
      console.error("Network/Catch Error:", error);
      setStatus('failed');
      setLoading(false);
      alert('Payment error: ' + error.message);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(https://media.istockphoto.com/id/2153573059/photo/mountain-covered-with-a-coniferous-fir-tree-forest-scenic-landscape-from-carpathian-mountains.jpg?b=1&s=612x612&w=0&k=20&c=i8DX-Q3QLZMcklMLoGH2_XWh8zWU375UauVnE5Mrx2M=)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      padding: '2rem'
    },
    overlay: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(10, 25, 47, 0.65)', 
      backdropFilter: 'blur(4px)',
      zIndex: 0
    },
    formContainer: {
      position: 'relative',
      zIndex: 1,
      background: 'rgba(255, 255, 255, 0.98)',
      padding: '3rem',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      width: '100%',
      maxWidth: '480px',
      border: '1px solid rgba(255, 255, 255, 0.5)'
    },
    title: {
      textAlign: 'center',
      color: '#111827',
      fontSize: '1.75rem',
      marginBottom: '0.5rem',
      fontWeight: '700',
      letterSpacing: '-0.025em'
    },
    subtitle: {
      textAlign: 'center',
      color: '#6B7280',
      marginBottom: '2.5rem',
      fontSize: '0.95rem'
    },
    amountDisplay: {
      background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
      color: 'white',
      padding: '2rem',
      borderRadius: '16px',
      textAlign: 'center',
      marginBottom: '2rem',
      boxShadow: '0 10px 15px -3px rgba(46, 125, 50, 0.2)'
    },
    inputGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      color: '#374151',
      fontSize: '0.9rem'
    },
    input: {
      width: '100%',
      padding: '1rem 1.25rem',
      border: '1px solid #D1D5DB',
      borderRadius: '10px',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      outline: 'none',
      fontFamily: 'inherit'
    },
    methodGroup: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem'
    },
    methodBtn: {
      flex: 1,
      padding: '1rem',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '0.95rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      color: '#374151',
      fontFamily: 'inherit'
    },
    methodBtnActive: {
      borderColor: '#2E7D32',
      backgroundColor: '#E8F5E9',
      color: '#1B5E20'
    },
    payBtn: {
      width: '100%',
      padding: '1.25rem',
      backgroundColor: '#2E7D32',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 6px -1px rgba(46, 125, 50, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontFamily: 'inherit'
    },
    statusFailed: {
      padding: '1rem',
      borderRadius: '10px',
      textAlign: 'center',
      marginTop: '1.5rem',
      fontWeight: '500',
      fontSize: '0.95rem',
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
      border: '1px solid #FECACA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    footerText: {
      textAlign: 'center',
      marginTop: '2rem',
      color: '#9CA3AF',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.4rem'
    }
  };

  useEffect(() => {
    const state = location.state || {};
    if (state.amount) {
      // FIX: Ensure amount is a number when loaded from state
      setFormData((prev) => ({ ...prev, amount: Number(state.amount) }));
    }
    if (state.therapist_name) {
      setTherapistName(state.therapist_name);
    }
  }, [location.state]);

  return (
    <div style={styles.container}>
      <div style={styles.overlay} />
      
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Secure Payment</h2>
        <p style={styles.subtitle}>Complete your booking securely</p>

        <div style={styles.amountDisplay}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>
            KSh {formData.amount.toLocaleString()}
          </div>
          <div style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: '500' }}>
            Session with {therapistName}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number (MPESA)</label>
            <input
              type="tel"
              placeholder="2547XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: stripEmoji(e.target.value) })}
              style={styles.input}
              required
              pattern="254[17]\d{8}"
            />
          </div>

          <div style={styles.methodGroup}>
            <button
              type="button"
              style={{
                ...styles.methodBtn,
                ...(formData.method === 'mpesa' ? styles.methodBtnActive : {})
              }}
              onClick={() => setFormData({ ...formData, method: 'mpesa' })}
            >
              <IconMobile /> M-PESA
            </button>
            <button
              type="button"
              style={{
                ...styles.methodBtn,
                ...(formData.method === 'card' ? styles.methodBtnActive : {})
              }}
              onClick={() => setFormData({ ...formData, method: 'card' })}
            >
              <IconCard /> Card
            </button>
          </div>

          <button
            type="submit"
            style={{
              ...styles.payBtn,
              opacity: (loading || !formData.phone) ? 0.7 : 1,
              cursor: (loading || !formData.phone) ? 'not-allowed' : 'pointer'
            }}
            disabled={loading || !formData.phone}
          >
            {loading ? 'Processing...' : `Pay KSh ${formData.amount.toLocaleString()}`}
          </button>

          {status === 'failed' && (
            <div style={styles.statusFailed}>
              <IconAlert /> Payment failed. Please try again or contact support.
            </div>
          )}
        </form>

        <p style={styles.footerText}>
          <IconLock /> Payments secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
};

export default Payment;