import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors } from '../theme/colors';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await SecureStore.getItemAsync('app_theme');
                if (savedTheme) {
                    setIsDarkMode(savedTheme === 'dark');
                } else {
                    setIsDarkMode(systemScheme === 'dark');
                }
            } catch (error) {
                setIsDarkMode(systemScheme === 'dark');
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, [systemScheme]);

    const toggleTheme = async (value) => {
        setIsDarkMode(value);
        await SecureStore.setItemAsync('app_theme', value ? 'dark' : 'light');
    };

    const colors = isDarkMode ? darkColors : lightColors;

    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};
