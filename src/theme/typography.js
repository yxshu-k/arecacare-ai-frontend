import { Platform } from 'react-native';

export const typography = {
    // We fall back to system fonts to keep the app lightweight and performant
    // For iOS it's San Francisco, for Android it's Roboto.
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: {
        regular: '400',
        medium: '500',
        bold: '700',
    },
    size: {
        xs: 12,
        sm: 14,
        md: 16,     // Default body size
        lg: 18,
        xl: 20,
        xxl: 24,
        huge: 32,
    },
    // Reusable text styles (colors are supplied dynamically via ThemeContext/AppText)
    styles: {
        heading1: { fontSize: 32, fontWeight: '700' },
        heading2: { fontSize: 24, fontWeight: '700' },
        heading3: { fontSize: 20, fontWeight: '700' },
        body: { fontSize: 16, fontWeight: '400' },
        bodyMedium: { fontSize: 14, fontWeight: '400' },
        caption: { fontSize: 12, fontWeight: '400' },
    },
};
