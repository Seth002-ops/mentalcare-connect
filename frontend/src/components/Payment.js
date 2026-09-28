import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { stripEmoji } from '../utils/sanitizeText';
import { API_URL } from '../config'; // ✅ FIXED: Using centralized config
import { useToast } from './ToastContext';

// ============ ICONS ============
const IconMobile = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
const IconCard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const IconLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconAlert = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const IconCheck = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconSpinner = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'paySpin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;
const IconArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

const Payment = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    amount: 0,
    phone: '',
    method: 'mpesa'
  });
  
  const [therapistName, setTherapistName] = useState('your therapist');
  const [bookingId, setBookingId] = useState(null);
  
  // States: idle | processing | success | failed
  const [status, setStatus] = useState('idle'); 
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(60); // Seconds to wait for STK push
  
  const timerRef = useRef(null);

  // Initialize data from route state
  useEffect(() => {
    const state = location.state || {};
    if (!state.bookingId) {
      addToast('Invalid booking reference. Redirecting...', 'error');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }
    
    setBookingId(state.bookingId);
    setFormData(prev => ({ ...prev, amount: Number(state.amount) || 0 }));
    setTherapistName(state.therapist_name || 'your therapist');
  }, [location.state, navigate, addToast]);

  // Handle Countdown Timer during Processing
  useEffect(() => {
    if (status === 'processing') {
      setCountdown(60);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [status]);

  const handleTimeout = () => {
    setStatus('failed');
    setErrorMessage('Request timed out. Please check your SMS inbox or try again.');
    addToast('Payment request timed out.', 'error');
  };

  const formatPhoneInput = (value) => {
    let clean = value.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '254' + clean.substring(1);
    if (clean.length > 12) clean = clean.substring(0, 12);
    return clean;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhoneInput(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phone || formData.phone.length !== 12) {
      addToast('Please enter a valid Safaricom number (e.g., 2547...).', 'error');
      return;
    }

    setStatus('processing');
    setErrorMessage('');

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}/payments/simulate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          booking_id: Number(bookingId),
          phone: formData.phone,
          amount: Number(formData.amount),
          method: formData.method
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Simulate slight delay for realism after API confirms receipt
        setTimeout(() => {
          setStatus('success');
          addToast('Payment successful! Session confirmed.', 'success');
          
          // Auto redirect after success
          setTimeout(() => {
            navigate('/dashboard');
          }, 2500);
        }, 1500);
      } else {
        throw new Error(data.message || 'Payment initialization failed.');
      }
    } catch (error) {
      console.error("Payment Error:", error);
      setStatus('failed');
      setErrorMessage(error.message);
      addToast(error.message, 'error');
    }
  };

  const retryPayment = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  // ============ RENDER STATES ============

  // 1. SUCCESS STATE
  if (status === 'success') {
    return (
      <div className="pay-container">
        <div className="pay-overlay" />
        <div className="pay-card pay-success-card">
          <div className="pay-check-circle">
            <IconCheck />
          </div>
          <h2 className="pay-title">Payment Successful</h2>
          <p className="pay-subtitle">Your session with {therapistName} is confirmed.</p>
          
          <div className="pay-summary-box">
            <div className="pay-summary-row">
              <span>Amount Paid</span>
              <strong>KSh {formData.amount.toLocaleString()}</strong>
            </div>
            <div className="pay-summary-row">
              <span>Reference</span>
              <code className="pay-ref-code">{bookingId}</code>
            </div>
          </div>

          <p className="pay-redirect-text">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // 2. PROCESSING STATE
  if (status === 'processing') {
    return (
      <div className="pay-container">
        <div className="pay-overlay" />
        <div className="pay-card pay-processing-card">
          <div className="pay-spinner-wrapper">
            <IconSpinner />
          </div>
          <h2 className="pay-title">Waiting for Approval</h2>
          <p className="pay-subtitle">
            Check your phone for an M-Pesa PIN prompt.<br/>
            We are waiting for confirmation...
          </p>
          
          <div className="pay-timer-bar">
            <div 
              className="pay-timer-fill" 
              style={{ width: `${(countdown / 60) * 100}%` }} 
            />
          </div>
          <div className="pay-timer-text">{countdown}s remaining</div>

          <button onClick={handleTimeout} className="pay-cancel-btn">
            Cancel Request
          </button>
        </div>
      </div>
    );
  }

  // 3. FAILED STATE
  if (status === 'failed') {
    return (
      <div className="pay-container">
        <div className="pay-overlay" />
        <div className="pay-card pay-failed-card">
          <div className="pay-alert-icon">
            <IconAlert />
          </div>
          <h2 className="pay-title">Payment Failed</h2>
          <p className="pay-error-msg">{errorMessage || 'Something went wrong.'}</p>
          
          <div className="pay-actions-group">
            <button onClick={retryPayment} className="pay-retry-btn">
              Try Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="pay-back-btn">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. IDLE STATE (MAIN FORM)
  return (
    <div className="pay-container">
      <div className="pay-overlay" />
      
      <div className="pay-card">
        {/* Header */}
        <div className="pay-header">
          <button onClick={() => navigate(-1)} className="pay-back-icon" aria-label="Go back">
            <IconArrowLeft />
          </button>
          <h2 className="pay-title">Secure Checkout</h2>
          <div className="pay-secure-badge">
            <IconLock /> Encrypted
          </div>
        </div>

        {/* Amount Display */}
        <div className="pay-amount-display">
          <span className="pay-currency">KSh</span>
          <span className="pay-value">{formData.amount.toLocaleString()}</span>
          <div className="pay-desc">Session with {therapistName}</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Phone Input */}
          <div className="pay-input-group">
            <label className="pay-label">M-PESA Phone Number</label>
            <div className="pay-input-wrapper">
              <span className="pay-prefix">+254</span>
              <input
                type="tel"
                name="phone"
                placeholder="7XX XXX XXX"
                value={formData.phone.replace(/^254/, '')}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  const formatted = '254' + raw;
                  setFormData(prev => ({ ...prev, phone: formatPhoneInput(formatted) }));
                }}
                className="pay-input"
                required
                maxLength={12}
                autoFocus
              />
            </div>
            <small className="pay-hint">Enter your Safaricom registered number</small>
          </div>

          {/* Method Selection (Visual Only for MVP) */}
          <div className="pay-method-section">
            <label className="pay-label">Payment Method</label>
            <div className="pay-method-grid">
              <button
                type="button"
                className={`pay-method-btn active`}
                disabled
              >
                <IconMobile />
                <span>M-PESA</span>
                <small>Instant</small>
              </button>
              
              <button
                type="button"
                className={`pay-method-btn disabled`}
                title="Coming Soon"
              >
                <IconCard />
                <span>Card</span>
                <small>Soon</small>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="pay-submit-btn"
            disabled={!formData.phone || formData.phone.length !== 12}
          >
            Pay KSh {formData.amount.toLocaleString()}
          </button>
        </form>

        {/* Footer Trust */}
        <div className="pay-footer">
          <p>
            <IconLock /> Secured by 256-bit SSL encryption. 
            Your financial data is never stored on our servers.
          </p>
        </div>
      </div>

      <style>{`
        .pay-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url('https://images.pexels.com/photos/6962625/pexels-photo-6962625.jpeg');
          background-size: cover;
          background-position: center;
          position: relative;
          padding: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .pay-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10, 28, 34, 0.85), rgba(46, 125, 50, 0.4));
          backdrop-filter: blur(8px);
          z-index: 0;
        }

        .pay-card {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: paySlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes paySlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header Styles */
        .pay-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .pay-back-icon {
          background: none;
          border: none;
          cursor: pointer;
          color: #6B7280;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .pay-back-icon:hover {
          background: #F3F4F6;
          color: #111827;
        }

        .pay-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
        }

        .pay-secure-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #E8F5E9;
          color: #1B5E20;
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        /* Amount Display */
        .pay-amount-display {
          text-align: center;
          margin-bottom: 2.5rem;
          padding: 1.5rem;
          background: #F9FAFB;
          border-radius: 16px;
          border: 1px solid #E5E7EB;
        }

        .pay-currency {
          font-size: 1.2rem;
          font-weight: 700;
          color: #6B7280;
          vertical-align: top;
          margin-right: 0.2rem;
        }

        .pay-value {
          font-size: 3rem;
          font-weight: 900;
          color: #111827;
          letter-spacing: -0.05em;
          line-height: 1;
        }

        .pay-desc {
          margin-top: 0.5rem;
          color: #6B7280;
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Inputs */
        .pay-input-group {
          margin-bottom: 1.5rem;
        }

        .pay-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #374151;
        }

        .pay-input-wrapper {
          display: flex;
          align-items: center;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
          background: white;
        }

        .pay-input-wrapper:focus-within {
          border-color: #2E7D32;
          box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
        }

        .pay-prefix {
          padding: 0 0.75rem;
          background: #F9FAFB;
          color: #6B7280;
          font-weight: 600;
          border-right: 1px solid #E5E7EB;
          font-size: 0.95rem;
        }

        .pay-input {
          flex: 1;
          border: none;
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: 600;
          outline: none;
          color: #111827;
          font-family: inherit;
        }

        .pay-hint {
          display: block;
          margin-top: 0.4rem;
          font-size: 0.75rem;
          color: #9CA3AF;
        }

        /* Methods */
        .pay-method-section {
          margin-bottom: 2rem;
        }

        .pay-method-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .pay-method-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6B7280;
        }

        .pay-method-btn.active {
          border-color: #2E7D32;
          background: #F0FDF4;
          color: #1B5E20;
        }

        .pay-method-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #F9FAFB;
        }

        .pay-method-btn span {
          font-weight: 700;
          font-size: 0.9rem;
        }

        .pay-method-btn small {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        /* Submit Button */
        .pay-submit-btn {
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 10px 20px rgba(46, 125, 50, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .pay-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(46, 125, 50, 0.3);
        }

        .pay-submit-btn:disabled {
          background: #D1D5DB;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        /* Footer */
        .pay-footer {
          margin-top: 2rem;
          text-align: center;
        }

        .pay-footer p {
          font-size: 0.75rem;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin: 0;
        }

        /* Processing State Specifics */
        .pay-processing-card {
          text-align: center;
          padding: 3rem 2rem;
        }

        .pay-spinner-wrapper {
          margin-bottom: 1.5rem;
          color: #2E7D32;
        }

        .pay-timer-bar {
          height: 6px;
          background: #E5E7EB;
          border-radius: 3px;
          margin: 1.5rem 0 0.5rem;
          overflow: hidden;
        }

        .pay-timer-fill {
          height: 100%;
          background: #2E7D32;
          transition: width 1s linear;
        }

        .pay-timer-text {
          font-size: 0.85rem;
          color: #6B7280;
          font-weight: 600;
        }

        .pay-cancel-btn {
          margin-top: 2rem;
          background: none;
          border: 1px solid #E5E7EB;
          color: #DC2626;
          padding: 0.6rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pay-cancel-btn:hover {
          background: #FEF2F2;
          border-color: #FECACA;
        }

        /* Success State Specifics */
        .pay-success-card {
          text-align: center;
        }

        .pay-check-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #E8F5E9;
          color: #2E7D32;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .pay-summary-box {
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.5rem 0;
          text-align: left;
        }

        .pay-summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .pay-summary-row:last-child {
          margin-bottom: 0;
        }

        .pay-summary-row span {
          color: #6B7280;
        }

        .pay-summary-row strong {
          color: #111827;
        }

        .pay-ref-code {
          background: #E5E7EB;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85rem;
        }

        .pay-redirect-text {
          font-size: 0.85rem;
          color: #9CA3AF;
          margin-top: 1rem;
        }

        /* Failed State Specifics */
        .pay-failed-card {
          text-align: center;
        }

        .pay-alert-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #FEE2E2;
          color: #DC2626;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .pay-error-msg {
          color: #991B1B;
          font-size: 0.95rem;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .pay-actions-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pay-retry-btn {
          width: 100%;
          padding: 1rem;
          background: #2E7D32;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pay-retry-btn:hover {
          background: #1B5E20;
        }

        .pay-back-btn {
          width: 100%;
          padding: 1rem;
          background: transparent;
          color: #6B7280;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pay-back-btn:hover {
          background: #F9FAFB;
          color: #111827;
        }

        @keyframes paySpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .pay-card {
            padding: 1.5rem;
          }
          .pay-value {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Payment;