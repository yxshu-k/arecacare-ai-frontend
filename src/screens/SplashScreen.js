import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';

export default function SplashScreen({ navigation }) {
    const { colors } = useTheme();

    useEffect(() => {
        if (navigation) {
            navigation.replace('Onboarding');
        }
    }, [navigation]);

    return (
        <Screen noPadding style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ flex: 1, backgroundColor: colors.background }} />
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    screen: {
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 60,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBackground: {
        backgroundColor: colors.surface,
        borderWidth: isDarkMode ? 1 : 0,
        borderColor: colors.border,
        padding: 24,
        borderRadius: 30,
        marginBottom: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDarkMode ? 0.3 : 0.15,
        shadowRadius: 24,
        elevation: 8,
    },
    title: {
        color: colors.primary,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        textAlign: 'center',
        letterSpacing: 0.5,
        color: colors.textMedium,
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: colors.textLight,
    }
});
