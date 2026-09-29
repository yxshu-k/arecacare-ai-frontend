import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import AppText from './AppText';
import { colors } from '../theme/colors';

// In production, this will be wrapped in a NetInfo listener 
// to automatically toggle isVisible when the connection drops.
export default function OfflineNotice({ isVisible = false }) {
    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            <AppText variant="bodyMedium" style={styles.text}>
                No Internet Connection
            </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#DC2626', // Error red
        height: Platform.OS === 'ios' ? 90 : 60,
        width: '100%',
        position: 'absolute',
        zIndex: 999,
        top: 0,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 12,
        elevation: (Platform.OS === 'android') ? 50 : 0,
    },
    text: {
        color: colors.white,
        fontWeight: '600',
    },
});
