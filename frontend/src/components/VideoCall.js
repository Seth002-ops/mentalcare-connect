import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const VideoCall = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  
  const apiRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/bookings/${bookingId}/video-room`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Not authorized to join this call');
        const data = await res.json();
        setRoomId(data.room_id);
        loadJitsiScript(data.room_id);
      } catch (err) {
        setError(err.message || 'Could not join this call.');
        setLoading(false);
      }
    };
    fetchRoom();

    // Cleanup: destroy Jitsi when leaving the page
    return () => {
      if (apiRef.current) {
        apiRef.current.executeCommand('hangup');
        apiRef.current.dispose();
      }
    };
  }, [bookingId]);

  const loadJitsiScript = (room) => {
    // Check if script already loaded
    if (window.JitsiMeetExternalAPI) {
      initJitsi(room);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => initJitsi(room);
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
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        DEFAULT_BACKGROUND: '#111827',
      }
    };
    
    const api = new window.JitsiMeetExternalAPI(domain, options);
    apiRef.current = api;
    setLoading(false);
  };

  const handleEndCall = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
      apiRef.current.dispose();
    }
    navigate('/dashboard'); 
  };

  const toggleRecording = () => {
    if (!apiRef.current) return;
    if (recording) {
      apiRef.current.executeCommand('stopRecording', 'file');
      setRecording(false);
    } else {
      // This triggers Jitsi's built-in Dropbox recording prompt
      apiRef.current.executeCommand('startRecording', { mode: 'file' });
      setRecording(true);
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: '#111827', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#1F2937', padding: '0.75rem 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <h1 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: '700' }}>Secure Session Call</h1>
            <p style={{ margin: 0, color: '#9CA3AF', fontSize: '0.75rem' }}>🔒 Private & encrypted via Jitsi Meet</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={toggleRecording}
            style={{ 
              padding: '0.5rem 1rem', 
              background: recording ? '#DC2626' : '#374151', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600', 
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: recording ? 'white' : '#DC2626' }}></span>
            {recording ? 'Stop Recording' : 'Record Session'}
          </button>

          <button 
            onClick={handleEndCall} 
            style={{ 
              padding: '0.5rem 1.2rem', 
              background: '#DC2626', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '700', 
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            End Call
          </button>
        </div>
      </header>

      <main style={{ flex: 1, position: 'relative' }}>
        {loading && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
            Connecting to secure call...
          </div>
        )}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FCA5A5', textAlign: 'center', padding: '2rem' }}>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: '700' }}>⚠️ {error}</p>
              <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Only the client and therapist of this session can join.</p>
            </div>
          </div>
        )}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </main>
    </div>
  );
};

export default VideoCall;