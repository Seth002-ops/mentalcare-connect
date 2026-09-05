import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import RageRoomWaiver from './RageRoomWaiver';

// ============ PROFESSIONAL ICONS ============
const IconX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconMapPin = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconGradCap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"></path></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;

const TIER_STYLES = {
  basic: { bg: '#E8F5E9', border: '#4CAF50', color: '#2E7D32', emoji: '🌱', label: 'Release' },
  regular: { bg: '#FFF3E0', border: '#FF9800', color: '#E65100', emoji: '🔥', label: 'Let It Out' },
  premium: { bg: '#FCE4EC', border: '#E91E63', color: '#C2185B', emoji: '💥', label: 'Total Destruction' },
};

const RageRooms = ({ logout }) => {
  const navigate = useNavigate();
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
    fetchRooms();
    fetchMyBookings();
    fetchStudentStatus();
  }, []);

  const fetchStudentStatus = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://mecac-backend.onrender.com/users/me/student-status', { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await fetch('https://mecac-backend.onrender.com/rage-rooms', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setRooms(await res.json());
    } catch (err) {
      console.error('Failed to fetch rage rooms', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('https://mecac-backend.onrender.com/rage-rooms/bookings/me', { headers: { Authorization: `Bearer ${token}` } });
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
      alert('Please select a date and time.');
      return;
    }
    // Waiver must be signed BEFORE the booking is created
    setShowBookingModal(false);
    setShowWaiverModal(true);
  };

  const handleWaiverSigned = async (signerName, signerId) => {
    const token = localStorage.getItem('token');
    const isoTime = convertTo24Hour(selectedTime);
    try {
      const res = await fetch('https://mecac-backend.onrender.com/rage-rooms/book', {
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
        alert(data.detail || 'Booking failed');
      }
    } catch (err) {
      alert('Failed to book. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!phone || phone.length < 10) {
      alert('Please enter a valid M-Pesa phone number.');
      return;
    }
    setPaying(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/rage-rooms/pay?booking_id=${bookingId}&phone=${phone}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBooked(true);
        fetchMyBookings();
      } else {
        alert(data.message || 'Payment failed');
      }
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const getDisplayPrice = (pkg) => {
    if (useStudentRate && pkg.student_price) return pkg.student_price;
    return pkg.price;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <IconZap />
          <p style={{ marginTop: '0.5rem' }}>Loading rage rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* HEADER */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.75rem 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: '#374151', display: 'flex' }}>
              <IconArrowLeft />
            </button>
            <h1 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111827', margin: 0 }}>Rage Room</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NotificationBell />
            <button onClick={() => setShowMyBookings(!showMyBookings)} style={{ padding: '0.5rem 1rem', background: showMyBookings ? '#2E7D32' : '#F3F4F6', color: showMyBookings ? 'white' : '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              My Bookings ({myBookings.length})
            </button>
            <button onClick={logout} style={{ padding: '0.5rem 1rem', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 20px' }}>
        {/* HERO */}
        <div style={{ background: '#2E7D32', borderRadius: '18px', padding: '2rem', marginBottom: '2rem', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#C8E6C9' }}>
            <IconZap /> Therapeutic Rage Room
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem', fontWeight: '800' }}>Smash Your Stress Away</h2>
          <p style={{ margin: 0, color: '#E8F5E9', fontSize: '0.95rem', maxWidth: '600px' }}>
            Kenya's first therapeutic rage room. Release anger safely with lightweight tools, then track how much calmer you feel in our cool-down corner.
          </p>
        </div>

        {/* STUDENT PRICING STATUS */}
        {studentVerified ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#E8F5E9', borderRadius: '12px', border: '1px solid #C8E6C9' }}>
            <span style={{ color: '#2E7D32', display: 'flex' }}><IconGradCap /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', color: '#1B5E20', fontSize: '0.9rem' }}>Student pricing active</div>
              <div style={{ fontSize: '0.78rem', color: '#2E7D32' }}>Your university covers the rest — you pay only KSh 100/150/200</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#FFF7ED', borderRadius: '12px', border: '1px solid #FED7AA' }}>
            <span style={{ color: '#92400E', display: 'flex' }}><IconGradCap /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', color: '#92400E', fontSize: '0.9rem' }}>University student?</div>
              <div style={{ fontSize: '0.78rem', color: '#B45309' }}>Sign up with your university email to unlock KSh 100/150/200 pricing</div>
            </div>
          </div>
        )}

        {/* MY BOOKINGS PANEL */}
        {showMyBookings && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>My Rage Room Bookings</h3>
            {myBookings.length === 0 ? (
              <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '1rem' }}>No bookings yet.</p>
            ) : (
              myBookings.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '0.9rem' }}>{b.package_name} — {b.room_name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                      {new Date(b.scheduled_time).toLocaleDateString()} at {new Date(b.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • KSh {b.amount}
                      {b.is_student_rate && <span style={{ color: '#2E7D32', fontWeight: '600' }}> (Student Rate)</span>}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '600',
                    background: b.payment_status === 'completed' ? '#E8F5E9' : '#FEF3C7',
                    color: b.payment_status === 'completed' ? '#1B5E20' : '#92400E',
                  }}>
                    {b.payment_status === 'completed' ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* ROOMS & PACKAGES */}
        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px' }}>
            <p style={{ color: '#6B7280' }}>No rage rooms available yet. Check back soon!</p>
          </div>
        ) : (
          rooms.map(room => (
            <div key={room.id} style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#111827' }}>{room.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6B7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    <IconMapPin /> {room.location}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#6B7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><IconCalendar /> {room.available_days}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><IconClock /> {room.available_hours}</span>
                </div>
              </div>
              {room.description && (
                <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>{room.description}</p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {room.packages.map(pkg => {
                  const tier = TIER_STYLES[pkg.tier] || TIER_STYLES.basic;
                  const price = getDisplayPrice(pkg);
                  return (
                    <div key={pkg.id} style={{ border: `2px solid ${tier.border}`, borderRadius: '14px', padding: '1.25rem', background: tier.bg, position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{tier.emoji}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: '700', color: tier.color, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'white', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>{pkg.tier}</span>
                      </div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>{pkg.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6B7280', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        <IconClock /> {pkg.duration_minutes} min
                      </div>
                      <p style={{ color: '#4B5563', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>{pkg.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: tier.color }}>KSh {price.toLocaleString()}</span>
                          {useStudentRate && pkg.student_price && (
                            <span style={{ fontSize: '0.75rem', color: '#9CA3AF', textDecoration: 'line-through', marginLeft: '0.5rem' }}>KSh {pkg.price.toLocaleString()}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleSelectPackage(room, pkg)}
                          style={{ padding: '0.6rem 1.25rem', background: tier.color, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>

      {/* BOOKING MODAL */}
      {showBookingModal && selectedPackage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowBookingModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', maxWidth: '480px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#111827' }}>Book {selectedPackage.name}</h3>
              <button onClick={() => setShowBookingModal(false)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#374151', display: 'flex' }}><IconX /></button>
            </div>

            <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>Package</span>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.85rem' }}>{selectedPackage.name} ({selectedPackage.duration_minutes} min)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>Location</span>
                <span style={{ fontWeight: '600', color: '#111827', fontSize: '0.85rem' }}>{selectedRoom?.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                <span style={{ fontWeight: '700', color: '#111827' }}>Total</span>
                <span style={{ fontWeight: '800', color: '#2E7D32', fontSize: '1.1rem' }}>KSh {getDisplayPrice(selectedPackage).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>Select Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>Select Time</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {timeSlots.map(time => (
                  <button key={time} onClick={() => setSelectedTime(time)} style={{
                    padding: '0.5rem 0.9rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                    background: selectedTime === time ? '#2E7D32' : '#F3F4F6', color: selectedTime === time ? 'white' : '#374151',
                  }}>{time}</button>
                ))}
              </div>
            </div>

            <button onClick={handleConfirmBooking} disabled={!selectedDate || !selectedTime} style={{
              width: '100%', padding: '0.85rem', background: !selectedDate || !selectedTime ? '#D1D5DB' : '#2E7D32',
              color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: !selectedDate || !selectedTime ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
            }}>
               Continue → Sign Liability Waiver
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', maxWidth: '420px', width: '100%' }}>
            {booked ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#2E7D32' }}><IconCheck /></div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1B5E20', fontSize: '1.2rem' }}>Booking Confirmed!</h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>Your rage room session is booked. Get ready to release!</p>
                <button onClick={() => { setShowPaymentModal(false); setBooked(false); }} style={{ width: '100%', padding: '0.85rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Done</button>
              </div>
            ) : (
              <>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: '700', color: '#111827' }}>Pay via M-Pesa</h3>
                <div style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB', marginBottom: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Amount to pay</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2E7D32' }}>KSh {bookingAmount.toLocaleString()}</div>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>M-Pesa Phone Number</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g., 254712345678" style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box' }} />
                </div>
                <button onClick={handlePayment} disabled={paying} style={{
                  width: '100%', padding: '0.85rem', background: paying ? '#9CA3AF' : '#2E7D32',
                  color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: paying ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
                }}>
                  {paying ? 'Processing...' : `Pay KSh ${bookingAmount.toLocaleString()}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          main { padding: 1.25rem 15px !important; }
        }
      `}</style>
    </div>
  );
};

export default RageRooms;