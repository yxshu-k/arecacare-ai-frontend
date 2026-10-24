import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { typography } from '../theme/typography';
import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

const AppTextInput = ({ icon, rightIcon, onRightIconPress, label, onFocus, onBlur, ...otherProps }) => {
    const { colors, isDarkMode } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    const handleFocus = (e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (onBlur) onBlur(e);
    };

    return (
        <View style={styles.container}>
            {label && <AppText variant="bodyMedium" style={styles.label}>{label}</AppText>}
            <View style={[
                styles.inputContainer,
                isFocused && { borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.15 }
            ]}>
                {icon && (
                    <Feather
                        name={icon}
                        size={20}
                        color={isFocused ? colors.primary : colors.textMedium}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...otherProps}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={{ padding: 4 }}>
                        <Feather name={rightIcon} size={20} color={colors.textMedium} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    label: {
        marginBottom: 8,
        color: colors.text,
        fontWeight: '600',
    },
    inputContainer: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0.2 : 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontFamily: typography.fontFamily,
        fontSize: 16,
        color: colors.text,
        paddingVertical: 2,
    },
});

export default AppTextInput;

