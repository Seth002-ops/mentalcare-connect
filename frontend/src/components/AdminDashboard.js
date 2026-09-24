import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import AdminBookings from './AdminBookings';
import { API_URL } from '../config';
import { useToast } from './ToastContext';

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
const IconChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;

// ============ TEMP BRAND MARK ============
const BrandMark = ({ size = 32 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        fontSize: size * 0.45,
        boxShadow: '0 6px 16px rgba(46,125,50,0.22)',
        flexShrink: 0,
      }}
    >
      M
    </div>
    <div style={{ lineHeight: 1.1 }}>
      <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'white', letterSpacing: '-0.02em' }}>MECAC</div>
      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.68)', fontWeight: 600 }}>Admin Control</div>
    </div>
  </div>
);

// ============ SKELETON SYSTEM ============
const Skeleton = ({ w = '100%', h = '16px', r = '10px', style = {} }) => (
  <div className="admin-skel" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const AdminDashboardSkeleton = () => (
  <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
    <header style={{ background: '#1F2937', color: 'white', padding: '1.25rem 0' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.14)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: 140, height: 14, borderRadius: 8, background: 'rgba(255,255,255,0.16)' }} />
            <div style={{ width: 96, height: 10, borderRadius: 8, background: 'rgba(255,255,255,0.10)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ width: 88, height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.12)' }} />
        </div>
      </nav>
    </header>

    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px', width: '100%', boxSizing: 'border-box' }}>
      <Skeleton h="190px" r="16px" style={{ marginBottom: '2rem' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} h="86px" r="12px" />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} h="76px" r="14px" />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} w="140px" h="42px" r="10px" />
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E7EB' }}>
        <Skeleton w="220px" h="22px" style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Skeleton h="44px" r="8px" style={{ flex: 1, minWidth: '200px' }} />
          <Skeleton w="160px" h="44px" r="8px" />
          <Skeleton w="130px" h="44px" r="8px" />
        </div>

        {Array.from({ length: 6 }).map((_, rowIndex) => (
          <div key={rowIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #F3F4F6' }}>
            {Array.from({ length: 8 }).map((__, colIndex) => (
              <Skeleton key={colIndex} h="16px" r="6px" />
            ))}
          </div>
        ))}
      </div>
    </main>
  </div>
);

const AdminDashboard = ({ logout }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingTherapists, setPendingTherapists] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  const initialLoadedRef = useRef(false);

  const buildUsersUrl = () => {
    let url = `${API_URL}/admin/users?`;
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
    if (filterType) url += `user_type=${filterType}`;
    return url;
  };

  const fetchStats = async (showError = true) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStats(await res.json());
      } else if (showError) {
        addToast('Failed to load platform stats.', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
      if (showError) addToast('Network error loading stats.', 'error');
    }
  };

  const fetchUsers = async (showError = true) => {
    const token = localStorage.getItem('token');
    setUsersLoading(true);
    try {
      const res = await fetch(buildUsersUrl(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(await res.json());
      } else if (showError) {
        addToast('Failed to load users.', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
      if (showError) addToast('Network error loading users.', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchPendingTherapists = async (showError = true) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/therapists/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPendingTherapists(await res.json());
      } else if (showError) {
        addToast('Failed to load pending therapists.', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch pending therapists', err);
      if (showError) addToast('Network error loading pending therapists.', 'error');
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        addToast('Session expired. Please log in again.', 'error');
        if (typeof logout === 'function') logout();
        setInitialLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, pendingRes] = await Promise.allSettled([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(buildUsersUrl(), { headers }),
        fetch(`${API_URL}/admin/therapists/pending`, { headers }),
      ]);

      let hadError = false;

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      } else {
        hadError = true;
      }

      if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
        setUsers(await usersRes.value.json());
      } else {
        hadError = true;
      }

      if (pendingRes.status === 'fulfilled' && pendingRes.value.ok) {
        setPendingTherapists(await pendingRes.value.json());
      } else {
        hadError = true;
      }

      if (hadError) {
        addToast('Some admin data could not be loaded.', 'error');
      }

      initialLoadedRef.current = true;
      setInitialLoading(false);
    };

    loadInitial();
  }, []);

  useEffect(() => {
    if (!initialLoadedRef.current) return;
    fetchUsers();
  }, [searchQuery, filterType]);

  const handleToggleActive = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        addToast('User status updated successfully', 'success');
        fetchUsers(false);
        fetchStats(false);
      } else {
        addToast('Failed to update user status', 'error');
      }
    } catch (err) {
      console.error('Failed to toggle user', err);
      addToast('Failed to update user status', 'error');
    }
  };

  const handleApproveTherapist = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/therapists/${userId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        addToast('Therapist approved successfully!', 'success');
        fetchPendingTherapists(false);
        fetchUsers(false);
        fetchStats(false);
      } else {
        addToast('Failed to approve therapist', 'error');
      }
    } catch (err) {
      console.error('Failed to approve therapist', err);
      addToast('Network error while approving therapist', 'error');
    }
  };

  const handleRejectTherapist = async (userId) => {
    const token = localStorage.getItem('token');
    if (!confirm('Are you sure you want to reject this therapist?')) return;

    try {
      const res = await fetch(`${API_URL}/admin/therapists/${userId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        addToast('Therapist application rejected', 'info');
        fetchPendingTherapists(false);
        fetchUsers(false);
        fetchStats(false);
      } else {
        addToast('Failed to reject therapist', 'error');
      }
    } catch (err) {
      console.error('Failed to reject therapist', err);
      addToast('Network error while rejecting therapist', 'error');
    }
  };

  const handleExportCSV = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/export/users`, {
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
        addToast('CSV export downloaded successfully', 'success');
      } else {
        addToast('Failed to export CSV', 'error');
      }
    } catch (err) {
      console.error('Failed to export CSV', err);
      addToast('Network error while exporting', 'error');
    }
  };

  const handlePlatformWithdrawal = async () => {
    const platformRevenue = stats?.total_platform_revenue || 0;

    if (platformRevenue <= 0) {
      addToast('No platform earnings available for withdrawal', 'error');
      return;
    }

    const amount = prompt(
      `Available balance: KSh ${platformRevenue.toLocaleString()}\nEnter withdrawal amount (KSh):`
    );

    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    if (parseInt(amount) > platformRevenue) {
      addToast('Amount exceeds available balance', 'error');
      return;
    }

    const bankDetails = prompt('Enter company bank account details:');
    if (!bankDetails) {
      addToast('Bank details are required', 'error');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(
        `${API_URL}/admin/withdraw-platform-earnings?amount=${parseInt(amount)}&destination=bank&account_details=${encodeURIComponent(bankDetails)}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        addToast(`Withdrawal request of KSh ${parseInt(amount).toLocaleString()} submitted successfully!`, 'success');
        fetchStats(false);
      } else {
        addToast('Failed to submit withdrawal request', 'error');
      }
    } catch (err) {
      console.error('Failed to submit withdrawal', err);
      addToast('Network error while submitting withdrawal', 'error');
    }
  };

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
    container: { minHeight: '100vh', backgroundColor: '#F9FAFB', overflowX: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    header: { background: '#1F2937', color: 'white', padding: '1.25rem 0' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', gap: '1rem', flexWrap: 'wrap' },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', minHeight: '44px', transition: 'all 0.2s ease' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px', width: '100%', boxSizing: 'border-box' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: 'white', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    statValue: { fontSize: '1.75rem', fontWeight: '700', color: '#111827' },
    statLabel: { fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' },
    earningsSection: { background: 'white', borderRadius: '16px', padding: '2rem', border: '2px solid #2E7D32', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(46, 125, 50, 0.1)' },
    earningsTitle: { fontSize: '1.3rem', fontWeight: '700', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    earningsAmount: { fontSize: '2.5rem', fontWeight: '800', color: '#2E7D32' },
    earningsSubtitle: { color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' },
    withdrawBtn: { padding: '1rem 2rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '48px', transition: 'all 0.2s ease' },
    section: { background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E7EB', marginBottom: '2rem', overflow: 'hidden' },
    sectionTitle: { fontSize: '1.2rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' },
    filterRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
    searchInput: { flex: 1, minWidth: '200px', padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem', minHeight: '44px', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s ease' },
    filterSelect: { padding: '0.75rem 1rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem', background: 'white', minHeight: '44px', outline: 'none' },
    exportBtn: { padding: '0.75rem 1.5rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' },
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
      transition: 'all 0.2s ease',
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
      transition: 'all 0.2s ease',
    }),
    therapistCard: {
      border: '1px solid #E5E7EB',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1rem',
      background: '#F9FAFB',
      transition: 'all 0.2s ease',
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
      transition: 'all 0.2s ease',
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
      transition: 'all 0.2s ease',
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
    managementCard: {
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
      transition: 'all 0.2s ease',
      marginBottom: '0.75rem',
      textDecoration: 'none',
      color: 'inherit',
      boxSizing: 'border-box',
    },
  };

  if (initialLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <BrandMark size={32} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationBell />
            <button
              onClick={logout}
              style={styles.logoutBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main style={styles.main}>
        {/* Platform Earnings & Withdrawal Section */}
        <div style={styles.earningsSection}>
          <h2 style={styles.earningsTitle}>
            <IconDollarSign /> Platform Earnings
          </h2>

          {!stats && (
            <div style={{ padding: '0.85rem 1rem', background: '#FEF3C7', color: '#92400E', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '600', marginBottom: '1rem' }}>
              Platform stats are currently unavailable. Values below may be incomplete.
            </div>
          )}

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
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(46,125,50,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Withdraw to Company Bank
            </button>
          </div>
        </div>

        {/* Stats Grid */}
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
            <div key={stat.label} className="admin-stat-card" style={styles.statCard}>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Management Cards */}
        <div
          className="admin-action-card"
          style={styles.managementCard}
          onClick={() => navigate('/admin/analytics')}
        >
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconChart />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#111827' }}>View Analytics</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Charts, trends & smart insights on how the platform is performing</div>
          </div>
          <span style={{ color: '#9CA3AF' }}><IconArrowRight /></span>
        </div>

        <div
          className="admin-action-card"
          style={styles.managementCard}
          onClick={() => navigate('/admin/universities')}
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

        <Link to="/admin/rage-rooms" className="admin-action-card" style={styles.managementCard}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FCE4EC', color: '#C2185B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconShield />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#111827' }}>Rage Rooms</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Register spaces with photos & locations</div>
          </div>
          <span style={{ color: '#9CA3AF' }}><IconArrowRight /></span>
        </Link>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={styles.tab(activeTab === 'users')}
            onClick={() => setActiveTab('users')}
            onMouseEnter={(e) => {
              if (activeTab !== 'users') e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'users') e.currentTarget.style.color = '#6B7280';
            }}
          >
            <IconUsers /> All Users ({users.length})
          </button>
          <button
            style={styles.tab(activeTab === 'pending')}
            onClick={() => setActiveTab('pending')}
            onMouseEnter={(e) => {
              if (activeTab !== 'pending') e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'pending') e.currentTarget.style.color = '#6B7280';
            }}
          >
            <IconClock /> Pending Approvals ({pendingTherapists.length})
          </button>
          <button
            style={styles.tab(activeTab === 'bookings')}
            onClick={() => setActiveTab('bookings')}
            onMouseEnter={(e) => {
              if (activeTab !== 'bookings') e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'bookings') e.currentTarget.style.color = '#6B7280';
            }}
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
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2E7D32';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(46,125,50,0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
              <button
                onClick={handleExportCSV}
                style={styles.exportBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 18px rgba(46,125,50,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <IconDownload /> Export CSV
              </button>
            </div>

            {usersLoading ? (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['ID', 'Name', 'Email', 'Role', 'Status', 'Terms', 'Joined', 'Actions'].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        {Array.from({ length: 8 }).map((__, colIndex) => (
                          <td key={colIndex} style={styles.td}>
                            <Skeleton h="16px" r="6px" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                      <tr key={user.id} className="admin-table-row">
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
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
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
                <div
                  key={therapist.id}
                  style={styles.therapistCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C8E6C9';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1B5E20';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2E7D32';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <IconCheck /> Approve Therapist
                    </button>
                    <button
                      onClick={() => handleRejectTherapist(therapist.id)}
                      style={styles.rejectBtn}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEF2F2';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
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

      <style>{`
        .admin-skel {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
          background-size: 400% 100%;
          animation: adminShimmer 1.4s ease infinite;
        }

        @keyframes adminShimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }

        .admin-stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .admin-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.08);
          border-color: #D1D5DB;
        }

        .admin-action-card:hover {
          border-color: #2E7D32 !important;
          background: #F9FAFB !important;
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.06);
        }

        .admin-table-row {
          transition: background 0.15s ease;
        }
        .admin-table-row:hover {
          background: #F9FAFB;
        }

        @media (prefers-reduced-motion: reduce) {
          .admin-skel,
          .admin-stat-card,
          .admin-action-card,
          .admin-table-row {
            animation: none !important;
            transition: none !important;
          }
        }

        @media (max-width: 640px) {
          nav {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;