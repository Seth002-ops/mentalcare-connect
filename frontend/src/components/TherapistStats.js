import React, { useEffect, useState } from 'react';

const IconStar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconDollar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const IconCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconTrend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;

const TherapistStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/therapist/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return null;

  const cards = [
    { label: 'Average Rating', value: `${stats.average_rating} ★`, sub: `${stats.review_count} reviews`, icon: <IconStar />, color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Total Earnings', value: `KSh ${stats.total_earnings.toLocaleString()}`, sub: 'Your 85% share', icon: <IconDollar />, color: '#2E7D32', bg: '#E8F5E9' },
    { label: 'Sessions Completed', value: stats.completed_sessions, sub: `${stats.total_sessions} total booked`, icon: <IconCheck />, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Completion Rate', value: `${stats.completion_rate}%`, sub: 'Sessions finished', icon: <IconTrend />, color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      {cards.map((card, i) => (
        <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
            <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{card.icon}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6B7280' }}>{card.label}</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#111827' }}>{card.value}</div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.15rem' }}>{card.sub}</div>
        </div>
      ))}
    </div>
  );
};

export default TherapistStats;