import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { stripEmoji } from '../utils/sanitizeText';

// ============ PROFESSIONAL SVG ICONS ============
const IconVideo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const IconAudio = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconClose = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconAI = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>;
const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

const Chat = ({ user, userType }) => {
  const { roomId } = useParams();

  // ============ HUMAN CHAT STATE ============
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [otherUserName, setOtherUserName] = useState('');

  // ============ AI CHAT STATE ============
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiMessagesEndRef = useRef(null);

  const suggestedPrompts = [
    "I'm feeling anxious today",
    "Help me with a breathing exercise",
    "I'm having trouble sleeping",
    "I need some grounding techniques",
    "I'm feeling overwhelmed",
    "Give me a journaling prompt",
  ];

  // ============ WEBRTC CALL STATE ============
  const [callState, setCallState] = useState('idle');
  const [callType, setCallType] = useState('audio');
  const clientIdRef = useRef(Math.random().toString(36).slice(2));
  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  // ============ FETCH AI CHAT HISTORY ============
  useEffect(() => {
    const fetchAiHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('https://mecac-backend.onrender.com/ai/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAiMessages(data.map(msg => ({ role: msg.role, content: msg.content })));
        }
      } catch (err) {
        console.error('Failed to load AI history:', err);
      }
    };
    fetchAiHistory();
  }, []);

  // ============ FETCH & POLL HUMAN MESSAGES ============
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      if (!token || !roomId) return;
      try {
        const res = await fetch(`/messages/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(m => ({
            id: m.id,
            text: m.content,
            sender: m.sender_type,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(prev => (prev.length !== mapped.length ? mapped : prev));
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  // ============ FETCH OTHER PARTICIPANT'S NAME ============
  useEffect(() => {
    const fetchOtherUser = async () => {
      const token = localStorage.getItem('token');
      if (!token || !roomId) return;

      try {
        const response = await fetch(`/bookings/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const booking = await response.json();
          const name = userType === 'client' ? booking.therapist_name : booking.client_name;
          setOtherUserName(name || 'Unknown User');
        }
      } catch (error) {
        console.error('Failed to fetch other user:', error);
      }
    };
    fetchOtherUser();
  }, [roomId, userType]);

  // ============ WEBSOCKET SIGNALING CONNECTION ============
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !roomId) return;
    const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const raw = String(event.data).replace(/^room:\d+:/, '');
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }
      if (!msg || msg.senderId === clientIdRef.current) return;
      handleSignalRef.current(msg);
    };

    return () => { ws.close(); wsRef.current = null; };
  }, [roomId]);

  useEffect(() => {
    if (remoteStreamRef.current) {
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStreamRef.current;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiLoading]);

  // ============ WEBRTC HELPERS ============
  const sendSignal = (msg) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ ...msg, senderId: clientIdRef.current }));
    }
  };

  const cleanupCall = (notify) => {
    if (notify) sendSignal({ type: 'call-end' });
    if (pcRef.current) { try { pcRef.current.close(); } catch (e) {} pcRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    remoteStreamRef.current = null;
    pendingOfferRef.current = null;
    setCallState('idle');
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal({ type: 'ice-candidate', candidate: e.candidate });
    };
    pc.ontrack = (e) => { remoteStreamRef.current = e.streams[0]; };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setCallState('connected');
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) cleanupCall(false);
    };
    return pc;
  };

  const handleSignal = async (msg) => {
    switch (msg.type) {
      case 'call-offer':
        pendingOfferRef.current = msg.sdp;
        setCallType(msg.callType || 'audio');
        setCallState('incoming');
        break;
      case 'call-answer':
        if (pcRef.current) await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        break;
      case 'ice-candidate':
        if (pcRef.current && msg.candidate) {
          try { await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch (e) {}
        }
        break;
      case 'call-decline':
        cleanupCall(false);
        break;
      case 'call-end':
        cleanupCall(false);
        break;
      default:
        break;
    }
  };
  const handleSignalRef = useRef(handleSignal);
  handleSignalRef.current = handleSignal;

  // ============ CALL ACTIONS ============
  const startCall = async (type) => {
    if (callState !== 'idle') return;
    setCallType(type);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
    } catch (err) {
      alert('Permission denied. Please allow microphone/camera access for calls.');
      return;
    }
    localStreamRef.current = stream;
    const pc = createPeerConnection();
    pcRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    setCallState('calling');
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal({ type: 'call-offer', sdp: offer, callType: type });
  };

  const acceptCall = async () => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: callType === 'video' });
    } catch (err) {
      alert('Permission denied. Please allow microphone/camera access.');
      return;
    }
    localStreamRef.current = stream;
    const pc = createPeerConnection();
    pcRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    setCallState('connecting');
    await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendSignal({ type: 'call-answer', sdp: answer });
    pendingOfferRef.current = null;
  };

  const declineCall = () => {
    sendSignal({ type: 'call-decline' });
    setCallState('idle');
    pendingOfferRef.current = null;
  };

  // ============ HUMAN CHAT SEND ============
  const sendMessage = async () => {
    const plainText = stripEmoji(newMessage).trim();
    if (!plainText) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      text: plainText,
      sender: userType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage('');

    try {
      await fetch('https://mecac-backend.onrender.com/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ room_id: Number(roomId), content: plainText, sender_type: userType })
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  // ============ AI CHAT (NON-STREAMING JSON) ============
  const sendAiMessage = async (text) => {
    const content = text || aiInput.trim();
    if (!content || aiLoading) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found. Please log in again.");
      return;
    }

    const updatedMessages = [...aiMessages, { role: 'user', content }];
    setAiMessages(updatedMessages);
    setAiInput('');
    setAiLoading(true);
    
    try {
      const response = await fetch('https://mecac-backend.onrender.com/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',  
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      
      if (!response.ok) throw new Error('AI service unavailable');
      
      // Read the JSON response (matches our non-streaming backend)
      const data = await response.json();
      const aiMessage = data.message || "I'm here to support you. Please try again.";
      
      setAiMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
    } catch (error) {
      console.error('AI Fetch Error:', error);
      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm here to support you. Please try again." 
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // ============ AI TEXT FORMATTER (Handles Bold, Lists, and JSON cleanup) ============
  const formatAiText = (text) => {
    if (!text) return null;
    
    // 1. Clean up accidental JSON wrappers like {"message": "..."}
    let cleanText = text.trim();
    if (cleanText.startsWith('{') && cleanText.includes('"message"')) {
      try {
        const parsed = JSON.parse(cleanText);
        if (parsed.message) cleanText = parsed.message;
      } catch (e) {
        cleanText = cleanText.replace(/^\{"message":\s*"/, '').replace(/"\}$/, '');
      }
    }

    // 2. Split by newlines to handle lists and paragraphs
    const lines = cleanText.split('\n');
    
    return lines.map((line, index) => {
      // Handle bold text **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formattedParts = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ fontWeight: 700, color: '#1B5E20' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      const trimmedLine = line.trim();

      // Handle bullet points (- or *)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (typeof formattedParts[0] === 'string') {
          formattedParts[0] = formattedParts[0].replace(/^[-*]\s*/, '');
        }
        return (
          <div key={index} style={{ display: 'flex', gap: '8px', margin: '6px 0', paddingLeft: '4px', alignItems: 'flex-start' }}>
            <span style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: '1.2rem', lineHeight: '1.4' }}>•</span>
            <span style={{ flex: 1 }}>{formattedParts}</span>
          </div>
        );
      }

      // Handle numbered lists (1. 2. etc)
      const numberMatch = trimmedLine.match(/^(\d+)\.\s/);
      if (numberMatch) {
        if (typeof formattedParts[0] === 'string') {
          formattedParts[0] = formattedParts[0].replace(/^\d+\.\s/, '');
        }
        return (
          <div key={index} style={{ display: 'flex', gap: '8px', margin: '6px 0', paddingLeft: '4px', alignItems: 'flex-start' }}>
            <span style={{ color: '#2E7D32', fontWeight: 'bold', minWidth: '18px' }}>{numberMatch[1]}.</span>
            <span style={{ flex: 1 }}>{formattedParts}</span>
          </div>
        );
      }

      // Empty line (spacing)
      if (trimmedLine === '') return <div key={index} style={{ height: '8px' }} />;

      // Normal paragraph
      return <div key={index} style={{ margin: '4px 0', lineHeight: '1.6' }}>{formattedParts}</div>;
    });
  };

  // ============ STYLES ============
  const styles = {
    container: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB' },
    header: { background: '#2E7D32', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    messagesContainer: { flex: 1, overflowY: 'auto', padding: '2rem', backgroundColor: '#F9FAFB' },
    message: { marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' },
    messageBubble: (sender) => ({
      maxWidth: '70%', padding: '1rem 1.5rem', borderRadius: '12px',
      marginLeft: sender === userType ? 'auto' : '0',
      backgroundColor: sender === userType ? '#2E7D32' : '#FFFFFF',
      color: sender === userType ? 'white' : '#111827',
      border: sender === userType ? 'none' : '1px solid #E5E7EB',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }),
    inputContainer: { padding: '1.5rem 2rem', backgroundColor: 'white', borderTop: '1px solid #E5E7EB' },
    input: { width: '100%', padding: '1rem 1.5rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '1rem', marginBottom: '1rem', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    buttons: { display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' },
    callBtn: { padding: '0.75rem 1.25rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#374151' },
    sendBtn: { backgroundColor: '#2E7D32', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' },
    
    // 📱 MOBILE FIX: AI Panel fits perfectly inside mobile screens
    aiPanel: { 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      width: 'calc(100% - 40px)', 
      maxWidth: '380px', 
      height: '70vh', 
      maxHeight: '550px', 
      background: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 20px 50px rgba(0,0,0,0.15)', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden', 
      border: '1px solid #E5E7EB', 
      zIndex: 100 
    },
    aiHeader: { padding: '1rem 1.5rem', background: '#F3F4F6', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    aiMessagesArea: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' },
    aiMessageRow: (isUser) => ({ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: '0.75rem', alignItems: 'flex-end' }),
    aiAvatar: (isUser) => ({ width: '32px', height: '32px', borderRadius: '50%', background: isUser ? '#E5E7EB' : '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: isUser ? '#4B5563' : '#2E7D32' }),
    aiBubble: (isUser) => ({ maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '12px', background: isUser ? '#F3F4F6' : '#FFFFFF', color: '#111827', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', border: isUser ? 'none' : '1px solid #E5E7EB' }),
    aiInputArea: { padding: '1rem', borderTop: '1px solid #E5E7EB', background: '#FAFAFA' },
    aiPromptBtn: { padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #D1D5DB', background: 'white', color: '#374151', fontSize: '0.85rem', cursor: 'pointer', marginRight: '0.5rem', marginBottom: '0.5rem' },
    callOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2000, color: 'white' },
    callAvatar: { width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: '#4CAF50' },
    callControls: { display: 'flex', gap: '1rem', marginTop: '2rem' },
    acceptBtn: { padding: '1rem 2rem', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '999px', fontWeight: '600', cursor: 'pointer' },
    declineBtn: { padding: '1rem 2rem', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '999px', fontWeight: '600', cursor: 'pointer' },
    videoContainer: { position: 'absolute', inset: 0 },
    remoteVideo: { width: '100%', height: '100%', objectFit: 'cover' },
    localVideo: { position: 'absolute', bottom: '110px', right: '20px', width: '180px', borderRadius: '12px', transform: 'scaleX(-1)', border: '2px solid rgba(255,255,255,0.3)' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
            {otherUserName ? `Chat with ${otherUserName}` : 'Secure Chat Room'}
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.85rem', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconLock /> End-to-end encrypted
            {otherUserName && (
              <span style={{ marginLeft: '8px', background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '999px', fontSize: '0.8rem' }}>
                {userType === 'client' ? 'Your Therapist' : 'Your Client'}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setAiOpen(!aiOpen)}
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', padding: '0.5rem 1rem', borderRadius: '6px', color: 'white', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}
        >
          <IconAI /> {aiOpen ? 'Close Assistant' : 'Mecac AI'}
        </button>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((message) => (
          <div key={message.id} style={styles.message}>
            <div style={styles.messageBubble(message.sender)}>{message.text}</div>
            <small style={{ opacity: 0.6, marginLeft: message.sender === userType ? 'auto' : '0', display: 'block', marginTop: '6px', fontSize: '0.75rem', color: '#6B7280' }}>
              {message.timestamp} &bull; Encrypted
            </small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <textarea
          style={styles.input}
          value={newMessage}
          onChange={(e) => setNewMessage(stripEmoji(e.target.value))}
          placeholder="Type your message..."
          rows="2"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
        />
        <div style={styles.buttons}>
          <button style={styles.callBtn} onClick={() => startCall('video')}><IconVideo /> Video Call</button>
          <button style={styles.callBtn} onClick={() => startCall('audio')}><IconAudio /> Audio Call</button>
          <button style={styles.sendBtn} onClick={sendMessage}>Send <IconSend /></button>
        </div>
      </div>

      {/* AI Panel */}
      {aiOpen && (
        <div style={styles.aiPanel}>
          <div style={styles.aiHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32' }}><IconAI /></div>
              <div>
                <h4 style={{ margin: 0, color: '#111827', fontSize: '0.95rem', fontWeight: '600' }}>Mecac Support Assistant</h4>
                <small style={{ color: '#6B7280', fontSize: '0.75rem' }}>Support tool &bull; Not a replacement for therapy</small>
              </div>
            </div>
            <button onClick={() => setAiOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center' }}><IconClose /></button>
          </div>
          <div style={styles.aiMessagesArea}>
            {/* Welcome message when no history */}
            {aiMessages.length === 0 && !aiLoading && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #2E7D32, #4CAF50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white' }}>
                  <IconAI />
                </div>
                <h4 style={{ color: '#111827', margin: '0 0 0.5rem' }}>Hello, {user?.email?.split('@')[0] || 'there'} 👋</h4>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  I'm your AI mental health companion. How are you feeling today?
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                  {suggestedPrompts.map((prompt, i) => (
                    <button key={i} style={styles.aiPromptBtn} onClick={() => sendAiMessage(prompt)}>{prompt}</button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Chat messages */}
            {aiMessages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} style={styles.aiMessageRow(isUser)}>
                  {!isUser && <div style={styles.aiAvatar(false)}><IconAI /></div>}
                  <div style={styles.aiBubble(isUser)}>
                    {isUser ? msg.content : formatAiText(msg.content)}
                  </div>
                  {isUser && <div style={styles.aiAvatar(true)}><IconUser /></div>}
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {aiLoading && (
              <div style={styles.aiMessageRow(false)}>
                <div style={styles.aiAvatar(false)}><IconAI /></div>
                <div style={{ ...styles.aiBubble(false), display: 'flex', gap: '4px', alignItems: 'center', padding: '1rem 1.25rem' }}>
                  <span style={{ animation: 'pulse 1s infinite', fontSize: '1.2rem', lineHeight: '1' }}>&bull;</span>
                  <span style={{ animation: 'pulse 1s infinite 0.2s', fontSize: '1.2rem', lineHeight: '1' }}>&bull;</span>
                  <span style={{ animation: 'pulse 1s infinite 0.4s', fontSize: '1.2rem', lineHeight: '1' }}>&bull;</span>
                </div>
              </div>
            )}
            <div ref={aiMessagesEndRef} />
          </div>
          <div style={styles.aiInputArea}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                placeholder="Share what's on your mind..."
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }}
              />
              <button onClick={() => sendAiMessage()} disabled={!aiInput.trim() || aiLoading} style={{ background: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: !aiInput.trim() || aiLoading ? 0.5 : 1 }}>
                <IconSend />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Overlay */}
      {callState !== 'idle' && (
        <div style={styles.callOverlay}>
          {callType === 'video' && callState === 'connected' ? (
            <div style={styles.videoContainer}>
              <video ref={remoteVideoRef} autoPlay playsInline style={styles.remoteVideo} />
              <video ref={localVideoRef} autoPlay playsInline muted style={styles.localVideo} />
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...styles.callAvatar, margin: '0 auto 1.5rem' }}><IconAudio /></div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem' }}>
                {callState === 'incoming' ? 'Incoming ' + callType + ' call' :
                 callState === 'calling' ? 'Calling...' :
                 callState === 'connecting' ? 'Connecting...' : 'Call in progress'}
              </h3>
              <p style={{ color: '#9CA3AF', margin: 0 }}>Secure {callType} session</p>
            </div>
          )}
          <div style={styles.callControls}>
            {callState === 'incoming' ? (
              <>
                <button onClick={acceptCall} style={styles.acceptBtn}>Accept</button>
                <button onClick={declineCall} style={styles.declineBtn}>Decline</button>
              </>
            ) : (
              <button onClick={() => cleanupCall(true)} style={styles.declineBtn}>End Call</button>
            )}
          </div>
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: translateY(0); }
            50% { opacity: 1; transform: translateY(-3px); }
          }
        `}
      </style>
            {/* AI COMPANION LINK */}
      <button
        onClick={() => navigate('/ai-companion')}
        style={{ position: 'fixed', bottom: '90px', right: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '999px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(46,125,50,0.35)', zIndex: 200 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg>
        AI Companion
      </button>
    </div>
  );
};

export default Chat;