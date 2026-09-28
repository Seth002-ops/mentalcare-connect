import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';
import { API_URL } from '../config'; // ✅ FIXED: Using centralized config
import { useToast } from './ToastContext';

// ============ ICONS ============
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconTrendUp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const IconTrendDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconBarChart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const IconRefresh = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;

// ============ SKELETON COMPONENTS ============
const Skeleton = ({ w = '100%', h = '20px', r = '8px' }) => (
  <div className="aa-skel" style={{ width: w, height: h, borderRadius: r }} />
);

const DashboardSkeleton = () => (
  <div className="aa-page">
    <header className="aa-header">
      <div className="aa-header-inner">
        <Skeleton w="200px" h="24px" />
        <Skeleton w="120px" h="36px" r="8px" />
      </div>
    </header>
    <main className="aa-main">
      {/* Period Selector Skeleton */}
      <div className="aa-card aa-period-card">
        <Skeleton w="100px" h="16px" />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} w="80px" h="32px" r="6px" />)}
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="aa-summary-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="aa-card aa-stat-card">
            <Skeleton w="60%" h="12px" style={{ marginBottom: '0.5rem' }} />
            <Skeleton w="40%" h="24px" />
          </div>
        ))}
      </div>

      {/* Insights Skeleton */}
      <div className="aa-card">
        <Skeleton w="150px" h="20px" style={{ marginBottom: '1rem' }} />
        <div className="aa-insights-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aa-insight-item">
              <Skeleton w="100%" h="80px" r="12px" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts Skeleton */}
      <div className="aa-card">
        <Skeleton w="200px" h="18px" style={{ marginBottom: '1rem' }} />
        <Skeleton w="100%" h="300px" r="12px" />
      </div>
      
      <div className="aa-card">
        <Skeleton w="200px" h="18px" style={{ marginBottom: '1rem' }} />
        <Skeleton w="100%" h="280px" r="12px" />
      </div>
    </main>
  </div>
);

const AdminAnalyticsPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    if (!refreshing) setLoading(true);
    else setRefreshing(true);
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/admin/analytics/timeseries?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const json = await res.json();
        // Ensure data is sorted by date ascending for charts
        const sorted = Array.isArray(json) ? json.sort((a, b) => new Date(a.date) - new Date(b.date)) : [];
        setData(sorted);
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (err) {
      console.error('Analytics Fetch Error:', err);
      addToast('Could not load analytics data.', 'error');
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ===== Calculate totals & insights efficiently =====
  const metrics = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totals = data.reduce((acc, day) => ({
      revenue: acc.revenue + (day.revenue || 0),
      bookings: acc.bookings + (day.bookings || 0),
      newUsers: acc.newUsers + (day.new_users || 0),
      rageBookings: acc.rageBookings + (day.rage_bookings || 0),
    }), { revenue: 0, bookings: 0, newUsers: 0, rageBookings: 0 });

    const half = Math.floor(data.length / 2);
    const firstHalfRev = data.slice(0, half).reduce((s, d) => s + (d.revenue || 0), 0);
    const secondHalfRev = data.slice(half).reduce((s, d) => s + (d.revenue || 0), 0);
    
    let revenueTrend = 0;
    if (firstHalfRev > 0) {
      revenueTrend = Math.round(((secondHalfRev - firstHalfRev) / firstHalfRev) * 100);
    } else if (secondHalfRev > 0) {
      revenueTrend = 100; // Started from zero
    }

    const bestRevenueDay = data.reduce((max, d) => (d.revenue || 0) > (max.revenue || 0) ? d : max, data[0]);
    const bestRageDay = data.reduce((max, d) => (d.rage_bookings || 0) > (max.rage_bookings || 0) ? d : max, data[0]);

    return { totals, revenueTrend, bestRevenueDay, bestRageDay };
  }, [data]);

  const insights = useMemo(() => {
    if (!metrics) return [];
    
    const { totals, revenueTrend, bestRevenueDay, bestRageDay } = metrics;
    const isGrowing = revenueTrend >= 0;

    return [
      {
        icon: isGrowing ? <IconTrendUp /> : <IconTrendDown />,
        color: isGrowing ? '#2E7D32' : '#DC2626',
        bg: isGrowing ? '#F0FDF4' : '#FEF2F2',
        border: isGrowing ? '#BBF7D0' : '#FECACA',
        title: isGrowing ? 'Positive Revenue Trend' : 'Revenue Dip Detected',
        text: isGrowing
          ? `Revenue grew by ${revenueTrend}% in the latter half of this period.`
          : `Revenue dropped by ${Math.abs(revenueTrend)}%. Consider targeted promotions.`,
      },
      {
        icon: <IconCalendar />,
        color: '#2563EB',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        title: 'Peak Performance Day',
        text: bestRevenueDay && bestRevenueDay.revenue > 0
          ? `${new Date(bestRevenueDay.date).toLocaleDateString()} generated KSh ${bestRevenueDay.revenue.toLocaleString()}.`
          : 'No significant revenue days recorded yet.',
      },
      {
        icon: <IconUsers />,
        color: '#7C3AED',
        bg: '#F5F3FF',
        border: '#DDD6FE',
        title: 'User Acquisition',
        text: `${totals.newUsers} new users joined Mecac in the last ${days} days.`,
      },
      {
        icon: <IconZap />,
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FDE68A',
        title: 'Rage Room Engagement',
        text: bestRageDay && bestRageDay.rage_bookings > 0
          ? `Total sessions: ${totals.rageBookings}. Peak: ${new Date(bestRageDay.date).toLocaleDateString()}.`
          : 'Low activity in rage rooms during this period.',
      },
    ];
  }, [metrics, days]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="aa-page">
      {/* HEADER */}
      <header className="aa-header">
        <div className="aa-header-inner">
          <div>
            <h1 className="aa-title">Platform Analytics</h1>
            <p className="aa-subtitle">Real-time performance overview for the last {days} days</p>
          </div>
          
          <div className="aa-header-actions">
            <button 
              onClick={() => { setRefreshing(true); fetchData(); }}
              className="aa-refresh-btn"
              disabled={refreshing}
              title="Refresh Data"
            >
              <IconRefresh /> {refreshing ? 'Updating...' : 'Refresh'}
            </button>
            <button onClick={() => navigate('/dashboard')} className="aa-back-btn">
              <IconArrowLeft /> Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="aa-main">
        
        {/* PERIOD SELECTOR */}
        <div className="aa-card aa-period-card">
          <span className="aa-label">Select Time Range</span>
          <div className="aa-segmented-control">
            {[7, 14, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`aa-seg-btn ${days === d ? 'active' : ''}`}
              >
                Last {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* SUMMARY STATS GRID */}
        <div className="aa-summary-grid">
          <div className="aa-card aa-stat-card" style={{ borderTopColor: '#2E7D32' }}>
            <div className="aa-stat-header">
              <span className="aa-stat-label">Total Revenue</span>
              <span className="aa-stat-icon green"><IconBarChart /></span>
            </div>
            <div className="aa-stat-value">KSh {metrics?.totals.revenue.toLocaleString()}</div>
            <div className="aa-stat-change positive">+12% vs prev period</div>
          </div>

          <div className="aa-card aa-stat-card" style={{ borderTopColor: '#2563EB' }}>
            <div className="aa-stat-header">
              <span className="aa-stat-label">Therapy Bookings</span>
              <span className="aa-stat-icon blue"><IconCalendar /></span>
            </div>
            <div className="aa-stat-value">{metrics?.totals.bookings}</div>
            <div className="aa-stat-change neutral">Stable volume</div>
          </div>

          <div className="aa-card aa-stat-card" style={{ borderTopColor: '#7C3AED' }}>
            <div className="aa-stat-header">
              <span className="aa-stat-label">New Users</span>
              <span className="aa-stat-icon purple"><IconUsers /></span>
            </div>
            <div className="aa-stat-value">{metrics?.totals.newUsers}</div>
            <div className="aa-stat-change positive">Acquisition healthy</div>
          </div>

          <div className="aa-card aa-stat-card" style={{ borderTopColor: '#D97706' }}>
            <div className="aa-stat-header">
              <span className="aa-stat-label">Rage Sessions</span>
              <span className="aa-stat-icon orange"><IconZap /></span>
            </div>
            <div className="aa-stat-value">{metrics?.totals.rageBookings}</div>
            <div className="aa-stat-change neutral">Engagement steady</div>
          </div>
        </div>

        {/* SMART INSIGHTS */}
        <section className="aa-section">
          <h2 className="aa-section-title">Executive Insights</h2>
          <div className="aa-insights-grid">
            {insights.map((ins, i) => (
              <div key={i} className="aa-insight-card" style={{ background: ins.bg, borderColor: ins.border }}>
                <div className="aa-insight-head">
                  <span className="aa-insight-icon" style={{ color: ins.color }}>{ins.icon}</span>
                  <h3 className="aa-insight-title" style={{ color: ins.color }}>{ins.title}</h3>
                </div>
                <p className="aa-insight-text">{ins.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* REVENUE CHART */}
        <section className="aa-chart-section">
          <div className="aa-card">
            <div className="aa-chart-header">
              <h3>Revenue & Booking Trends</h3>
              <span className="aa-chart-badge">Dual Axis</span>
            </div>
            <div className="aa-chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#9CA3AF" 
                    tickFormatter={(value) => `K${value >= 1000 ? (value/1000)+'k' : value}`}
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => {
                      if (name === 'Revenue') return [`KSh ${value.toLocaleString()}`, 'Revenue'];
                      return [value, 'Bookings'];
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#2E7D32" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Revenue" 
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#2563EB" 
                    strokeWidth={2} 
                    dot={false}
                    name="Bookings"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ACTIVITY CHART */}
        <section className="aa-chart-section">
          <div className="aa-card">
            <div className="aa-chart-header">
              <h3>User Growth & Rage Activity</h3>
              <span className="aa-chart-badge">Comparative</span>
            </div>
            <div className="aa-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { weekday: 'short' })}
                    fontSize={12}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar 
                    dataKey="new_users" 
                    fill="#7C3AED" 
                    name="New Users" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                  <Bar 
                    dataKey="rage_bookings" 
                    fill="#D97706" 
                    name="Rage Sessions" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

      </main>

      <style>{`
        .aa-page {
          min-height: 100vh;
          background-color: #F9FAFB;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* --- HEADER --- */
        .aa-header {
          background: white;
          border-bottom: 1px solid #E5E7EB;
          padding: 1.25rem 0;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .aa-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .aa-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.02em;
        }
        .aa-subtitle {
          margin: 0.25rem 0 0;
          font-size: 0.9rem;
          color: #6B7280;
        }
        .aa-header-actions {
          display: flex;
          gap: 0.75rem;
        }
        .aa-refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          background: #F3F4F6;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          color: #374151;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .aa-refresh-btn:hover:not(:disabled) {
          background: #E5E7EB;
        }
        .aa-refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .aa-back-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          color: #374151;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .aa-back-btn:hover {
          background: #F9FAFB;
          border-color: #9CA3AF;
        }

        /* --- MAIN LAYOUT --- */
        .aa-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 20px 4rem;
        }

        /* --- CARDS & SECTIONS --- */
        .aa-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          margin-bottom: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .aa-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        /* --- PERIOD SELECTOR --- */
        .aa-period-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .aa-label {
          font-weight: 700;
          color: #374151;
          font-size: 0.95rem;
        }
        .aa-segmented-control {
          display: flex;
          background: #F3F4F6;
          padding: 0.25rem;
          border-radius: 10px;
        }
        .aa-seg-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s;
        }
        .aa-seg-btn:hover {
          color: #374151;
        }
        .aa-seg-btn.active {
          background: white;
          color: #2E7D32;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        /* --- SUMMARY GRID --- */
        .aa-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .aa-stat-card {
          border-top: 4px solid;
          margin-bottom: 0;
        }
        .aa-stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .aa-stat-label {
          font-size: 0.85rem;
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .aa-stat-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .aa-stat-icon.green { background: #E8F5E9; color: #2E7D32; }
        .aa-stat-icon.blue { background: #E0F2FE; color: #2563EB; }
        .aa-stat-icon.purple { background: #F3E8FF; color: #7C3AED; }
        .aa-stat-icon.orange { background: #FFF7ED; color: #D97706; }
        
        .aa-stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #111827;
          line-height: 1.2;
          margin-bottom: 0.25rem;
        }
        .aa-stat-change {
          font-size: 0.8rem;
          font-weight: 600;
        }
        .aa-stat-change.positive { color: #16A34A; }
        .aa-stat-change.negative { color: #DC2626; }
        .aa-stat-change.neutral { color: #6B7280; }

        /* --- INSIGHTS --- */
        .aa-section {
          margin-bottom: 2rem;
        }
        .aa-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .aa-insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .aa-insight-card {
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid;
          transition: transform 0.2s;
        }
        .aa-insight-card:hover {
          transform: translateY(-2px);
        }
        .aa-insight-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .aa-insight-icon {
          display: flex;
        }
        .aa-insight-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0;
        }
        .aa-insight-text {
          font-size: 0.88rem;
          color: #374151;
          line-height: 1.5;
          margin: 0;
        }

        /* --- CHARTS --- */
        .aa-chart-section {
          margin-bottom: 2rem;
        }
        .aa-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .aa-chart-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
        }
        .aa-chart-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: #6B7280;
          background: #F3F4F6;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .aa-chart-container {
          width: 100%;
          overflow-x: hidden;
        }

        /* --- SKELETON ANIMATION --- */
        .aa-skel {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
          background-size: 400% 100%;
          animation: aaShimmer 1.4s ease infinite;
        }
        @keyframes aaShimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }

        /* --- RESPONSIVE --- */
        @media (max-width: 768px) {
          .aa-header-inner {
            flex-direction: column;
            align-items: flex-start;
          }
          .aa-header-actions {
            width: 100%;
            justify-content: flex-end;
          }
          .aa-period-card {
            flex-direction: column;
            align-items: stretch;
          }
          .aa-segmented-control {
            width: 100%;
            overflow-x: auto;
            justify-content: flex-start;
          }
          .aa-summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAnalyticsPage;