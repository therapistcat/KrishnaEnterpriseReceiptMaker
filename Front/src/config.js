// API Configuration - Using same server for frontend and backend
const config = {
  development: {
    // For development, use the combined server
    API_BASE_URL: '/api'
  },
  production: {
    // For production, also use same server (no CORS issues!)
    API_BASE_URL: '/api'
  }
};

const environment = import.meta.env.MODE || 'development';
export const API_BASE_URL = config[environment].API_BASE_URL;

export default config;
