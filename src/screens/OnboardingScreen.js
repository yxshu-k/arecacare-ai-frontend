import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        icon: 'shield',
        badge: 'AI Protection',
        title: 'AI-Powered Care',
        description: 'Smart disease detection and agricultural advisory right in your pocket. Protect your crops with AI.'
    },
    {
        icon: 'camera',
        badge: 'Instant Scanner',
        title: 'Early Detection',
        description: 'Snap a picture of a leaf to instantly identify diseases like Leaf Spot, Yellow Leaf, and Bud Rot.'
    },
    {
        icon: 'trending-up',
        badge: 'Yield & Insights',
        title: 'Better Yield',
        description: 'Get actionable treatments, calculate yield predictions, and receive tailored farming tips.'
    }
];

export default function OnboardingScreen({ navigation }) {
    const { colors, isDarkMode } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const [step, setStep] = useState(0);

    const finishOnboarding = async () => {
        try {
            await SecureStore.setItemAsync('has_onboarded', 'true');
        } catch (e) {}
        navigation.replace('Login');
    };

    const handleNext = async () => {
        if (step < ONBOARDING_DATA.length - 1) {
            setStep(step + 1);
        } else {
            await finishOnboarding();
        }
    };

    const currentData = ONBOARDING_DATA[step];
    const isLast = step === ONBOARDING_DATA.length - 1;

    return (
        <Screen>
            <View style={styles.container}>
                {/* Top Bar with Skip */}
                <View style={styles.topBar}>
                    <View style={styles.brandRow}>
                        <View style={styles.brandDot} />
                        <AppText variant="caption" style={styles.brandTag}>ARECACARE AI</AppText>
                    </View>
                    {!isLast && (
                        <TouchableOpacity onPress={finishOnboarding} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <AppText variant="bodyMedium" style={styles.skipText}>Skip</AppText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    <View style={styles.imagePlaceholder}>
                        <View style={styles.innerHalo}>
                            <Feather name={currentData.icon} size={68} color={colors.primary} />
                        </View>
                    </View>

                    <View style={styles.badgeContainer}>
                        <AppText variant="caption" style={styles.badgeText}>{currentData.badge}</AppText>
                    </View>

                    <AppText variant="heading2" style={styles.title}>{currentData.title}</AppText>
                    <AppText variant="body" style={styles.description}>
                        {currentData.description}
                    </AppText>
                </View>

                {/* Footer with Dots & Action */}
                <View style={styles.footer}>
                    <View style={styles.dotsContainer}>
                        {ONBOARDING_DATA.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    step === index ? styles.dotActive : null
                                ]}
                            />
                        ))}
                    </View>
                    <AppButton
                        title={isLast ? "Get Started" : "Next"}
                        variant="primary"
                        onPress={handleNext}
                    />
                </View>
            </View>
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    container: { flex: 1, justifyContent: 'space-between', paddingVertical: 16 },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: 8,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.accent || '#F1A344',
        marginRight: 6,
    },
    brandTag: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: 1.2,
    },
    skipText: {
        color: colors.textMedium,
        fontWeight: '600',
    },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    imagePlaceholder: {
        width: width * 0.58,
        height: width * 0.58,
        backgroundColor: isDarkMode ? 'rgba(85, 121, 69, 0.18)' : '#E8F0E4',
        borderWidth: 1.5,
        borderColor: isDarkMode ? '#2D3A2B' : '#DCE5D7',
        borderRadius: (width * 0.58) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
        shadowColor: colors.primaryDark || '#1C241B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    innerHalo: {
        width: width * 0.44,
        height: width * 0.44,
        borderRadius: (width * 0.44) / 2,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? colors.border : '#E2E8DE',
    },
    badgeContainer: {
        backgroundColor: colors.softCream || '#FFF3E2',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F8D8B0',
    },
    badgeText: {
        color: colors.accent || '#F1A344',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    title: { textAlign: 'center', marginBottom: 12, color: colors.text, fontWeight: '700' },
    description: { textAlign: 'center', lineHeight: 24, color: colors.textMedium, paddingHorizontal: 10 },
    footer: { paddingBottom: 20 },
    dotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 5 },
    dotActive: { width: 28, backgroundColor: colors.primary, borderRadius: 4 }
});

