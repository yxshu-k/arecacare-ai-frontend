import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';

export default function SplashScreen() {
    return (
        <Screen noPadding>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    {/* We will replace this emoji with the actual logo image later */}
                    <AppText variant="heading1" style={styles.logoIcon}>🌿</AppText>
                    <AppText variant="heading1" style={styles.title}>ArecaCare AI</AppText>
                    <AppText variant="bodyMedium" color="textMedium" style={styles.subtitle}>
                        Smart Farming, Better Future
                    </AppText>
                </View>

                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AppText variant="caption" color="textLight" style={styles.loadingText}>
                        Loading...
                    </AppText>
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 60,
        backgroundColor: colors.background,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIcon: {
        fontSize: 72,
        marginBottom: 16,
    },
    title: {
        color: colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
    }
});
