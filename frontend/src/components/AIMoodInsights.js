import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const AIMoodInsights = ({ userToken, onBookSession }) => {
  const [insights, setInsights] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await fetch(`${API_URL}/ai/client/insights`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      
      const data = await res.json();

      if (res.ok) {
        setInsights(data);
        if (data.should_talk_to_therapist) {
          fetchRecommendation();
        }
      } else {
        // FIX: Safely extract error message
        const errorMsg = Array.isArray(data.detail) 
          ? data.detail.map(e => e.msg).join(', ') 
          : (data.detail || 'Unable to load insights');
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Failed to fetch mood insights', err);
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendation = async () => {
    try {
      const res = await fetch(`${API_URL}/ai/client/recommend-therapist`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setRecommendation(data);
      } else {
        console.error('Failed to fetch therapist recommendation');
      }
    } catch (err) {
      console.error('Failed to fetch therapist recommendation', err);
    }
  };

  const handleOneClickBooking = async () => {
    if (!recommendation?.therapist) return;
    
    setBooking(true);
    setBookingResult(null);

    try {
      const res = await fetch(`${API_URL}/bookings/one-click?therapist_id=${recommendation.therapist.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });

      const data = await res.json();
      
      if (res.ok) {
        setBookingResult({ success: true, message: data.message });
        if (onBookSession) onBookSession(data);
      } else {
        // FIX: Safely extract error message
        const errorMsg = Array.isArray(data.detail) 
          ? data.detail.map(e => e.msg).join(', ') 
          : (data.detail || 'Booking failed. Please try again.');
        setBookingResult({ success: false, message: errorMsg });
      }
    } catch (err) {
      setBookingResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setBooking(false);
    }
  };
  if (loading) {
    return (
      <div style={{ 
        padding: '1.5rem', 
        background: 'linear-gradient(135deg, #F0FDF4 0%, #E0F2FE 100%)', 
        borderRadius: '16px', 
        border: '1px solid #BBF7D0', 
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #86EFAC',
            borderTop: '3px solid #16A34A',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 0.75rem'
          }} />
          <p style={{ color: '#166534', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
            Analyzing your weekly mood...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '1.5rem', 
        background: '#FEF2F2', 
        borderRadius: '16px', 
        border: '1px solid #FECACA', 
        marginBottom: '1.5rem' 
      }}>
        <p style={{ color: '#991B1B', margin: 0, fontSize: '0.9rem' }}>
          <strong>Unable to load insights:</strong> {error}
        </p>
      </div>
    );
  }

  if (!insights) return null;

  // If no mood data logged yet
  if (!insights.has_data) {
    return (
      <div style={{ 
        padding: '1.5rem', 
        background: 'linear-gradient(135deg, #F0FDF4 0%, #E0F2FE 100%)', 
        borderRadius: '16px', 
        border: '1px solid #BBF7D0', 
        marginBottom: '1.5rem' 
      }}>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.05rem', color: '#166534', fontWeight: '700' }}>
          Your Weekly Mood Insights
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>
          {insights.summary}
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1.5rem', 
      background: 'linear-gradient(135deg, #F0FDF4 0%, #E0F2FE 100%)', 
      borderRadius: '16px', 
      border: '1px solid #BBF7D0', 
      marginBottom: '1.5rem' 
    }}>
      <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.05rem', color: '#166534', fontWeight: '700' }}>
        Your Weekly Mood Insights
      </h3>

      <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>
        {insights.summary}
      </p>

      {insights.suggestion && (
        <div style={{ 
          padding: '0.75rem 1rem', 
          background: 'white', 
          borderRadius: '10px', 
          marginBottom: '1rem', 
          borderLeft: '4px solid #22C55E',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#4B5563', lineHeight: '1.5' }}>
            <strong style={{ color: '#166534' }}>Suggestion:</strong> {insights.suggestion}
          </p>
        </div>
      )}

      {/* Show therapist recommendation if AI suggests it */}
      {insights.should_talk_to_therapist && recommendation?.therapist && (
        <div style={{ 
          padding: '1.25rem', 
          background: 'white', 
          borderRadius: '12px', 
          border: '1px solid #E5E7EB', 
          marginTop: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#111827', fontWeight: '600' }}>
            {insights.reason}
          </p>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#6B7280', lineHeight: '1.5' }}>
            {recommendation.message}
          </p>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            marginBottom: '1rem',
            padding: '0.75rem',
            background: '#F9FAFB',
            borderRadius: '10px'
          }}>
            {recommendation.therapist.profile_photo_url ? (
              <img
                src={`${API_URL}${recommendation.therapist.profile_photo_url}`}
                alt={recommendation.therapist.name}
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22C55E' }}
              />
            ) : (
              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #86EFAC 0%, #22C55E 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontWeight: '700', 
                fontSize: '1.4rem',
                border: '2px solid #16A34A'
              }}>
                {recommendation.therapist.name?.charAt(0) || 'T'}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>
                {recommendation.therapist.name}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '0.15rem' }}>
                {recommendation.therapist.specialty || 'General Counselling'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#F59E0B', marginTop: '0.25rem', fontWeight: '600' }}>
                ★ {recommendation.therapist.rating || '4.5'} rating
              </div>
            </div>
          </div>

          <button
            onClick={handleOneClickBooking}
            disabled={booking}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: booking ? '#9CA3AF' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: booking ? 'not-allowed' : 'pointer',
              boxShadow: booking ? 'none' : '0 4px 12px rgba(5, 150, 105, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            {booking ? 'Booking your session...' : 'Book Free Session Now'}
          </button>

          <p style={{ 
            margin: '0.6rem 0 0 0', 
            fontSize: '0.75rem', 
            color: '#9CA3AF', 
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            No payment required. Session is sponsored by Afya Care Connect.
          </p>
        </div>
      )}

      {bookingResult && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: bookingResult.success ? '#DCFCE7' : '#FEE2E2',
          color: bookingResult.success ? '#166534' : '#991B1B',
          fontSize: '0.88rem',
          fontWeight: '600',
          border: `1px solid ${bookingResult.success ? '#86EFAC' : '#FCA5A5'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {bookingResult.success ? '✓' : '⚠'} {bookingResult.message}
        </div>
      )}
    </div>
  );
};

export default AIMoodInsights;