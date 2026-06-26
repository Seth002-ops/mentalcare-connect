import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ClientDashboard from './components/ClientDashboard';
import TherapistDashboard from './components/TherapistDashboard';
import Chat from './components/Chat';
import Booking from './components/Booking';
import Payment from './components/Payment';
import Login from './components/Login';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
  }, []);

  const login = (email, password, type) => {
    // Simulate login
    const token = 'fake-jwt-token';
    localStorage.setItem('token', token);
    localStorage.setItem('userType', type);
    setUser({ email, token });
    setUserType(type);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setUser(null);
    setUserType(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/dashboard" element={
            user ? (userType === 'client' ? <ClientDashboard logout={logout} /> : <TherapistDashboard logout={logout} />) : <Navigate to="/login" />
          } />
          <Route path="/chat/:roomId" element={<Chat user={user} userType={userType} />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;