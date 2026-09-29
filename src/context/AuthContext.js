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
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = async () => {
        setUserToken(null);
        setUserData(null);
        await SecureStore.deleteItemAsync('auth_token');
    };

    return (
        <AuthContext.Provider value={{ userToken, userData, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
