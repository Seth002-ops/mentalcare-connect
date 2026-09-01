import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============ PROFESSIONAL SVG ICONS ============
const IconSparkles = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
  </svg>
);

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconMinimize = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
    <line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

const IconMaximize = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

const IconMic = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
    <path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const IconMicOff = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/>
    <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IconSpeaker = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
  </svg>
);

const IconStop = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
);

const IconBot = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);


// ============ MAIN WIDGET COMPONENT ============
const AICompanionWidget = ({ userType = 'client' }) => {
  // Panel state
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState('');
  
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setLiveTranscript(interimTranscript || finalTranscript);
        
        if (finalTranscript) {
          setInputText(finalTranscript);
          setLiveTranscript('');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setLiveTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Load chat history when panel opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/ai/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const history = await res.json();
        setMessages(history.map(msg => ({
          role: msg.role,
          content: msg.content,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch AI history', err);
    }
  };

  const speakText = useCallback((text) => {
    if (!autoSpeak || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    // Clean text for speech (remove markdown)
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/-/g, '')
      .replace(/#/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google'))
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [autoSpeak]);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const aiMessage = { role: 'assistant', content: data.response };
        setMessages(prev => [...prev, aiMessage]);
        
        // Auto-speak the response
        if (autoSpeak) {
          speakText(data.response);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I\'m having trouble connecting right now. Please try again in a moment.',
        }]);
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setLiveTranscript('');
    } else {
      stopSpeaking(); // Stop any current speech
      setInputText('');
      setLiveTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const clearHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('/ai/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
      stopSpeaking();
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  // Format message content (simple markdown-like rendering)
  const formatMessage = (content) => {
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text
        let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        if (formatted.startsWith('- ')) {
          return <div key={i} style={{ paddingLeft: '12px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: formatted.substring(2) }} />
          </div>;
        }
        return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
      });
  };

  // ============ STYLES ============
  const styles = {
    // Floating Action Button
    fab: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      display: isOpen ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 25px rgba(124, 58, 237, 0.4)',
      transition: 'all 0.3s ease',
      zIndex: 1000,
      animation: !isOpen ? 'pulse 2s infinite' : 'none',
    },
    
    // Slide-out Panel
    panel: {
      position: 'fixed',
      top: 0,
      right: 0,
      height: '100vh',
      width: isFullScreen ? '100vw' : '420px',
      maxWidth: isFullScreen ? '100vw' : '100vw',
      background: '#FFFFFF',
      boxShadow: '-4px 0 25px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s ease',
      zIndex: 1001,
    },
    
    // Panel Header
    panelHeader: {
      background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
      color: 'white',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    },
    
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    
    headerIcon: {
      width: '38px',
      height: '38px',
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    headerTitle: {
      fontWeight: '700',
      fontSize: '1rem',
      margin: 0,
    },
    
    headerSubtitle: {
      fontSize: '0.75rem',
      opacity: 0.85,
      margin: 0,
    },
    
    headerActions: {
      display: 'flex',
      gap: '0.5rem',
    },
    
    headerBtn: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      background: 'rgba(255,255,255,0.15)',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s',
    },
    
    // Messages Area
    messagesArea: {
      flex: 1,
      overflowY: 'auto',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      background: '#F9FAFB',
    },
    
    // Message Bubbles
    messageBubble: (isUser) => ({
      maxWidth: '85%',
      padding: '0.85rem 1rem',
      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
      background: isUser ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : 'white',
      color: isUser ? 'white' : '#1F2937',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      fontSize: '0.9rem',
      lineHeight: '1.5',
      wordBreak: 'break-word',
    }),
    
    messageMeta: (isUser) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      fontSize: '0.7rem',
      color: isUser ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
      marginTop: '0.4rem',
    }),
    
    // Typing indicator
    typingIndicator: {
      display: 'flex',
      gap: '4px',
      padding: '0.85rem 1rem',
      background: 'white',
      borderRadius: '16px 16px 16px 4px',
      alignSelf: 'flex-start',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    
    typingDot: (delay) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#9CA3AF',
      animation: `typingBounce 1.4s infinite ease-in-out`,
      animationDelay: `${delay}s`,
    }),
    
    // Input Area
    inputArea: {
      padding: '1rem 1.25rem',
      borderTop: '1px solid #E5E7EB',
      background: 'white',
      flexShrink: 0,
    },
    
    // Voice status bar
    voiceStatus: {
      display: isListening || liveTranscript ? 'flex' : 'none',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      background: isListening ? '#FEF2F2' : '#F0FDF4',
      borderRadius: '8px',
      marginBottom: '0.75rem',
      fontSize: '0.8rem',
      color: isListening ? '#DC2626' : '#2E7D32',
    },
    
    inputRow: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '0.5rem',
    },
    
    textInput: {
      flex: 1,
      padding: '0.75rem 1rem',
      border: '1px solid #D1D5DB',
      borderRadius: '12px',
      fontSize: '0.9rem',
      outline: 'none',
      resize: 'none',
      maxHeight: '100px',
      fontFamily: 'inherit',
      lineHeight: '1.4',
      transition: 'border-color 0.2s',
    },
    
    micButton: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      background: isListening ? '#DC2626' : '#F3F4F6',
      color: isListening ? 'white' : '#374151',
      flexShrink: 0,
    },
    
    sendButton: {
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      border: 'none',
      background: inputText.trim() ? 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)' : '#E5E7EB',
      color: inputText.trim() ? 'white' : '#9CA3AF',
      cursor: inputText.trim() ? 'pointer' : 'not-allowed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      flexShrink: 0,
    },
    
    // Settings row
    settingsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '0.75rem',
      paddingTop: '0.75rem',
      borderTop: '1px solid #F3F4F6',
    },
    
    autoSpeakToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.75rem',
      color: '#6B7280',
      cursor: 'pointer',
      userSelect: 'none',
    },
    
    toggleSwitch: {
      width: '36px',
      height: '20px',
      borderRadius: '10px',
      background: autoSpeak ? '#7C3AED' : '#D1D5DB',
      position: 'relative',
      transition: 'background 0.2s',
      cursor: 'pointer',
    },
    
    toggleKnob: {
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      background: 'white',
      position: 'absolute',
      top: '2px',
      left: autoSpeak ? '18px' : '2px',
      transition: 'left 0.2s',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    },
    
    clearBtn: {
      fontSize: '0.75rem',
      color: '#DC2626',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.25rem 0.5rem',
      borderRadius: '6px',
      transition: 'background 0.2s',
    },
    
    // Empty state
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      textAlign: 'center',
      color: '#9CA3AF',
    },
    
    emptyIcon: {
      width: '64px',
      height: '64px',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem',
      color: '#7C3AED',
    },
    
    // Full screen button
    fullScreenBtn: {
      position: 'fixed',
      bottom: '24px',
      right: isFullScreen ? '24px' : 'calc(420px + 24px)',
      padding: '0.5rem 1rem',
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '999px',
      fontSize: '0.8rem',
      color: '#6B7280',
      cursor: 'pointer',
      display: isOpen ? 'flex' : 'none',
      alignItems: 'center',
      gap: '0.4rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.35s ease',
      zIndex: 999,
    },
  };

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.5); }
          70% { box-shadow: 0 0 0 15px rgba(124, 58, 237, 0); }
          100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @media (max-width: 480px) {
          .ai-panel { width: 100vw !important; }
        }
      `}</style>

      {/* Floating Action Button */}
      <button
        style={styles.fab}
        onClick={() => setIsOpen(true)}
        title="Talk to AI Companion"
      >
        <IconSparkles />
      </button>

      {/* Full Screen Toggle */}
      <button
        style={styles.fullScreenBtn}
        onClick={() => setIsFullScreen(!isFullScreen)}
      >
        {isFullScreen ? <IconMinimize /> : <IconMaximize />}
        {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
      </button>

      {/* Slide-out Panel */}
      <div style={styles.panel} className="ai-panel">
        {/* Header */}
        <div style={styles.panelHeader}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <IconSparkles />
            </div>
            <div>
              <p style={styles.headerTitle}>AI Companion</p>
              <p style={styles.headerSubtitle}>
                {isSpeaking ? 'Speaking...' : 'Always here for you'}
              </p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button
              style={styles.headerBtn}
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullScreen ? <IconMinimize /> : <IconMaximize />}
            </button>
            <button
              style={styles.headerBtn}
              onClick={() => {
                setIsOpen(false);
                stopSpeaking();
              }}
              title="Close"
            >
              <IconClose />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={styles.messagesArea}>
          {messages.length === 0 && !isLoading ? (
            <div style={styles.emptyState}>
  <div style={styles.emptyIcon}>
    <IconBot />
  </div>
  <p style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
    {userType === 'therapist' 
      ? 'Hello! I\'m your Practice Assistant' 
      : 'Hello! I\'m your AI Companion'}
  </p>
  <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
    {userType === 'therapist'
      ? 'I can help summarize client progress, draft session notes, and manage your practice.'
      : 'I\'m here to listen and support you. You can type or tap the microphone to speak.'}
  </p>
  <p style={{ fontSize: '0.8rem', color: '#7C3AED', marginTop: '0.75rem', fontWeight: '600' }}>
    {userType === 'therapist'
      ? 'Try asking: "Summarize my sessions this week"'
      : 'Try saying: "I\'m feeling anxious today"'}
  </p>
</div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i}>
                  <div style={styles.messageBubble(msg.role === 'user')}>
                    {formatMessage(msg.content)}
                  </div>
                  <div style={styles.messageMeta(msg.role === 'user')}>
                    {msg.role === 'user' ? <IconUser /> : <IconBot />}
                    {msg.role === 'user' ? 'You' : 'AI Companion'}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.content)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex', marginLeft: '0.5rem' }}
                        title="Read aloud"
                      >
                        <IconSpeaker />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={styles.typingIndicator}>
                  <div style={styles.typingDot(0)} />
                  <div style={styles.typingDot(0.2)} />
                  <div style={styles.typingDot(0.4)} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>
          {/* Voice Status */}
          <div style={styles.voiceStatus}>
            {isListening ? (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626', animation: 'pulse 1s infinite' }} />
                Listening... {liveTranscript && `"${liveTranscript}"`}
              </>
            ) : liveTranscript ? (
              <>Processing: "{liveTranscript}"</>
            ) : null}
          </div>

          {/* Input Row */}
          <div style={styles.inputRow}>
            <textarea
              ref={inputRef}
              style={styles.textInput}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type or speak your message..."
              rows={1}
            />
            
            <button
              style={styles.micButton}
              onClick={toggleListening}
              title={isListening ? 'Stop listening' : 'Start speaking'}
            >
              {isListening ? <IconMicOff /> : <IconMic />}
            </button>
            
            <button
              style={styles.sendButton}
              onClick={handleSend}
              disabled={!inputText.trim()}
              title="Send message"
            >
              <IconSend />
            </button>
          </div>

          {/* Settings Row */}
          <div style={styles.settingsRow}>
            <div
              style={styles.autoSpeakToggle}
              onClick={() => setAutoSpeak(!autoSpeak)}
            >
              <div style={styles.toggleSwitch}>
                <div style={styles.toggleKnob} />
              </div>
              Auto-speak responses
            </div>
            
            <button
              style={styles.clearBtn}
              onClick={clearHistory}
            >
              Clear history
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AICompanionWidget;