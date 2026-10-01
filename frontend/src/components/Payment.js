import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useToast } from './ToastContext';

const Payment = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookingId, setBookingId] = useState(null);
  const [amount, setAmount] = useState(0);
  const [therapistName, setTherapistName] = useState('your therapist');

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [serverError, setServerError] = useState('');

  // idle | processing | success | failed
  const [status, setStatus] = useState('idle');

  const phoneInputRef = useRef(null);

  const state = location.state || {};
  const nextBookingId = state.bookingId ? Number(state.bookingId) : null;
  const nextAmount = Number(state.amount) || 0;
  const nextTherapist = state.therapist_name || 'your therapist';

  useEffect(() => {
    if (!nextBookingId) {
      addToast('Missing booking reference. Start from the booking page.', 'error');
      navigate('/booking');
      return;
    }
    setBookingId(nextBookingId);
    setAmount(nextAmount);
    setTherapistName(nextTherapist);
  }, [nextBookingId, nextAmount, nextTherapist, navigate, addToast]);

  // Store the full international number (2547XXXXXXXX), display it nationally.
  const formatDisplay = (value) => {
    const national = value.startsWith('254') ? value.slice(3) : value;
    return national.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1 $2 $3').trim();
  };

  const handlePhoneChange = (event) => {
    let digits = event.target.value.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = `254${digits.slice(1)}`;
    if (!digits.startsWith('254')) digits = `254${digits}`;
    setPhone(digits.slice(0, 12));
    if (phoneError) setPhoneError('');
  };

  const validatePhone = () => {
    if (!/^254[17]\d{8}$/.test(phone)) {
      const message = 'Enter a valid Safaricom number, for example 712 345 678.';
      setPhoneError(message);
      phoneInputRef.current?.focus();
      return false;
    }
    return true;
  };

  const extractError = (data, fallback) =>
    (typeof data?.detail === 'string' && data.detail) ||
    data?.message ||
    fallback;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    if (!validatePhone()) return;

    setStatus('processing');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/payments/simulate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          phone,
          amount,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok && data.success) {
        setStatus('success');
        addToast('Payment confirmed. Your session is booked.', 'success');
      } else {
        const message = extractError(data, 'Payment could not be completed. Please try again.');
        setStatus('failed');
        setServerError(message);
        addToast(message, 'error');
      }
    } catch {
      const message =
        'Could not reach the payment service. Check your connection and try again.';
      setStatus('failed');
      setServerError(message);
      addToast(message, 'error');
    }
  };

  const retryPayment = () => {
    setStatus('idle');
    setServerError('');
  };

  const formatKsh = (value) =>
    new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(value);

  if (status === 'success') {
    return (
      <div className="pay">
        <main className="pay-main">
          <div className="pay-card" role="status" aria-live="polite">
            <h1 className="pay-title">Payment confirmed</h1>
            <p className="pay-subtitle">
              Your session with {therapistName} is booked.
            </p>

            <dl className="pay-summary">
              <div>
                <dt>Amount paid</dt>
                <dd>KSh {formatKsh(amount)}</dd>
              </div>
              <div>
                <dt>Reference</dt>
                <dd>
                  <code>MC-{bookingId}</code>
                </dd>
              </div>
            </dl>

            <p className="pay-note">A confirmation is on its way to your email.</p>

            <button
              type="button"
              className="pay-btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Go to dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="pay">
        <main className="pay-main">
          <div className="pay-card" role="alert">
            <h1 className="pay-title">Payment not completed</h1>
            <p className="pay-error">{serverError}</p>

            <div className="pay-actions">
              <button type="button" className="pay-btn-primary" onClick={retryPayment}>
                Try again
              </button>
              <button
                type="button"
                className="pay-btn-ghost"
                onClick={() => navigate('/dashboard')}
              >
                Back to dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pay">
      <main className="pay-main">
        <div className="pay-card">
          <button
            type="button"
            className="pay-back"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <h1 className="pay-title">Checkout</h1>

          <div className="pay-amount">
            <span className="pay-currency">KSh</span>
            <span className="pay-value">{formatKsh(amount)}</span>
            <span className="pay-desc">Session with {therapistName}</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="pay-field">
              <label htmlFor="pay-phone">M-PESA phone number</label>
              <div className={`pay-phone-wrap${phoneError ? ' pay-phone-invalid' : ''}`}>
                <span className="pay-prefix" aria-hidden="true">
                  +254
                </span>
                <input
                  id="pay-phone"
                  ref={phoneInputRef}
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="712 345 678"
                  value={formatDisplay(phone)}
                  onChange={handlePhoneChange}
                  disabled={status === 'processing'}
                  aria-invalid={Boolean(phoneError)}
                  aria-describedby={phoneError ? 'pay-phone-error' : undefined}
                />
              </div>
              {phoneError ? (
                <p className="pay-field-error" id="pay-phone-error" role="alert">
                  {phoneError}
                </p>
              ) : (
                <p className="pay-hint">You will confirm the payment on your phone.</p>
              )}
            </div>

            <button
              type="submit"
              className="pay-btn-primary pay-submit"
              disabled={status === 'processing' || !phone}
            >
              {status === 'processing' ? 'Processing…' : `Pay KSh ${formatKsh(amount)}`}
            </button>
          </form>

          <p className="pay-footer">
            Payments run through a secure simulated gateway for this release.
          </p>
        </div>
      </main>

      <style>{`
        .pay {
          min-height: 100vh;
          background: #F8F7F4;
          color: #1A2E22;
          font-family: "Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
          display: flex;
          flex-direction: column;
        }

        .pay-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 20px;
        }

        .pay-card {
          background: #fff;
          border: 1px solid #E2E0D8;
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(26, 46, 34, 0.08);
          width: 100%;
          max-width: 430px;
          padding: 2.25rem;
          animation: payRise 0.4s ease both;
        }

        .pay-back {
          background: none;
          border: none;
          padding: 0;
          margin-bottom: 1.25rem;
          color: #5B7A66;
          font: inherit;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-color: #C9CDBF;
          transition: text-decoration-color 0.15s ease;
        }

        .pay-back:hover {
          text-decoration-color: #14532D;
        }

        .pay-title {
          font-family: "Fraunces", Georgia, "Times New Roman", serif;
          font-size: 1.55rem;
          font-weight: 600;
          margin: 0 0 0.4rem;
          letter-spacing: -0.01em;
        }

        .pay-subtitle {
          margin: 0 0 1.5rem;
          color: #3E4C42;
        }

        .pay-amount {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: #F8F7F4;
          border: 1px solid #E9E7E0;
          border-radius: 12px;
          padding: 1.25rem 1.4rem;
          margin: 0 0 1.75rem;
        }

        .pay-currency {
          font-size: 1rem;
          font-weight: 600;
          color: #5B7A66;
        }

        .pay-value {
          font-family: "Fraunces", Georgia, serif;
          font-size: 2.4rem;
          font-weight: 600;
          line-height: 1.1;
          font-variant-numeric: tabular-nums;
        }

        .pay-desc {
          margin-top: 0.25rem;
          color: #5B7A66;
          font-size: 0.9rem;
        }

        .pay-field {
          margin-bottom: 1.5rem;
        }

        .pay-field label {
          display: block;
          margin-bottom: 0.45rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1A2E22;
        }

        .pay-phone-wrap {
          display: flex;
          align-items: stretch;
          border: 1px solid #C9CDBF;
          border-radius: 10px;
          background: #fff;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .pay-phone-wrap:focus-within {
          border-color: #14532D;
          box-shadow: 0 0 0 3px rgba(20, 83, 45, 0.12);
        }

        .pay-phone-invalid,
        .pay-phone-invalid:focus-within {
          border-color: #B42318;
          box-shadow: 0 0 0 3px rgba(180, 35, 24, 0.1);
        }

        .pay-prefix {
          display: flex;
          align-items: center;
          padding: 0 0.8rem;
          border-right: 1px solid #E9E7E0;
          color: #5B7A66;
          font-weight: 600;
          font-size: 0.95rem;
          font-variant-numeric: tabular-nums;
        }

        .pay-phone-wrap input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          padding: 0.9rem 0.9rem;
          font: inherit;
          font-size: 1.05rem;
          font-weight: 600;
          color: #1A2E22;
          font-variant-numeric: tabular-nums;
        }

        .pay-hint,
        .pay-field-error {
          margin: 0.45rem 0 0;
          font-size: 0.82rem;
        }

        .pay-hint {
          color: #5B7A66;
        }

        .pay-field-error {
          color: #B42318;
          font-weight: 500;
        }

        .pay-btn-primary {
          width: 100%;
          min-height: 50px;
          padding: 0 1.5rem;
          border: 1px solid transparent;
          border-radius: 10px;
          background: #14532D;
          color: #fff;
          font: inherit;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .pay-btn-primary:hover:not(:disabled) {
          background: #0F3D22;
        }

        .pay-btn-primary:disabled {
          background: #A8B5AC;
          cursor: not-allowed;
        }

        .pay-submit {
          margin-top: 0.25rem;
        }

        .pay-actions {
          display: grid;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .pay-btn-ghost {
          width: 100%;
          min-height: 48px;
          padding: 0 1.5rem;
          border: 1px solid #C9CDBF;
          border-radius: 10px;
          background: transparent;
          color: #1A2E22;
          font: inherit;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }

        .pay-btn-ghost:hover {
          border-color: #14532D;
        }

        .pay-summary {
          margin: 0 0 1.25rem;
          border-top: 1px solid #E9E7E0;
        }

        .pay-summary > div {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.65rem 0;
          border-bottom: 1px solid #E9E7E0;
        }

        .pay-summary dt {
          color: #5B7A66;
          font-size: 0.9rem;
        }

        .pay-summary dd {
          margin: 0;
          font-weight: 600;
          font-size: 0.9rem;
          font-variant-numeric: tabular-nums;
        }

        .pay-summary code {
          font-family: ui-monospace, "Cascadia Mono", Consolas, monospace;
          font-size: 0.85rem;
          background: #F8F7F4;
          border: 1px solid #E9E7E0;
          border-radius: 6px;
          padding: 0.1rem 0.45rem;
        }

        .pay-note {
          margin: 0 0 1.25rem;
          font-size: 0.85rem;
          color: #5B7A66;
        }

        .pay-error {
          margin: 0 0 0.5rem;
          color: #B42318;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .pay-footer {
          margin: 1.5rem 0 0;
          font-size: 0.78rem;
          color: #8A978D;
          text-align: center;
        }

        .pay :is(a, button, input):focus-visible {
          outline: 2px solid #14532D;
          outline-offset: 2px;
          border-radius: 4px;
        }

        @keyframes payRise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .pay-card {
            padding: 1.5rem;
          }

          .pay-value {
            font-size: 2rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pay-card {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Payment;
