import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: 2500,
    phone: '',
    method: 'mpesa'
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    const { bookingId } = location.state || {};
    if (!bookingId) {
      alert('No booking found');
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/payments/simulate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          booking_id: bookingId,
          phone: formData.phone,
          amount: formData.amount
        })
      });
      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setTimeout(() => {
          alert('✅ Payment successful! Session booked.');
          navigate('/dashboard');
        }, 1500);
      } else {
        setStatus('failed');
        setLoading(false);
      }
    } catch (error) {
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
      padding: '2rem 0',
      backgroundColor: '#F9FAFB'
    },
    formContainer: {
      background: 'white',
      padding: '3rem',
      borderRadius: '20px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
      width: '100%',
      maxWidth: '500px'
    },
    title: {
      textAlign: 'center',
      color: '#2BB3A3',
      fontSize: '2rem',
      marginBottom: '0.5rem',
      fontWeight: '700'
    },
    subtitle: {
      textAlign: 'center',
      color: '#6B7280',
      marginBottom: '2.5rem'
    },
    amountDisplay: {
      background: 'linear-gradient(135deg, #2BB3A3 0%, #A78BFA 100%)',
      color: 'white',
      padding: '2rem',
      borderRadius: '20px',
      textAlign: 'center',
      marginBottom: '2.5rem'
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
      padding: '1.2rem',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      fontSize: '1.1rem',
      transition: 'border-color 0.3s ease'
    },
    methodGroup: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem'
    },
    methodBtn: {
      flex: 1,
      padding: '1.2rem',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '1rem'
    },
    methodBtnActive: {
      borderColor: '#2BB3A3',
      backgroundColor: '#2BB3A3',
      color: 'white'
    },
    payBtn: {
      width: '100%',
      padding: '1.5rem',
      backgroundColor: '#2BB3A3',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1.2rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    status: status => ({
      padding: '1.5rem',
      borderRadius: '12px',
      textAlign: 'center',
      marginTop: '1.5rem',
      fontWeight: '600',
      fontSize: '1.1rem'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Secure Payment</h2>
        <p style={styles.subtitle}>Complete your booking with secure payment</p>
        
        <div style={styles.amountDisplay}>
          <div style={{fontSize: '3rem', fontWeight: '700', marginBottom: '0.5rem'}}>
            KSh {formData.amount.toLocaleString()}
          </div>
          <div style={{opacity: 0.9}}>Session with Dr. Sarah Johnson</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number (MPESA)</label>
            <input
              type="tel"
              placeholder="2547XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
              onClick={() => setFormData({...formData, method: 'mpesa'})}
            >
              💳 M-PESA
            </button>
            <button
              type="button"
              style={{
                ...styles.methodBtn,
                ...(formData.method === 'card' ? styles.methodBtnActive : {})
              }}
              onClick={() => setFormData({...formData, method: 'card'})}
            >
              💳 Card
            </button>
          </div>

          <button
            type="submit"
            style={styles.payBtn}
            disabled={loading || !formData.phone}
          >
            {loading ? 'Processing...' : `Pay KSh ${formData.amount.toLocaleString()}`}
          </button>

          {status === 'failed' && (
            <div style={{...styles.status('failed'), backgroundColor: '#FEF2F2', color: '#DC2626'}}>
              ❌ Payment failed. Please try again or contact support.
            </div>
          )}
        </form>

        <p style={{textAlign: 'center', marginTop: '2rem', color: '#6B7280', fontSize: '0.9rem'}}>
          🔒 Payments secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
};

export default Payment;