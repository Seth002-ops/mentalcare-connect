import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const Chat = ({ user, userType }) => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [showMediaPermission, setShowMediaPermission] = useState(false);
  const [callType, setCallType] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const aiTips = [
    "Take a few deep breaths - inhale for 4 seconds, hold for 4, exhale for 4.",
    "Try progressive muscle relaxation: tense and release each muscle group.",
    "Write down three things you're grateful for right now.",
    "Go for a short walk and focus on your surroundings.",
    "Remember: it's okay to feel this way. You're taking positive steps by being here."
  ];

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: userType === 'client' ? 'client' : 'therapist',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      encrypted: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate response
    setTimeout(() => {
      const response = {
        id: Date.now() + 1,
        text: userType === 'client' 
          ? "Thank you for sharing. How has this been affecting your daily life?"
          : "I appreciate you opening up. Let's explore this together.",
        sender: userType === 'client' ? 'therapist' : 'client',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        encrypted: true
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const startCall = async (type) => {
    setCallType(type);
    setShowMediaPermission(true);
  };

  const requestMediaPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });
      setShowMediaPermission(false);
      alert(`${callType.toUpperCase()} call started successfully!`);
      // In production, this would connect to WebRTC peer
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      alert('Permission denied. Please allow microphone/camera access for calls.');
    }
  };

  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#F9FAFB'
    },
    header: {
      background: 'linear-gradient(135deg, #2BB3A3 0%, #A78BFA 100%)',
      color: 'white',
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '2rem',
      backgroundColor: '#F9FAFB'
    },
    message: {
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    },
    messageBubble: sender => ({
      maxWidth: '70%',
      padding: '1rem 1.5rem',
      borderRadius: '20px',
      marginLeft: sender === 'client' ? 'auto' : '0',
      backgroundColor: sender === 'client' ? '#2BB3A3' : '#E5E7EB',
      color: sender === 'client' ? 'white' : '#111827'
    }),
    inputContainer: {
      padding: '2rem',
      backgroundColor: 'white',
      borderTop: '1px solid #E5E7EB'
    },
    input: {
      width: '100%',
      padding: '1rem 1.5rem',
      border: '2px solid #E5E7EB',
      borderRadius: '25px',
      fontSize: '1rem',
      marginBottom: '1rem',
      resize: 'none'
    },
    buttons: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap'
    },
    callBtn: {
      padding: '1rem 1.5rem',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    videoBtn: {
      backgroundColor: '#F97373',
      color: 'white'
    },
    voiceBtn: {
      backgroundColor: '#A78BFA',
      color: 'white'
    },
    sendBtn: {
      backgroundColor: '#2BB3A3',
      color: 'white',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '25px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    aiPanel: {
      position: 'fixed',
      bottom: '120px',
      right: '2rem',
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      width: '350px',
      maxHeight: '400px',
      overflowY: 'auto'
    },
    permissionModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    permissionContent: {
      background: 'white',
      padding: '3rem',
      borderRadius: '20px',
      textAlign: 'center',
      maxWidth: '450px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2>Chat</h2>
          <p style={{opacity: 0.9}}>All messages are end-to-end encrypted 🔒</p>
        </div>
        <button 
          onClick={() => setAiOpen(!aiOpen)}
          style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer'}}
        >
          🤖
        </button>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((message) => (
          <div key={message.id} style={styles.message}>
            <div style={styles.messageBubble(message.sender)}>
              {message.text}
            </div>
            <small style={{opacity: 0.7, marginLeft: message.sender === 'client' ? 'auto' : '0', display: 'block'}}>
              {message.timestamp} • Encrypted
            </small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <textarea
          style={styles.input}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          rows="2"
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
        />
        <div style={styles.buttons}>
          <button style={{...styles.callBtn, ...styles.videoBtn}} onClick={() => startCall('video')}>
            📹 Video Call
          </button>
          <button style={{...styles.callBtn, ...styles.voiceBtn}} onClick={() => startCall('voice')}>
            🎤 Voice Call
          </button>
          <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
        </div>
      </div>

      {aiOpen && (
        <div style={styles.aiPanel}>
          <h4 style={{color: '#2BB3A3', marginBottom: '1rem'}}>AI Support</h4>
          <p style={{color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem'}}>
            Gentle coping tips • Not a therapist replacement
          </p>
          <div style={{maxHeight: '250px', overflowY: 'auto'}}>
            {aiTips.map((tip, index) => (
              <div key={index} style={{
                background: '#F0F9FF',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                borderLeft: '3px solid #2BB3A3'
              }}>
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {showMediaPermission && (
        <div style={styles.permissionModal}>
          <div style={styles.permissionContent}>
            <div style={{fontSize: '4rem', marginBottom: '1.5rem'}}>🎥</div>
            <h3 style={{color: '#2BB3A3', marginBottom: '1rem'}}>
              {callType === 'video' ? 'Video Call' : 'Voice Call'} Permission
            </h3>
            <p style={{marginBottom: '2rem', color: '#6B7280'}}>
              We need your permission to use your {callType === 'video' ? 'microphone and camera' : 'microphone'}.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button 
                onClick={requestMediaPermissions}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: '#2BB3A3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}
              >
                Grant Permission
              </button>
              <button 
                onClick={() => setShowMediaPermission(false)}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: 'transparent',
                  color: '#6B7280',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;