import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

// ============ PROFESSIONAL LINE ICONS ============
const IconMenu = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconLeaf = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>;
const IconSunrise = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="9" x2="12" y2="2"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="16 5 12 9 8 5"></polyline></svg>;
const IconSun = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const IconMoon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconVideo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>;
const IconMessage = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconStar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconSparkle = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9z"></path><line x1="19" y1="3" x2="19" y2="7"></line><line x1="17" y1="5" x2="21" y2="5"></line><line x1="5" y1="17" x2="5" y2="21"></line><line x1="3" y1="19" x2="7" y2="19"></line></svg>;
const IconBulb = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z"></path></svg>;
const IconHeart = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconUpload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const IconLogout = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const IconChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconBot = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path></svg>;
// ============ PROFESSIONAL MOOD FACE ICONS ============
const MoodFace = ({ type, color }) => {
  const eyes = (
    <>
      <circle cx="9" cy="10" r="1.1" fill={color} stroke="none" />
      <circle cx="15" cy="10" r="1.1" fill={color} stroke="none" />
    </>
  );
  const closedEyes = (
    <>
      <path d="M7.5 10 q1.5 1.4 3 0" stroke={color} />
      <path d="M13.5 10 q1.5 1.4 3 0" stroke={color} />
    </>
  );
  let mouth = null;
  let extra = null;
  switch (type) {
    case 'bigsmile': mouth = <path d="M8 13.5 q4 4.5 8 0" stroke={color} />; break;
    case 'smile': mouth = <path d="M8.5 14 q3.5 3 7 0" stroke={color} />; break;
    case 'soft': mouth = <path d="M9 14.5 q3 2 6 0" stroke={color} />; break;
    case 'neutral': mouth = <line x1="9" y1="14.5" x2="15" y2="14.5" stroke={color} />; break;
    case 'frown': mouth = <path d="M8.5 15.5 q3.5 -3 7 0" stroke={color} />; break;
    case 'deep': mouth = <path d="M8 16 q4 -4 8 0" stroke={color} />; extra = <><line x1="7" y1="7.5" x2="10.5" y2="8.5" stroke={color} /><line x1="17" y1="7.5" x2="13.5" y2="8.5" stroke={color} /></>; break;
    case 'tear': mouth = <path d="M8.5 15.5 q3.5 -3 7 0" stroke={color} />; extra = <path d="M16.5 12 q1 1.6 0 2.4 q-1 -0.8 0 -2.4" fill={color} stroke="none" />; break;
    case 'open': mouth = <ellipse cx="12" cy="14.5" rx="2.5" ry="2" stroke={color} />; break;
    default: mouth = <path d="M8.5 14 q3.5 3 7 0" stroke={color} />;
  }
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.2" stroke={color} />
      {type === 'calm' ? closedEyes : eyes}
      {mouth}
      {extra}
    </svg>
  );
};

const MOODS = [
  { value: 'happy', label: 'Happy', type: 'bigsmile', color: '#2E7D32', score: 8 },
  { value: 'calm', label: 'Calm', type: 'calm', soft: true, color: '#43A047', score: 7 },
  { value: 'hopeful', label: 'Hopeful', type: 'smile', color: '#66BB6A', score: 8 },
  { value: 'grateful', label: 'Grateful', type: 'soft', color: '#81C784', score: 9 },
  { value: 'excited', label: 'Excited', type: 'open', color: '#F9A825', score: 9 },
  { value: 'neutral', label: 'Neutral', type: 'neutral', color: '#78909C', score: 5 },
  { value: 'anxious', label: 'Anxious', type: 'frown', color: '#FB8C00', score: 3 },
  { value: 'stressed', label: 'Stressed', type: 'deep', color: '#F4511E', score: 2 },
  { value: 'sad', label: 'Sad', type: 'tear', color: '#1E88E5', score: 3 },
  { value: 'angry', label: 'Angry', type: 'deep', color: '#E53935', score: 2 },
  { value: 'lonely', label: 'Lonely', type: 'frown', color: '#5E35B1', score: 2 },
  { value: 'overwhelmed', label: 'Overwhelmed', type: 'deep', color: '#8E24AA', score: 2 },
];

// ============ PRESET AVATARS (Professional flat illustrations) ============
const PRESETS = [
  { bg: '#E8F5E9', skin: '#F2C9A0', shirt: '#2E7D32', hair: 'short', hairColor: '#3E2723' },
  { bg: '#E0F2FE', skin: '#8D5524', shirt: '#0277BD', hair: 'bun', hairColor: '#212121' },
  { bg: '#EDE9FE', skin: '#E0AC69', shirt: '#6D28D9', hair: 'long', hairColor: '#4E342E' },
  { bg: '#FFF3E0', skin: '#C68642', shirt: '#E65100', hair: 'curly', hairColor: '#212121' },
  { bg: '#FCE4EC', skin: '#FFDBAC', shirt: '#C2185B', hair: 'long', hairColor: '#6D4C41' },
  { bg: '#E0F7FA', skin: '#F2C9A0', shirt: '#00838F', hair: 'none', hairColor: '#9E9E9E' },
  { bg: '#F1F8E9', skin: '#E0AC69', shirt: '#558B2F', hair: 'short', hairColor: '#212121' },
  { bg: '#EFEBE9', skin: '#8D5524', shirt: '#5D4037', hair: 'curly', hairColor: '#424242' },
];

const AvatarPreset = ({ v, size = 40 }) => {
  const p = PRESETS[v];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ borderRadius: '50%', display: 'block' }}>
      <circle cx="24" cy="24" r="24" fill={p.bg} />
      <path d="M9 46 q15 -14 30 0 v3 h-30 z" fill={p.shirt} />
      <circle cx="24" cy="20" r="9.5" fill={p.skin} />
      {p.hair === 'short' && <path d="M14.5 20 a9.5 9.5 0 0 1 19 0" fill="none" stroke={p.hairColor} strokeWidth="4.5" strokeLinecap="round" />}
      {p.hair === 'long' && <><path d="M14.5 20 a9.5 9.5 0 0 1 19 0" fill="none" stroke={p.hairColor} strokeWidth="4.5" strokeLinecap="round" /><path d="M14.5 20 v8" stroke={p.hairColor} strokeWidth="4" strokeLinecap="round" /><path d="M33.5 20 v8" stroke={p.hairColor} strokeWidth="4" strokeLinecap="round" /></>}
      {p.hair === 'bun' && <><path d="M14.5 20 a9.5 9.5 0 0 1 19 0" fill="none" stroke={p.hairColor} strokeWidth="4.5" strokeLinecap="round" /><circle cx="24" cy="9" r="4" fill={p.hairColor} /></>}
      {p.hair === 'curly' && <><circle cx="17" cy="13" r="3.5" fill={p.hairColor} /><circle cx="24" cy="10.5" r="3.8" fill={p.hairColor} /><circle cx="31" cy="13" r="3.5" fill={p.hairColor} /></>}
      {p.hair === 'none' && <path d="M15 16 a9.5 9.5 0 0 1 18 0" fill="none" stroke={p.hairColor} strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
};

const WELLNESS_TIPS = [
  { title: 'Breathing Exercise', text: 'Try the 4-7-8 technique: Inhale for 4 seconds, hold for 7, exhale for 8. Repeat 3 times.' },
  { title: 'Journaling Prompt', text: 'Write down 3 things that went well today, no matter how small they seem.' },
  { title: 'Mindful Walk', text: 'Take a 10-minute walk and focus only on what you can see, hear, and feel.' },
  { title: 'Hydration Check', text: 'Have you had enough water today? Dehydration can affect your mood and energy.' },
  { title: 'Grounding Technique', text: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.' },
  { title: 'Music Break', text: 'Listen to a calming song and focus entirely on the melody for 3 minutes.' },
  { title: 'Digital Detox', text: 'Put your phone away for 30 minutes and do something you enjoy offline.' },
  { title: 'Self-Compassion', text: 'Talk to yourself like you would talk to a dear friend. Be kind and understanding.' },
  { title: 'Gratitude Moment', text: 'Think of one person who made a difference in your life today.' },
  { title: 'Body Scan', text: 'Close your eyes and slowly focus on each part of your body from head to toe, releasing tension.' },
];

const ClientDashboard = ({ logout }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');
  const [showMoodNote, setShowMoodNote] = useState(false);
  const [moodSubmitted, setMoodSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatar, setAvatar] = useState(null); // {type:'preset',value:n} or {type:'upload',value:dataUrl}

  useEffect(() => {
    fetchUserData();
    const stored = localStorage.getItem('mecac_avatar');
    if (stored) {
      try { setAvatar(JSON.parse(stored)); } catch (e) {}
    }
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setDailyTip(WELLNESS_TIPS[dayOfYear % WELLNESS_TIPS.length]);
  }, []);

  const saveAvatar = (av) => {
    setAvatar(av);
    localStorage.setItem('mecac_avatar', JSON.stringify(av));
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => saveAvatar({ type: 'upload', value: reader.result });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    try {
      const userRes = await fetch('/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserName(userData.name || userData.email?.split('@')[0] || 'Friend');
        setUserEmail(userData.email || '');
      }
      const bookingsRes = await fetch('/bookings/me', { headers: { Authorization: `Bearer ${token}` } });
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      const moodsRes = await fetch('/mood/entries', { headers: { Authorization: `Bearer ${token}` } });
      if (moodsRes.ok) setMoodEntries(await moodsRes.json());
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setShowMoodNote(true);
  };

  const handleMoodSubmit = async () => {
    if (!selectedMood) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/mood/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mood_score: selectedMood.value, note: moodNote || null }),
      });
      if (res.ok) {
        setMoodSubmitted(true);
        fetchUserData();
      }
    } catch (err) {
      console.error('Failed to log mood', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: <IconSun /> };
    if (hour < 17) return { text: 'Good Afternoon', icon: <IconSun /> };
    if (hour < 21) return { text: 'Good Evening', icon: <IconSunrise /> };
    return { text: 'Good Night', icon: <IconMoon /> };
  };

  const getUpcomingSession = () => {
    const now = new Date();
    return bookings
      .filter(b => (b.status === 'confirmed' || b.status === 'scheduled' || b.status === 'pending') && new Date(b.scheduled_time) > now)
      .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))[0] || null;
  };

  const getTodayString = () => new Date().toISOString().split('T')[0];
  const hasLoggedMoodToday = () => moodEntries.some(e => new Date(e.entry_date).toISOString().split('T')[0] === getTodayString());

  const getWeekData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = moodEntries.find(e => new Date(e.entry_date).toISOString().split('T')[0] === dateStr);
      const mood = entry ? MOODS.find(m => m.value === entry.mood_score) : null;
      days.push({
        dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
        score: mood ? mood.score : 0,
        mood,
      });
    }
    return days;
  };

  // ===== Avatar Display =====
  const AvatarDisplay = ({ size = 38 }) => {
    if (avatar?.type === 'upload') {
      return <img src={avatar.value} alt="avatar" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block', border: '2px solid #2E7D32' }} />;
    }
    if (avatar?.type === 'preset') {
      return <AvatarPreset v={avatar.value} size={size} />;
    }
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#2E7D32', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: size * 0.42 }}>
        {(userName || 'U').charAt(0).toUpperCase()}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <div style={{ textAlign: 'center', color: '#2E7D32' }}>
          <IconLeaf />
          <p style={{ marginTop: '0.5rem', color: '#6B7280' }}>Loading your safe space...</p>
        </div>
      </div>
    );
  }

  const greeting = getGreeting();
  const upcomingSession = getUpcomingSession();
  const weekData = getWeekData();
  const alreadyLogged = hasLoggedMoodToday();

  // ===== Week Chart (flat SVG area chart) =====
  const chartW = 340, chartH = 130, pad = 14;
  const pts = weekData.map((d, i) => {
    const x = pad + i * ((chartW - 2 * pad) / 6);
    const y = chartH - pad - (d.score / 10) * (chartH - 2 * pad);
    return [x, y];
  });
  const linePoints = pts.map(p => `${p[0]},${p[1]}`).join(' ');
  const areaPoints = `${pad},${chartH - pad} ${linePoints} ${chartW - pad},${chartH - pad}`;

    const quickActions = [
    { to: '/ai-companion', icon: <IconBot />, title: 'AI Companion', desc: 'Your 24/7 support partner' },
    { to: '/rage-rooms', icon: <IconZap />, title: 'Rage Room', desc: 'Smash your stress away' },
    { to: '/therapists', icon: <IconUsers />, title: 'Find Therapist', desc: 'Browse professionals' },
    { to: '/booking', icon: <IconCalendar />, title: 'Book Session', desc: 'Schedule appointment' },
    { to: '/chat/1', icon: <IconMessage />, title: 'Messages', desc: 'Chat with therapist' },
    { to: '/leave-review', icon: <IconStar />, title: 'Leave Review', desc: 'Rate your session' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ===== TOP NAV BAR ===== */}
      <header className="cd-header">
        <div className="cd-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setDrawerOpen(true)} className="cd-icon-btn" aria-label="Menu">
              <IconMenu />
            </button>
            <span style={{ color: '#2E7D32' }}><IconLeaf /></span>
            <h1 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111827', margin: 0 }}>Afya Care Connect</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NotificationBell />
            {/* Enhanced user visibility: avatar + name chip */}
            <button onClick={() => setAvatarModalOpen(true)} className="cd-avatar-chip">
              <AvatarDisplay size={36} />
              <span className="cd-avatar-text">
                <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.9rem', display: 'block', lineHeight: 1.1 }}>{userName}</span>
                <span style={{ fontSize: '0.7rem', color: '#2E7D32', fontWeight: '600' }}>Client Account</span>
              </span>
              <span style={{ color: '#9CA3AF' }}><IconChevronDown /></span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== HAMBURGER DRAWER (Quick Actions live here) ===== */}
      {drawerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)', zIndex: 900 }} onClick={() => setDrawerOpen(false)}>
          <div className="cd-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', borderBottom: '1px solid #E5E7EB' }}>
              <AvatarDisplay size={46} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', color: '#111827' }}>{userName}</div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="cd-icon-btn" aria-label="Close"><IconX /></button>
            </div>

            <div style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.75rem', marginBottom: '0.5rem' }}>
                Quick Actions
              </div>
              {quickActions.map(a => (
                <Link key={a.title} to={a.to} className="cd-drawer-item" onClick={() => setDrawerOpen(false)}>
                  <span className="cd-drawer-icon"><span style={{ color: '#2E7D32' }}>{a.icon}</span></span>
                  <span>
                    <span style={{ display: 'block', fontWeight: '600', color: '#111827', fontSize: '0.92rem' }}>{a.title}</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280' }}>{a.desc}</span>
                  </span>
                </Link>
              ))}

              <div style={{ height: 1, background: '#E5E7EB', margin: '0.75rem 0' }} />

              <button className="cd-drawer-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={() => { setDrawerOpen(false); setAvatarModalOpen(true); }}>
                <span className="cd-drawer-icon"><span style={{ color: '#2E7D32' }}><IconSettings /></span></span>
                <span>
                  <span style={{ display: 'block', fontWeight: '600', color: '#111827', fontSize: '0.92rem' }}>Edit Avatar</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#6B7280' }}>Choose or upload a picture</span>
                </span>
              </button>

              <button className="cd-drawer-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }} onClick={logout}>
                <span className="cd-drawer-icon"><span style={{ color: '#DC2626' }}><IconLogout /></span></span>
                <span style={{ fontWeight: '600', color: '#DC2626', fontSize: '0.92rem' }}>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== AVATAR SETTINGS MODAL ===== */}
      {avatarModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setAvatarModalOpen(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', maxWidth: '460px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#111827' }}>Choose Your Avatar</h3>
              <button onClick={() => setAvatarModalOpen(false)} className="cd-icon-btn" aria-label="Close"><IconX /></button>
            </div>

            {/* Current preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
              <AvatarDisplay size={56} />
              <div>
                <div style={{ fontWeight: '700', color: '#111827' }}>{userName}</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>This is how you appear across the platform</div>
              </div>
            </div>

            {/* Upload option */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ width: '100%', padding: '0.85rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.95rem' }}
            >
              <IconUpload /> Upload Photo from Device
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

            {/* Preset avatars */}
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6B7280', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Or pick an illustration
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {PRESETS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => saveAvatar({ type: 'preset', value: idx })}
                  style={{
                    padding: '0.4rem',
                    borderRadius: '12px',
                    border: avatar?.type === 'preset' && avatar.value === idx ? '2px solid #2E7D32' : '2px solid #E5E7EB',
                    background: avatar?.type === 'preset' && avatar.value === idx ? '#E8F5E9' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <AvatarPreset v={idx} size={56} />
                </button>
              ))}
            </div>

            <button
              onClick={() => setAvatarModalOpen(false)}
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem', background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="cd-main">

        {/* Welcome banner (flat, no gradient) */}
        <div className="cd-banner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#C8E6C9', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {greeting.icon} {greeting.text}
            </div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'white' }}>Welcome back, {userName}</h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#E8F5E9', fontSize: '0.95rem' }}>This is your safe space. Take a moment to check in with yourself.</p>
          </div>
          <div style={{ color: '#E8F5E9' }}><IconSunrise /></div>
        </div>

        {/* Zen journey stepper */}
        <div className="cd-stepper">
          {[
            { icon: <IconHeart />, label: 'Check In' },
            { icon: <IconCalendar />, label: 'Next Session' },
            { icon: <IconBulb />, label: 'Reflect & Grow' },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="cd-step">
                <span className="cd-step-dot">{step.icon}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151' }}>{step.label}</span>
              </div>
              {i < 2 && <div className="cd-step-line" />}
            </React.Fragment>
          ))}
        </div>

        <div className="cd-grid">
          {/* ===== LEFT COLUMN ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Mood check-in */}
            <div className="cd-card">
              <h3 className="cd-card-title">How are you feeling today?</h3>
              {alreadyLogged || moodSubmitted ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', background: '#E8F5E9', borderRadius: '12px', border: '1px solid #C8E6C9' }}>
                  <div style={{ color: '#2E7D32', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><IconHeart /></div>
                  <p style={{ color: '#1B5E20', fontWeight: '700', margin: 0 }}>Mood logged for today!</p>
                  <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: 0 }}>Thank you for checking in with yourself.</p>
                </div>
              ) : (
                <>
                  <div className="cd-mood-grid">
                    {MOODS.map(m => (
                      <button key={m.value} onClick={() => handleMoodSelect(m)} className="cd-mood-btn" style={{
                        borderColor: selectedMood?.value === m.value ? m.color : '#F3F4F6',
                        background: selectedMood?.value === m.value ? '#FFFFFF' : '#FAFAFA',
                        boxShadow: selectedMood?.value === m.value ? `0 0 0 1px ${m.color}` : 'none',
                      }}>
                        <MoodFace type={m.type} color={m.color} />
                        <span style={{ fontSize: '0.7rem', fontWeight: '600', color: selectedMood?.value === m.value ? m.color : '#6B7280' }}>{m.label}</span>
                      </button>
                    ))}
                  </div>
                  {showMoodNote && selectedMood && (
                    <div style={{ marginTop: '1rem' }}>
                      <textarea
                        value={moodNote}
                        onChange={(e) => setMoodNote(e.target.value)}
                        placeholder="Add a note about how you feel (optional)"
                        rows={2}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '0.9rem', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '0.75rem' }}
                      />
                      <button onClick={handleMoodSubmit} style={{ width: '100%', padding: '0.85rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                        Save My Mood
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Week chart */}
            <div className="cd-card">
              <h3 className="cd-card-title">Your Week at a Glance</h3>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto' }}>
                <polygon points={areaPoints} fill="#2E7D32" opacity="0.12" />
                <polyline points={linePoints} fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => (
                  <circle key={i} cx={p[0]} cy={p[1]} r={weekData[i].mood ? 4 : 2.5} fill={weekData[i].mood ? weekData[i].mood.color : '#D1D5DB'} stroke="white" strokeWidth="1.5" />
                ))}
                {weekData.map((d, i) => (
                  <text key={i} x={pad + i * ((chartW - 2 * pad) / 6)} y={chartH - 1} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontWeight="600">
                    {d.dayLabel}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Next session */}
            <div className="cd-card">
              <h3 className="cd-card-title">Next Session</h3>
              {upcomingSession ? (
                <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '1rem', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.1rem', flexShrink: 0 }}>
                      {(upcomingSession.therapist_name || 'T').charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.95rem' }}>{upcomingSession.therapist_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <IconCalendar /> {new Date(upcomingSession.scheduled_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(upcomingSession.scheduled_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/chat/${upcomingSession.id}`)} style={{ width: '100%', padding: '0.75rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <IconVideo /> Join Session
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.25rem', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <p style={{ color: '#6B7280', margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>No upcoming sessions yet.</p>
                  <button onClick={() => navigate('/therapists')} style={{ padding: '0.65rem 1.25rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem' }}>
                    Browse Therapists
                  </button>
                </div>
              )}
            </div>

            {/* AI Companion (flat lavender, no gradient) */}
            <div style={{ background: '#EDE9FE', borderRadius: '16px', padding: '1.5rem', border: '1px solid #DDD6FE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#4C1D95' }}>AI Companion</h3>
                <span style={{ color: '#6D28D9' }}><IconSparkle /></span>
              </div>
              <p style={{ color: '#5B21B6', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                Need someone to talk to right now? Your AI companion is here to listen, 24/7.
              </p>
              <button onClick={() => navigate('/chat/1')} style={{ width: '100%', padding: '0.75rem', background: '#6D28D9', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
                Start a Conversation
              </button>
            </div>

            {/* Daily wellness tip (flat amber) */}
            {dailyTip && (
              <div style={{ background: '#FFF7ED', borderRadius: '16px', padding: '1.5rem', border: '1px solid #FED7AA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <span style={{ color: '#B45309' }}><IconBulb /></span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#92400E' }}>{dailyTip.title}</h3>
                    <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: '600' }}>Daily Wellness Tip</span>
                  </div>
                </div>
                <p style={{ color: '#78350F', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>{dailyTip.text}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ===== RESPONSIVE + COMPONENT STYLES ===== */}
      <style>{`
        .cd-header { background: #FFFFFF; border-bottom: 1px solid #E5E7EB; position: sticky; top: 0; z-index: 100; }
        .cd-header-inner { max-width: 1200px; margin: 0 auto; padding: 0.75rem 20px; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
        .cd-icon-btn { background: none; border: 1px solid #E5E7EB; border-radius: 10px; padding: 0.5rem; cursor: pointer; color: #374151; display: flex; align-items: center; justify-content: center; }
        .cd-icon-btn:hover { background: #F3F4F6; }
        .cd-avatar-chip { display: flex; align-items: center; gap: 0.6rem; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 999px; padding: 0.3rem 0.9rem 0.3rem 0.35rem; cursor: pointer; }
        .cd-avatar-chip:hover { background: #F3F4F6; }
        .cd-main { max-width: 1200px; margin: 0 auto; padding: 1.75rem 20px; }
        .cd-banner { background: #2E7D32; border-radius: 18px; padding: 1.75rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .cd-stepper { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.75rem; flex-wrap: wrap; }
        .cd-step { display: flex; align-items: center; gap: 0.5rem; }
        .cd-step-dot { width: 34px; height: 34px; border-radius: 50%; background: #E8F5E9; color: #2E7D32; display: flex; align-items: center; justify-content: center; border: 1px solid #C8E6C9; }
        .cd-step-line { flex: 1; min-width: 24px; height: 2px; background: #D1D5DB; }
        .cd-grid { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; align-items: start; }
        .cd-card { background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .cd-card-title { margin: 0 0 1.1rem 0; font-size: 1.08rem; font-weight: 700; color: #111827; }
        .cd-mood-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(74px, 1fr)); gap: 0.5rem; }
        .cd-mood-btn { display: flex; flexDirection: column; align-items: center; gap: 0.3rem; padding: 0.6rem 0.25rem; border-radius: 12px; border: 2px solid #F3F4F6; cursor: pointer; transition: all 0.15s ease; }
        .cd-drawer { position: absolute; top: 0; left: 0; bottom: 0; width: 300px; max-width: 85vw; background: white; box-shadow: 4px 0 20px rgba(0,0,0,0.15); overflow-y: auto; }
        .cd-drawer-item { display: flex; align-items: center; gap: 0.85rem; padding: 0.75rem; border-radius: 12px; text-decoration: none; margin-bottom: 0.25rem; }
        .cd-drawer-item:hover { background: #F3F4F6; }
        .cd-drawer-icon { width: 40px; height: 40px; border-radius: 10px; background: #E8F5E9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        @media (max-width: 900px) {
          .cd-grid { grid-template-columns: 1fr !important; }
          .cd-avatar-text { display: none; }
          .cd-banner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
};

export default ClientDashboard;