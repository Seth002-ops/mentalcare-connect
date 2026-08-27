import React, { useState } from 'react';

const RageRoomWaiver = ({ onSign, onCancel, roomName }) => {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!agreed) {
      setError('You must agree to the terms to proceed.');
      return;
    }
    if (fullName.trim().length < 3) {
      setError('Please enter your full legal name as it appears on your ID.');
      return;
    }
    if (idNumber.trim().length < 4) {
      setError('Please enter a valid National ID or Passport number.');
      return;
    }
    setError('');
    onSign(fullName.trim(), idNumber.trim());
  };

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 9999, padding: '20px', backdropFilter: 'blur(4px)'
  };

  const modalStyle = {
    background: 'white', borderRadius: '16px', maxWidth: '600px', width: '100%',
    maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB', background: '#FEE2E2' }}>
          <h2 style={{ margin: 0, color: '#991B1B', fontSize: '1.25rem' }}>⚠️ Liability Waiver & Release</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#B91C1C' }}>
            Mandatory for {roomName || 'Rage Room'} participation
          </p>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', fontSize: '0.9rem', color: '#374151', lineHeight: '1.6' }}>
          <p><strong>1. Assumption of Risk:</strong> I understand that participating in Rage Room activities involves inherent risks, including but not limited to flying debris, physical exertion, and the use of protective equipment. I voluntarily assume all risks associated with this activity.</p>
          <p><strong>2. Release of Liability:</strong> I hereby release, waive, and discharge Mecac Care Connect, its owners, employees, and affiliates from any and all liability, claims, or demands for personal injury, property damage, or wrongful death arising from my participation.</p>
          <p><strong>3. Health & Safety:</strong> I confirm I am physically fit to participate. I will wear all provided safety gear (helmet, goggles, gloves) at all times inside the room and follow all instructions from the staff.</p>
          <p><strong>4. Property Damage:</strong> I understand I am only permitted to destroy items provided by the facility. Any intentional damage to the facility's infrastructure (walls, cameras, floors) will result in financial liability.</p>
          <p><strong>5. Media Release:</strong> I grant Mecac permission to use photos/videos taken in the room for promotional purposes, unless I explicitly opt-out with the staff before my session.</p>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111827' }}>
                I have read, understood, and agree to the above terms. I am at least 18 years of age.
              </span>
            </label>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid #E5E7EB', background: '#F9FAFB' }}>
          <p style={{ margin: '0 0 0.75rem', fontWeight: '700', fontSize: '0.95rem', color: '#111827' }}>Digital Signature</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', marginBottom: '0.25rem' }}>Full Legal Name</label>
              <input 
                type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} 
                placeholder="e.g. Jane Doe" 
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'cursive' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', marginBottom: '0.25rem' }}>ID / Passport Number</label>
              <input 
                type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} 
                placeholder="e.g. 12345678" 
                style={{ width: '100%', padding: '0.6rem', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }} 
              />
            </div>
          </div>

          {error && <p style={{ color: '#B91C1C', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onCancel} style={{ flex: 1, padding: '0.75rem', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} style={{ flex: 2, padding: '0.75rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>
              Sign & Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RageRoomWaiver;