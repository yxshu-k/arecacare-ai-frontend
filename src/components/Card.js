import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const Card = ({ children, style }) => {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        // iOS shadow
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        // Android elevation
        elevation: 3,
    }
});

export default Card;
