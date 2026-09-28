import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import RageRoomWaiver from './RageRoomWaiver';
import { API_URL } from '../config'; // ✅ FIXED: Using centralized config
import { useToast } from './ToastContext';

// ============ ICONS ============
const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconMapPin = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconGradCap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"></path></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconShield = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconSparkle = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9z"></path></svg>;
const IconPhone = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;

// ============ TIER CONFIGURATION ============
const TIERS = {
  basic: { 
    id: 'basic', 
    label: 'Release', 
    color: '#2E7D32', 
    bg: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    border: '#A5D6A7',
    icon: <IconLeaf />,
    desc: 'Light smashing with foam bats. Perfect for stress relief.'
  },
  regular: { 
    id: 'regular', 
    label: 'Let It Out', 
    color: '#E65100', 
    bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    border: '#FFCC80',
    icon: <IconFlame />,
    desc: 'Mixed intensity. Break plates and electronics safely.'
  },
  premium: { 
    id: 'premium', 
    label: 'Total Destruction', 
    color: '#C2185B', 
    bg: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)',
    border: '#F48FB1',
    icon: <IconExplosion />,
    desc: 'Full access. Heavy tools, maximum chaos, complete catharsis.'
  }
};

// Helper Icons for Tiers
const IconLeaf = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>;
const IconFlame = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>;
const IconExplosion = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path><circle cx="12" cy="12" r="3"></circle></svg>;

const RageRooms = ({ logout }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [useStudentRate, setUseStudentRate] = useState(false);
  const [studentVerified, setStudentVerified] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [bookingAmount, setBookingAmount] = useState(0);
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [booked, setBooked] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    await Promise.all([fetchRooms(), fetchMyBookings(), fetchStudentStatus()]);
    setLoading(false);
  };

  const fetchStudentStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users/me/student-status`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (data.is_verified_student) {
          setStudentVerified(true);
          setUseStudentRate(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch student status', err);
    }
  };

  const fetchRooms = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/rage-rooms`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setRooms(await res.json());
    } catch (err) {
      console.error('Failed to fetch rage rooms', err);
      addToast('Failed to load rage rooms.', 'error');
    }
  };

  const fetchMyBookings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/rage-rooms/bookings/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMyBookings(await res.json());
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  const handleSelectPackage = (room, pkg) => {
    setSelectedRoom(room);
    setSelectedPackage(pkg);
    setSelectedDate('');
    setSelectedTime('');
    setShowBookingModal(true);
  };

  const convertTo24Hour = (time) => {
    const match = time.match(/(\d+):(\d+)\s?(AM|PM)/i);
    if (!match) return '00:00:00';
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      addToast('Please select a date and time.', 'error');
      return;
    }
    setShowBookingModal(false);
    setShowWaiverModal(true);
  };

  const handleWaiverSigned = async (signerName, signerId) => {
    const token = localStorage.getItem('token');
    const isoTime = convertTo24Hour(selectedTime);
    
    try {
      const res = await fetch(`${API_URL}/rage-rooms/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          rage_room_id: selectedRoom.id,
          package_id: selectedPackage.id,
          scheduled_time: `${selectedDate}T${isoTime}`,
          use_student_rate: useStudentRate,
          signer_name: signerName,
          signer_id_number: signerId,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setBookingId(data.booking_id);
        setBookingAmount(data.amount);
        setShowWaiverModal(false);
        setShowPaymentModal(true);
      } else {
        addToast(data.detail || 'Booking failed', 'error');
      }
    } catch (err) {
      addToast('Failed to book. Please try again.', 'error');
    }
  };

  const handlePayment = async () => {
    if (!phone || phone.length < 10) {
      addToast('Please enter a valid M-Pesa phone number.', 'error');
      return;
    }
    
    setPaying(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/rage-rooms/pay?booking_id=${bookingId}&phone=${phone}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await res.json();
      
      if (data.success) {
        setBooked(true);
        addToast('Payment successful! Your session is booked.', 'success');
        fetchMyBookings();
      } else {
        addToast(data.message || 'Payment failed', 'error');
      }
    } catch (err) {
      addToast('Payment failed. Please try again.', 'error');
    } finally {
      setPaying(false);
    }
  };

  const getDisplayPrice = (pkg) => {
    if (useStudentRate && pkg.student_price) return pkg.student_price;
    return pkg.price;
  };

  const formatPhoneInput = (value) => {
    let clean = value.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '254' + clean.substring(1);
    if (clean.length > 12) clean = clean.substring(0, 12);
    return clean;
  };

  if (loading) {
    return (
      <div className="rr-loading-screen">
        <div className="rr-spinner-ring"></div>
        <p>Loading Safe Spaces...</p>
      </div>
    );
  }

  return (
    <div className="rr-page">
      {/* HEADER */}
      <header className="rr-header">
        <div className="rr-header-inner">
          <div className="rr-brand-group">
            <button onClick={() => navigate('/dashboard')} className="rr-back-btn">
              <IconArrowLeft />
            </button>
            <div>
              <h1 className="rr-title">Rage Room</h1>
              <span className="rr-subtitle">Therapeutic Release Zone</span>
            </div>
          </div>
          
          <div className="rr-actions">
            <NotificationBell />
            <button 
              onClick={() => setShowMyBookings(!showMyBookings)} 
              className={`rr-bookings-toggle ${showMyBookings ? 'active' : ''}`}
            >
              My Bookings ({myBookings.length})
            </button>
            <button onClick={logout} className="rr-logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="rr-main">
        {/* HERO SECTION */}
        <section className="rr-hero">
          <div className="rr-hero-content">
            <div className="rr-badge-row">
              <span className="rr-live-badge"><IconZap /> LIVE</span>
              <span className="rr-location-badge"><IconMapPin /> Nairobi CBD</span>
            </div>
            
            <h2 className="rr-hero-title">Smash Your Stress Away</h2>
            <p className="rr-hero-desc">
              Kenya's premier therapeutic rage room. Release anger safely with professional supervision, 
              then find your calm in our guided cool-down zone.
            </p>
            
            <div className="rr-stats-row">
              <div className="rr-stat-item">
                <strong>50+</strong>
                <span>Sessions Daily</span>
              </div>
              <div className="rr-stat-item">
                <strong>100%</strong>
                <span>Safe Gear</span>
              </div>
              <div className="rr-stat-item">
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
          </div>
          
          <div className="rr-hero-visual">
             {/* Abstract geometric shapes representing energy/destruction */}
             <div className="rr-shape rr-shape-1"></div>
             <div className="rr-shape rr-shape-2"></div>
             <div className="rr-shape rr-shape-3"></div>
          </div>
        </section>

        {/* STUDENT PRICING BANNER */}
        {studentVerified ? (
          <div className="rr-student-banner verified">
            <div className="rr-icon-box"><IconGradCap /></div>
            <div className="rr-text-box">
              <strong>Student Pricing Active</strong>
              <span>Your university covers the subsidy. You pay only KSh 100/150/200.</span>
            </div>
            <button 
              onClick={() => setUseStudentRate(false)}
              className="rr-toggle-rate-btn"
            >
              Switch to Standard Rate
            </button>
          </div>
        ) : (
          <div className="rr-student-banner promo">
            <div className="rr-icon-box"><IconSparkle /></div>
            <div className="rr-text-box">
              <strong>University Student?</strong>
              <span>Sign up with your .ac.ke email to unlock exclusive discounts.</span>
            </div>
            <Link to="/signup" className="rr-promo-link">Get Verified</Link>
          </div>
        )}

        {/* MY BOOKINGS PANEL */}
        {showMyBookings && (
          <div className="rr-my-bookings-panel">
            <h3>Recent Sessions</h3>
            {myBookings.length === 0 ? (
              <p className="rr-empty-msg">No upcoming or past sessions found.</p>
            ) : (
              <div className="rr-bookings-list">
                {myBookings.map(b => (
                  <div key={b.id} className="rr-booking-card">
                    <div className="rr-booking-info">
                      <div className="rr-package-name">{b.package_name}</div>
                      <div className="rr-room-name">@ {b.room_name}</div>
                      <div className="rr-date-time">
                        <IconCalendar /> {new Date(b.scheduled_time).toLocaleDateString()} • 
                        <IconClock /> {new Date(b.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="rr-booking-price">
                      <span>KSh {b.amount.toLocaleString()}</span>
                      {b.is_student_rate && <small className="rr-student-tag">Student</small>}
                    </div>
                    <span className={`rr-status-pill ${b.payment_status}`}>
                      {b.payment_status === 'completed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ROOMS GRID */}
        <section className="rr-rooms-section">
          <h2 className="rr-section-title">Available Spaces</h2>
          
          {rooms.length === 0 ? (
            <div className="rr-no-rooms">
              <p>No rooms currently available. Check back soon!</p>
            </div>
          ) : (
            <div className="rr-rooms-grid">
              {rooms.map(room => (
                <div key={room.id} className="rr-room-card">
                  <div className="rr-room-header">
                    <h3>{room.name}</h3>
                    <div className="rr-room-meta">
                      <span><IconMapPin /> {room.location}</span>
                      <span><IconClock /> {room.available_hours}</span>
                    </div>
                  </div>
                  
                  {room.description && (
                    <p className="rr-room-desc">{room.description}</p>
                  )}

                  <div className="rr-packages-container">
                    {room.packages.map(pkg => {
                      const tierConfig = TIERS[pkg.tier] || TIERS.basic;
                      const price = getDisplayPrice(pkg);
                      
                      return (
                        <div 
                          key={pkg.id} 
                          className="rr-package-card"
                          style={{ borderColor: tierConfig.border }}
                        >
                          <div className="rr-pkg-top">
                            <div className="rr-tier-icon" style={{ background: tierConfig.bg, color: tierConfig.color }}>
                              {tierConfig.icon}
                            </div>
                            <span className="rr-tier-label" style={{ color: tierConfig.color }}>
                              {tierConfig.label}
                            </span>
                          </div>
                          
                          <h4 className="rr-pkg-name">{pkg.name}</h4>
                          <p className="rr-pkg-duration"><IconClock /> {pkg.duration_minutes} mins</p>
                          <p className="rr-pkg-desc">{pkg.description}</p>
                          
                          <div className="rr-pkg-footer">
                            <div className="rr-price-display">
                              <span className="rr-currency">KSh</span>
                              <span className="rr-amount">{price.toLocaleString()}</span>
                              {useStudentRate && pkg.student_price && (
                                <span className="rr-old-price">KSh {pkg.price.toLocaleString()}</span>
                              )}
                            </div>
                            
                            <button 
                              onClick={() => handleSelectPackage(room, pkg)}
                              className="rr-book-now-btn"
                              style={{ background: tierConfig.color }}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* BOOKING MODAL */}
      {showBookingModal && selectedPackage && (
        <div className="rr-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="rr-modal-content" onClick={e => e.stopPropagation()}>
            <div className="rr-modal-header">
              <h3>Book {selectedPackage.name}</h3>
              <button onClick={() => setShowBookingModal(false)} className="rr-close-btn"><IconX /></button>
            </div>
            
            <div className="rr-summary-box">
              <div className="rr-summary-row">
                <span>Location</span>
                <strong>{selectedRoom?.name}</strong>
              </div>
              <div className="rr-summary-row">
                <span>Tier</span>
                <strong style={{ color: TIERS[selectedPackage.tier]?.color }}>{TIERS[selectedPackage.tier]?.label}</strong>
              </div>
              <div className="rr-summary-row total">
                <span>Total Price</span>
                <strong>KSh {getDisplayPrice(selectedPackage).toLocaleString()}</strong>
              </div>
            </div>

            <div className="rr-form-group">
              <label>Select Date</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)} 
                className="rr-input"
              />
            </div>

            <div className="rr-form-group">
              <label>Select Time Slot</label>
              <div className="rr-time-slots-grid">
                {timeSlots.map(time => (
                  <button 
                    key={time} 
                    onClick={() => setSelectedTime(time)}
                    className={`rr-slot-btn ${selectedTime === time ? 'selected' : ''}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleConfirmBooking}
              disabled={!selectedDate || !selectedTime}
              className="rr-primary-action-btn"
            >
              Continue to Waiver
            </button>
          </div>
        </div>
      )}

      {/* LIABILITY WAIVER MODAL */}
      {showWaiverModal && selectedPackage && (
        <RageRoomWaiver
          roomName={selectedRoom?.name}
          onCancel={() => setShowWaiverModal(false)}
          onSign={handleWaiverSigned}
        />
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="rr-modal-overlay">
          <div className="rr-payment-card">
            {booked ? (
              <div className="rr-success-state">
                <div className="rr-check-circle"><IconCheck /></div>
                <h3>Session Confirmed!</h3>
                <p>You're all set. Arrive 10 minutes early for gear fitting.</p>
                <button 
                  onClick={() => { setShowPaymentModal(false); setBooked(false); }}
                  className="rr-done-btn"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="rr-pay-header">
                  <h3>M-Pesa Checkout</h3>
                  <button onClick={() => setShowPaymentModal(false)} className="rr-close-btn-sm"><IconX /></button>
                </div>
                
                <div className="rr-amount-display-large">
                  <span>KSh</span>
                  <strong>{bookingAmount.toLocaleString()}</strong>
                </div>

                <div className="rr-phone-input-wrapper">
                  <span className="rr-prefix">+254</span>
                  <input 
                    type="tel" 
                    placeholder="7XX XXX XXX"
                    value={phone.replace(/^254/, '')}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setPhone(formatPhoneInput('254' + raw));
                    }}
                    className="rr-phone-input"
                    maxLength={12}
                  />
                </div>
                
                <p className="rr-hint-text">You will receive an STK push prompt.</p>

                <button 
                  onClick={handlePayment}
                  disabled={paying || !phone}
                  className="rr-pay-submit-btn"
                >
                  {paying ? 'Processing...' : `Pay KSh ${bookingAmount.toLocaleString()}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        /* --- GLOBAL RESET FOR THIS COMPONENT --- */
        .rr-page {
          min-height: 100vh;
          background: #F9FAFB;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #111827;
        }

        /* --- LOADING SCREEN --- */
        .rr-loading-screen {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0F172A;
          color: white;
        }
        .rr-spinner-ring {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #2E7D32;
          border-radius: 50%;
          animation: rrSpin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes rrSpin { to { transform: rotate(360deg); } }

        /* --- HEADER --- */
        .rr-header {
          background: white;
          border-bottom: 1px solid #E5E7EB;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .rr-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rr-brand-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .rr-back-btn {
          background: none;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 0.5rem;
          cursor: pointer;
          color: #374151;
          display: flex;
          transition: all 0.2s;
        }
        .rr-back-btn:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }
        .rr-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .rr-subtitle {
          font-size: 0.75rem;
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .rr-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .rr-bookings-toggle {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          background: white;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rr-bookings-toggle.active {
          background: #2E7D32;
          color: white;
          border-color: #2E7D32;
        }
        .rr-logout-btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          background: white;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          color: #DC2626;
        }
        .rr-logout-btn:hover {
          background: #FEF2F2;
          border-color: #FECACA;
        }

        /* --- MAIN CONTENT --- */
        .rr-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 20px 4rem;
        }

        /* --- HERO --- */
        .rr-hero {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          border-radius: 24px;
          padding: 3rem 2rem;
          color: white;
          position: relative;
          overflow: hidden;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: center;
        }
        @media (max-width: 768px) {
          .rr-hero {
            grid-template-columns: 1fr;
            padding: 2rem 1.5rem;
          }
        }
        .rr-hero-content {
          position: relative;
          z-index: 2;
        }
        .rr-badge-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .rr-live-badge {
          background: rgba(220, 38, 38, 0.2);
          color: #FCA5A5;
          border: 1px solid rgba(220, 38, 38, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .rr-location-badge {
          background: rgba(255, 255, 255, 0.1);
          color: #CBD5E1;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .rr-hero-title {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 900;
          line-height: 1.1;
          margin: 0 0 1rem;
          letter-spacing: -0.03em;
        }
        .rr-hero-desc {
          color: #94A3B8;
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 2rem;
          max-width: 500px;
        }
        .rr-stats-row {
          display: flex;
          gap: 2rem;
        }
        .rr-stat-item {
          display: flex;
          flex-direction: column;
        }
        .rr-stat-item strong {
          font-size: 1.5rem;
          color: #10B981;
          font-weight: 800;
        }
        .rr-stat-item span {
          font-size: 0.8rem;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        /* Decorative Shapes */
        .rr-hero-visual {
          position: absolute;
          right: -50px;
          top: -50px;
          bottom: -50px;
          width: 50%;
          opacity: 0.4;
          pointer-events: none;
        }
        .rr-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
        }
        .rr-shape-1 {
          width: 300px;
          height: 300px;
          background: #EF4444;
          top: 10%;
          left: 20%;
          animation: floatShape 8s ease-in-out infinite alternate;
        }
        .rr-shape-2 {
          width: 200px;
          height: 200px;
          background: #F59E0B;
          bottom: 20%;
          right: 10%;
          animation: floatShape 6s ease-in-out infinite alternate-reverse;
        }
        .rr-shape-3 {
          width: 150px;
          height: 150px;
          background: #8B5CF6;
          top: 50%;
          left: 50%;
          animation: floatShape 10s ease-in-out infinite alternate;
        }
        @keyframes floatShape {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(20px, -20px) scale(1.1); }
        }

        /* --- STUDENT BANNERS --- */
        .rr-student-banner {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .rr-student-banner.verified {
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
        }
        .rr-student-banner.promo {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
        }
        .rr-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rr-student-banner.verified .rr-icon-box {
          background: #D1FAE5;
          color: #059669;
        }
        .rr-student-banner.promo .rr-icon-box {
          background: #DBEAFE;
          color: #2563EB;
        }
        .rr-text-box {
          flex: 1;
          min-width: 200px;
        }
        .rr-text-box strong {
          display: block;
          color: #111827;
          font-size: 0.95rem;
        }
        .rr-text-box span {
          display: block;
          color: #6B7280;
          font-size: 0.85rem;
        }
        .rr-toggle-rate-btn, .rr-promo-link {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        .rr-toggle-rate-btn {
          background: white;
          border: 1px solid #E5E7EB;
          color: #374151;
        }
        .rr-toggle-rate-btn:hover {
          background: #F9FAFB;
        }
        .rr-promo-link {
          background: #2563EB;
          color: white;
        }
        .rr-promo-link:hover {
          background: #1D4ED8;
        }

        /* --- MY BOOKINGS --- */
        .rr-my-bookings-panel {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .rr-my-bookings-panel h3 {
          margin: 0 0 1rem;
          font-size: 1.1rem;
          color: #111827;
        }
        .rr-empty-msg {
          color: #9CA3AF;
          text-align: center;
          padding: 1rem;
        }
        .rr-bookings-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .rr-booking-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #F9FAFB;
          border-radius: 12px;
          border: 1px solid #F3F4F6;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .rr-booking-info {
          flex: 1;
          min-width: 200px;
        }
        .rr-package-name {
          font-weight: 700;
          color: #111827;
          font-size: 0.95rem;
        }
        .rr-room-name {
          font-size: 0.85rem;
          color: #6B7280;
        }
        .rr-date-time {
          font-size: 0.8rem;
          color: #9CA3AF;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .rr-booking-price {
          text-align: right;
        }
        .rr-booking-price span {
          font-weight: 800;
          color: #111827;
          display: block;
        }
        .rr-student-tag {
          font-size: 0.7rem;
          color: #059669;
          background: #D1FAE5;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }
        .rr-status-pill {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .rr-status-pill.completed {
          background: #D1FAE5;
          color: #065F46;
        }
        .rr-status-pill.pending {
          background: #FEF3C7;
          color: #92400E;
        }

        /* --- ROOMS SECTION --- */
        .rr-section-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 1.5rem;
        }
        .rr-rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .rr-room-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .rr-room-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .rr-room-header {
          margin-bottom: 1rem;
        }
        .rr-room-header h3 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          color: #111827;
        }
        .rr-room-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #6B7280;
        }
        .rr-room-meta span {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .rr-room-desc {
          color: #4B5563;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }
        .rr-packages-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .rr-package-card {
          border: 2px solid;
          border-radius: 16px;
          padding: 1.25rem;
          background: #FAFAFA;
          transition: all 0.2s;
        }
        .rr-package-card:hover {
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .rr-pkg-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .rr-tier-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rr-tier-label {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .rr-pkg-name {
          margin: 0 0 0.25rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
        }
        .rr-pkg-duration {
          font-size: 0.85rem;
          color: #6B7280;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 0.5rem;
        }
        .rr-pkg-desc {
          font-size: 0.85rem;
          color: #4B5563;
          line-height: 1.4;
          margin-bottom: 1rem;
        }
        .rr-pkg-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px dashed #E5E7EB;
        }
        .rr-price-display {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }
        .rr-currency {
          font-size: 0.9rem;
          font-weight: 600;
          color: #6B7280;
        }
        .rr-amount {
          font-size: 1.5rem;
          font-weight: 800;
          color: #111827;
        }
        .rr-old-price {
          font-size: 0.8rem;
          color: #9CA3AF;
          text-decoration: line-through;
          margin-left: 0.5rem;
        }
        .rr-book-now-btn {
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          color: white;
          border: none;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }
        .rr-book-now-btn:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }

        /* --- MODALS --- */
        .rr-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(17, 24, 39, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .rr-modal-content {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rr-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .rr-modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
        }
        .rr-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6B7280;
          padding: 0.25rem;
        }
        .rr-close-btn:hover {
          color: #111827;
        }
        .rr-summary-box {
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }
        .rr-summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .rr-summary-row:last-child {
          margin-bottom: 0;
        }
        .rr-summary-row.total {
          border-top: 1px solid #E5E7EB;
          padding-top: 0.5rem;
          margin-top: 0.5rem;
          font-weight: 700;
          color: #111827;
        }
        .rr-form-group {
          margin-bottom: 1.25rem;
        }
        .rr-form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
          color: #374151;
        }
        .rr-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #D1D5DB;
          border-radius: 10px;
          font-size: 1rem;
          outline: none;
          box-sizing: border-box;
        }
        .rr-input:focus {
          border-color: #2E7D32;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
        }
        .rr-time-slots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
        .rr-slot-btn {
          padding: 0.6rem;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: white;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rr-slot-btn:hover {
          border-color: #2E7D32;
          background: #F0FDF4;
        }
        .rr-slot-btn.selected {
          background: #2E7D32;
          color: white;
          border-color: #2E7D32;
        }
        .rr-primary-action-btn {
          width: 100%;
          padding: 1rem;
          background: #2E7D32;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rr-primary-action-btn:hover:not(:disabled) {
          background: #1B5E20;
          transform: translateY(-1px);
        }
        .rr-primary-action-btn:disabled {
          background: #D1D5DB;
          cursor: not-allowed;
        }

        /* --- PAYMENT MODAL SPECIFIC --- */
        .rr-payment-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .rr-pay-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .rr-pay-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
        }
        .rr-close-btn-sm {
          background: none;
          border: none;
          cursor: pointer;
          color: #6B7280;
        }
        .rr-amount-display-large {
          margin-bottom: 1.5rem;
        }
        .rr-amount-display-large span {
          font-size: 1.2rem;
          color: #6B7280;
          vertical-align: super;
        }
        .rr-amount-display-large strong {
          font-size: 2.5rem;
          font-weight: 900;
          color: #111827;
        }
        .rr-phone-input-wrapper {
          display: flex;
          align-items: center;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 0.5rem;
          transition: border-color 0.2s;
        }
        .rr-phone-input-wrapper:focus-within {
          border-color: #2E7D32;
        }
        .rr-prefix {
          padding: 0 0.75rem;
          background: #F9FAFB;
          color: #6B7280;
          font-weight: 600;
          border-right: 1px solid #E5E7EB;
        }
        .rr-phone-input {
          flex: 1;
          border: none;
          padding: 1rem;
          font-size: 1.1rem;
          outline: none;
          font-family: inherit;
        }
        .rr-hint-text {
          font-size: 0.8rem;
          color: #9CA3AF;
          margin-bottom: 1.5rem;
        }
        .rr-pay-submit-btn {
          width: 100%;
          padding: 1rem;
          background: #2E7D32;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rr-pay-submit-btn:hover:not(:disabled) {
          background: #1B5E20;
        }
        .rr-pay-submit-btn:disabled {
          background: #D1D5DB;
          cursor: not-allowed;
        }
        .rr-success-state {
          padding: 1rem 0;
        }
        .rr-check-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #D1FAE5;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .rr-success-state h3 {
          margin: 0 0 0.5rem;
          color: #111827;
        }
        .rr-success-state p {
          color: #6B7280;
          margin-bottom: 1.5rem;
        }
        .rr-done-btn {
          width: 100%;
          padding: 0.85rem;
          background: #2E7D32;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        /* Responsive Adjustments */
        @media (max-width: 600px) {
          .rr-time-slots-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .rr-stats-row {
            gap: 1rem;
          }
          .rr-hero-title {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RageRooms;