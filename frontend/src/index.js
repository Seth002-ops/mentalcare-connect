// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import the new utility-first global styles
import './styles/global.css'; 

const container = document.getElementById('root');

if (!container) {
  throw new Error(
    'Root container missing in index.html. Expected <div id="root"></div>.'
  );
}

// Global error handlers for development debugging
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global window error:', event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);