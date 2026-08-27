import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TherapistRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    specializations: '',
    bio: '',
    experience_years: '',
    hourly_rate: '',
    license_number: '',
    languages: 'English',
  });
  const [licenseFile, setLicenseFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, JPG, and PNG files are allowed.');
      return;
    }

    setLicenseFile(file);
    setError('');
    setUploadStatus('Uploading...');

    const token = localStorage.getItem('token');
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch('/therapist/upload-license', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });
      if (res.ok) {
        setUploadStatus('✓ License uploaded successfully');
      } else {
        const data = await res.json();
        setError(data.detail || 'Upload failed');
        setUploadStatus('');
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
      setUploadStatus('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!licenseFile && !uploadStatus.includes('successfully')) {
      setError('Please upload your license document.');
      return;
    }
    if (!formData.specializations) {
      setError('Please enter your specializations.');
      return;
    }
    if (!formData.license_number) {
      setError('Please enter your license number.');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/therapist/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          experience_years: parseInt(formData.experience_years) || null,
          hourly_rate: parseInt(formData.hourly_rate) || null,
        }),
      });

      if (res.ok) {
        alert('Your profile has been submitted for review! You will be notified once approved.');
        if (onComplete) onComplete(); // Call the callback if provided
        navigate('/dashboard');
      } else {
        const data = await res.json();
        setError(data.detail || 'Submission failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F9FAFB', paddingTop: '7rem', paddingBottom: '4rem', boxSizing: 'border-box' },
    main: { maxWidth: '700px', margin: '0 auto', padding: '2rem 20px' },
    card: { background: 'white', borderRadius: '20px', padding: '3rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
    title: { fontSize: '1.8rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' },
    subtitle: { color: '#6B7280', marginBottom: '2rem', lineHeight: '1.6' },
    formGroup: { marginBottom: '1.5rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.9rem' },
    input: { width: '100%', padding: '0.85rem 1rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'inherit' },
    textarea: { width: '100%', padding: '0.85rem 1rem', border: '1px solid #D1D5DB', borderRadius: '10px', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px', boxSizing: 'border-box' },
    fileInput: { width: '100%', padding: '0.85rem', border: '2px dashed #D1D5DB', borderRadius: '10px', cursor: 'pointer', background: '#F9FAFB' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    submitBtn: { width: '100%', padding: '1rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', marginTop: '1rem' },
    error: { color: '#DC2626', fontSize: '0.9rem', marginTop: '0.5rem' },
    success: { color: '#16A34A', fontSize: '0.9rem', marginTop: '0.5rem' },
    notice: { background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#92400E', fontSize: '0.9rem' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.title}>Complete Your Therapist Profile</h1>
          <p style={styles.subtitle}>
            Please provide your professional details and upload your license for verification. Your profile will be reviewed before you can accept clients.
          </p>

          <div style={styles.notice}>
            ⚠️ Your account will remain in <strong>Pending</strong> status until an admin reviews and approves your credentials.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Specializations *</label>
              <input
                name="specializations"
                value={formData.specializations}
                onChange={handleChange}
                placeholder="e.g., Anxiety, Depression, CBT, Trauma"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Professional Bio *</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell clients about your approach, experience, and what makes you unique..."
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Years of Experience</label>
                <input
                  name="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  style={styles.input}
                  min="0"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hourly Rate (KSh)</label>
                <input
                  name="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  placeholder="e.g., 2500"
                  style={styles.input}
                  min="0"
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>License Number *</label>
                <input
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  placeholder="e.g., KMP-12345"
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Languages</label>
                <input
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="e.g., English, Swahili"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Upload License Document *</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={styles.fileInput}
              />
              {uploadStatus && <p style={styles.success}>{uploadStatus}</p>}
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TherapistRegistration;