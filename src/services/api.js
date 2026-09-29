import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// We pull the API URL dynamically from our .env file.
// If the .env is missing, it falls back to a development IP safely.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.5:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout threshold to prevent hanging requests
});

// --- REQUEST INTERCEPTOR ---
// This runs before EVERY single outgoing API call.
// It searches our native secure storage for an active Authentication Token (JWT)
// and autonomously attaches it as a Bearer Header for backend verification.
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("[Axios API] Token intercept error:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- RESPONSE INTERCEPTOR ---
// This runs globally when the backend replies.
// Useful for globally catching 401 Unauthorized errors and force log-outs.
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Global error logging for debugging
        if (error.response) {
            console.error(`[Axios Error ${error.response.status}] =>`, error.response.data);

            // If the user's token expired on the backend server
            if (error.response.status === 401) {
                // Here we would ideally trigger a global logout function via Context API.
                // Since this is outside of the React Tree, we rely on the AuthContext to catch 401s where relevant, 
                // or we use a navigation ref.
                console.warn("[Axios API] Unauthorized access detected. Session likely expired.");
            }
        } else if (error.request) {
            console.error("[Axios Error] Network Error / No Response (Is the Backend Server running API_URL?)");
        }
        return Promise.reject(error);
    }
);

export default api;
