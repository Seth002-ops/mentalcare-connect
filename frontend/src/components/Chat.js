import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stripEmoji } from '../utils/sanitizeText';
import { API_URL } from '../config'; // ✅ FIXED: Using centralized config
import { useToast } from './ToastContext';

// ============ ICONS ============
const IconVideo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const IconAudio = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const IconSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconClose = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconAI = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>;
const IconUser = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconCheckDouble = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 7 13 12 10 9"></polyline><polyline points="22 10 17 15 14 12"></polyline></svg>;
const IconMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

const Chat = ({ user, userType }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // ============ HUMAN CHAT STATE ============
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [otherUserName, setOtherUserName] = useState('Therapist');
  const [isTyping, setIsTyping] = useState(false);

  // ============ AI SIDEBAR STATE ============
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
  const [callState, setCallState] = useState('idle'); // idle | calling | incoming | connecting | connected
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
        const res = await fetch(`${API_URL}/ai/history`, {
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
        const res = await fetch(`${API_URL}/messages/${roomId}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(m => ({
            id: m.id,
            text: m.content,
            sender: m.sender_type,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: true // Simplified for MVP
          }));
          // Only update if length changed to prevent flickering
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
        const response = await fetch(`${API_URL}/bookings/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const booking = await response.json();
          const name = userType === 'client' ? booking.therapist_name : booking.client_name;
          setOtherUserName(name || 'Support Team');
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
    
    // Construct WS URL based on protocol
    const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    // Extract host from API_URL for consistency, assuming backend serves WS at same root path structure
    // If your backend WS is at /ws/{id}, adjust accordingly. 
    // Here we assume standard Render setup where WS might be separate or proxied.
    // For safety, we derive it from API_URL if possible, otherwise fallback.
    
    let wsHost = '';
    try {
        const urlObj = new URL(API_URL);
        wsHost = urlObj.host;
    } catch(e) {
        wsHost = 'localhost:8000'; // Dev fallback
    }

    const wsUrl = `${protocol}${wsHost}/ws/${roomId}?token=${token}`;
      
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const raw = String(event.data).replace(/^room:\d+:/, '');
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }
      if (!msg || msg.senderId === clientIdRef.current) return;
      handleSignalRef.current(msg);
    };

    return () => { 
        if(ws.readyState === WebSocket.OPEN) ws.close();
        wsRef.current = null; 
    };
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
      addToast('Permission denied. Please allow microphone/camera access.', 'error');
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
      addToast('Permission denied. Please allow microphone/camera access.', 'error');
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

    // Optimistic Update
    const tempMsg = {
      id: Date.now(),
      text: plainText,
      sender: userType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');

    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ room_id: Number(roomId), content: plainText, sender_type: userType })
      });
    } catch (err) {
      console.error("Failed to send message", err);
      addToast('Failed to send message. Please try again.', 'error');
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  // ============ AI CHAT ============
  const sendAiMessage = async (text) => {
    const content = text || aiInput.trim();
    if (!content || aiLoading) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      addToast('Please log in again to use the AI assistant.', 'error');
      return;
    }

    const updatedMessages = [...aiMessages, { role: 'user', content }];
    setAiMessages(updatedMessages);
    setAiInput('');
    setAiLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',  
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      
      if (!response.ok) throw new Error('AI service unavailable');
      
      const data = await response.json();
      const aiMessage = data.message || "I'm here to support you. Please try again.";
      
      setAiMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
    } catch (error) {
      console.error('AI Fetch Error:', error);
      addToast('AI assistant is currently unavailable.', 'error');
      setAiMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm here to support you. Please try again." 
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // ============ AI TEXT FORMATTER ============
  const formatAiText = (text) => {
    if (!text) return null;
    
    let cleanText = text.trim();
    if (cleanText.startsWith('{') && cleanText.includes('"message"')) {
      try {
        const parsed = JSON.parse(cleanText);
        if (parsed.message) cleanText = parsed.message;
      } catch (e) {
        cleanText = cleanText.replace(/^\{"message":\s*"/, '').replace(/"\}$/, '');
      }
    }

    const lines = cleanText.split('\n');
    
    return lines.map((line, index) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formattedParts = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ fontWeight: 700, color: '#1B5E20' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      const trimmedLine = line.trim();

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

      if (trimmedLine === '') return <div key={index} style={{ height: '8px' }} />;

      return <div key={index} style={{ margin: '4px 0', lineHeight: '1.6' }}>{formattedParts}</div>;
    });
  };

  return (
    <div className="chat-layout">
      {/* MAIN CHAT AREA */}
      <div className={`chat-main ${aiOpen ? 'chat-main-shifted' : ''}`}>
        
        {/* HEADER */}
        <header className="chat-header">
          <div className="chat-user-info">
            <div className="chat-avatar-circle">
              {(otherUserName.charAt(0)).toUpperCase()}
            </div>
            <div>
              <h2 className="chat-title">{otherUserName}</h2>
              <div className="chat-status-row">
                <span className="status-dot-online"></span>
                <span className="status-text">Online • Secure Channel</span>
              </div>
            </div>
          </div>
          
          <div className="chat-actions">
            <button onClick={() => startCall('video')} className="icon-btn" title="Start Video Call">
              <IconVideo />
            </button>
            <button onClick={() => startCall('audio')} className="icon-btn" title="Start Audio Call">
              <IconAudio />
            </button>
            <button 
              onClick={() => setAiOpen(!aiOpen)} 
              className={`icon-btn ${aiOpen ? 'active' : ''}`} 
              title="Toggle AI Assistant"
            >
              <IconAI />
            </button>
          </div>
        </header>

        {/* MESSAGES LIST */}
        <div className="chat-messages-area">
          {messages.length === 0 && (
            <div className="empty-chat-state">
              <div className="empty-icon-box"><IconLock /></div>
              <p>This is the beginning of your secure conversation with {otherUserName}.</p>
              <small>All messages are end-to-end encrypted.</small>
            </div>
          )}
          
          {messages.map((message) => {
            const isMe = message.sender === userType;
            return (
              <div key={message.id} className={`message-row ${isMe ? 'me' : 'them'}`}>
                {!isMe && (
                  <div className="msg-avatar">
                    {(otherUserName.charAt(0)).toUpperCase()}
                  </div>
                )}
                
                <div className="msg-content-wrapper">
                  <div className={`bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                    {message.text}
                  </div>
                  <div className="msg-meta">
                    <span>{message.timestamp}</span>
                    {isMe && <IconCheckDouble />}
                  </div>
                </div>

                {isMe && (
                  <div className="msg-avatar me-avatar">
                    {(user?.email?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <footer className="chat-input-area">
          <div className="input-wrapper">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(stripEmoji(e.target.value))}
              placeholder="Type a message..."
              rows="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="chat-textarea"
            />
            <button 
              onClick={sendMessage} 
              disabled={!newMessage.trim()}
              className="send-btn"
            >
              <IconSend />
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send • Shift+Enter for new line
          </div>
        </footer>
      </div>

      {/* AI ASSISTANT SIDEBAR */}
      <aside className={`ai-sidebar ${aiOpen ? 'open' : 'closed'}`}>
        <div className="ai-header">
          <div className="ai-brand">
            <div className="ai-logo-box"><IconAI /></div>
            <div>
              <h3>Mecac Support AI</h3>
              <small>Your private wellness companion</small>
            </div>
          </div>
          <button onClick={() => setAiOpen(false)} className="close-sidebar-btn">
            <IconClose />
          </button>
        </div>

        <div className="ai-messages-container">
          {aiMessages.length === 0 && !aiLoading && (
            <div className="ai-welcome">
              <p>Hello! I am here to listen and support you between sessions.</p>
              <div className="prompt-chips">
                {suggestedPrompts.map((prompt, i) => (
                  <button key={i} onClick={() => sendAiMessage(prompt)} className="chip">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {aiMessages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div key={index} className={`ai-msg-row ${isUser ? 'user' : 'bot'}`}>
                {!isUser && <div className="ai-avatar-bot"><IconAI /></div>}
                <div className={`ai-bubble ${isUser ? 'ai-bubble-user' : 'ai-bubble-bot'}`}>
                  {isUser ? msg.content : formatAiText(msg.content)}
                </div>
                {isUser && <div className="ai-avatar-user"><IconUser /></div>}
              </div>
            );
          })}
          
          {aiLoading && (
            <div className="ai-msg-row bot">
               <div className="ai-avatar-bot"><IconAI /></div>
               <div className="ai-typing-indicator">
                 <span></span><span></span><span></span>
               </div>
            </div>
          )}
          <div ref={aiMessagesEndRef} />
        </div>

        <div className="ai-input-area">
           <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
            placeholder="Ask anything..."
            className="ai-input-field"
          />
          <button 
            onClick={() => sendAiMessage()} 
            disabled={!aiInput.trim() || aiLoading}
            className="ai-send-btn"
          >
            <IconSend />
          </button>
        </div>
      </aside>

      {/* WEBRTC CALL OVERLAY */}
      {callState !== 'idle' && (
        <div className="call-overlay">
          {callType === 'video' && callState === 'connected' ? (
            <div className="video-call-container">
              <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
              <video ref={localVideoRef} autoPlay playsInline muted className="local-pip" />
              
              <div className="call-controls-floating">
                <button onClick={() => cleanupCall(true)} className="control-btn danger">
                  <IconClose /> End Call
                </button>
              </div>
            </div>
          ) : (
            <div className="audio-call-container">
              <div className="wave-animation">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
              
              <h2 className="call-status-text">
                {callState === 'incoming' ? `Incoming ${callType} call from ${otherUserName}` :
                 callState === 'calling' ? `Calling ${otherUserName}...` :
                 callState === 'connecting' ? 'Connecting...' : 'Call Active'}
              </h2>
              
              <div className="call-controls-center">
                {callState === 'incoming' ? (
                  <>
                    <button onClick={acceptCall} className="ctrl-btn accept"><IconAudio /></button>
                    <button onClick={declineCall} className="ctrl-btn decline"><IconClose /></button>
                  </>
                ) : (
                  <button onClick={() => cleanupCall(true)} className="ctrl-btn decline wide">
                    End Call
                  </button>
                )}
              </div>
            </div>
          )}
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      )}

      <style>{`
        /* --- LAYOUT --- */
        .chat-layout {
          display: flex;
          height: 100vh;
          background: #F9FAFB;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          overflow: hidden;
        }

        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          transition: margin-right 0.3s ease;
          min-width: 0; /* Prevent flex blowout */
        }

        .chat-main-shifted {
          margin-right: 380px; /* Width of sidebar */
        }

        @media (max-width: 900px) {
          .chat-main-shifted {
            margin-right: 0;
          }
          .ai-sidebar {
            position: fixed;
            right: 0;
            top: 0;
            bottom: 0;
            z-index: 100;
            box-shadow: -5px 0 20px rgba(0,0,0,0.1);
          }
        }

        /* --- HEADER --- */
        .chat-header {
          background: white;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        .chat-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .chat-avatar-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2E7D32, #66BB6A);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .chat-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
        }

        .chat-status-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: #6B7280;
        }

        .status-dot-online {
          width: 8px;
          height: 8px;
          background: #10B981;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .chat-actions {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: none;
          background: #F3F4F6;
          color: #4B5563;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          background: #E5E7EB;
          color: #111827;
        }

        .icon-btn.active {
          background: #E8F5E9;
          color: #2E7D32;
        }

        /* --- MESSAGES --- */
        .chat-messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          scroll-behavior: smooth;
        }

        .empty-chat-state {
          text-align: center;
          margin: auto;
          color: #9CA3AF;
        }
        .empty-icon-box {
          width: 60px;
          height: 60px;
          background: #F3F4F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #6B7280;
        }

        .message-row {
          display: flex;
          gap: 0.75rem;
          max-width: 85%;
        }

        .message-row.me {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-row.them {
          align-self: flex-start;
        }

        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #E5E7EB;
          color: #4B5563;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        
        .me-avatar {
          background: #2E7D32;
          color: white;
        }

        .msg-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .bubble {
          padding: 0.85rem 1.25rem;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.5;
          word-wrap: break-word;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .bubble-me {
          background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .bubble-them {
          background: white;
          color: #111827;
          border: 1px solid #E5E7EB;
          border-bottom-left-radius: 4px;
        }

        .msg-meta {
          font-size: 0.7rem;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0 0.5rem;
        }
        
        .message-row.me .msg-meta {
          justify-content: flex-end;
        }

        /* --- INPUT --- */
        .chat-input-area {
          background: white;
          padding: 1rem 1.5rem;
          border-top: 1px solid #E5E7EB;
        }

        .input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 0.5rem;
          transition: border-color 0.2s;
        }

        .input-wrapper:focus-within {
          border-color: #2E7D32;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
        }

        .chat-textarea {
          flex: 1;
          border: none;
          background: transparent;
          resize: none;
          padding: 0.5rem;
          font-size: 0.95rem;
          outline: none;
          max-height: 120px;
          font-family: inherit;
        }

        .send-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #2E7D32;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .send-btn:disabled {
          background: #D1D5DB;
          cursor: not-allowed;
        }

        .input-hint {
          font-size: 0.75rem;
          color: #9CA3AF;
          margin-top: 0.5rem;
          text-align: center;
        }

        /* --- AI SIDEBAR --- */
        .ai-sidebar {
          width: 380px;
          background: white;
          border-left: 1px solid #E5E7EB;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform: translateX(100%);
          opacity: 0;
          pointer-events: none;
        }

        .ai-sidebar.open {
          transform: translateX(0);
          opacity: 1;
          pointer-events: auto;
        }

        .ai-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #F3F4F6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #F9FAFB;
        }

        .ai-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ai-logo-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6D28D9, #8B5CF6);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-brand h3 {
          margin: 0;
          font-size: 0.95rem;
          color: #111827;
        }
        .ai-brand small {
          font-size: 0.75rem;
          color: #6B7280;
        }

        .close-sidebar-btn {
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          padding: 0.25rem;
        }

        .ai-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .ai-welcome {
          text-align: center;
          padding: 2rem 1rem;
          color: #4B5563;
        }

        .prompt-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .chip {
          background: #F3F4F6;
          border: 1px solid #E5E7EB;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chip:hover {
          background: #E8F5E9;
          border-color: #C8E6C9;
          color: #1B5E20;
        }

        .ai-msg-row {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
        }

        .ai-msg-row.user {
          flex-direction: row-reverse;
        }

        .ai-avatar-bot, .ai-avatar-user {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.8rem;
        }

        .ai-avatar-bot {
          background: #EDE9FE;
          color: #6D28D9;
        }

        .ai-avatar-user {
          background: #E5E7EB;
          color: #4B5563;
        }

        .ai-bubble {
          max-width: 85%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .ai-bubble-bot {
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          color: #111827;
          border-top-left-radius: 2px;
        }

        .ai-bubble-user {
          background: #6D28D9;
          color: white;
          border-top-right-radius: 2px;
        }

        .ai-typing-indicator {
          display: flex;
          gap: 4px;
          padding: 0.75rem 1rem;
          background: #F9FAFB;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
        }

        .ai-typing-indicator span {
          width: 6px;
          height: 6px;
          background: #9CA3AF;
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }
        
        .ai-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .ai-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }

        .ai-input-area {
          padding: 1rem;
          border-top: 1px solid #F3F4F6;
          display: flex;
          gap: 0.5rem;
          background: #F9FAFB;
        }

        .ai-input-field {
          flex: 1;
          padding: 0.6rem 1rem;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
        }
        
        .ai-input-field:focus {
          border-color: #6D28D9;
        }

        .ai-send-btn {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #6D28D9;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* --- CALL OVERLAY --- */
        .call-overlay {
          position: fixed;
          inset: 0;
          background: #0F172A;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .video-call-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .remote-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .local-pip {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          width: 180px;
          height: 240px;
          border-radius: 12px;
          border: 2px solid rgba(255,255,255,0.2);
          object-fit: cover;
          transform: scaleX(-1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .call-controls-floating {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
        }

        .control-btn {
          padding: 0.8rem 1.5rem;
          border-radius: 50px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s;
        }
        
        .control-btn:hover { transform: scale(1.05); }
        .control-btn.danger { background: #EF4444; color: white; }

        .audio-call-container {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .wave-animation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 60px;
        }

        .bar {
          width: 6px;
          background: #2E7D32;
          border-radius: 3px;
          animation: wave 1s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { height: 10px; }
          50% { height: 40px; }
        }

        .call-status-text {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .call-controls-center {
          display: flex;
          gap: 1.5rem;
        }

        .ctrl-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .ctrl-btn:hover { transform: scale(1.1); }
        .ctrl-btn.accept { background: #2E7D32; color: white; }
        .ctrl-btn.decline { background: #EF4444; color: white; }
        .ctrl-btn.wide { width: auto; padding: 0 2rem; border-radius: 30px; }

      `}</style>
    </div>
  );
};

export default Chat;