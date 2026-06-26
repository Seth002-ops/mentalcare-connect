import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'client'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const passwordRequirements = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'One uppercase letter', regex: /[A-Z]/ },
    { label: 'One lowercase letter', regex: /[a-z]/ },
    { label: 'One number', regex: /\d/ },
    { label: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
  ];

  const checkPasswordStrength = (password) => {
    return passwordRequirements.map(req => ({
      ...req,
      met: req.regex.test(password)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const requirements = checkPasswordStrength(formData.password);
      const unmetRequirements = requirements.filter(req => !req.met);
      if (unmetRequirements.length > 0) {
        newErrors.password = 'Password does not meet requirements';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          user_type: formData.userType
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onLogin(data.access_token, data.user_type, formData.email);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.detail || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const requirements = checkPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Signup Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm bg-white/95">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join Afya Connect today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 ${
                    errors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                  }`}
                  placeholder="Enter your email"
                  required
                />
                <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                  }`}
                  placeholder="Create a strong password"
                  required
                />
                <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-1">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <svg
                        className={`w-4 h-4 mr-2 ${req.met ? 'text-green-500' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={req.met ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}
                        />
                      </svg>
                      <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 outline-none text-gray-900 placeholder-gray-400 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-primary-500 focus:ring-primary-100'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'client' }))}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all duration-200 ${
                    formData.userType === 'client'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Client
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, userType: 'therapist' }))}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all duration-200 ${
                    formData.userType === 'therapist'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Therapist
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;