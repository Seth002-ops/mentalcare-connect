import React, { useState } from 'react';
import { API_URL } from '../config';

const AISoapDrafter = ({ bookingId, onSave }) => {
  const [roughNotes, setRoughNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [soap, setSoap] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSoap(null);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/ai/therapist/soap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id: bookingId, rough_notes: roughNotes }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to generate note');
      }

      const data = await res.json();
      setSoap(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSoapChange = (field, value) => {
    setSoap({ ...soap, [field]: value });
  };

  const handleSave = () => {
    if (onSave && soap) {
      onSave(soap); // Passes the data up to the parent component to save to DB
    }
  };

  const inputStyle = { width: '100%', padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '0.5rem' };
  const labelStyle = { fontWeight: '600', fontSize: '0.85rem', color: '#374151', marginBottom: '0.25rem', display: 'block' };

  return (
    <div style={{ background: '#F9FAFB', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', marginTop: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#111827' }}> AI Clinical Assistant</h3>
      
      {!soap ? (
        <>
          <label style={labelStyle}>Therapist's Rough Notes (Optional)</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px' }}
            placeholder="e.g., Client seemed anxious, discussed work stress, assigned breathing exercises."
            value={roughNotes}
            onChange={(e) => setRoughNotes(e.target.value)}
          />
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            style={{ padding: '0.7rem 1.5rem', background: loading ? '#9CA3AF' : '#2563EB', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Analyzing Transcript...' : 'Generate SOAP Note'}
          </button>
          {error && <p style={{ color: '#DC2626', marginTop: '0.5rem', fontSize: '0.85rem' }}>{error}</p>}
        </>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem', fontStyle: 'italic' }}>Review and edit the AI draft before saving to the client's permanent record.</p>
          
          {['subjective', 'objective', 'assessment', 'plan'].map((field) => (
            <div key={field} style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <textarea
                style={{ ...inputStyle, minHeight: '70px' }}
                value={soap[field]}
                onChange={(e) => handleSoapChange(field, e.target.value)}
              />
            </div>
          ))}
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={handleSave} 
              style={{ padding: '0.7rem 1.5rem', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              Save to Clinical Record
            </button>
            <button 
              onClick={() => setSoap(null)} 
              style={{ padding: '0.7rem 1.5rem', background: 'white', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            >
              Regenerate
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AISoapDrafter;