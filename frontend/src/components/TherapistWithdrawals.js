import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const TherapistWithdrawals = ({ logout }) => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/therapist/earnings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEarnings(data);
      }
    } catch (err) {
      console.error('Failed to fetch earnings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawPhone) {
      alert('Please enter amount and M-Pesa number.');
      return;
    }
    if (isNaN(withdrawAmount) || Number(withdrawAmount) < 500) {
      alert('Minimum withdrawal is KSh 500.');
      return;
    }
    if (earnings && Number(withdrawAmount) > earnings.balance) {
      alert('Amount exceeds available balance.');
      return;
    }

    setWithdrawLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `/therapist/withdraw?amount=${withdrawAmount}&mpesa_phone=${withdrawPhone}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawPhone('');
        fetchEarnings();
      } else {
        alert(data.detail || 'Withdrawal failed');
      }
    } catch (err) {
      alert('Failed to submit withdrawal request.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <header style={{ background: '#2E7D32', color: 'white', padding: '1.25rem 0' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Withdrawals & Earnings</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <NotificationBell />
            <button onClick={() => navigate('/dashboard')} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
              Back to Dashboard
            </button>
            <button onClick={logout} style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 20px' }}>
        {earnings && (
          <>
            {/* Earnings Summary */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>💰 Earnings Summary</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#F0FDF4', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2E7D32' }}>
                    KSh {earnings.total_earned.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>Total Earned</div>
                </div>
                <div style={{ background: '#FEF3C7', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#92400E' }}>
                    KSh {earnings.balance.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>Available Balance</div>
                </div>
                <div style={{ background: '#F3F4F6', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#374151' }}>
                    KSh {earnings.total_withdrawn.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>Total Withdrawn</div>
                </div>
              </div>

              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={earnings.balance < 500}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: earnings.balance >= 500 ? '#2E7D32' : '#D1D5DB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: earnings.balance >= 500 ? 'pointer' : 'not-allowed',
                }}
              >
                💳 Request Withdrawal {earnings.balance < 500 ? '(Min: KSh 500)' : ''}
              </button>
            </div>

            {/* Withdrawal History */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>📜 Withdrawal History</h2>
              
              {earnings.withdrawals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                  No withdrawal requests yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {earnings.withdrawals.map((w) => (
                    <div key={w.id} style={{
                      padding: '1.25rem',
                      background: '#F9FAFB',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>
                            KSh {w.amount_sent.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
                            Requested: KSh {w.amount_requested.toLocaleString()}
                          </div>
                        </div>
                        <span style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '999px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          background: w.status === 'approved' ? '#E8F5E9' : w.status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                          color: w.status === 'approved' ? '#1B5E20' : w.status === 'rejected' ? '#991B1B' : '#92400E',
                        }}>
                          {w.status === 'approved' ? '✅ Sent' : w.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                        <div>
                          <div style={{ color: '#6B7280', marginBottom: '0.25rem' }}>M-Pesa Number</div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>{w.mpesa_phone}</div>
                        </div>
                        <div>
                          <div style={{ color: '#6B7280', marginBottom: '0.25rem' }}>Platform Fee</div>
                          <div style={{ fontWeight: '600', color: '#DC2626' }}>KSh {w.platform_fee.toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ color: '#6B7280', marginBottom: '0.25rem' }}>Requested On</div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>
                            {new Date(w.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {w.processed_at && (
                          <div>
                            <div style={{ color: '#6B7280', marginBottom: '0.25rem' }}>Processed On</div>
                            <div style={{ fontWeight: '600', color: '#111827' }}>
                              {new Date(w.processed_at).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>

                      {w.admin_note && (
                        <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Admin Note:</div>
                          <div style={{ fontSize: '0.875rem', color: '#374151' }}>{w.admin_note}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '2rem',
            maxWidth: '450px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
              💳 Request Withdrawal
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                Amount (KSh)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder={`Max: KSh ${earnings?.balance.toLocaleString()}`}
                style={{
                  width: '100%', padding: '0.75rem 1rem', border: '1px solid #D1D5DB',
                  borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>Minimum withdrawal: KSh 500</p>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>
                M-Pesa Number
              </label>
              <input
                type="text"
                value={withdrawPhone}
                onChange={(e) => setWithdrawPhone(e.target.value)}
                placeholder="e.g., 254712345678"
                style={{
                  width: '100%', padding: '0.75rem 1rem', border: '1px solid #D1D5DB',
                  borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none'
                }}
              />
            </div>

            {withdrawAmount && !isNaN(withdrawAmount) && Number(withdrawAmount) > 0 && (
              <div style={{
                background: '#F0FDF4', padding: '1rem', borderRadius: '12px',
                marginBottom: '1.5rem', border: '1px solid #BBF7D0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#6B7280' }}>Requested:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>KSh {Number(withdrawAmount).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#6B7280' }}>Platform Fee (15%):</span>
                  <span style={{ fontWeight: '600', color: '#DC2626' }}>- KSh {(Number(withdrawAmount) * 0.15).toFixed(0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #86EFAC', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: '700', color: '#111827' }}>You receive:</span>
                  <span style={{ fontWeight: '800', color: '#1B5E20', fontSize: '1.1rem' }}>KSh {(Number(withdrawAmount) * 0.85).toFixed(0)}</span>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => { setShowWithdrawModal(false); setWithdrawAmount(''); setWithdrawPhone(''); }}
                style={{
                  flex: 1, padding: '0.75rem', background: '#F3F4F6', border: '1px solid #E5E7EB',
                  borderRadius: '10px', fontWeight: '600', cursor: 'pointer', color: '#374151'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading || !withdrawAmount || !withdrawPhone}
                style={{
                  flex: 1, padding: '0.75rem', background: withdrawLoading ? '#9CA3AF' : '#2E7D32',
                  color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600',
                  cursor: withdrawLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {withdrawLoading ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistWithdrawals;