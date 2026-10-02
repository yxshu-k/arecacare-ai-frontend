import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { typography } from '../theme/typography';
import { useTheme } from '../context/ThemeContext';

const AppText = ({ children, style, variant = 'body', color = 'text', numberOfLines, ...props }) => {
    const { colors } = useTheme();
    const variantStyle = typography.styles[variant] || typography.styles.body;

    return (
        <Text
            style={[
                styles.text,
                variantStyle,
                { color: colors[color] || colors.text },
                style
            ]}
            numberOfLines={numberOfLines}
            {...props}
        >
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        fontFamily: typography.fontFamily,
    },
});

export default AppText;
