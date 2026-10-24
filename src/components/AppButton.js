import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

const AppButton = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    style,
    textStyle,
    icon
}) => {
    const { colors, isDarkMode } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    const getBackgroundColor = () => {
        if (disabled) return isDarkMode ? colors.border : '#E5E9E2';
        if (variant === 'primary') return colors.primary;
        if (variant === 'secondary' || variant === 'accent') return colors.accent;
        if (variant === 'light' || variant === 'sage') return colors.lightSage;
        if (variant === 'outline') return 'transparent';
        return colors.primary;
    };

    const getTextColor = () => {
        if (disabled) return colors.textLight;
        if (variant === 'outline') return colors.primary;
        if (variant === 'light' || variant === 'sage') return colors.primary;
        if (variant === 'secondary' || variant === 'accent') return '#FFFFFF';
        return colors.white;
    };

    const isElevated = !disabled && (variant === 'primary' || variant === 'secondary' || variant === 'accent');

    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[`size_${size}`],
                { backgroundColor: getBackgroundColor() },
                variant === 'outline' && styles.outline,
                isElevated && styles.elevated,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.82}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon && <>{icon}</>}
                    <AppText
                        variant="heading3"
                        style={[styles.text, { color: getTextColor() }, textStyle]}
                    >
                        {title}
                    </AppText>
                </>
            )}
        </TouchableOpacity>
    );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        flexDirection: 'row',
    },
    elevated: {
        shadowColor: colors.primaryDark || '#2F4426',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.35 : 0.15,
        shadowRadius: 5,
        elevation: 3,
    },
    size_sm: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        minHeight: 42,
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
        fontWeight: '600',
        letterSpacing: 0.2,
    }
});

export default AppButton;

