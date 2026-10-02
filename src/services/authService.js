import api from './api';

export const authService = {
    getMe: async () => {
        try {
            const response = await api.get('/api/auth/me');
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch profile.');
        }
    },

    login: async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const token = response.data.token || response.data.access_token;
            if (!token) throw new Error("No token returned from server");

            return {
                token: token,
                user: response.data.user || { email }
            };
        } catch (error) {
            if (error.response && error.response.data) {
                // FastAPI natively uses "detail" for its error strings
                throw new Error(error.response.data.detail || error.response.data.message || 'Invalid credentials');
            }
            throw new Error('Network error. Unable to connect to server.');
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/api/auth/register', userData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                // FastAPI natively uses "detail" for its error strings
                throw new Error(error.response.data.detail || error.response.data.message || 'Registration failed');
            }
            throw new Error('Network error. Unable to connect to server.');
        }
    },

    // ----------------------------------------------------
    // User Profile Actions
    // ----------------------------------------------------

    updateProfile: async (userData) => {
        try {
            const response = await api.put('/api/auth/me', userData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || error.response.data.message || 'Profile update failed');
            }
            throw new Error('Network error. Unable to connect to server.');
        }
    },

    uploadProfilePicture: async (imageUri) => {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'profile.jpg',
            });

            const response = await api.post('/api/auth/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        } catch (error) {
            throw new Error('Avatar upload failed.');
        }
    },

    // ----------------------------------------------------
    // Extended Auth Endpoints (From Swagger Contract)
    // ----------------------------------------------------

    refresh: async (refreshToken) => {
        try {
            const response = await api.post('/api/auth/refresh', { refresh_token: refreshToken });
            return response.data; // Expected { access_token: "new_token" }
        } catch (error) {
            throw new Error('Failed to refresh token.');
        }
    },

    logout: async (refreshToken = "") => {
        try {
            // Inform the backend to invalidate the current token
            await api.post('/api/auth/logout', { refresh_token: refreshToken });
            return true;
        } catch (error) {
            console.warn("[AuthService] Remote logout unavailable, proceeding with native local token termination.");
            return false;
        }
    },

    deactivate: async () => {
        try {
            // Permanently deletes or disables the user account
            await api.post('/api/auth/deactivate');
            return true;
        } catch (error) {
            throw new Error('Failed to deactivate account.');
        }
    },

    googleLogin: async (googleToken) => {
        try {
            // Send the token received from Expo Google Auth to our FastAPI backend for verification
            const response = await api.post('/api/auth/google', { token: googleToken });
            const token = response.data.token || response.data.access_token;

            if (!token) throw new Error("No token returned from server");

            return {
                token: token,
                user: response.data.user
            };
        } catch (error) {
            throw new Error('Google Authentication failed.');
        }
    }
};
