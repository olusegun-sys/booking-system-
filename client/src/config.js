// config.js - Single source of truth for API endpoint
// For local development: uses localhost
// For production: uses deployed backend URL

const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.includes('192.168');

const API_BASE = isLocal 
  ? 'http://localhost:5000'
  : 'https://booking-hub-api.onrender.com';

export default API_BASE;