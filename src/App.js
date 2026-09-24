import React, { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { ToastProvider, useToast } from './components/ToastContext';

import LandingPage from './components/LandingPage';
import ClientDashboard from './components/ClientDashboard';
import TherapistDashboard from './components/TherapistDashboard';
import AdminDashboard from './components/AdminDashboard';

import Chat from './components/Chat';
import Booking from './components/Booking';
import Payment from './components/Payment';

import Login from './components/Login';
import Signup from './components/Signup';

import BrowseTherapists from './components/BrowseTherapists';
import TherapistProfile from './components/TherapistProfile';

import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import Services from './components/Services';
import TermsAcceptance from './components/TermsAcceptance';

import TherapistRegistration from './components/TherapistRegistration';
import TherapistPendingPage from './components/TherapistPendingPage';

import LeaveReview from './components/LeaveReview';

import RageRooms from './components/RageRooms';

import TherapistWithdrawals from './components/TherapistWithdrawals';
import TherapistAvailability from './components/TherapistAvailability';
import TherapistClients from './components/TherapistClients';
import TherapistMessages from './components/TherapistMessages';
import TherapistSessionNotes from './components/TherapistSessionNotes';

import AdminUniversities from './components/AdminUniversities';
import AdminRageRooms from './components/AdminRageRooms';

import { API_URL } from './config';

// ============ SMALL HELPERS ============
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function TherapistRedirect() {
  const { id } = useParams();
  // Temporary until TherapistPublicProfile.jsx is built
  return <Navigate to={`/booking?therapist_id=${id}`} replace />;
}

function AppLoader({ label = 'Preparing your safe space...' }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #E8F5E9 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        className="app-loader-badge"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '1.8rem',
          boxShadow: '0 14px 32px rgba(46,125,50,0.24)',
          marginBottom: '1rem',
        }}
      >
        M
      </div>

      <div style={{ fontSize: '1rem', fontWeight: '800', color: '#111827', marginBottom: '0.35rem' }}>
        MECAC
      </div>
      <div style={{ fontSize: '0.92rem', color: '#4B5563', marginBottom: '1.25rem' }}>{label}</div>

      <div
        style={{
          width: '180px',
          height: '4px',
          borderRadius: '999px',
          background: 'rgba(46,125,50,0.12)',
          overflow: 'hidden',
        }}
      >
        <div className="app-loader-bar" />
      </div>

      <style>{`
        @keyframes appLoaderFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes appLoaderBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
        .app-loader-badge {
          animation: appLoaderFloat 2.8s ease-in-out infinite;
        }
        .app-loader-bar {
          width: 45%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #2E7D32, #66BB6A);
          animation: appLoaderBar 1.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .app-loader-badge,
          .app-loader-bar {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function AdminToolShell({ children }) {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1200,
          padding: '0.6rem 1rem',
          background: 'white',
          border: '1px solid #E5E7EB',
          borderRadius: '999px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          color: '#374151',
        }}
      >
        ← Back to Admin
      </button>
      {children}
    </div>
  );
}

function AdminAnalyticsPlaceholder() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid #E5E7EB',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#DBEAFE',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.8rem',
            fontWeight: '900',
          }}
        >
          📊
        </div>
        <h2 style={{ margin: '0 0 0.5rem', color: '#111827' }}>Analytics Coming Soon</h2>
        <p style={{ color: '#6B7280', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
          This page is reserved for platform metrics, booking trends, therapist performance,
          revenue insights, and engagement analytics.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '0.85rem 1.5rem',
            background: '#2E7D32',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// ============ MAIN APP SHELL ============
function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('email');
    setUser(null);
    setUserType(null);
    setTermsAccepted(false);
    setProfileComplete(true);
  }, []);

  const fetchCurrentUser = useCallback(
    async (token, options = {}) => {
      const { showToast = true } = options;

      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          clearAuth();
          setAuthReady(true);
          if (showToast) {
            addToast('Session expired. Please log in again.', 'error');
          }
          navigate('/login', { replace: true });
          return null;
        }

        if (!res.ok) {
          throw new Error('Failed to load user profile');
        }

        const data = await res.json();

        setTermsAccepted(Boolean(data.terms_accepted));

        const resolvedType = data.user_type || localStorage.getItem('userType');
        if (resolvedType) {
          setUserType(resolvedType);
          localStorage.setItem('userType', resolvedType);
        }

        if (resolvedType === 'therapist') {
          setProfileComplete(data.verification_status !== 'incomplete');
        } else {
          setProfileComplete(true);
        }

        return data;
      } catch (err) {
        console.error('Auth bootstrap error:', err);
        return null;
      } finally {
        setAuthReady(true);
      }
    },
    [addToast, clearAuth, navigate]
  );

  // Initial session restore
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email');

    if (token && storedEmail) {
      setUser({ email: storedEmail, token });
      setAuthReady(false);
      fetchCurrentUser(token, { showToast: false });
    } else {
      setAuthReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep Render backend warm, but only when tab is visible
  useEffect(() => {
    let intervalId;

    const ping = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetch(`${API_URL}/api/health`).catch(() => {});
      }
    };

    ping();
    intervalId = setInterval(ping, 240000); // 4 minutes

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') ping();
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const login = (token, type, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
    localStorage.setItem('email', email);

    setUser({ email, token });
    setUserType(type);
    setTermsAccepted(false);
    setProfileComplete(type !== 'therapist');
    setAuthReady(false);

    navigate('/dashboard', { replace: true });

    fetchCurrentUser(token, { showToast: false });
  };

  const logout = (message = 'You have been signed out securely.') => {
    clearAuth();
    setAuthReady(true);
    addToast(message, 'info');
    navigate('/', { replace: true });
  };

  const handleTermsAccepted = () => {
    setTermsAccepted(true);
  };

  const handleProfileComplete = () => {
    setProfileComplete(true);
  };

  const renderDashboard = () => {
    if (!user) return <Navigate to="/login" replace />;

    if (!termsAccepted) {
      return <Navigate to="/terms-acceptance" replace />;
    }

    if (userType === 'therapist' && !profileComplete) {
      return <Navigate to="/therapist-register" replace />;
    }

    if (userType === 'client') {
      return <ClientDashboard logout={logout} />;
    }

    if (userType === 'therapist') {
      return <TherapistDashboard logout={logout} />;
    }

    if (userType === 'admin') {
      return <AdminDashboard logout={logout} />;
    }

    return <Navigate to="/login" replace />;
  };

  if (!authReady) {
    return <AppLoader />;
  }

  return (
    <>
      <ScrollToTop />

      <div className="app-route-transition" key={location.pathname}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={login} />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" replace /> : <Signup onLogin={login} />}
          />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/services" element={<Services />} />

          {/* Terms gate */}
          <Route
            path="/terms-acceptance"
            element={
              !user ? (
                <Navigate to="/login" replace />
              ) : termsAccepted ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <TermsAcceptance onAccept={handleTermsAccepted} />
              )
            }
          />

          {/* Therapist onboarding gates */}
          <Route
            path="/therapist-register"
            element={
              !user || userType !== 'therapist' ? (
                <Navigate to="/login" replace />
              ) : profileComplete ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <TherapistRegistration onComplete={handleProfileComplete} />
              )
            }
          />

          <Route
            path="/therapist-pending"
            element={
              !user || userType !== 'therapist' ? (
                <Navigate to="/login" replace />
              ) : (
                <TherapistPendingPage />
              )
            }
          />

          {/* Main dashboard */}
          <Route path="/dashboard" element={renderDashboard()} />

          {/* Client routes */}
          <Route
            path="/therapists"
            element={
              user && userType === 'client' ? (
                <BrowseTherapists />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/therapists/:id"
            element={
              user && userType === 'client' ? (
                <TherapistRedirect />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/leave-review"
            element={
              user && userType === 'client' ? (
                <LeaveReview />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/rage-rooms"
            element={
              user ? (
                <RageRooms logout={logout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Therapist routes */}
          <Route
            path="/therapist/profile"
            element={
              user && userType === 'therapist' ? (
                <TherapistProfile />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/therapist/clients"
            element={
              user && userType === 'therapist' ? (
                <TherapistClients logout={logout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/therapist/messages"
            element={
              user && userType === 'therapist' ? (
                <TherapistMessages logout={logout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/therapist/session-notes"
            element={
              user && userType === 'therapist' ? (
                <TherapistSessionNotes />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/therapist/session-notes/:bookingId"
            element={
              user && userType === 'therapist' ? (
                <TherapistSessionNotes />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/therapist/withdrawals"
            element={
              user && userType === 'therapist' ? (
                <TherapistWithdrawals logout={logout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/therapist-availability"
            element={
              user && userType === 'therapist' ? (
                <TherapistAvailability />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Shared authenticated routes */}
          <Route
            path="/chat/:roomId"
            element={
              user ? (
                <Chat user={user} userType={userType} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/booking"
            element={user ? <Booking /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/payment"
            element={user ? <Payment /> : <Navigate to="/login" replace />}
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              user && userType === 'admin' ? (
                <AdminDashboard logout={logout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/universities"
            element={
              user && userType === 'admin' ? (
                <AdminUniversities logout={logout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/rage-rooms"
            element={
              user && userType === 'admin' ? (
                <AdminToolShell>
                  <AdminRageRooms />
                </AdminToolShell>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/analytics"
            element={
              user && userType === 'admin' ? (
                <AdminAnalyticsPlaceholder />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={user ? '/dashboard' : '/'} replace />}
          />
        </Routes>
      </div>

      <style>{`
        @keyframes appRouteFadeSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .app-route-transition {
          animation: appRouteFadeSlide 0.32s ease-out;
          min-height: 100vh;
        }

        @media (prefers-reduced-motion: reduce) {
          .app-route-transition {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}

// ============ ROOT EXPORT ============
export default function App() {
  return (
    <ToastProvider>
      <Router>
        <AppShell />
      </Router>
    </ToastProvider>
  );
}