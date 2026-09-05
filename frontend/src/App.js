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
import AICompanion from './components/AICompanion';
import TherapistAvailability from './components/TherapistAvailability';
import VideoCall from './components/VideoCall';
import AdminAnalyticsPage from './components/AdminAnalyticsPage';
import AICompanionWidget from './components/AICompanionWidget';
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

      fetch('https://mecac-backend.onrender.com/users/me', {
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
    
    fetch('https://mecac-backend.onrender.com/users/me', {
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
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              !user || !termsAccepted ? (
                <LandingPage />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/admin/analytics"
            element={
              user && userType === 'admin' ? (
                <AdminAnalyticsPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/signup" element={<Signup onLogin={login} />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/services" element={<Services />} />
          <Route path="/therapist/session-notes" element={user && userType === 'therapist' ? <TherapistSessionNotes /> : <Navigate to="/login" />} />
          <Route path="/therapist/session-notes/:bookingId" element={user && userType === 'therapist' ? <TherapistSessionNotes /> : <Navigate to="/login" />} />

          {/* Terms Acceptance Gate */}
          <Route
            path="/terms-acceptance"
            element={
              user ? (
                <TermsAcceptance onAccept={handleTermsAccepted} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Therapist Profile Completion */}
          <Route
            path="/therapist-register"
            element={
              user && userType === 'therapist' ? (
                <TherapistRegistration onComplete={handleProfileComplete} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Therapist Pending Approval Page */}
          <Route
            path="/pending-approval"
            element={
              user && userType === 'therapist' ? (
                <TherapistPendingPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              user ? (
                termsAccepted ? (
                  userType === 'therapist' && verificationStatus === 'incomplete' ? (
                    <Navigate to="/therapist-register" />
                  ) : userType === 'therapist' && (verificationStatus === 'pending' || verificationStatus === 'rejected') ? (
                    <Navigate to="/pending-approval" />
                  ) : userType === 'client' ? (
                    <ClientDashboard logout={logout} />
                  ) : userType === 'therapist' ? (
                    <TherapistDashboard logout={logout} />
                  ) : userType === 'admin' ? (
                    <AdminDashboard logout={logout} />
                  ) : (
                    <Navigate to="/login" />
                  )
                ) : (
                  <Navigate to="/terms-acceptance" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Client-Only Routes */}
          <Route
            path="/therapists"
            element={
              user && userType === 'client' ? (
                <BrowseTherapists />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/therapists/:id"
            element={
              user && userType === 'client' ? (
                <TherapistProfile />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/leave-review"
            element={
              user && userType === 'client' ? (
                <LeaveReview />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Authenticated Chat Route */}
          <Route
            path="/chat/:roomId"
            element={<Chat user={user} userType={userType} />}
          />
          <Route path="/booking" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />

          {/* Admin Route */}
          <Route
            path="/admin"
            element={
              user && userType === 'admin' ? (
                <AdminDashboard logout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin/universities"
            element={
              user && userType === 'admin' ? (
                <AdminUniversities logout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ============ NEW THERAPIST ROUTES ============ */}
          
          {/* Therapist Profile Management */}
          <Route
            path="/therapist/profile"
            element={
              user && userType === 'therapist' ? (
                <TherapistProfile logout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Therapist Clients List */}
          <Route
            path="/therapist/clients"
            element={
              user && userType === 'therapist' ? (
                <TherapistClients logout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Therapist Messages List */}
          <Route
            path="/therapist/messages"
            element={
              user && userType === 'therapist' ? (
                <TherapistMessages logout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Therapist Session Notes - List all clients */}
          <Route
            path="/therapist/session-notes"
            element={
              user && userType === 'therapist' ? (
                <TherapistClients logout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Therapist Session Notes - Specific client */}
          <Route
            path="/therapist/session-notes/:clientId"
            element={
              user && userType === 'therapist' ? (
                <TherapistSessionNotes logout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Therapist Chat with specific client */}
          <Route
            path="/therapist/chat/:roomId"
            element={
              user && userType === 'therapist' ? (
                <Chat user={user} userType={userType} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Therapist Withdrawals Management */}
          <Route
            path="/therapist/withdrawals"
            element={
              user && userType === 'therapist' ? (
                <TherapistWithdrawals logout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/therapist-availability"
            element={
              user && userType === 'therapist' ? (
                <TherapistAvailability />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/session/video/:bookingId"
            element={
              user ? (
                <VideoCall />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* Rage Room Booking */}
          <Route
            path="/rage-rooms"
            element={
              user && userType === 'client' ? (
                <RageRooms logout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

        </Routes>

        {/* ============ AI COMPANION WIDGET ============ */}
        {/* Shows for clients (support) AND therapists (work assistant) */}
        {/* Hidden for admins and logged-out visitors */}
        {user && (userType === 'client' || userType === 'therapist') && (
          <AICompanionWidget userType={userType} />
        )}

      </div>
    </Router>
  );
};

export default App;