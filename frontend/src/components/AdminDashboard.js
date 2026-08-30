import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import AdminBookings from './AdminBookings';

// ============ PROFESSIONAL ICONS ============
const IconGradCap = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"></path></svg>;
const IconUsers = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconClock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconArrowRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconDollarSign = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconShield = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconGlobe = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const IconCreditCard = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;

const AdminDashboard = ({ logout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingTherapists, setPendingTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchPendingTherapists();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, filterType]);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      let url = '/admin/users?';
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (filterType) url += `user_type=${filterType}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTherapists = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/admin/therapists/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPendingTherapists(await res.json());
    } catch (err) {
      console.error('Failed to fetch pending therapists', err);
    }
  };

  const handleToggleActive = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/admin/users/${userId}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to toggle user', err);
    }
  };

  const handleApproveTherapist = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/admin/therapists/${userId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Therapist approved successfully!');
        fetchPendingTherapists();
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to approve therapist', err);
    }
  };

  const handleRejectTherapist = async (userId) => {
    const token = localStorage.getItem('token');
    if (!confirm('Are you sure you want to reject this therapist?')) return;
    
    try {
      const res = await fetch(`/admin/therapists/${userId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Therapist rejected.');
        fetchPendingTherapists();
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to reject therapist', err);
    }
  };

  const handleExportCSV = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/admin/export/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  const handlePlatformWithdrawal = async () => {
    const platformRevenue = stats?.total_platform_revenue || 0;
    if (platformRevenue <= 0) {
      alert('No platform earnings available for withdrawal.');
      return;
    }

    const amount = prompt(
      `Available balance: KSh ${platformRevenue.toLocaleString()}\nEnter withdrawal amount (KSh):`
    );
    
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (parseInt(amount) > platformRevenue) {
      alert('Amount exceeds available balance.');
      return;
    }

    const bankDetails = prompt('Enter company bank account details:');
    if (!bankDetails) {
      alert('Bank details are required.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `/admin/withdraw-platform-earnings?amount=${parseInt(amount)}&destination=bank&account_details=${encodeURIComponent(bankDetails)}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert(`Withdrawal request of KSh ${parseInt(amount).toLocaleString()} submitted successfully!`);
        fetchStats();
      } else {
        alert('Failed to submit withdrawal request.');
      }
    } catch (err) {
      console.error('Failed to submit withdrawal', err);
      alert('Failed to submit withdrawal request.');
    }
  };

  // Safe stat values with fallbacks
  const totalUsers = stats?.total_users || 0;
  const totalClients = stats?.total_clients || 0;
  const totalTherapists = stats?.total_therapists || 0;
  const totalBookings = stats?.total_bookings || 0;
  const completedBookings = stats?.completed_bookings || 0;
  const averageRating = stats?.average_rating || 0;
  const totalMessages = stats?.total_messages || 0;
  const totalMoodEntries = stats?.total_mood_entries || 0;
  const totalPlatformRevenue = stats?.total_platform_revenue || 0;
  const totalRevenue = stats?.total_revenue || 0;
  const totalTherapistPayouts = stats?.total_therapist_payouts || 0;

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F9FAFB', overflowX: 'hidden' },
    header: { background: '#1F2937', color: 'white', padding: '1.25rem 0' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', gap: '1rem', flexWrap: 'wrap' },
    navTitle: { fontSize: '1.5rem', fontWeight: '700' },
    navSubtitle: { fontSize: '0.85rem', opacity: 0.7, marginLeft: '0.75rem' },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', minHeight: '44px' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px', width: '100%', boxSizing: 'border-box' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    statValue: { fontSize: '1.75rem', fontWeight: '700', color: '#111827' },
    statLabel: { fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' },
    earningsSection: { background: 'white', borderRadius: '16px', padding: '2rem', border: '2px solid #2E7D32', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(46, 125, 50, 0.1)' },
    earningsTitle: { fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    earningsAmount: { fontSize: '2.5rem', fontWeight: '800', color: '#2E7D32' },
    earningsSubtitle: { color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' },
    withdrawBtn: { padding: '1rem 2rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '48px' },
    section: { background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E7EB', marginBottom: '2rem', overflow: 'hidden' },
    sectionTitle: { fontSize: '1.2rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' },
    filterRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
    searchInput: { flex: 1, minWidth: '200px', padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem', minHeight: '44px', boxSizing: 'border-box' },
    filterSelect: { padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem', background: 'white', minHeight: '44px' },
    exportBtn: { padding: '0.75rem 1.5rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    tableWrapper: { width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
    th: { textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '2px solid #E5E7EB', fontSize: '0.8rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' },
    td: { padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6', fontSize: '0.9rem', color: '#374151', whiteSpace: 'nowrap' },
    badge: (type) => ({
      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
      background: type === 'admin' ? '#FEF3C7' : type === 'therapist' ? '#E0F2FE' : '#E8F5E9',
      color: type === 'admin' ? '#92400E' : type === 'therapist' ? '#0369A1' : '#1B5E20',
      display: 'inline-block',
    }),
    activeBadge: (isActive) => ({
      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
      background: isActive ? '#E8F5E9' : '#FEE2E2',
      color: isActive ? '#1B5E20' : '#991B1B',
      display: 'inline-block',
    }),
    actionBtn: (isActive) => ({
      padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
      cursor: 'pointer', border: '1px solid',
      background: isActive ? '#FEE2E2' : '#E8F5E9',
      color: isActive ? '#991B1B' : '#1B5E20',
      borderColor: isActive ? '#FECACA' : '#BBF7D0',
      minHeight: '36px',
    }),
    emptyState: { textAlign: 'center', padding: '3rem', color: '#9CA3AF' },
    tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #E5E7EB', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
    tab: (isActive) => ({
      padding: '0.75rem 1.5rem',
      background: 'none',
      border: 'none',
      borderBottom: isActive ? '3px solid #2E7D32' : '3px solid transparent',
      color: isActive ? '#2E7D32' : '#6B7280',
      fontWeight: '600',
      fontSize: '0.95rem',
      cursor: 'pointer',
      marginBottom: '-2px',
      whiteSpace: 'nowrap',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
    }),
    therapistCard: {
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      background: '#F9FAFB',
    },
    therapistHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem',
      flexWrap: 'wrap',
      gap: '0.75rem',
    },
    therapistName: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '0.25rem',
      wordBreak: 'break-word',
    },
    therapistEmail: {
      fontSize: '0.85rem',
      color: '#6B7280',
      wordBreak: 'break-all',
    },
    therapistDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem',
    },
    detailItem: { fontSize: '0.9rem' },
    detailLabel: { fontWeight: '600', color: '#374151', marginBottom: '0.25rem' },
    detailValue: { color: '#6B7280', wordBreak: 'break-word' },
    therapistBio: {
      fontSize: '0.9rem',
      color: '#4B5563',
      lineHeight: '1.6',
      marginBottom: '1rem',
      padding: '1rem',
      background: 'white',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
      wordBreak: 'break-word',
    },
    approvalButtons: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    approveBtn: {
      padding: '0.6rem 1.25rem',
      background: '#2E7D32',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
      flex: '1 1 auto',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.4rem',
    },
    rejectBtn: {
      padding: '0.6rem 1.25rem',
      background: 'white',
      color: '#DC2626',
      border: '1px solid #DC2626',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
      flex: '1 1 auto',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.4rem',
    },
    pendingBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      background: '#FEF3C7',
      color: '#92400E',
      whiteSpace: 'nowrap',
    },
    uniManageBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1.25rem 1.5rem',
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '14px',
      cursor: 'pointer',
      width: '100%',
      textAlign: 'left',
      transition: 'all 0.15s ease',
      marginBottom: '0.75rem',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <h1 style={styles.navTitle}>Mecac Admin Panel</h1>
            <span style={styles.navSubtitle}>Platform Management</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            <button onClick={logout} style={styles.logoutBtn}>Logout</button>
          </div>
        </nav>
      </header>

      <main style={styles.main}>
     
        {/* Platform Earnings & Withdrawal Section */}
        {stats && (
          <div style={styles.earningsSection}>
            <h2 style={styles.earningsTitle}>
              <IconDollarSign /> Platform Earnings
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={styles.earningsAmount}>
                  KSh {totalPlatformRevenue.toLocaleString()}
                </div>
                <div style={styles.earningsSubtitle}>
                  Total available for withdrawal (15% commission from all sessions)
                </div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Total Revenue</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>
                      KSh {totalRevenue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Therapist Payouts</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>
                      KSh {totalTherapistPayouts.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Your Share (5% each × 3)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2E7D32' }}>
                      KSh {Math.round(totalPlatformRevenue / 3).toLocaleString()} per person
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handlePlatformWithdrawal}
                style={styles.withdrawBtn}
              >
                Withdraw to Company Bank
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div style={styles.statsGrid}>
            {[
              { label: 'Total Users', value: totalUsers },
              { label: 'Clients', value: totalClients },
              { label: 'Therapists', value: totalTherapists },
              { label: 'Total Bookings', value: totalBookings },
              { label: 'Completed', value: completedBookings },
              { label: 'Avg Rating', value: averageRating.toFixed(1) },
              { label: 'Messages', value: totalMessages },
              { label: 'Mood Entries', value: totalMoodEntries },
            ].map((stat) => (
              <div key={stat.label} style={styles.statCard}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        {/* ===== ANALYTICS CARD ===== */}
        <div
          style={styles.uniManageBtn}
          onClick={() => navigate('/admin/analytics')}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2E7D32'; e.currentTarget.style.background = '#E8F5E9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'white'; }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#111827' }}>View Analytics</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Charts, trends & smart insights on how the platform is performing</div>
          </div>
          <span style={{ color: '#9CA3AF' }}><IconArrowRight /></span>
        </div>

        {/* ===== UNIVERSITY MANAGEMENT CARD ===== */}
        <div
          style={styles.uniManageBtn}
          onClick={() => navigate('/admin/universities')}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2E7D32'; e.currentTarget.style.background = '#E8F5E9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'white'; }}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EDE9FE', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconGradCap />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#111827' }}>Manage Universities</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Add partner universities, manage subscriptions & rage room credits</div>
          </div>
          <span style={{ color: '#9CA3AF' }}><IconArrowRight /></span>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={styles.tab(activeTab === 'users')}
            onClick={() => setActiveTab('users')}
          >
            <IconUsers /> All Users ({users.length})
          </button>
          <button
            style={styles.tab(activeTab === 'pending')}
            onClick={() => setActiveTab('pending')}
          >
            <IconClock /> Pending Approvals ({pendingTherapists.length})
          </button>
          <button
            style={styles.tab(activeTab === 'bookings')}
            onClick={() => setActiveTab('bookings')}
          >
            <IconDollarSign /> Bookings & Refunds
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>User Management</h2>
            
            <div style={styles.filterRow}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Roles</option>
                <option value="client">Clients</option>
                <option value="therapist">Therapists</option>
                <option value="admin">Admins</option>
              </select>
              <button onClick={handleExportCSV} style={styles.exportBtn}>
                <IconDownload /> Export CSV
              </button>
            </div>

            {loading ? (
              <p style={{ color: '#6B7280' }}>Loading users...</p>
            ) : users.length === 0 ? (
              <div style={styles.emptyState}>No users found</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Terms</th>
                      <th style={styles.th}>Joined</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td style={styles.td}>{user.id}</td>
                        <td style={styles.td}>{user.name || 'N/A'}</td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>
                          <span style={styles.badge(user.user_type)}>{user.user_type}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.activeBadge(user.is_active)}>
                            {user.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td style={styles.td}>{user.terms_accepted ? '✓' : '✗'}</td>
                        <td style={styles.td}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td style={styles.td}>
                          {user.user_type !== 'admin' && (
                            <button
                              onClick={() => handleToggleActive(user.id)}
                              style={styles.actionBtn(user.is_active)}
                            >
                              {user.is_active ? 'Disable' : 'Enable'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pending Therapists Tab */}
        {activeTab === 'pending' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Pending Therapist Approvals</h2>
            
            {pendingTherapists.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No pending therapist applications</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  All therapist accounts have been reviewed
                </p>
              </div>
            ) : (
              pendingTherapists.map((therapist) => (
                <div key={therapist.id} style={styles.therapistCard}>
                  <div style={styles.therapistHeader}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.therapistName}>{therapist.name || 'Unnamed'}</div>
                      <div style={styles.therapistEmail}>{therapist.email}</div>
                    </div>
                    <span style={styles.pendingBadge}>Pending Review</span>
                  </div>

                  <div style={styles.therapistDetails}>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Specializations</div>
                      <div style={styles.detailValue}>{therapist.specializations || 'Not provided'}</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Experience</div>
                      <div style={styles.detailValue}>{therapist.experience_years ? `${therapist.experience_years} years` : 'Not provided'}</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Hourly Rate</div>
                      <div style={styles.detailValue}>{therapist.hourly_rate ? `KSh ${therapist.hourly_rate}` : 'Not provided'}</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>License Number</div>
                      <div style={styles.detailValue}>{therapist.license_number || 'Not provided'}</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Languages</div>
                      <div style={styles.detailValue}>{therapist.languages || 'Not provided'}</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Applied On</div>
                      <div style={styles.detailValue}>{new Date(therapist.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {therapist.bio && (
                    <div style={styles.therapistBio}>
                      <strong>Bio:</strong> {therapist.bio}
                    </div>
                  )}

                  <div style={styles.approvalButtons}>
                    <button
                      onClick={() => handleApproveTherapist(therapist.id)}
                      style={styles.approveBtn}
                    >
                      <IconCheck /> Approve Therapist
                    </button>
                    <button
                      onClick={() => handleRejectTherapist(therapist.id)}
                      style={styles.rejectBtn}
                    >
                      <IconX /> Reject Application
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* Bookings & Refunds Tab */}
        {activeTab === 'bookings' && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>All Bookings & Refunds</h2>
            <AdminBookings />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;