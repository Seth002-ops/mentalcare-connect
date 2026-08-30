import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

const AdminAnalytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/admin/analytics/timeseries?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const totals = data.reduce((acc, day) => ({
    revenue: acc.revenue + day.revenue,
    bookings: acc.bookings + day.bookings,
    newUsers: acc.newUsers + day.new_users,
    rageBookings: acc.rageBookings + day.rage_bookings,
  }), { revenue: 0, bookings: 0, newUsers: 0, rageBookings: 0 });

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #E5E7EB',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  };

  const titleStyle = {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>Loading analytics...</div>;
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ ...cardStyle, marginBottom: 0, borderLeft: '4px solid #2E7D32' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Total Revenue</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2E7D32' }}>KSh {totals.revenue.toLocaleString()}</div>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, borderLeft: '4px solid #3B82F6' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Therapy Bookings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{totals.bookings}</div>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>New Users</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{totals.newUsers}</div>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: '600' }}>Rage Room Sessions</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{totals.rageBookings}</div>
        </div>
      </div>

      {/* Period Selector */}
      <div style={cardStyle}>
        <div style={titleStyle}>
          <span>Platform Analytics</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[7, 14, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  padding: '0.4rem 0.9rem',
                  background: days === d ? '#2E7D32' : '#F3F4F6',
                  color: days === d ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>Revenue & Bookings Over Time</div>
          <ResponsiveContainer width="100%" height={280}>
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

        {/* Users & Rage Rooms Chart */}
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>User Growth & Rage Room Activity</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="new_users" fill="#8B5CF6" name="New Users" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rage_bookings" fill="#F59E0B" name="Rage Room Sessions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;