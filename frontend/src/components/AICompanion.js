import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const IconBot = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconBack = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconZap = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;

const QUICK_PROMPTS = [
  'I feel anxious today',
  'Help me book a therapy session',
  'How can I manage exam stress?',
  'I want to try the rage room',
];

const renderContent = (text) => {
  const parts = text.split('**');
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>));
};

const AICompanion = ({ logout }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const loadHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/ai/history', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.map(m => ({ role: m.role, content: m.content })));
      }
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: newMessages.slice(-10) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* HEADER */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0.75rem 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: '#374151', display: 'flex' }}><IconBack /></button>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#2E7D32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBot /></div>
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#111827', margin: 0 }}>AI Companion</h1>
              <p style={{ fontSize: '0.72rem', color: '#2E7D32', margin: 0, fontWeight: '600' }}>Available 24/7 • Private & supportive</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NotificationBell />
            <button onClick={logout} style={{ padding: '0.5rem 1rem', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Logout</button>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <main style={{ flex: 1, maxWidth: '800px', width: '100%', margin: '0 auto', padding: '1.5rem 20px', overflowY: 'auto', boxSizing: 'border-box' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><IconBot /></div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: '700', color: '#111827' }}>How are you feeling today?</h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>I'm here to listen, support, and guide you. Everything you share is private.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)} style={{ padding: '0.6rem 1rem', background: 'white', border: '1px solid #E5E7EB', borderRadius: '999px', cursor: 'pointer', fontSize: '0.85rem', color: '#374151', fontWeight: '600' }}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '0.85rem' }}>
            <div style={{
              maxWidth: '80%', padding: '0.85rem 1.1rem', borderRadius: '16px', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
              background: m.role === 'user' ? '#2E7D32' : 'white',
              color: m.role === 'user' ? 'white' : '#374151',
              border: m.role === 'user' ? 'none' : '1px solid #E5E7EB',
              borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
              borderBottomLeftRadius: m.role === 'user' ? '16px' : '4px',
            }}>
              {renderContent(m.content)}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.85rem' }}>
            <div style={{ padding: '0.85rem 1.1rem', borderRadius: '16px', background: 'white', border: '1px solid #E5E7EB', color: '#9CA3AF', fontSize: '0.9rem' }}>Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* ACTION BAR */}
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 20px 0.5rem', display: 'flex', gap: '0.5rem', boxSizing: 'border-box' }}>
        <button onClick={() => navigate('/booking')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '999px', color: '#2E7D32', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700' }}><IconCalendar /> Book Session</button>
        <button onClick={() => navigate('/rage-rooms')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: '#FFF3E0', border: '1px solid #FFE0B2', borderRadius: '999px', color: '#E65100', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700' }}><IconZap /> Rage Room</button>
      </div>

      {/* INPUT */}
      <div style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: '0.85rem 0', position: 'sticky', bottom: 0 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '0.5rem', boxSizing: 'border-box' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Share what's on your mind..."
            style={{ flex: 1, padding: '0.85rem 1rem', border: '1px solid #D1D5DB', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ padding: '0.85rem 1.1rem', background: loading || !input.trim() ? '#9CA3AF' : '#2E7D32', color: 'white', border: 'none', borderRadius: '12px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}><IconSend /></button>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;