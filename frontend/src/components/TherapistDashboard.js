import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import SessionReminder from './SessionReminder';
import TherapistStats from './TherapistStats';

// ============ PROFESSIONAL SVG ICONS ============
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconCheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const IconClock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconVideo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const IconMessage = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconBook = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const IconChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconDollarSign = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

const TherapistDashboard = ({ logout }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [therapistName, setTherapistName] = useState('Therapist');
  const navigate = useNavigate();
  
  const [earnings, setEarnings] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchTherapistName();
    fetchEarnings();
  }, []);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/bookings/me', {
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTherapistName = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id;
        
        const res = await fetch(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const realName = data.name && data.name !== 'Anonymous' ? data.name : (data.email ? data.email.split('@')[0] : 'Therapist');
          setTherapistName(realName);
        }
      } catch (e) {
        console.error("Failed to fetch therapist name", e);
      }
    }
  };

  const fetchEarnings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
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

  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const pendingCount = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
  
  const uniqueClientIds = [...new Set(appointments.map(a => a.client_id))];
  const uniqueClientsCount = uniqueClientIds.length;

  const upcoming = appointments
    .filter(a => (a.status === 'confirmed' || a.status === 'pending') && new Date(a.scheduled_time) > new Date())
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
    .slice(0, 5);

  const clientProgressData = uniqueClientIds.map((clientId) => {
    const clientAppts = appointments.filter(a => a.client_id === clientId);
    const clientName = clientAppts[0]?.client_name || `Client #${clientId}`;
    const completed = clientAppts.filter(a => a.status === 'completed').length;
    const progress = Math.min(100, completed * 25); 
    const milestones = ['Intake & Assessment', 'Goal Setting', 'Skill Building', 'Integration', 'Maintenance & Review'];
    return {
      id: clientId,
      name: clientName,
      sessionsCompleted: completed,
      progress: progress,
      nextMilestone: milestones[Math.min(completed, milestones.length - 1)]
    };
  });

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    header: { background: '#2E7D32', color: 'white', padding: '1.25rem 0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
    navTitle: { fontSize: '1.5rem', fontWeight: '700' },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px', display: 'flex', flexDirection: 'column', gap: '2rem' },
    welcomeBanner: { background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', borderRadius: '20px', padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(46, 125, 50, 0.2)' },
    bannerCircle: { position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' },
    bannerTitle: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' },
    bannerText: { opacity: '0.9', fontSize: '0.95rem', marginBottom: '1.25rem' },
    bannerBtns: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    bannerBtnPrimary: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', background: 'white', color: '#1B5E20', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none', border: 'none', cursor: 'pointer' },
    bannerBtnSecondary: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
    statCard: { background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    statIconBox: (bg) => ({ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    statValue: { fontSize: '1.5rem', fontWeight: '700', color: '#111827', lineHeight: '1.2' },
    statLabel: { fontSize: '0.8rem', color: '#6B7280', fontWeight: '500' },
    twoColGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
    card: { background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' },
    cardTitle: { fontSize: '1.1rem', fontWeight: '600', color: '#111827' },
    viewAllLink: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#2E7D32', textDecoration: 'none', fontWeight: '500' },
    sessionItem: { padding: '1rem', background: '#F9FAFB', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' },
    sessionIconBox: { width: '40px', height: '40px', borderRadius: '10px', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#2E7D32' },
    sessionClient: { fontWeight: '600', fontSize: '0.9rem', color: '#111827' },
    sessionTime: { fontSize: '0.8rem', color: '#6B7280' },
    statusBadge: (status) => ({ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', background: status === 'confirmed' ? '#E8F5E9' : '#FEF3C7', color: status === 'confirmed' ? '#1B5E20' : '#92400E', textTransform: 'capitalize' }),
    quickActionLink: { display: 'flex', alignItems: 'center', gap: '14px', padding: '1rem 1.25rem', background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', textDecoration: 'none', transition: 'all 0.2s ease', marginBottom: '0.75rem', cursor: 'pointer' },
    actionIconBox: (bg) => ({ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    actionTitle: { fontWeight: '600', fontSize: '0.9rem', color: '#111827' },
    actionDesc: { fontSize: '0.8rem', color: '#6B7280' },
    progressBarBg: { height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem', marginBottom: '0.5rem' },
    progressBarFill: (width) => ({ height: '100%', width: `${width}%`, background: 'linear-gradient(90deg, #4CAF50, #2E7D32)', borderRadius: '4px', transition: 'width 0.5s ease' }),
    progressBtn: { marginTop: '0.75rem', padding: '0.5rem 1rem', background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', width: '100%' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <h1 style={styles.navTitle}>Mecac Therapist Portal</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </nav>
      </header>

      <main style={styles.main}>
        <div style={styles.welcomeBanner}>
          <div style={styles.bannerCircle} />
          <h2 style={styles.bannerTitle}>Welcome back, {therapistName}</h2>
          <p style={styles.bannerText}>
            {pendingCount > 0
              ? `You have ${pendingCount} pending session request${pendingCount > 1 ? 's' : ''} awaiting confirmation.`
              : 'Your schedule is up to date. Ready to help your clients today.'}
          </p>
          <div style={styles.bannerBtns}>
            <button onClick={() => navigate('/therapist/profile')} style={styles.bannerBtnPrimary}>
              <IconUsers /> Edit Profile
            </button>
            <button onClick={() => navigate('/therapist-availability')} style={styles.bannerBtnPrimary}>
              <IconCalendar /> Set Availability
            </button>
            <button onClick={() => navigate('/therapist/clients')} style={styles.bannerBtnSecondary}>
              <IconUsers /> My Clients
            </button>
          </div>
        </div>

        <SessionReminder />

        {/* THERAPIST PERFORMANCE METRICS */}
        <TherapistStats />

        {/* EARNINGS SECTION */}
        {earnings && (
          <div style={{ ...styles.card, border: '2px solid #2E7D32', background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)' }}>
            <div style={styles.cardHeader}>
              <h3 style={{ ...styles.cardTitle, color: '#1B5E20', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconDollarSign /> My Earnings & Wallet
              </h3>
              <button
                onClick={() => navigate('/therapist/withdrawals')}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: '#2E7D32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <IconDollarSign /> Manage Withdrawals
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2E7D32' }}>
                  KSh {(earnings.total_earned || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Total Earned</div>
              </div>
              <div style={{ background: '#FEF3C7', padding: '1.25rem', borderRadius: '12px', border: '1px solid #FDE68A', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#92400E' }}>
                  KSh {(earnings.balance || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Available Balance</div>
              </div>
              <div style={{ background: '#F3F4F6', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#374151' }}>
                  KSh {(earnings.total_withdrawn || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Total Withdrawn</div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.statsGrid}>
          {[
            { label: 'Total Sessions', value: appointments.length, icon: <IconCalendar />, color: '#2E7D32', bg: '#E8F5E9' },
            { label: 'Completed', value: completedCount, icon: <IconCheckCircle />, color: '#0284C7', bg: '#E0F2FE' },
            { label: 'Pending Requests', value: pendingCount, icon: <IconClock />, color: '#EA580C', bg: '#FFEDD5' },
            { label: 'Active Clients', value: uniqueClientsCount, icon: <IconUsers />, color: '#7C3AED', bg: '#EDE9FE' },
          ].map((stat) => (
            <div key={stat.label} style={styles.statCard}>
              <div style={styles.statIconBox(stat.bg)}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.twoColGrid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Upcoming Sessions</h3>
              <Link to="/booking" style={styles.viewAllLink}>View All <IconChevronRight /></Link>
            </div>

            {loading ? (
              <p style={{ color: '#6B7280' }}>Loading schedule...</p>
            ) : upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                <IconCalendar />
                <p style={{ marginTop: '0.5rem' }}>No upcoming sessions</p>
              </div>
            ) : (
              upcoming.map((s) => (
                <div key={s.id} style={styles.sessionItem}>
                  <div style={styles.sessionIconBox}><IconVideo /></div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.sessionClient}>{s.client_name || 'Client'}</div>
                    <div style={styles.sessionTime}>
                      {new Date(s.scheduled_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                      {new Date(s.scheduled_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => navigate(`/session/video/${s.id}`)}
                      style={{ padding: '0.45rem 0.9rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <IconVideo /> Join
                    </button>
                    <span style={styles.statusBadge(s.status)}>{s.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            {[
              { to: '/therapist-availability', icon: <IconCalendar />, title: 'Set Availability', desc: 'Define your working hours', color: '#059669', bg: '#D1FAE5' },
              { to: '/therapist/clients', icon: <IconUsers />, title: 'My Clients', desc: `${uniqueClientsCount} active client${uniqueClientsCount !== 1 ? 's' : ''}`, color: '#2E7D32', bg: '#E8F5E9' },
              { to: '/therapist/messages', icon: <IconMessage />, title: 'Messages', desc: 'View all conversations', color: '#0284C7', bg: '#E0F2FE' },
              { to: '/therapist/session-notes', icon: <IconBook />, title: 'Session Notes', desc: 'Write and review clinical notes', color: '#EA580C', bg: '#FFEDD5' },
              { to: '/therapist/profile', icon: <IconUsers />, title: 'My Profile', desc: 'Manage your profile details', color: '#7C3AED', bg: '#EDE9FE' },
            ].map((action) => (
              <Link key={action.title} to={action.to} style={styles.quickActionLink}>
                <div style={styles.actionIconBox(action.bg)}>
                  <span style={{ color: action.color }}>{action.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.actionTitle}>{action.title}</div>
                  <div style={styles.actionDesc}>{action.desc}</div>
                </div>
                <IconChevronRight />
              </Link>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Client Progress Tracker</h3>
            <Link to="/therapist/clients" style={styles.viewAllLink}>View All Clients <IconChevronRight /></Link>
          </div>
          
          {clientProgressData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
              <IconUsers />
              <p style={{ marginTop: '0.5rem' }}>No active clients to track yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {clientProgressData.map(client => (
                <div key={client.id} style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600', color: '#111827' }}>{client.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#1B5E20', fontWeight: '600', background: '#E8F5E9', padding: '2px 8px', borderRadius: '999px' }}>Active</span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div style={styles.progressBarFill(client.progress)}></div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                    {client.sessionsCompleted} sessions completed • Next: {client.nextMilestone}
                  </div>
                  <button style={styles.progressBtn} onClick={() => navigate(`/therapist/session-notes/${client.id}`)}>
                    Review Notes & Progress
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default TherapistDashboard;