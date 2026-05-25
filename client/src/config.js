// Use environment variable on Render, fallback to localhost for development
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default API_BASE;