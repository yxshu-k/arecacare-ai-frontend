import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Card = ({ children, style }) => {
    const { colors, isDarkMode } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: colors.border,
        // iOS shadow
        shadowColor: colors.primaryDark || '#1C241B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.25 : 0.05,
        shadowRadius: 8,
        // Android elevation
        elevation: 2,
    }
});

export default Card;

