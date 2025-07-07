// API Configuration - Using separate backend server
const config = {
  development: {
    // For development, use Vite proxy (relative path)
    API_BASE_URL: '/api'
  },
  production: {
    // For production, use deployed backend
    API_BASE_URL: 'https://krishnaenterprisereceiptmaker-backend.onrender.com/api'
  }
};

const environment = import.meta.env.MODE || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;

export default config;
