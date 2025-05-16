import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'http://localhost:5001/api' // Relative path for production when served by same Node server
    : 'http://localhost:5001/api'; // Full path for development (React on 3000, API on 5001)
console.log("API_BASE_URL:", API_BASE_URL); // For debugging
const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
    (config) => {
        console.log("Retrieving token from localStorage");
        const token = localStorage.getItem('authToken'); // Or however you store it (e.g., in AuthContext)
        console.log("Token retrieved:", token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Authorization header set:", config.headers.Authorization);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Response interceptor for global error handling (e.g., auto-logout on 401)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login
            // localStorage.removeItem('authToken');
            // window.location.href = '/login'; // Simple redirect
            console.error("Unauthorized access - 401. Token might be invalid or expired.");
        }
        return Promise.reject(error);
    }
);

export default apiClient;