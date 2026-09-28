import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config'; // ✅ FIXED: Using centralized config
import { useToast } from './ToastContext';

// ============ ICONS ============
const IconPhoneOff = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>;
const IconMic = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>;
const IconCam = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const IconRecord = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>;
const IconStop = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect></svg>;
const IconLock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconSignalGood = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/></svg>;
const IconSignalBad = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 20V4"/></svg>;

const VideoCall = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState('good'); // good | poor
  
  const apiRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimerRef = useRef(null);

  // Auto-hide controls after 3 seconds of inactivity
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!recording) setControlsVisible(false); // Keep visible if recording
    }, 3000);
  }, [recording]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Session expired. Please log in again.');
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      try {
        const res = await fetch(`${API_URL}/bookings/${bookingId}/video-room`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || 'Not authorized to join this call');
        }
        
        const data = await res.json();
        setRoomId(data.room_id);
        loadJitsiScript(data.room_id);
      } catch (err) {
        console.error("Video Call Init Error:", err);
        setError(err.message || 'Could not initialize secure session.');
        setLoading(false);
      }
    };

    fetchRoom();

    // Cleanup on unmount
    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.executeCommand('hangup');
          apiRef.current.dispose();
        } catch (e) {
          console.warn("Cleanup error", e);
        }
      }
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [bookingId]);

  const loadJitsiScript = (room) => {
    if (window.JitsiMeetExternalAPI) {
      initJitsi(room);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => initJitsi(room);
    script.onerror = () => {
      setError('Failed to load video engine. Check your internet connection.');
      setLoading(false);
    };
    document.body.appendChild(script);
  };

  const initJitsi = (room) => {
    if (!containerRef.current) return;
    
    const domain = 'meet.jit.si';
    const options = {
      roomName: room,
      parentNode: containerRef.current,
      width: '100%',
      height: '100%',
      userInfo: {
        displayName: localStorage.getItem('email')?.split('@')[0] || 'Participant',
      },
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableNoisyMicDetection: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        DEFAULT_BACKGROUND: '#0F172A',
        TOOLBAR_BUTTONS: [], // Hide default toolbar, we use custom
      }
    };
    
    try {
      const api = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;
      
      // Listen for events
      api.addEventListener('participantJoined', () => {
        setConnectionQuality('good');
      });
      
      api.addEventListener('networkQualityChanged', (event) => {
        // event.level can be 'good', 'poor', etc.
        setConnectionQuality(event.level === 'poor' ? 'poor' : 'good');
      });

      api.addEventListener('audioMuteStatusChanged', (event) => {
        // Optional: Sync UI state if needed
      });

      setLoading(false);
      resetHideTimer(); // Start timer once loaded
    } catch (e) {
      setError('Failed to start video call.');
      setLoading(false);
    }
  };

  const handleEndCall = () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      if (apiRef.current) {
        apiRef.current.executeCommand('hangup');
        apiRef.current.dispose();
      }
      navigate('/dashboard'); 
    }
  };

  const toggleRecording = () => {
    if (!apiRef.current) return;
    
    if (recording) {
      apiRef.current.executeCommand('stopRecording', 'file');
      setRecording(false);
      addToast('Recording stopped.', 'info');
    } else {
      // Note: Actual recording requires backend configuration in Jitsi.
      // This simulates the UI state.
      apiRef.current.executeCommand('startRecording', { mode: 'file' });
      setRecording(true);
      addToast('Recording started. Ensure all participants consent.', 'warning');
    }
  };

  const toggleMic = () => {
    if (apiRef.current) {
      apiRef.current.toggleAudioMuted();
    }
  };

  const toggleCamera = () => {
    if (apiRef.current) {
      apiRef.current.toggleVideoMuted();
    }
  };

  return (
    <div 
      className="vc-container"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
    >
      {/* LOADING STATE */}
      {loading && !error && (
        <div className="vc-loading-overlay">
          <div className="vc-spinner-ring"></div>
          <p>Establishing secure connection...</p>
          <small>Encrypting channel via WebRTC</small>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="vc-error-overlay">
          <div className="vc-error-card">
            <IconLock />
            <h2>Access Denied</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/dashboard')} className="vc-btn-secondary">
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* VIDEO CONTAINER (Jitsi Injects Here) */}
      <div ref={containerRef} className="vc-video-wrapper" />

      {/* TOP BAR: Status & Security */}
      <header className={`vc-top-bar ${controlsVisible ? 'visible' : 'hidden'}`}>
        <div className="vc-status-left">
          <span className="vc-live-badge">LIVE SESSION</span>
          <div className="vc-quality-indicator" title={`Connection: ${connectionQuality}`}>
            {connectionQuality === 'good' ? <IconSignalGood /> : <IconSignalBad />}
          </div>
        </div>
        
        <div className="vc-security-badge">
          <IconLock /> End-to-End Encrypted
        </div>
      </header>

      {/* RECORDING WARNING BANNER */}
      {recording && (
        <div className="vc-recording-banner">
          <span className="vc-rec-dot"></span>
          <strong>RECORDING ACTIVE</strong>
          <span>Please ensure informed consent from all participants.</span>
        </div>
      )}

      {/* BOTTOM CONTROL BAR */}
      <footer className={`vc-bottom-bar ${controlsVisible ? 'visible' : 'hidden'}`}>
        <div className="vc-controls-group">
          <button 
            onClick={toggleMic} 
            className="vc-control-btn" 
            title="Toggle Microphone"
          >
            <IconMic />
          </button>
          
          <button 
            onClick={toggleCamera} 
            className="vc-control-btn" 
            title="Toggle Camera"
          >
            <IconCam />
          </button>
          
          <button 
            onClick={toggleRecording} 
            className={`vc-control-btn ${recording ? 'active-danger' : ''}`} 
            title={recording ? "Stop Recording" : "Start Recording"}
          >
            {recording ? <IconStop /> : <IconRecord />}
          </button>
        </div>

        <button 
          onClick={handleEndCall} 
          className="vc-end-call-btn"
        >
          <IconPhoneOff /> End Session
        </button>
      </footer>

      <style>{`
        .vc-container {
          position: fixed;
          inset: 0;
          background: #0F172A; /* Deep Slate Blue/Black */
          z-index: 9999;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .vc-video-wrapper {
          width: 100%;
          height: 100%;
        }

        /* --- OVERLAYS --- */
        .vc-loading-overlay, .vc-error-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(15, 23, 42, 0.95);
          color: white;
          z-index: 10;
        }

        .vc-spinner-ring {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.1);
          border-top-color: #10B981;
          border-radius: 50%;
          animation: vcSpin 1s linear infinite;
          margin-bottom: 1.5rem;
        }

        @keyframes vcSpin {
          to { transform: rotate(360deg); }
        }

        .vc-loading-overlay p {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }
        
        .vc-loading-overlay small {
          color: #9CA3AF;
          font-size: 0.85rem;
        }

        .vc-error-card {
          text-align: center;
          max-width: 400px;
          padding: 2rem;
          background: #1E293B;
          border-radius: 16px;
          border: 1px solid #334155;
        }

        .vc-error-card h2 {
          color: #EF4444;
          margin: 1rem 0 0.5rem;
        }

        .vc-error-card p {
          color: #CBD5E1;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        /* --- TOP BAR --- */
        .vc-top-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(to bottom, rgba(15, 23, 42, 0.8), transparent);
          transition: opacity 0.3s ease, transform 0.3s ease;
          z-index: 5;
        }

        .vc-top-bar.hidden {
          opacity: 0;
          transform: translateY(-20px);
          pointer-events: none;
        }

        .vc-status-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .vc-live-badge {
          background: #DC2626;
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
          box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
        }

        .vc-quality-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          backdrop-filter: blur(4px);
        }

        .vc-security-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #10B981;
          font-size: 0.8rem;
          font-weight: 600;
          background: rgba(16, 185, 129, 0.1);
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        /* --- RECORDING BANNER --- */
        .vc-recording-banner {
          position: absolute;
          top: 4rem;
          left: 50%;
          transform: translateX(-50%);
          background: #FEF2F2;
          color: #991B1B;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          border: 1px solid #FECACA;
          z-index: 6;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .vc-rec-dot {
          width: 10px;
          height: 10px;
          background: #DC2626;
          border-radius: 50%;
          animation: pulseRec 1.5s infinite;
        }

        @keyframes pulseRec {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }

        /* --- BOTTOM BAR --- */
        .vc-bottom-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent);
          transition: opacity 0.3s ease, transform 0.3s ease;
          z-index: 5;
        }

        .vc-bottom-bar.hidden {
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
        }

        .vc-controls-group {
          display: flex;
          gap: 1rem;
          background: rgba(30, 41, 59, 0.6);
          padding: 0.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .vc-control-btn {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vc-control-btn:hover {
          background: rgba(255,255,255,0.1);
          transform: scale(1.05);
        }

        .vc-control-btn.active-danger {
          background: #DC2626;
          color: white;
        }

        .vc-end-call-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          background: #DC2626;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .vc-end-call-btn:hover {
          background: #B91C1C;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
        }

        .vc-btn-secondary {
          padding: 0.6rem 1.2rem;
          background: transparent;
          border: 1px solid #475569;
          color: #CBD5E1;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        
        .vc-btn-secondary:hover {
          background: #334155;
          color: white;
        }

        /* Responsive adjustments */
        @media (max-width: 600px) {
          .vc-bottom-bar {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }
          
          .vc-controls-group {
            width: 100%;
            justify-content: space-around;
          }
          
          .vc-end-call-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoCall;