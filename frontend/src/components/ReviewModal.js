import React, { useState } from 'react';

const ReviewModal = ({ booking, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('https://mecac-backend.onrender.com/mport.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || '') + '/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          booking_id: booking.id,
          therapist_id: booking.therapist_id,
          rating: rating,
          comment: comment.trim() || null,
        }),
      });
      if (res.ok) {
        onSubmitted();
        onClose();
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to submit review.');
      }
    } catch (err) {
      setError('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: '700', color: '#111827' }}>Rate Your Session</h3>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#6B7280' }}>
          How was your session with <strong>{booking.therapist_name || 'your therapist'}</strong>?
        </p>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {stars.map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '2rem', padding: '0.25rem', transition: 'transform 0.15s' }}
            >
              <span style={{ color: star <= (hoverRating || rating) ? '#F59E0B' : '#D1D5DB', fontSize: '2.2rem' }}>★</span>
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)..."
          rows={3}
          style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical', marginBottom: '1rem' }}
        />

        {error && <p style={{ color: '#B91C1C', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting} style={{ flex: 2, padding: '0.75rem', background: submitting ? '#9CA3AF' : '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;