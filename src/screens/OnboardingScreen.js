import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';

const ONBOARDING_DATA = [
    {
        icon: '🌱',
        title: 'AI-Powered Arecanut Care',
        description: 'Smart disease detection and agricultural advisory right in your pocket. Protect your crops with AI.'
    },
    {
        icon: '🔍',
        title: 'Early Detection',
        description: 'Snap a picture of a leaf to instantly identify diseases like Leaf Spot, Yellow Leaf, and Bud Rot.'
    },
    {
        icon: '📈',
        title: 'Better Yield',
        description: 'Get actionable treatments, calculate yield predictions, and receive tailored farming tips.'
    }
];

export default function OnboardingScreen({ onFinish }) {
    const [step, setStep] = useState(0);

    const handleNext = () => {
        if (step < ONBOARDING_DATA.length - 1) {
            setStep(step + 1);
        } else {
            onFinish();
        }
    };

    const currentData = ONBOARDING_DATA[step];
    const isLast = step === ONBOARDING_DATA.length - 1;

    return (
        <Screen>
            <View style={styles.container}>
                <View style={styles.content}>
                    <AppText variant="heading1" style={styles.icon}>{currentData.icon}</AppText>
                    <AppText variant="heading2" style={styles.title}>{currentData.title}</AppText>
                    <AppText variant="body" color="textMedium" style={styles.description}>
                        {currentData.description}
                    </AppText>
                </View>

                <View style={styles.footer}>
                    {/* Render standard pagination dots */}
                    <View style={styles.dotsContainer}>
                        {ONBOARDING_DATA.map((_, index) => (
                            <View
                                key={index}
                                style={[styles.dot, step === index && styles.dotActive]}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    icon: {
        fontSize: 90,
        marginBottom: 40,
    },
    title: {
        textAlign: 'center',
        marginBottom: 16,
        color: colors.primary,
    },
    description: {
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingBottom: 20,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border,
        marginHorizontal: 4,
    },
    dotActive: {
        width: 24,
        backgroundColor: colors.primary,
    }
});
