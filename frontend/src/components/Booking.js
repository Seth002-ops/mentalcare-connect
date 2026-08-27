import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Convert "09:00" (24h from backend) to "9:00 AM" for display
const format12Hour = (time24) => {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
};

const Booking = () => {
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setErrorMessage('Please log in to see available therapists.');
      return;
    }

    const fetchTherapists = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch('/users?user_type=therapist', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setErrorMessage('Session expired. Please log in again.');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load therapists');
        }

        const data = await response.json();

        const therapistList = Array.isArray(data)
          ? data
          : data.users || data.data || [];

        setTherapists(
          therapistList.map((user) => ({
            id: user.id,
            name: user.name || user.email,
            specialty: user.specializations || 'Therapist',
            rating: user.rating || 4.8,
            price: user.hourly_rate || 2500,
            photo: user.profile_photo_url || null,
          }))
        );
      } catch (error) {
        console.error('Therapist fetch error:', error);
        setErrorMessage('Could not load therapists. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  useEffect(() => {
    const therapistIdParam = searchParams.get('therapist_id');
    
    if (therapistIdParam && therapists.length > 0 && !selectedTherapist) {
      const therapistId = parseInt(therapistIdParam, 10);
      const foundTherapist = therapists.find(t => t.id === therapistId);
      
      if (foundTherapist) {
        setSelectedTherapist(foundTherapist);
      }
    }
  }, [searchParams, therapists, selectedTherapist]);

  // ============ FETCH AVAILABLE SLOTS WHEN THERAPIST + DATE SELECTED ============
  useEffect(() => {
    if (!selectedTherapist || !selectedDate) {
      setAvailableSlots([]);
      setSlotsMessage('');
      return;
    }

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsMessage('');
      setSelectedTime('');
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(
          `/therapist/${selectedTherapist.id}/available-slots?date=${selectedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.ok) {
          const data = await res.json();
          const slots = data.available_slots || [];
          setAvailableSlots(slots);
          if (slots.length === 0) {
            setSlotsMessage(`${selectedTherapist.name} is not available on this date. Please try another day.`);
          }
        } else {
          setSlotsMessage('Could not load availability. Please try again.');
        }
      } catch (err) {
        setSlotsMessage('Could not load availability. Please try again.');
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedTherapist, selectedDate]);

  const handleBook = async () => {
    if (!selectedTherapist || !selectedDate || !selectedTime) {
      alert('Please select a therapist, date, and time.');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please log in before booking.');
      return;
    }

    // selectedTime is now in "09:00" format from the backend
    try {
      const response = await fetch('/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapist_id: selectedTherapist.id,
          scheduled_time: `${selectedDate}T${selectedTime}:00`,
          amount: selectedTherapist.price,
        }),
      });

      if (!response.ok) {
        let errorText = `Booking failed with status ${response.status}`;

        try {
          const errorData = await response.json();
          errorText =
            errorData.detail ||
            errorData.message ||
            errorData.error ||
            errorText;
        } catch {
          try {
            errorText = await response.text();
          } catch {
            // ignore
          }
        }

        throw new Error(errorText || 'Booking failed');
      }

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      const bookingId =
        data.booking_id ||
        data.id ||
        data.booking?.id ||
        null;

      if (!bookingId) {
        throw new Error('Booking was created but no booking ID was returned.');
      }

      navigate('/payment', {
        state: {
          bookingId,
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
      overflowX: 'hidden',
    },
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      width: '100%',
      boxSizing: 'border-box',
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
      width: '100%',
    },
    therapistCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '1.5rem',
      boxSizing: 'border-box',
    },
    calendar: {
      background: 'white',
      borderRadius: '20px',
      padding: '2.5rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      boxSizing: 'border-box',
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
      minHeight: '48px',
    },
    warning: {
      marginBottom: '1rem',
      color: '#B91C1C',
      fontWeight: '600',
    },
    timeSlotBtn: {
      padding: '0.8rem 1.5rem',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      minWidth: '90px',
      minHeight: '44px',
      transition: 'all 0.2s ease',
    },
    dateInput: {
      width: '100%',
      padding: '1rem',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      fontSize: '1rem',
      boxSizing: 'border-box',
      minHeight: '48px',
    },
  };

  const isBookingDisabled =
    !selectedTherapist || !selectedDate || !selectedTime;

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Book Your Session</h1>
          <p style={{ color: '#6B7280', fontSize: '1.2rem' }}>
            Find the right therapist and schedule your appointment.
          </p>
        </div>

        <div style={styles.grid} className="booking-grid">
          <div className="therapist-column">
            <h3
              style={{
                fontSize: '1.5rem',
                marginBottom: '2rem',
                color: '#111827',
              }}
            >
              Choose Therapist
            </h3>

            {loading && <p>Loading therapists...</p>}

            {errorMessage && <p style={styles.warning}>{errorMessage}</p>}

            {!loading && therapists.length === 0 && !errorMessage && (
              <p style={styles.warning}>
                No therapists available. Please make sure you are logged in and
                the backend is running.
              </p>
            )}

            {therapists.map((therapist) => (
              <div
                key={therapist.id}
                style={{
                  ...styles.therapistCard,
                  border:
                    selectedTherapist?.id === therapist.id
                      ? '3px solid #4CAF50'
                      : '2px solid transparent',
                }}
                onClick={() => {
                  setSelectedTherapist(therapist);
                  setSelectedTime('');
                  setAvailableSlots([]);
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {therapist.photo ? (
                      <img src={therapist.photo} alt={therapist.name} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2BB3A3' }} />
                    ) : (
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2BB3A3', fontWeight: '700', fontSize: '1.2rem', flexShrink: 0 }}>
                        {therapist.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h4 style={{ color: '#111827', fontSize: '1.3rem', margin: 0 }}>
                      {therapist.name}
                    </h4>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: '#2BB3A3',
                      }}
                    >
                      KSh {therapist.price.toLocaleString()}
                    </div>

                    <div
                      style={{
                        color: '#F97373',
                        fontWeight: '600',
                      }}
                    >
                      ★ {therapist.rating}
                    </div>
                  </div>
                </div>

                <p style={{ color: '#6B7280', margin: 0 }}>{therapist.specialty}</p>
              </div>
            ))}
          </div>

          <div style={styles.calendar} className="calendar-column">
            <h3
              style={{
                fontSize: '1.5rem',
                marginBottom: '2rem',
                color: '#111827',
              }}
            >
              Select Date & Time
            </h3>

            {selectedTherapist ? (
              <>
                <div style={{ marginBottom: '2rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                    }}
                  >
                    Select Date
                  </label>

                  <input
                    type="date"
                    value={selectedDate}
                    min={todayStr}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={styles.dateInput}
                  />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                    }}
                  >
                    Available Times
                  </label>

                  {slotsLoading ? (
                    <p style={{ color: '#6B7280' }}>Checking {selectedTherapist.name}'s availability...</p>
                  ) : !selectedDate ? (
                    <p style={{ color: '#6B7280' }}>Select a date to see open time slots.</p>
                  ) : availableSlots.length === 0 ? (
                    <p style={{ color: '#B91C1C', fontWeight: '600' }}>
                      {slotsMessage || 'No available slots on this date.'}
                    </p>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        width: '100%',
                      }}
                      className="time-slots"
                    >
                      {availableSlots.map((time) => (
                        <button
                          type="button"
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          style={{
                            ...styles.timeSlotBtn,
                            backgroundColor:
                              selectedTime === time ? '#2BB3A3' : '#E3F2FD',
                            color:
                              selectedTime === time ? 'white' : '#111827',
                          }}
                        >
                          {format12Hour(time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleBook}
                  disabled={isBookingDisabled}
                  style={{
                    ...styles.btnPrimary,
                    backgroundColor: isBookingDisabled
                      ? '#D1D5DB'
                      : '#2BB3A3',
                    cursor: isBookingDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  Proceed to Payment{' '}
                  {selectedTherapist
                    ? `KSh ${selectedTherapist.price.toLocaleString()}`
                    : ''}
                </button>
              </>
            ) : (
              <p style={{ color: '#6B7280' }}>
                Please select a therapist to continue.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .booking-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .calendar-column {
            order: -1;
            padding: 1.5rem !important;
          }
          .therapist-column {
            order: 2;
          }
        }

        @media (max-width: 600px) {
          .booking-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            margin-bottom: 2rem !important;
          }
          .calendar-column,
          .therapist-column {
            padding: 1.25rem !important;
          }
          .time-slots {
            gap: 0.4rem !important;
            justify-content: flex-start;
          }
          .time-slots button {
            flex: 1 1 calc(50% - 0.4rem) !important;
            min-width: calc(50% - 0.4rem) !important;
            padding: 0.75rem 0.5rem !important;
            font-size: 0.85rem !important;
          }
          input[type="date"] {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
      
export default Booking;