// src/config.js

const isProduction = process.env.NODE_ENV === 'production';

// Define your backend URLs clearly
const fallbackApiUrl = isProduction
  ? 'https://mecac-backend.onrender.com' // Replace with your actual live backend URL
  : 'http://localhost:8000';             // Local development backend

export const API_URL = (process.env.REACT_APP_API_URL || fallbackApiUrl).replace(
  /\/+$/,
  ''
);

export const APP_NAME = 'Mental Care Connect';