import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import AppText from './AppText';

const AppTextInput = ({ icon, rightIcon, onRightIconPress, label, ...otherProps }) => {
    return (
        <View style={styles.container}>
            {label && <AppText variant="bodyMedium" style={styles.label}>{label}</AppText>}
            <View style={styles.inputContainer}>
                {icon && <Feather name={icon} size={20} color={colors.textMedium} style={styles.icon} />}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="none"
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

const styles = StyleSheet.create({
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
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 2,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontFamily: typography.fontFamily,
        fontSize: 16,
        color: colors.text,
    },
});

export default AppTextInput;
