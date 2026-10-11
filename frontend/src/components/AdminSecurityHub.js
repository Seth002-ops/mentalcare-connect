import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useToast } from './ToastContext';

// ============ ICONS ============
const IconShield = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconAlert = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const IconBlock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>;
const IconCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconRefresh = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;
const IconTrash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconActivity = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;

// ============ SKELETON LOADER ============
const Skeleton = ({ w = '100%', h = '20px', r = '8px' }) => (
  <div className="sh-skel" style={{ width: w, height: h, borderRadius: r }} />
);

const AdminSecurityHub = ({ logout }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [status, setStatus] = useState(null);
  const [events, setEvents] = useState([]);
  const [blockedIps, setBlockedIps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [blockForm, setBlockForm] = useState({ ip: '', reason: '', duration: 3600, permanent: false });
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [statusRes, eventsRes, blockedRes] = await Promise.all([
        fetch(`${API_URL}/admin/security/status`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/security/events?limit=50`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/admin/security/blocked-ips`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statusRes.ok) setStatus(await statusRes.json());
      if (eventsRes.ok) setEvents((await eventsRes.json()).events || []);
      if (blockedRes.ok) setBlockedIps((await blockedRes.json()).blocked_ips || []);
    } catch (err) {
      console.error("Failed to fetch security data", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleBlockIp = async (e) => {
    e.preventDefault();
    if (!blockForm.ip) return addToast('IP address is required', 'error');
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/admin/security/block-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ip: blockForm.ip,
          reason: blockForm.reason || 'Manual block by admin',
          duration_seconds: blockForm.permanent ? null : parseInt(blockForm.duration),
          permanent: blockForm.permanent
        })
      });
      if (res.ok) {
        addToast(`IP ${blockForm.ip} blocked successfully`, 'success');
        setBlockForm({ ip: '', reason: '', duration: 3600, permanent: false });
        fetchData();
      } else {
        const err = await res.json();
        addToast(err.detail || 'Failed to block IP', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnblockIp = async (ip) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API_URL}/admin/security/unblock-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ip })
      });
      if (res.ok) {
        addToast(`IP ${ip} unblocked`, 'success');
        fetchData();
      } else {
        addToast('Failed to unblock IP', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/security/cache/clear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        addToast(`Cache cleared! ${data.deleted_keys} keys removed.`, 'success');
      }
    } catch (err) {
      addToast('Failed to clear cache', 'error');
    }
  };

  const severityColors = {
    critical: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', glow: 'rgba(220, 38, 38, 0.15)' },
    high: { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA', glow: 'rgba(234, 88, 12, 0.15)' },
    medium: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', glow: 'rgba(217, 119, 6, 0.15)' },
    low: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', glow: 'rgba(37, 99, 235, 0.15)' },
    info: { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', glow: 'rgba(107, 114, 128, 0.1)' }
  };

  return (
    <div className="sh-page">
      {/* HEADER */}
      <header className="sh-header">
        <div className="sh-header-inner">
          <div className="sh-header-left">
            <button onClick={() => navigate('/dashboard')} className="sh-back-btn">
              <IconArrowLeft /> Dashboard
            </button>
            <div className="sh-title-group">
              <div className="sh-icon-badge">
                <IconShield />
              </div>
              <div>
                <h1 className="sh-title">Security Command Center</h1>
                <p className="sh-subtitle">Real-time threat monitoring and access control</p>
              </div>
            </div>
          </div>
          <div className="sh-header-actions">
            <button onClick={handleClearCache} className="sh-action-btn ghost">
              <IconTrash /> Clear Cache
            </button>
            <button onClick={fetchData} className="sh-action-btn primary">
              <IconRefresh /> Refresh
            </button>
            <button onClick={logout} className="sh-action-btn danger">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="sh-main">
        {/* STATS GRID */}
        <div className="sh-stats-grid">
          {loading ? (
            <>
              {[1,2,3,4].map(i => <div key={i} className="sh-stat-card"><Skeleton w="60%" h="12px" /><Skeleton w="40%" h="32px" style={{marginTop: '1rem'}} /></div>)}
            </>
          ) : (
            <>
              <StatCard title="Redis Status" value={status?.redis_available ? 'Online' : 'Offline'} color={status?.redis_available ? '#16A34A' : '#DC2626'} icon={<IconCheck />} bgGradient={status?.redis_available ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)'} />
              <StatCard title="Blocked IPs" value={status?.blocked_ip_count || 0} color="#EA580C" icon={<IconBlock />} bgGradient="linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)" />
              <StatCard title="Events (24h)" value={status?.events_last_24h || 0} color="#2563EB" icon={<IconActivity />} bgGradient="linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)" />
              <StatCard title="Critical Alerts" value={status?.critical_last_24h || 0} color="#DC2626" icon={<IconAlert />} bgGradient="linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)" />
            </>
          )}
        </div>

        <div className="sh-content-grid">
          {/* LEFT COLUMN: ACTIONS */}
          <div className="sh-left-col">
            {/* Block IP Form */}
            <div className="sh-card sh-block-card">
              <div className="sh-card-header">
                <IconBlock />
                <h3>Quarantine IP Address</h3>
              </div>
              <form onSubmit={handleBlockIp} className="sh-form">
                <div className="sh-input-group">
                  <label>IP Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 192.168.1.100" 
                    value={blockForm.ip} 
                    onChange={e => setBlockForm({...blockForm, ip: e.target.value})} 
                    className="sh-input" 
                  />
                </div>
                <div className="sh-input-group">
                  <label>Reason (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Suspicious scraping" 
                    value={blockForm.reason} 
                    onChange={e => setBlockForm({...blockForm, reason: e.target.value})} 
                    className="sh-input" 
                  />
                </div>
                <div className="sh-row">
                  <div className="sh-input-group" style={{flex: 1}}>
                    <label>Duration</label>
                    <select 
                      value={blockForm.duration} 
                      onChange={e => setBlockForm({...blockForm, duration: e.target.value})} 
                      disabled={blockForm.permanent} 
                      className="sh-select"
                    >
                      <option value="300">5 Minutes</option>
                      <option value="3600">1 Hour</option>
                      <option value="86400">24 Hours</option>
                      <option value="604800">7 Days</option>
                    </select>
                  </div>
                  <label className="sh-checkbox">
                    <input 
                      type="checkbox" 
                      checked={blockForm.permanent} 
                      onChange={e => setBlockForm({...blockForm, permanent: e.target.checked})} 
                    />
                    <span>Permanent</span>
                  </label>
                </div>
                <button type="submit" disabled={processing} className="sh-submit-btn">
                  {processing ? 'Quarantining...' : 'Block IP Address'}
                </button>
              </form>
            </div>

            {/* Active Blocks List */}
            <div className="sh-card">
              <div className="sh-card-header">
                <IconShield />
                <h3>Active Quarantine ({blockedIps.length})</h3>
              </div>
              <div className="sh-blocks-list">
                {loading ? (
                  <div style={{padding: '1rem'}}><Skeleton h="40px" /></div>
                ) : blockedIps.length === 0 ? (
                  <div className="sh-empty-state">
                    <p>No IPs currently quarantined.</p>
                  </div>
                ) : (
                  blockedIps.map(ip => (
                    <div key={ip} className="sh-block-item">
                      <span className="sh-ip-text">{ip}</span>
                      <button onClick={() => handleUnblockIp(ip)} disabled={processing} className="sh-unblock-btn">
                        Release
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: THREAT FEED */}
          <div className="sh-card sh-feed-card">
            <div className="sh-card-header">
              <IconActivity />
              <h3>Live Threat Feed</h3>
              <span className="sh-live-badge">
                <span className="sh-live-dot"></span> LIVE
              </span>
            </div>
            <div className="sh-feed-list">
              {loading ? (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem'}}>
                  {[1,2,3,4,5].map(i => <Skeleton key={i} h="70px" r="12px" />)}
                </div>
              ) : events.length === 0 ? (
                <div className="sh-empty-state" style={{padding: '4rem 2rem'}}>
                  <IconShield />
                  <p style={{marginTop: '1rem', fontSize: '1.1rem', fontWeight: '600', color: '#6B7280'}}>All systems secure.</p>
                  <p style={{color: '#9CA3AF', fontSize: '0.9rem'}}>No security events recorded in the last 24 hours.</p>
                </div>
              ) : (
                events.map((event, idx) => {
                  const colors = severityColors[event.severity] || severityColors.info;
                  return (
                    <div 
                      key={event.id} 
                      className="sh-feed-item" 
                      style={{ 
                        borderLeftColor: colors.text,
                        animationDelay: `${idx * 0.05}s`
                      }}
                    >
                      <div className="sh-feed-head">
                        <span className="sh-severity-pill" style={{background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`}}>
                          {event.severity}
                        </span>
                        <span className="sh-event-type">{event.event_type.replace(/_/g, ' ')}</span>
                        <span className="sh-timestamp">
                          {new Date(event.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="sh-feed-body">
                        <code className="sh-ip-badge">{event.ip_address}</code>
                        <span className="sh-path">{event.method} {event.path_hit}</span>
                      </div>
                      {event.action_taken && (
                        <div className="sh-feed-footer">
                          Action: <strong>{event.action_taken.replace(/_/g, ' ')}</strong>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .sh-page {
          min-height: 100vh;
          background: #F3F4F6;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #111827;
        }

        /* HEADER */
        .sh-header {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          color: white;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .sh-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .sh-header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .sh-back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .sh-back-btn:hover { background: rgba(255,255,255,0.2); }
        .sh-title-group { display: flex; align-items: center; gap: 1rem; }
        .sh-icon-badge {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }
        .sh-title { margin: 0; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; }
        .sh-subtitle { margin: 0; font-size: 0.85rem; color: #94A3B8; }
        .sh-header-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .sh-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sh-action-btn.ghost { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); }
        .sh-action-btn.ghost:hover { background: rgba(255,255,255,0.2); }
        .sh-action-btn.primary { background: #2563EB; color: white; }
        .sh-action-btn.primary:hover { background: #1D4ED8; }
        .sh-action-btn.danger { background: #DC2626; color: white; }
        .sh-action-btn.danger:hover { background: #B91C1C; }

        /* MAIN LAYOUT */
        .sh-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        /* STATS */
        .sh-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .sh-stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          border: 1px solid #E5E7EB;
          position: relative;
          overflow: hidden;
        }
        .sh-stat-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .sh-stat-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .sh-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sh-stat-value {
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        /* CONTENT GRID */
        .sh-content-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 1.5rem;
          align-items: start;
        }
        .sh-left-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .sh-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .sh-card-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #F3F4F6;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #FAFAFA;
        }
        .sh-card-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          flex: 1;
        }
        .sh-live-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-weight: 800;
          color: #16A34A;
          background: #ECFDF5;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          border: 1px solid #A7F3D0;
          letter-spacing: 0.05em;
        }
        .sh-live-dot {
          width: 6px;
          height: 6px;
          background: #16A34A;
          border-radius: 50%;
          animation: sh-pulse 2s infinite;
        }
        @keyframes sh-pulse {
          0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(22, 163, 74, 0); }
          100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }

        /* BLOCK FORM */
        .sh-block-card {
          background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
          border: 1px solid #E5E7EB;
        }
        .sh-form {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .sh-input-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .sh-input-group label { font-size: 0.85rem; font-weight: 600; color: #374151; }
        .sh-input, .sh-select {
          padding: 0.75rem 1rem;
          border: 1px solid #D1D5DB;
          border-radius: 10px;
          font-size: 0.95rem;
          background: white;
          transition: all 0.2s;
          outline: none;
          font-family: inherit;
        }
        .sh-input:focus, .sh-select:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .sh-row { display: flex; gap: 1rem; align-items: flex-end; }
        .sh-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          padding-bottom: 0.85rem;
          white-space: nowrap;
        }
        .sh-checkbox input { width: 18px; height: 18px; cursor: pointer; accent-color: #DC2626; }
        .sh-submit-btn {
          width: 100%;
          padding: 0.85rem;
          background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);
        }
        .sh-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.3);
        }
        .sh-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* BLOCKS LIST */
        .sh-blocks-list {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
        }
        .sh-block-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          transition: all 0.2s;
        }
        .sh-block-item:hover { background: #FEE2E2; }
        .sh-ip-text { font-family: 'SF Mono', Monaco, monospace; font-weight: 600; color: #991B1B; font-size: 0.9rem; }
        .sh-unblock-btn {
          background: white;
          border: 1px solid #D1D5DB;
          color: #374151;
          padding: 0.3rem 0.8rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .sh-unblock-btn:hover { background: #F3F4F6; border-color: #9CA3AF; }

        /* THREAT FEED */
        .sh-feed-card { min-height: 600px; display: flex; flex-direction: column; }
        .sh-feed-list {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
          max-height: 70vh;
        }
        .sh-feed-item {
          padding: 1rem 1.25rem;
          border: 1px solid #E5E7EB;
          border-left: 4px solid;
          border-radius: 10px;
          background: white;
          animation: sh-slideIn 0.4s ease-out forwards;
          opacity: 0;
          transform: translateX(-10px);
          transition: box-shadow 0.2s;
        }
        .sh-feed-item:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        @keyframes sh-slideIn {
          to { opacity: 1; transform: translateX(0); }
        }
        .sh-feed-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .sh-severity-pill {
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .sh-event-type {
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          flex: 1;
        }
        .sh-timestamp {
          font-size: 0.75rem;
          color: #9CA3AF;
          font-family: monospace;
        }
        .sh-feed-body {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .sh-ip-badge {
          background: #F3F4F6;
          color: #111827;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-family: 'SF Mono', Monaco, monospace;
          font-weight: 600;
        }
        .sh-path {
          font-size: 0.85rem;
          color: #6B7280;
        }
        .sh-feed-footer {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #6B7280;
          border-top: 1px dashed #E5E7EB;
          padding-top: 0.5rem;
        }
        .sh-feed-footer strong { color: #111827; }

        .sh-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          color: #9CA3AF;
          text-align: center;
        }

        /* SKELETON */
        .sh-skel {
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
          background-size: 400% 100%;
          animation: sh-shimmer 1.4s ease infinite;
        }
        @keyframes sh-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .sh-content-grid { grid-template-columns: 1fr; }
          .sh-feed-card { min-height: 400px; }
        }
        @media (max-width: 640px) {
          .sh-header-inner { flex-direction: column; align-items: flex-start; }
          .sh-header-actions { width: 100%; overflow-x: auto; }
          .sh-row { flex-direction: column; align-items: stretch; }
          .sh-checkbox { padding-bottom: 0; }
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, color, icon, bgGradient }) => (
  <div className="sh-stat-card">
    <div className="sh-stat-head">
      <span className="sh-stat-label">{title}</span>
      <div className="sh-stat-icon" style={{ background: bgGradient, color }}>
        {icon}
      </div>
    </div>
    <div className="sh-stat-value" style={{ color }}>
      {value}
    </div>
  </div>
);

export default AdminSecurityHub;