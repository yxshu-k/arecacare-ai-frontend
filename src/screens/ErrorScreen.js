import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ErrorScreen({ error, onRetry }) {
    const { colors, isDarkMode } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    return (
        <View style={styles.container}>
            <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#DC2626" />
            </View>

            <AppText variant="heading2" style={styles.title}>
                Oops! Something went wrong
            </AppText>

            <AppText variant="bodyMedium" color="textMedium" style={styles.message}>
                {error || "We couldn't load this page. Please check your internet connection or try again later."}
            </AppText>

            <AppButton
                title="Try Again"
                onPress={onRetry}
                style={styles.retryBtn}
            />
        </View>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
        borderWidth: isDarkMode ? 1 : 0,
        borderColor: isDarkMode ? '#991B1B' : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        color: colors.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 20,
        color: colors.textMedium,
    },
    retryBtn: {
        width: width * 0.7,
    }
});
