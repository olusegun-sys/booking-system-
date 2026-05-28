// config.js - Dynamic API detection for local vs production
const getAPI_BASE = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168')) {
    return 'http://localhost:5000';
  }
  return 'https://booking-hub-api.onrender.com';
};

const API_BASE = getAPI_BASE();

export default API_BASE;