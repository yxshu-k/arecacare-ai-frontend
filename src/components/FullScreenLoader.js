import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AppText from './AppText';
import { colors } from '../theme/colors';

export default function FullScreenLoader({ visible = false, message = 'Processing...' }) {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.box}>
                <ActivityIndicator size="large" color={colors.primary} />
                <AppText variant="heading3" style={styles.text}>{message}</AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 100, // Android z-index enforcement
    },
    box: {
        backgroundColor: colors.surface,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        minWidth: 150,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
    },
    text: {
        marginTop: 16,
        color: colors.text,
    }
});
