import React, { useEffect, useState } from 'react';
import { API_URL } from '../config'; // ✅ ADDED
import { useToast } from './ToastContext'; // ✅ ADDED

const AdminBookings = () => {
  const { addToast } = useToast(); // ✅ ADDED
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/bookings`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setBookings(await res.json());
      } else {
        addToast('Failed to load bookings.', 'error'); // ✅ ADDED
      }
    } catch (err) { 
      console.error(err); 
      addToast('Network error. Could not load bookings.', 'error'); // ✅ ADDED
    } finally { 
      setLoading(false); 
    }
  };

  const handleRefund = async (id) => {
    if (!confirm('Refund this booking? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    try {
      // ✅ FIXED: Use API_URL instead of relative path
      const res = await fetch(`${API_URL}/admin/bookings/${id}/refund`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addToast('Refund processed successfully!', 'success'); // ✅ ADDED
        fetchBookings();
      } else {
        addToast('Failed to process refund.', 'error'); // ✅ ADDED
      }
    } catch (err) { 
      console.error(err); 
      addToast('Network error. Refund failed.', 'error'); // ✅ ADDED
    }
  };

  const statusBadge = (status) => {
    const map = {
      completed: { bg: '#E8F5E9', color: '#1B5E20' },
      confirmed: { bg: '#E0F2FE', color: '#0369A1' },
      pending: { bg: '#FEF3C7', color: '#92400E' },
      refunded: { bg: '#FEE2E2', color: '#991B1B' },
      cancelled: { bg: '#F3F4F6', color: '#6B7280' },
    };
    const s = map[status] || map.pending;
    return { padding: '0.25rem 0.7rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '600', background: s.bg, color: s.color };
  };

  if (loading) return <p style={{ color: '#6B7280' }}>Loading bookings...</p>;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
        <thead>
          <tr>
            {['ID', 'Client', 'Therapist', 'Date', 'Amount', 'Status', 'Payment', 'Action'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '2px solid #E5E7EB', fontSize: '0.8rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>No bookings yet</td></tr>
          ) : bookings.map(b => (
            <tr key={b.id}>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6', fontSize: '0.9rem' }}>{b.id}</td>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6', fontSize: '0.9rem' }}>{b.client_name}</td>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6', fontSize: '0.9rem' }}>{b.therapist_name}</td>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{new Date(b.scheduled_time).toLocaleString()}</td>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6', fontSize: '0.9rem', fontWeight: '600' }}>KSh {(b.amount || 0).toLocaleString()}</td>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6' }}><span style={statusBadge(b.status)}>{b.status}</span></td>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6' }}><span style={statusBadge(b.payment_status)}>{b.payment_status}</span></td>
              <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6' }}>
                {b.status !== 'refunded' && b.payment_status === 'completed' && (
                  <button onClick={() => handleRefund(b.id)} style={{ padding: '0.4rem 0.75rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' }}>
                    Refund
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookings;