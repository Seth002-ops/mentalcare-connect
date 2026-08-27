import React, { useState, useEffect, useRef } from 'react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/notifications/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking': return '';
      case 'payment': return '';
      case 'message': return '';
      default: return '🔔';
    }
  };

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const styles = {
    container: { position: 'relative', display: 'inline-block' },
    bellBtn: {
      background: 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.3)',
      padding: '0.5rem 0.75rem',
      borderRadius: '8px',
      color: 'white',
      fontSize: '1.2rem',
      cursor: 'pointer',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    badge: {
      position: 'absolute',
      top: '-6px',
      right: '-6px',
      background: '#EF4444',
      color: 'white',
      fontSize: '0.7rem',
      fontWeight: '700',
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '0.5rem',
      width: '360px',
      maxHeight: '420px',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
      zIndex: 1000,
    },
    dropdownHeader: {
      padding: '1rem 1.25rem',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dropdownTitle: { fontSize: '1rem', fontWeight: '700', color: '#111827' },
    markAllBtn: {
      background: 'none',
      border: 'none',
      color: '#2E7D32',
      fontSize: '0.85rem',
      fontWeight: '600',
      cursor: 'pointer',
    },
    notificationList: { maxHeight: '340px', overflowY: 'auto' },
    notificationItem: (isRead) => ({
      padding: '1rem 1.25rem',
      borderBottom: '1px solid #F3F4F6',
      cursor: 'pointer',
      background: isRead ? 'white' : '#F0FDF4',
      transition: 'background 0.2s',
    }),
    notificationContent: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
    notificationIcon: { fontSize: '1.2rem', flexShrink: 0 },
    notificationText: { fontSize: '0.9rem', color: '#374151', lineHeight: '1.4' },
    notificationTime: { fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem' },
    emptyState: { padding: '2rem', textAlign: 'center', color: '#9CA3AF' },
  };

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button style={styles.bellBtn} onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}>
        🔔
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <span style={styles.dropdownTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button style={styles.markAllBtn} onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div style={styles.notificationList}>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={styles.notificationItem(notif.is_read)}
                  onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                >
                  <div style={styles.notificationContent}>
                    <span style={styles.notificationIcon}>{getTypeIcon(notif.type)}</span>
                    <div>
                      <div style={styles.notificationText}>{notif.message}</div>
                      <div style={styles.notificationTime}>{getTimeAgo(notif.created_at)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;