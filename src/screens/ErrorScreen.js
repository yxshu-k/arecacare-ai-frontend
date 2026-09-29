import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function ErrorScreen({ error, onRetry }) {
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

const styles = StyleSheet.create({
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
        backgroundColor: '#FEF2F2',
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
    },
    retryBtn: {
        width: width * 0.7,
    }
});
