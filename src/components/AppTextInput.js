import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import AppText from './AppText';

const AppTextInput = ({ icon, label, ...otherProps }) => {
    return (
        <View style={styles.container}>
            {label && <AppText variant="bodyMedium" style={styles.label}>{label}</AppText>}
            <View style={styles.inputContainer}>
                {icon && <AppText style={styles.icon}>{icon}</AppText>}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="none"
                    {...otherProps}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    label: {
        marginBottom: 6,
        color: colors.text,
        fontWeight: '500',
    },
    inputContainer: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        flexDirection: 'row',
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
        fontSize: 18,
        color: colors.textMedium,
    },
    input: {
        flex: 1,
        fontFamily: typography.fontFamily,
        fontSize: 16,
        color: colors.text,
    },
});

export default AppTextInput;
