import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import LeaveReview from './components/LeaveReview';
import TherapistRegistration from './components/TherapistRegistration';
import TherapistPendingPage from './components/TherapistPendingPage';
import TherapistClients from './components/TherapistClients';
import TherapistMessages from './components/TherapistMessages';
import TherapistSessionNotes from './components/TherapistSessionNotes';
import TherapistWithdrawals from './components/TherapistWithdrawals';
import RageRooms from './components/RageRooms';
import VerifyEmail from './components/VerifyEmail';
import AdminUniversities from './components/AdminUniversities';
import AdminSecurityHub from './components/AdminSecurityHub';
import TherapistAvailability from './components/TherapistAvailability';
import VideoCall from './components/VideoCall';
import AdminAnalyticsPage from './components/AdminAnalyticsPage';
import AICompanionWidget from './components/AICompanionWidget';
import AdminRageRooms from './components/AdminRageRooms';
import { ToastProvider } from './components/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import { API_URL } from './config';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('approved');
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAfterLogin, setLoadingAfterLogin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedType = localStorage.getItem('userType');
    const storedEmail = localStorage.getItem('email');

    if (token && storedType && storedEmail) {
      setUser({ email: storedEmail, token });
      setUserType(storedType);

      fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setTermsAccepted(data.terms_accepted || false);

            if (storedType === 'therapist') {
              setVerificationStatus(data.verification_status || 'incomplete');
              setProfileComplete(!!data.specializations);
            }
          }
          setLoadingUser(false);
        })
        .catch(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }
  }, []);

  const login = (token, type, email) => {
    setLoadingAfterLogin(true);

    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
    localStorage.setItem('email', email);
    setUser({ email, token });
    setUserType(type);

    fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setTermsAccepted(data.terms_accepted || false);
          if (type === 'therapist') {
            setVerificationStatus(data.verification_status || 'incomplete');
            setProfileComplete(!!data.specializations);
          } else {
            setProfileComplete(true);
            setVerificationStatus('approved');
          }
        }
        setLoadingAfterLogin(false);
      })
      .catch((err) => {
        console.error('Failed to fetch user data:', err);
        setLoadingAfterLogin(false);
      });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('email');
    setUser(null);
    setUserType(null);
    setTermsAccepted(false);
    setProfileComplete(true);
    setVerificationStatus('approved');
  };

  const handleTermsAccepted = () => {
    setTermsAccepted(true);
  };

  const handleProfileComplete = () => {
    setProfileComplete(true);
  };

  if (loadingUser || loadingAfterLogin) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#6B7280',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* ==================== PUBLIC ROUTES ==================== */}
              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <LandingPage />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Login onLogin={login} />
                  )
                }
              />
              <Route
                path="/signup"
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Signup onLogin={login} />
                  )
                }
              />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/services" element={<Services />} />

              {/* ==================== TERMS GATE ==================== */}
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

              {/* ==================== THERAPIST ONBOARDING ==================== */}
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
                path="/pending-approval"
                element={
                  !user || userType !== 'therapist' ? (
                    <Navigate to="/login" replace />
                  ) : (
                    <TherapistPendingPage />
                  )
                }
              />

              {/* ==================== MAIN DASHBOARD ==================== */}
              <Route
                path="/dashboard"
                element={
                  !user ? (
                    <Navigate to="/login" replace />
                  ) : !termsAccepted ? (
                    <Navigate to="/terms-acceptance" replace />
                  ) : userType === 'therapist' && verificationStatus === 'incomplete' ? (
                    <Navigate to="/therapist-register" replace />
                  ) : userType === 'therapist' && (verificationStatus === 'pending' || verificationStatus === 'rejected') ? (
                    <Navigate to="/pending-approval" replace />
                  ) : userType === 'client' ? (
                    <ClientDashboard logout={logout} />
                  ) : userType === 'therapist' ? (
                    <TherapistDashboard logout={logout} />
                  ) : userType === 'admin' ? (
                    <AdminDashboard logout={logout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* ==================== CLIENT ROUTES ==================== */}
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
                    <TherapistProfile />
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
                  user && userType === 'client' ? (
                    <RageRooms logout={logout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* ==================== SHARED AUTHENTICATED ROUTES ==================== */}
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
                element={
                  user ? (
                    <Booking />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/payment"
                element={
                  user ? (
                    <Payment />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/session/video/:bookingId"
                element={
                  user ? (
                    <VideoCall />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* ==================== THERAPIST ROUTES ==================== */}
              <Route
                path="/therapist/profile"
                element={
                  user && userType === 'therapist' ? (
                    <TherapistProfile logout={logout} />
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
                    <TherapistSessionNotes logout={logout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/therapist/session-notes/:bookingId"
                element={
                  user && userType === 'therapist' ? (
                    <TherapistSessionNotes logout={logout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/therapist/chat/:roomId"
                element={
                  user && userType === 'therapist' ? (
                    <Chat user={user} userType={userType} />
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

              {/* ==================== ADMIN ROUTES ==================== */}
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
                    <AdminRageRooms />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  user && userType === 'admin' ? (
                    <AdminAnalyticsPage />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/admin/security"
                element={
                  user && userType === 'admin' ? (
                    <AdminSecurityHub logout={logout} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* ==================== FALLBACK ==================== */}
              <Route
                path="*"
                element={<Navigate to={user ? '/dashboard' : '/'} replace />}
              />
            </Routes>

            {/* AI COMPANION WIDGET */}
            {user && (userType === 'client' || userType === 'therapist') && (
              <AICompanionWidget userType={userType} />
            )}
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;