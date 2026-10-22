import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';

export default function SplashScreen({ navigation }) {
    const { colors, isDarkMode } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    useEffect(() => {
        if (navigation) {
            const timer = setTimeout(async () => {
                try {
                    const hasOnboarded = await SecureStore.getItemAsync('has_onboarded');
                    if (hasOnboarded === 'true') {
                        navigation.replace('Login');
                    } else {
                        navigation.replace('Onboarding');
                    }
                } catch (e) {
                    navigation.replace('Login');
                }
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [navigation]);

    return (
        <Screen noPadding style={styles.screen}>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <View style={styles.iconBackground}>
                        <MaterialCommunityIcons name="leaf" size={72} color={colors.primary} />
                    </View>
                    <AppText variant="heading1" style={styles.title}>ArecaCare AI</AppText>
                    <AppText variant="bodyMedium" color="textMedium" style={styles.subtitle}>
                        Smart Farming, Better Future
                    </AppText>
                </View>

                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AppText variant="caption" color="textLight" style={styles.loadingText}>
                        Initializing framework...
                    </AppText>
                </View>
            </View>
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
