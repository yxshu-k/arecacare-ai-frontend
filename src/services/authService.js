import { apiClient } from './api';

export const authService = {
    login: async (email, password) => {
        // In production:
        // const response = await apiClient.post('/api/auth/login', { email, password });
        // return response.data;

        // For local testing until backend is live:
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ token: 'mock_jwt_token_123', user: { name: 'Ramesh', email } });
            }, 1000);
        });
    },

    register: async (name, phone, email, password) => {
        // In production:
        // const response = await apiClient.post('/api/auth/register', { name, phone, email, password });
        // return response.data;

        // For local testing:
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true }), 1000);
        });
    }
};
