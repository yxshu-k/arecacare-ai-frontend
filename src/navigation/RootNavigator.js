import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashScreen from '../screens/SplashScreen'; // Pure visual component if loading

export default function RootNavigator() {
    const { userToken, isLoading } = useContext(AuthContext);
    const { colors, isDarkMode } = useTheme();

    const navigationTheme = {
        ...(isDarkMode ? DarkTheme : DefaultTheme),
        colors: {
            ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
            background: colors.background,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            primary: colors.primary,
        },
    };

    if (isLoading) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer theme={navigationTheme}>
            {userToken ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
