import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Card = ({ children, style }) => {
    const { colors } = useTheme();
    const styles = React.useMemo(() => getStyles(colors), [colors]);
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

const getStyles = (colors) => StyleSheet.create({
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
