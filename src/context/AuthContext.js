import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await SecureStore.getItemAsync('auth_token');
                if (token) {
                    // Try to silently refresh token on boot if refresh_token logic exists, 
                    // for now we just trust the local token until an Axios 401 proves otherwise.
                    setUserToken(token);
                }
            } catch (e) {
                console.error('Failed to load token', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const login = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            setUserToken(data.token);
            setUserData(data.user);
            await SecureStore.setItemAsync('auth_token', data.token);
        } catch (error) {
            console.error('[AuthContext] Login failed:', error.message);
            throw error; // Let UI handle it
        }
    };

    const register = async (registerData) => {
        try {
            // Register user in database
            await authService.register(registerData);
            // Immediately log them in if backend doesn't auto-send a token on register
            await login(registerData.email, registerData.password);
        } catch (error) {
            console.error('[AuthContext] Signup failed:', error.message);
            throw error;
        }
    };

    const googleLogin = async (googleToken) => {
        try {
            const data = await authService.googleLogin(googleToken);
            setUserToken(data.token);
            setUserData(data.user);
            await SecureStore.setItemAsync('auth_token', data.token);
        } catch (error) {
            console.error('[AuthContext] Google Auth failed:', error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout(); // Invalidate token remotely
        } catch (error) {
            console.log('Remote logout failed, clearing locally.');
        } finally {
            setUserToken(null);
            setUserData(null);
            await SecureStore.deleteItemAsync('auth_token');
        }
    };

    const deactivate = async () => {
        try {
            await authService.deactivate();
        } catch (error) {
            console.log('Deactivation failed at backend, clearing local state.');
        } finally {
            setUserToken(null);
            setUserData(null);
            await SecureStore.deleteItemAsync('auth_token');
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, userData, isLoading, login, register, googleLogin, logout, deactivate }}>
            {children}
        </AuthContext.Provider>
    );
};
