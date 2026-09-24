import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import NotificationBell from './NotificationBell';
import SessionReminder from './SessionReminder';
import TherapistStats from './TherapistStats';
import { useToast } from './ToastContext';

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
const IconSparkle = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9z"></path><line x1="19" y1="3" x2="19" y2="7"></line><line x1="17" y1="5" x2="21" y2="5"></line><line x1="5" y1="17" x2="5" y2="21"></line><line x1="3" y1="19" x2="7" y2="19"></line></svg>;
const IconGift = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>;
const IconCopy = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;

// ============ TEMP BRAND MARK ============
// Senior note: this is intentionally not a final logo.
const BrandMark = ({ size = 32 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        background: 'linear-gradient(135deg, #FFFFFF 0%, #E8F5E9 100%)',
        color: '#1B5E20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 900,
        fontSize: size * 0.45,
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        flexShrink: 0,
      }}
    >
      M
    </div>
    <div style={{ lineHeight: 1.1 }}>
      <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'white', letterSpacing: '-0.02em' }}>MECAC</div>
      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.78)', fontWeight: 600 }}>Therapist Portal</div>
    </div>
  </div>
);

// ============ SKELETON SYSTEM ============
const Skeleton = ({ w = '100%', h = '16px', r = '10px', style = {} }) => (
  <div className="td-skel" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

const TherapistDashboardSkeleton = () => (
  <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
    <header style={{ background: '#2E7D32', color: 'white', padding: '1.25rem 0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.22)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: 120, height: 14, borderRadius: 8, background: 'rgba(255,255,255,0.22)' }} />
            <div style={{ width: 86, height: 10, borderRadius: 8, background: 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.18)' }} />
          <div style={{ width: 88, height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.18)' }} />
        </div>
      </nav>
    </header>

    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Skeleton h="160px" r="20px" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} h="82px" r="16px" />
        ))}
      </div>

      <Skeleton h="260px" r="20px" />
      <Skeleton h="220px" r="20px" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} h="88px" r="12px" />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} h="68px" r="14px" />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} h="150px" r="12px" />
        ))}
      </div>
    </main>
  </div>
);

const TherapistDashboard = ({ logout }) => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [therapistName, setTherapistName] = useState('Therapist');

  const [earnings, setEarnings] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // ============ AI SOAP NOTE STATE ============
  const [soapSelectedBooking, setSoapSelectedBooking] = useState('');
  const [soapRoughNotes, setSoapRoughNotes] = useState('');
  const [soapGenerating, setSoapGenerating] = useState(false);
  const [soapResult, setSoapResult] = useState(null);
  const [soapError, setSoapError] = useState('');
  const [soapCopied, setSoapCopied] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      addToast('Session expired. Please log in again.', 'error');
      if (typeof logout === 'function') logout();
      setLoading(false);
      return;
    }

    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    const [appointmentsRes, nameRes, earningsRes] = await Promise.allSettled([
      fetch(`${API_URL}/bookings/me`, { headers }),
      fetch(`${API_URL}/users/me`, { headers }),
      fetch(`${API_URL}/therapist/earnings`, { headers }),
    ]);

    let hadError = false;

    if (appointmentsRes.status === 'fulfilled' && appointmentsRes.value.ok) {
      const data = await appointmentsRes.value.json();
      setAppointments(Array.isArray(data) ? data : []);
    } else {
      setAppointments([]);
      hadError = true;
    }

    if (nameRes.status === 'fulfilled' && nameRes.value.ok) {
      const data = await nameRes.value.json();
      const realName =
        data.name && data.name !== 'Anonymous'
          ? data.name
          : data.email
          ? data.email.split('@')[0]
          : 'Therapist';
      setTherapistName(realName);
    } else {
      hadError = true;
    }

    if (earningsRes.status === 'fulfilled' && earningsRes.value.ok) {
      const data = await earningsRes.value.json();
      setEarnings(data);
    } else {
      setEarnings(null);
      hadError = true;
    }

    if (hadError) {
      addToast('Some dashboard data could not be loaded.', 'error');
    }

    setLoading(false);
  };

  const refreshEarnings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/therapist/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setEarnings(data);
      }
    } catch (err) {
      console.error('Failed to refresh earnings', err);
      addToast('Failed to refresh earnings.', 'error');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawPhone) {
      addToast('Please enter amount and M-Pesa number.', 'error');
      return;
    }

    if (isNaN(withdrawAmount) || Number(withdrawAmount) < 500) {
      addToast('Minimum withdrawal is KSh 500.', 'error');
      return;
    }

    if (earnings && Number(withdrawAmount) > earnings.balance) {
      addToast('Amount exceeds available balance.', 'error');
      return;
    }

    setWithdrawLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(
        `${API_URL}/therapist/withdraw?amount=${withdrawAmount}&mpesa_phone=${withdrawPhone}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (res.ok) {
        addToast(data.message || 'Withdrawal request submitted.', 'success');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawPhone('');
        refreshEarnings();
      } else {
        addToast(data.detail || 'Withdrawal failed', 'error');
      }
    } catch (err) {
      addToast('Failed to submit withdrawal request.', 'error');
    } finally {
      setWithdrawLoading(false);
    }
  };

  // ============ AI SOAP NOTE GENERATOR ============
  const handleGenerateSOAP = async () => {
    if (!soapSelectedBooking) {
      setSoapError('Please select a session first.');
      return;
    }

    setSoapGenerating(true);
    setSoapError('');
    setSoapResult(null);
    setSoapCopied(false);

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/ai/therapist/soap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: Number(soapSelectedBooking),
          rough_notes: soapRoughNotes || '',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSoapResult(data);
        addToast('SOAP note generated successfully.', 'success');
      } else {
        const errorMsg = Array.isArray(data.detail)
          ? data.detail.map((e) => e.msg).join(', ')
          : data.detail || 'Failed to generate SOAP note.';
        setSoapError(errorMsg);
        addToast(errorMsg, 'error');
      }
    } catch (err) {
      setSoapError('Network error. Please try again.');
      addToast('Network error. Please try again.', 'error');
    } finally {
      setSoapGenerating(false);
    }
  };

  const handleCopySOAP = () => {
    if (!soapResult) return;

    const text = `SOAP NOTE\n\nS: ${soapResult.subjective}\n\nO: ${soapResult.objective}\n\nA: ${soapResult.assessment}\n\nP: ${soapResult.plan}`;

    navigator.clipboard.writeText(text).then(() => {
      setSoapCopied(true);
      addToast('SOAP note copied to clipboard!', 'success');
      setTimeout(() => setSoapCopied(false), 2000);
    });
  };

  // ============ COMPUTED VALUES ============
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed').length;

  const uniqueClientIds = [...new Set(appointments.map((a) => a.client_id))];
  const uniqueClientsCount = uniqueClientIds.length;

  const upcoming = appointments
    .filter((a) => (a.status === 'confirmed' || a.status === 'pending') && new Date(a.scheduled_time) > new Date())
    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime())
    .slice(0, 5);

  const soapEligibleSessions = appointments
    .filter((a) => a.status === 'completed' || a.status === 'confirmed')
    .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime())
    .slice(0, 10);

  const clientProgressData = uniqueClientIds.map((clientId) => {
    const clientAppts = appointments.filter((a) => a.client_id === clientId);
    const clientName = clientAppts[0]?.client_name || `Client #${clientId}`;
    const completed = clientAppts.filter((a) => a.status === 'completed').length;
    const progress = Math.min(100, completed * 25);
    const milestones = ['Intake & Assessment', 'Goal Setting', 'Skill Building', 'Integration', 'Maintenance & Review'];

    return {
      id: clientId,
      name: clientName,
      sessionsCompleted: completed,
      progress,
      nextMilestone: milestones[Math.min(completed, milestones.length - 1)],
    };
  });

  // ============ PAYMENT BADGE HELPER ============
  const PaymentBadge = ({ paymentStatus, amount }) => {
    if (paymentStatus === 'sponsored') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '0.68rem',
            fontWeight: '700',
            background: '#DBEAFE',
            color: '#1E40AF',
            border: '1px solid #93C5FD',
          }}
        >
          <IconGift /> Sponsored
        </span>
      );
    }

    if (paymentStatus === 'completed') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '0.68rem',
            fontWeight: '700',
            background: '#D1FAE5',
            color: '#065F46',
            border: '1px solid #6EE7B7',
          }}
        >
          Paid • KSh {(amount || 0).toLocaleString()}
        </span>
      );
    }

    if (paymentStatus === 'pending') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '0.68rem',
            fontWeight: '700',
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FDE68A',
          }}
        >
          Awaiting Payment
        </span>
      );
    }

    return null;
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    header: { background: '#2E7D32', color: 'white', padding: '1.25rem 0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0 20px', gap: '1rem', flexWrap: 'wrap' },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', minHeight: '44px', transition: 'all 0.2s ease' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px', display: 'flex', flexDirection: 'column', gap: '2rem' },
    welcomeBanner: { background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', borderRadius: '20px', padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(46, 125, 50, 0.2)' },
    bannerCircle: { position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' },
    bannerTitle: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' },
    bannerText: { opacity: '0.9', fontSize: '0.95rem', marginBottom: '1.25rem' },
    bannerBtns: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
    bannerBtnPrimary: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', background: 'white', color: '#1B5E20', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' },
    bannerBtnSecondary: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.2s ease' },
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
    sessionItem: { padding: '1rem', background: '#F9FAFB', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem', flexWrap: 'wrap', transition: 'all 0.2s ease' },
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
    progressBtn: { marginTop: '0.75rem', padding: '0.5rem 1rem', background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'all 0.2s ease' },
  };

  if (loading) {
    return <TherapistDashboardSkeleton />;
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
        <div style={styles.welcomeBanner}>
          <div style={styles.bannerCircle} />
          <h2 style={styles.bannerTitle}>Welcome back, {therapistName}</h2>
          <p style={styles.bannerText}>
            {pendingCount > 0
              ? `You have ${pendingCount} pending session request${pendingCount > 1 ? 's' : ''} awaiting confirmation.`
              : 'Your schedule is up to date. Ready to help your clients today.'}
          </p>
          <div style={styles.bannerBtns}>
            <button
              onClick={() => navigate('/therapist/profile')}
              style={styles.bannerBtnPrimary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <IconUsers /> Edit Profile
            </button>
            <button
              onClick={() => navigate('/therapist-availability')}
              style={styles.bannerBtnPrimary}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <IconCalendar /> Set Availability
            </button>
            <button
              onClick={() => navigate('/therapist/clients')}
              style={styles.bannerBtnSecondary}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <IconUsers /> My Clients
            </button>
          </div>
        </div>

        <SessionReminder />

        {/* THERAPIST PERFORMANCE METRICS */}
        <TherapistStats />

        {/* ============ AI SOAP NOTE GENERATOR ============ */}
        <div style={{ ...styles.card, border: '2px solid #7C3AED', background: 'linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 100%)' }}>
          <div style={styles.cardHeader}>
            <h3 style={{ ...styles.cardTitle, color: '#4C1D95', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#7C3AED' }}><IconSparkle /></span> AI Clinical Assistant
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#7C3AED', background: '#EDE9FE', padding: '4px 12px', borderRadius: '999px', fontWeight: '600' }}>
              Powered by AI
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
            Select a session below and let AI draft a professional SOAP note from the chat transcript.
            Add your rough observations to make it even more accurate.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                Select Session
              </label>
              <select
                value={soapSelectedBooking}
                onChange={(e) => {
                  setSoapSelectedBooking(e.target.value);
                  setSoapError('');
                  setSoapResult(null);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.88rem',
                  background: 'white',
                  color: '#111827',
                  cursor: 'pointer',
                  appearance: 'auto',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <option value="">-- Choose a session --</option>
                {soapEligibleSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.client_name || 'Client'} — {new Date(s.scheduled_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem' }}>
                Your Rough Notes (Optional)
              </label>
              <input
                type="text"
                value={soapRoughNotes}
                onChange={(e) => setSoapRoughNotes(e.target.value)}
                placeholder="e.g., Client seemed anxious about exams..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          </div>

          <button
            onClick={handleGenerateSOAP}
            disabled={soapGenerating || !soapSelectedBooking}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: soapGenerating || !soapSelectedBooking ? '#9CA3AF' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: soapGenerating || !soapSelectedBooking ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: soapGenerating || !soapSelectedBooking ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!soapGenerating && soapSelectedBooking) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(124, 58, 237, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = soapGenerating || !soapSelectedBooking ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.3)';
            }}
          >
            {soapGenerating ? (
              <>
                <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'tdSpin 1s linear infinite' }} />
                Drafting SOAP Note...
              </>
            ) : (
              <>
                <IconSparkle /> Generate SOAP Note
              </>
            )}
          </button>

          {soapError && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#FEE2E2', borderRadius: '10px', color: '#991B1B', fontSize: '0.85rem', fontWeight: '500' }}>
              {soapError}
            </div>
          )}

          {soapResult && (
            <div style={{ marginTop: '1.25rem', background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>Generated SOAP Note</span>
                <button
                  onClick={handleCopySOAP}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0.4rem 0.85rem',
                    background: soapCopied ? '#D1FAE5' : '#F3F4F6',
                    color: soapCopied ? '#065F46' : '#374151',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <IconCopy /> {soapCopied ? 'Copied!' : 'Copy Note'}
                </button>
              </div>

              <div style={{ padding: '1.25rem' }}>
                {[
                  { letter: 'S', label: 'Subjective', value: soapResult.subjective, color: '#2563EB', bg: '#EFF6FF' },
                  { letter: 'O', label: 'Objective', value: soapResult.objective, color: '#059669', bg: '#ECFDF5' },
                  { letter: 'A', label: 'Assessment', value: soapResult.assessment, color: '#D97706', bg: '#FFFBEB' },
                  { letter: 'P', label: 'Plan', value: soapResult.plan, color: '#7C3AED', bg: '#F5F3FF' },
                ].map((section) => (
                  <div key={section.letter} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: section.bg,
                          color: section.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          border: `1px solid ${section.color}22`,
                        }}
                      >
                        {section.letter}
                      </span>
                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: section.color }}>{section.label}</span>
                    </div>
                    <p style={{ margin: 0, padding: '0.75rem 1rem', background: '#F9FAFB', borderRadius: '8px', fontSize: '0.88rem', color: '#374151', lineHeight: 1.6, border: '1px solid #F3F4F6' }}>
                      {section.value || 'No data available.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* EARNINGS SECTION */}
        <div style={{ ...styles.card, border: '2px solid #2E7D32', background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)' }}>
          <div style={styles.cardHeader}>
            <h3 style={{ ...styles.cardTitle, color: '#1B5E20', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconDollarSign /> My Earnings & Wallet
            </h3>
            <button
              onClick={() => setShowWithdrawModal(true)}
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
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 8px 18px rgba(46,125,50,0.22)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <IconDollarSign /> Request Withdrawal
            </button>
          </div>

          {!earnings && (
            <div style={{ padding: '0.85rem 1rem', background: '#FEF3C7', color: '#92400E', borderRadius: '10px', fontSize: '0.88rem', fontWeight: '600', marginBottom: '1rem' }}>
              Earnings data is currently unavailable. Values below may be incomplete.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2E7D32' }}>
                KSh {(earnings?.total_earned || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Total Earned</div>
            </div>
            <div style={{ background: '#FEF3C7', padding: '1.25rem', borderRadius: '12px', border: '1px solid #FDE68A', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#92400E' }}>
                KSh {(earnings?.balance || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Available Balance</div>
            </div>
            <div style={{ background: '#F3F4F6', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#374151' }}>
                KSh {(earnings?.total_withdrawn || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Total Withdrawn</div>
            </div>
          </div>
        </div>

        <div style={styles.statsGrid}>
          {[
            { label: 'Total Sessions', value: appointments.length, icon: <IconCalendar />, color: '#2E7D32', bg: '#E8F5E9' },
            { label: 'Completed', value: completedCount, icon: <IconCheckCircle />, color: '#0284C7', bg: '#E0F2FE' },
            { label: 'Pending Requests', value: pendingCount, icon: <IconClock />, color: '#EA580C', bg: '#FFEDD5' },
            { label: 'Active Clients', value: uniqueClientsCount, icon: <IconUsers />, color: '#7C3AED', bg: '#EDE9FE' },
          ].map((stat) => (
            <div key={stat.label} className="td-stat-card" style={styles.statCard}>
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

            {upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                <IconCalendar />
                <p style={{ marginTop: '0.5rem' }}>No upcoming sessions</p>
              </div>
            ) : (
              upcoming.map((s) => (
                <div key={s.id} className="td-session-item" style={styles.sessionItem}>
                  <div style={styles.sessionIconBox}><IconVideo /></div>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <div style={styles.sessionClient}>{s.client_name || 'Client'}</div>
                    <div style={styles.sessionTime}>
                      {new Date(s.scheduled_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                      {new Date(s.scheduled_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <PaymentBadge paymentStatus={s.payment_status} amount={s.amount} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => navigate(`/session/video/${s.id}`)}
                      style={{ padding: '0.45rem 0.9rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1B5E20';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#2E7D32';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
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
              <Link key={action.title} to={action.to} className="td-action-link" style={styles.quickActionLink}>
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
              {clientProgressData.map((client) => (
                <div key={client.id} style={{ padding: '1.25rem', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C8E6C9';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
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
                  <button
                    className="td-progress-btn"
                    style={styles.progressBtn}
                    onClick={() => navigate(`/therapist/session-notes/${client.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E8F5E9';
                      e.currentTarget.style.borderColor = '#C8E6C9';
                      e.currentTarget.style.color = '#1B5E20';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F3F4F6';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    Review Notes & Progress
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowWithdrawModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '450px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                placeholder={`Max: KSh ${(earnings?.balance || 0).toLocaleString()}`}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none',
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
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {withdrawAmount && !isNaN(withdrawAmount) && Number(withdrawAmount) > 0 && (
              <div style={{
                background: '#F0FDF4',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '1px solid #BBF7D0',
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
                onClick={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                  setWithdrawPhone('');
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#374151',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawLoading || !withdrawAmount || !withdrawPhone}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: withdrawLoading ? '#9CA3AF' : '#2E7D32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: withdrawLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {withdrawLoading ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tdSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .td-skel {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
          background-size: 400% 100%;
          animation: tdShimmer 1.4s ease infinite;
        }

        @keyframes tdShimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }

        .td-stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .td-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.08);
          border-color: #D1D5DB;
        }

        .td-action-link:hover {
          border-color: #2E7D32 !important;
          background: #F9FAFB !important;
          transform: translateX(2px);
        }

        .td-session-item:hover {
          background: #F3F4F6 !important;
          border-color: #D1D5DB;
        }

        @media (prefers-reduced-motion: reduce) {
          .td-skel,
          .td-stat-card,
          .td-action-link,
          .td-session-item {
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

export default TherapistDashboard;