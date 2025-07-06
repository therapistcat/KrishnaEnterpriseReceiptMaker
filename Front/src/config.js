// API Configuration
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3000'
  },
  production: {
    // Update this with your actual Render backend URL
    API_BASE_URL: 'https://receipt-maker-backend.onrender.com'
  }
};

const environment = import.meta.env.MODE || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;

export default config;
