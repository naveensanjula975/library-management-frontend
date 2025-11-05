import axios from 'axios';

// Default to the backend dev server port (5119)
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5119/api";

const api = axios.create({
    baseURL: API_BASE,
    headers: {"Content-Type": "application/json"}
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
            // Request made but no response received
            console.error('Network Error: No response from server');
        } else {
            // Error setting up the request
            console.error('Request Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;