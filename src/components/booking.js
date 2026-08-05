import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Booking = () => {
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [therapists, setTherapists] = useState([]);
  const navigate = useNavigate();

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM'
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchTherapists = async () => {
      try {
        const response = await fetch('/users?user_type=therapist', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to load therapists');
        }
        const data = await response.json();
        setTherapists(
          data.map((user) => ({
            id: user.id,
            name: user.email,
            specialty: 'Therapist',
            rating: 4.8,
            price: 2500,
          }))
        );
      } catch (error) {
        console.error('Therapist fetch error:', error);
      }
    };

    fetchTherapists();
  }, []);

  const handleBook = async () => {
    if (!selectedTherapist || !selectedDate || !selectedTime) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in before booking.');
      return;
    }

    const timeParts = selectedTime.match(/(\d+):(\d+)\s?(AM|PM)/i);
    let isoTime = '00:00:00';
    if (timeParts) {
      let hours = parseInt(timeParts[1], 10);
      const minutes = timeParts[2];
      const period = timeParts[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      isoTime = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
    }

    try {
      const response = await fetch('/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapist_id: selectedTherapist.id,
          scheduled_time: `${selectedDate}T${isoTime}`,
          amount: selectedTherapist.price,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Booking failed');
      }

      const data = await response.json();
      navigate('/payment', {
        state: {
          bookingId: data.booking_id,
          amount: selectedTherapist.price,
          therapist_name: selectedTherapist.name,
        },
      });
    } catch (error) {
      alert('Booking failed: ' + error.message);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '3rem 0',
      backgroundColor: '#F9FAFB',
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '4rem',
    },
    title: {
      color: '#2BB3A3',
      fontSize: '2.5rem',
      marginBottom: '1rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '4rem',
      marginBottom: '3rem',
    },
    therapistCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    calendar: {
      background: 'white',
      borderRadius: '20px',
      padding: '2.5rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    },
    btnPrimary: {
      backgroundColor: '#2BB3A3',
      color: 'white',
      border: 'none',
      padding: '1.2rem 3rem',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      width: '100%',
    },
    warning: {
      marginBottom: '1rem',
      color: '#B91C1C',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Book Your Session</h1>
          <p style={{ color: '#6B7280', fontSize: '1.2rem' }}>
            Find the right therapist and schedule your appointment.
          </p>
        </div>

        <div style={styles.grid}>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#111827' }}>
              Choose Therapist
            </h3>
            {therapists.length === 0 && (
              <p style={styles.warning}>
                No therapists available. Please make sure you are logged in and refresh.
              </p>
            )}
            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                style={{
                  ...styles.therapistCard,
                  border: selectedTherapist?.id === therapist.id ? '3px solid #4CAF50' : '2px solid transparent',
                }}
                onClick={() => setSelectedTherapist(therapist)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ color: '#111827', fontSize: '1.3rem' }}>{therapist.name}</h4>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2BB3A3' }}>
                      KSh {therapist.price.toLocaleString()}
                    </div>
                    <div style={{ color: '#F97373', fontWeight: '600' }}>
                      ★ {therapist.rating}
                    </div>
                  </div>
                </div>
                <p style={{ color: '#6B7280' }}>{therapist.specialty}</p>
              </div>
            ))}
          </div>

          <div style={styles.calendar}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#111827' }}>
              Select Date & Time
            </h3>

            {selectedTherapist && (
              <>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '12px',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Available Times
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {timeSlots.map((time) => (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: '0.8rem 1.5rem',
                          backgroundColor: selectedTime === time ? '#2BB3A3' : '#E3F2FD',
                          color: selectedTime === time ? 'white' : '#111827',
                          border: 'none',
                          borderRadius: '25px',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                        }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBook}
                  disabled={!selectedTherapist || !selectedDate || !selectedTime}
                  style={{
                    ...styles.btnPrimary,
                    backgroundColor: !selectedTherapist || !selectedDate || !selectedTime ? '#D1D5DB' : '#2BB3A3',
                    cursor: !selectedTherapist || !selectedDate || !selectedTime ? 'not-allowed' : 'pointer',
                  }}
                >
                  Proceed to Payment KSh {selectedTherapist?.price?.toLocaleString()}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
