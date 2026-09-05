import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LeaveReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { therapist_id, booking_id, therapist_name } = location.state || {};

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!therapist_id || !booking_id) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <p>Missing review information.</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }

    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://mecac-backend.onrender.com/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          therapist_id: therapist_id,
          booking_id: booking_id,
          rating: rating,
          comment: comment.trim() || null,
        }),
      });

      if (response.ok) {
        alert('Thank you for your review!');
        navigate('/dashboard');
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.detail || 'Failed to submit review.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F9FAFB', paddingTop: '7rem', paddingBottom: '4rem', boxSizing: 'border-box' },
    main: { maxWidth: '600px', margin: '0 auto', padding: '2rem 20px' },
    card: { background: 'white', borderRadius: '20px', padding: '3rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
    title: { fontSize: '1.8rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem', textAlign: 'center' },
    subtitle: { color: '#6B7280', marginBottom: '2rem', textAlign: 'center' },
    therapistName: { color: '#2E7D32', fontWeight: '600', fontSize: '1.1rem' },
    stars: { display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' },
    star: (filled) => ({
      fontSize: '2.5rem',
      cursor: 'pointer',
      color: filled ? '#FBBF24' : '#E5E7EB',
      transition: 'color 0.2s, transform 0.2s',
      background: 'none',
      border: 'none',
      padding: 0,
    }),
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' },
    textarea: { width: '100%', padding: '1rem', border: '1px solid #D1D5DB', borderRadius: '12px', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', minHeight: '120px' },
    submitBtn: { width: '100%', padding: '1rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', marginTop: '1.5rem' },
    cancelBtn: { width: '100%', padding: '1rem', background: 'transparent', color: '#6B7280', border: '1px solid #D1D5DB', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer', marginTop: '0.75rem' },
    error: { color: '#DC2626', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.title}>Leave a Review</h1>
          <p style={styles.subtitle}>
            How was your session with <span style={styles.therapistName}>{therapist_name || 'your therapist'}</span>?
          </p>

          <div style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                style={styles.star(star <= (hover || rating))}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={styles.label}>Comment (optional)</label>
            <textarea
              style={styles.textarea}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows="4"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>

          <button onClick={() => navigate('/dashboard')} style={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveReview;