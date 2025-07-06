// API Configuration
const config = {
  development: {
    // Try proxy first, fallback to direct connection
    API_BASE_URL: window.location.hostname === 'localhost' ? '/api' : 'http://localhost:3001'
  },
  production: {
    // Update this with your actual Render backend URL
    API_BASE_URL: 'https://receipt-maker-backend.onrender.com'
  }
};

const environment = import.meta.env.MODE || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;

export default config;
