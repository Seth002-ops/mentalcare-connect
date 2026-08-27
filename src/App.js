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
import TherapistRegistration from './components/TherapistRegistration';
import LeaveReview from './components/LeaveReview';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedType = localStorage.getItem('userType');
    const storedEmail = localStorage.getItem('email');

    if (token && storedType && storedEmail) {
      setUser({ email: storedEmail, token });
      setUserType(storedType);

      // Check if user has accepted terms
      fetch('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setTermsAccepted(data.terms_accepted || false);
            
            // Check if therapist profile is complete
            if (storedType === 'therapist' && !data.specializations) {
              setProfileComplete(false);
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
    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
    localStorage.setItem('email', email);
    setUser({ email, token });
    setUserType(type);
    setTermsAccepted(false);
    setProfileComplete(type !== 'therapist'); // Assume complete unless therapist
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('email');
    setUser(null);
    setUserType(null);
    setTermsAccepted(false);
    setProfileComplete(true);
  };

  const handleTermsAccepted = () => {
    setTermsAccepted(true);
  };

  const handleProfileComplete = () => {
    setProfileComplete(true);
  };

  if (loadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#6B7280' }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/signup" element={<Signup onLogin={login} />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/services" element={<Services />} />

          {/* Terms Acceptance Gate */}
          <Route
            path="/terms-acceptance"
            element={user ? <TermsAcceptance onAccept={handleTermsAccepted} /> : <Navigate to="/login" />}
          />

          {/* Therapist Profile Completion Gate */}
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

          {/* Dashboard (Handles Client, Therapist, and Admin routing + Terms Gate + Profile Gate) */}
          <Route
            path="/dashboard"
            element={
              user ? (
                termsAccepted ? (
                  userType === 'therapist' && !profileComplete ? (
                    <Navigate to="/therapist-register" />
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

          {/* Client Routes */}
          <Route path="/therapists" element={user && userType === 'client' ? <BrowseTherapists /> : <Navigate to="/login" />} />
          <Route path="/therapists/:id" element={user && userType === 'client' ? <TherapistProfile /> : <Navigate to="/login" />} />
          <Route path="/leave-review" element={user && userType === 'client' ? <LeaveReview /> : <Navigate to="/login" />} />

          {/* Shared Authenticated Routes */}
          <Route path="/chat/:roomId" element={user ? <Chat user={user} userType={userType} /> : <Navigate to="/login" />} />
          <Route path="/booking" element={user ? <Booking /> : <Navigate to="/login" />} />
          <Route path="/payment" element={user ? <Payment /> : <Navigate to="/login" />} />

          {/* Admin Route */}
          <Route path="/admin" element={user && userType === 'admin' ? <AdminDashboard logout={logout} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;