import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BrowseTherapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [filteredTherapists, setFilteredTherapists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTherapists = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('/users?user_type=therapist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTherapists(data);
          setFilteredTherapists(data);
        }
      } catch (error) {
        console.error('Error fetching therapists:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapists();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTherapists(therapists);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = therapists.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(query)) ||
          (t.email && t.email.toLowerCase().includes(query))
      );
      setFilteredTherapists(filtered);
    }
  }, [searchQuery, therapists]);

  const handleBook = (therapistId) => {
    navigate(`/booking?therapist_id=${therapistId}`);
  };

  const getInitials = (name, email) => {
    const source = name || email || 'T';
    return source.charAt(0).toUpperCase();
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F9FAFB', overflowX: 'hidden' },
    header: { background: '#2E7D32', color: 'white', padding: '2rem 0' },
    nav: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      maxWidth: '1200px', margin: '0 auto', padding: '0 20px', width: '100%', boxSizing: 'border-box'
    },
    navTitle: { fontSize: '1.8rem', fontWeight: '700' },
    navSubtitle: { fontSize: '0.9rem', fontWeight: '600', opacity: 0.9 },
    backBtn: {
      backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
      padding: '0.8rem 1.5rem', borderRadius: '25px', cursor: 'pointer',
      fontWeight: '500', textDecoration: 'none', whiteSpace: 'nowrap'
    },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '3rem 20px', width: '100%', boxSizing: 'border-box' },
    pageTitle: { fontSize: '2rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' },
    pageSubtitle: { color: '#6B7280', marginBottom: '2rem' },
    searchBox: {
      width: '100%', maxWidth: '500px', padding: '0.9rem 1.25rem',
      border: '2px solid #E5E7EB', borderRadius: '12px', fontSize: '1rem',
      marginBottom: '2rem', outline: 'none', boxSizing: 'border-box'
    },
    grid: {
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      width: '100%',
      boxSizing: 'border-box'
    },
    card: {
      background: 'white', borderRadius: '16px', padding: '1.75rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box', width: '100%'
    },
    avatar: {
      width: '64px', height: '64px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem'
    },
    name: { fontSize: '1.2rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' },
    email: { fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem', wordBreak: 'break-word' },
    badge: {
      display: 'inline-block', padding: '0.25rem 0.75rem', background: '#E8F5E9',
      color: '#2E7D32', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
      marginBottom: '1rem', width: 'fit-content'
    },
    bookBtn: {
      marginTop: 'auto', padding: '0.85rem', background: '#2E7D32', color: 'white',
      border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer',
      fontSize: '0.95rem', transition: 'background 0.2s', width: '100%', boxSizing: 'border-box'
    },
    emptyState: { textAlign: 'center', padding: '3rem', color: '#6B7280' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.nav} className="responsive-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={styles.navTitle}>Mecac</h1>
            <span style={styles.navSubtitle}>Mental Care Connect</span>
          </div>
          <Link to="/dashboard" style={styles.backBtn}>Back to Dashboard</Link>
        </nav>
      </header>

      <main style={styles.main} className="responsive-main">
        <h2 style={styles.pageTitle}>Find Your Therapist</h2>
        <p style={styles.pageSubtitle}>
          Browse our network of licensed mental health professionals and book a session.
        </p>

        <input
          type="text"
          placeholder="Search therapists by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchBox}
        />

        {loading ? (
          <p style={styles.emptyState}>Loading therapists...</p>
        ) : filteredTherapists.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>No therapists found</p>
            <p>Try a different search term, or check back later.</p>
          </div>
        ) : (
          <div style={styles.grid} className="responsive-grid">
            {filteredTherapists.map((therapist) => (
              <div key={therapist.id} style={styles.card} className="responsive-card">
                <Link to={`/therapists/${therapist.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={styles.avatar}>
                    {getInitials(therapist.name, therapist.email)}
                  </div>
                  <div style={styles.name}>
                    {therapist.name || therapist.email.split('@')[0]}
                  </div>
                  <div style={styles.email}>{therapist.email}</div>
                  <div style={styles.badge}>Licensed Therapist</div>
                </Link>

                <button
                  style={styles.bookBtn}
                  onClick={() => handleBook(therapist.id)}
                  onMouseOver={(e) => (e.target.style.background = '#1B5E20')}
                  onMouseOut={(e) => (e.target.style.background = '#2E7D32')}
                >
                  Book a Session
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        html, body {
          overflow-x: hidden;
          max-width: 100vw;
        }
        
        @media (max-width: 600px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-card {
            width: 100% !important;
            max-width: 100% !important;
            padding: 1.25rem !important;
          }
          .responsive-main {
            padding: 2rem 15px !important;
          }
          .responsive-nav {
            padding: 0 15px !important;
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BrowseTherapists;