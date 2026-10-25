import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Production live backend on Render (fallback if EXPO_PUBLIC_API_URL not injected)
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://arecacare-ai.onrender.com';

const getInitialBaseUrl = () => {
    let url = rawApiUrl.replace(/\/+$/, '');
    if (Platform.OS === 'android') {
        const serverHost = Platform.constants?.ServerHost || '';
        // If Metro packager is connected via 10.0.2.2 or localhost, this is an Android Emulator
        if (serverHost.includes('10.0.2.2') || serverHost.includes('localhost') || serverHost.includes('127.0.0.1')) {
            url = url.replace(/192\.168\.\d+\.\d+/, '10.0.2.2');
        }
    }
    return url;
};

let currentBaseUrl = getInitialBaseUrl();
console.log(`[API Config] Initial Base URL: ${currentBaseUrl} (Platform: ${Platform.OS}, Env: ${rawApiUrl})`);

const api = axios.create({
    baseURL: currentBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60s timeout accommodates Render free-tier initial spin-up
});

// --- REQUEST INTERCEPTOR ---
// This runs before EVERY single outgoing API call.
// It ensures the dynamic baseURL is always current and attaches JWT authentication.
api.interceptors.request.use(
    async (config) => {
        config.baseURL = currentBaseUrl;
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            // Automatically sync UI dialect selections to backend API calls
            const lang = await SecureStore.getItemAsync('app_language');
            if (lang) {
                config.headers['Accept-Language'] = lang;
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

// --- RESPONSE INTERCEPTOR WITH DYNAMIC NETWORK AUTO-RETRY ---
// Automatically switches between 192.168.x.x (physical mobile) and 10.0.2.2 (Android Studio emulator)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If a network connection error occurred (no HTTP response received) and we haven't retried yet:
        if (!error.response && originalRequest && !originalRequest._networkRetried && Platform.OS === 'android') {
            originalRequest._networkRetried = true;

            let fallbackUrl = null;
            if (currentBaseUrl.includes('192.168.')) {
                // Host 192.168.x.x unreachable -> Auto-switch to Android Emulator's 10.0.2.2 gateway
                fallbackUrl = currentBaseUrl.replace(/192\.168\.\d+\.\d+/, '10.0.2.2');
            } else if (currentBaseUrl.includes('10.0.2.2')) {
                // 10.0.2.2 unreachable -> Switch back to local Wi-Fi IP for real mobile device
                fallbackUrl = rawApiUrl.replace(/\/+$/, '');
            }

            if (fallbackUrl && fallbackUrl !== currentBaseUrl) {
                console.log(`[Axios API] Network unreachable at ${currentBaseUrl}. Auto-switching to ${fallbackUrl}...`);
                currentBaseUrl = fallbackUrl.replace(/\/+$/, '');
                api.defaults.baseURL = currentBaseUrl;
                originalRequest.baseURL = currentBaseUrl;

                // Transparently retry the failed request with the new baseURL
                return api(originalRequest);
            }
        }

        // Global error logging for debugging (Demoted to warn to prevent Expo red screens)
        if (error.response) {
            console.warn(`[Axios Error ${error.response.status}] =>`, error.response.data);

            if (error.response.status === 401) {
                console.warn("[Axios API] Unauthorized access detected. Session likely expired.");
            }
        } else if (error.request) {
            console.warn(`[Axios API] Network Error / No Response to: ${currentBaseUrl}${originalRequest?.url || ''}`);
        }
        return Promise.reject(error);
    }
);

export default api;
