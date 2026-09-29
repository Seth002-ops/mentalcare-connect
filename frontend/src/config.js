const isProduction = process.env.NODE_ENV === 'production';

const fallbackApiUrl = isProduction
  ? 'https://mecac-backend.onrender.com'
  : 'http://localhost:8000';

export const API_URL = (process.env.REACT_APP_API_URL || fallbackApiUrl).replace(
  /\/+$/,
  ''
);

export const APP_NAME = 'Mental Care Connect';