import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

const AppButton = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    style
}) => {
    const { colors } = useTheme();
    const styles = React.useMemo(() => getStyles(colors), [colors]);

    const getBackgroundColor = () => {
        if (disabled) return colors.border;
        if (variant === 'primary') return colors.primary;
        if (variant === 'secondary') return colors.secondary;
        if (variant === 'outline') return 'transparent';
        return colors.primary;
    };

    const getTextColor = () => {
        if (disabled) return colors.textLight;
        if (variant === 'outline') return colors.primary;
        return colors.white;
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[`size_${size}`],
                { backgroundColor: getBackgroundColor() },
                variant === 'outline' && styles.outline,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <AppText
                    variant="heading3"
                    style={[styles.text, { color: getTextColor() }]}
                >
                    {title}
                </AppText>
            )}
        </TouchableOpacity>
    );
};

const getStyles = (colors) => StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
    },
    size_sm: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    size_md: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        minHeight: 52,
    },
    outline: {
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    text: {
        fontSize: 16,
    }
});

export default AppButton;
