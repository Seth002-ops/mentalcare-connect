import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

// ============ PROFESSIONAL ICONS ============
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconTrendUp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const IconTrendDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconBarChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;

const AdminAnalyticsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/admin/analytics/timeseries?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Calculate totals =====
  const totals = data.reduce((acc, day) => ({
    revenue: acc.revenue + day.revenue,
    bookings: acc.bookings + day.bookings,
    newUsers: acc.newUsers + day.new_users,
    rageBookings: acc.rageBookings + day.rage_bookings,
  }), { revenue: 0, bookings: 0, newUsers: 0, rageBookings: 0 });

  // ===== Smart Insights Calculations =====
  const half = Math.floor(data.length / 2);
  const firstHalfRev = data.slice(0, half).reduce((s, d) => s + d.revenue, 0);
  const secondHalfRev = data.slice(half).reduce((s, d) => s + d.revenue, 0);
  const revenueTrend = firstHalfRev > 0 ? Math.round(((secondHalfRev - firstHalfRev) / firstHalfRev) * 100) : 0;
  const isGrowing = revenueTrend >= 0;

  const bestRevenueDay = data.length > 0 ? data.reduce((max, d) => d.revenue > max.revenue ? d : max, data[0]) : null;
  const bestRageDay = data.length > 0 ? data.reduce((max, d) => d.rage_bookings > max.rage_bookings ? d : max, data[0]) : null;

  const insights = [
    {
      icon: isGrowing ? <IconTrendUp /> : <IconTrendDown />,
      color: isGrowing ? '#2E7D32' : '#DC2626',
      bg: isGrowing ? '#E8F5E9' : '#FEE2E2',
      title: isGrowing ? 'Revenue is Growing' : 'Revenue Needs Attention',
      text: isGrowing
        ? `Revenue trended up ${revenueTrend}% in the second half of this period. Keep the momentum going!`
        : `Revenue trended down ${Math.abs(revenueTrend)}% in the second half. Consider a promotion to boost bookings.`,
    },
    {
      icon: <IconCalendar />,
      color: '#3B82F6',
      bg: '#EFF6FF',
      title: 'Best Earning Day',
      text: bestRevenueDay && bestRevenueDay.revenue > 0
        ? `${bestRevenueDay.date} was your top day, bringing in KSh ${bestRevenueDay.revenue.toLocaleString()}.`
        : 'No completed sessions yet in this period.',
    },
    {
      icon: <IconUsers />,
      color: '#8B5CF6',
      bg: '#F5F3FF',
      title: 'Client Growth',
      text: `${totals.newUsers} new ${totals.newUsers === 1 ? 'user' : 'users'} joined Mecac in the last ${days} days.`,
    },
    {
      icon: <IconZap />,
      color: '#F59E0B',
      bg: '#FFFBEB',
      title: 'Rage Room Activity',
      text: bestRageDay && bestRageDay.rage_bookings > 0
        ? `${totals.rageBookings} rage sessions total. Peak was ${bestRageDay.date} with ${bestRageDay.rage_bookings} ${bestRageDay.rage_bookings === 1 ? 'session' : 'sessions'}.`
        : 'No rage room sessions booked in this period yet.',
    },
  ];

  const styles = {
    page: { minHeight: '100vh', backgroundColor: '#F9FAFB' },
    header: { background: '#1F2937', color: 'white', padding: '1.25rem 0' },
    headerInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px' },
    card: { background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },
  };

  if (loading) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <IconBarChart /> Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Platform Analytics</h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.7 }}>How Mecac is performing at a glance</p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>
            <IconArrowLeft /> Back to Dashboard
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Period Selector */}
        <div style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontWeight: '700', color: '#111827' }}>Time Range</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[7, 14, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  padding: '0.5rem 1rem',
                  background: days === d ? '#2E7D32' : '#F3F4F6',
                  color: days === d ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ ...styles.card, marginBottom: 0, borderLeft: '4px solid #2E7D32' }}>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Total Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2E7D32' }}>KSh {totals.revenue.toLocaleString()}</div>
          </div>
          <div style={{ ...styles.card, marginBottom: 0, borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Therapy Bookings</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{totals.bookings}</div>
          </div>
          <div style={{ ...styles.card, marginBottom: 0, borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>New Users</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{totals.newUsers}</div>
          </div>
          <div style={{ ...styles.card, marginBottom: 0, borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Rage Room Sessions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{totals.rageBookings}</div>
          </div>
        </div>

        {/* Smart Insights */}
        <div style={styles.card}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconBarChart /> Smart Insights
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ padding: '1.25rem', background: ins.bg, borderRadius: '12px', border: `1px solid ${ins.color}22` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <span style={{ color: ins.color, display: 'flex' }}>{ins.icon}</span>
                  <span style={{ fontWeight: '700', color: ins.color, fontSize: '0.95rem' }}>{ins.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#374151', lineHeight: 1.5 }}>{ins.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>Revenue & Bookings Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '0.75rem' }} />
              <YAxis yAxisId="left" stroke="#9CA3AF" style={{ fontSize: '0.75rem' }} tickFormatter={(v) => `KSh ${v}`} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value, name) => name === 'revenue' ? [`KSh ${value.toLocaleString()}`, 'Revenue'] : [value, 'Bookings']}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#2E7D32" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Bookings" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Users & Rage Chart */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: '600', color: '#374151' }}>User Growth & Rage Room Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '0.75rem' }} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="new_users" fill="#8B5CF6" name="New Users" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rage_bookings" fill="#F59E0B" name="Rage Room Sessions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalyticsPage;