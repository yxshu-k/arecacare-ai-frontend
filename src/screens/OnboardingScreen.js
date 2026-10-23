import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
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
        title: 'AI-Powered Care',
        description: 'Smart disease detection and agricultural advisory right in your pocket. Protect your crops with AI.'
    },
    {
        icon: 'camera',
        title: 'Early Detection',
        description: 'Snap a picture of a leaf to instantly identify diseases like Leaf Spot, Yellow Leaf, and Bud Rot.'
    },
    {
        icon: 'trending-up',
        title: 'Better Yield',
        description: 'Get actionable treatments, calculate yield predictions, and receive tailored farming tips.'
    }
];

export default function OnboardingScreen({ navigation }) {
    const { colors, isDarkMode } = useTheme();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const [step, setStep] = useState(0);

    const handleNext = async () => {
        if (step < ONBOARDING_DATA.length - 1) {
            setStep(step + 1);
        } else {
            try {
                await SecureStore.setItemAsync('has_onboarded', 'true');
            } catch (e) {}
            navigation.replace('Login');
        }
    };

    const currentData = ONBOARDING_DATA[step];
    const isLast = step === ONBOARDING_DATA.length - 1;

    return (
        <Screen>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.imagePlaceholder}>
                        <Feather name={currentData.icon} size={80} color={colors.primary} />
                    </View>
                    <AppText variant="heading2" style={styles.title}>{currentData.title}</AppText>
                    <AppText variant="body" color="textMedium" style={styles.description}>
                        {currentData.description}
                    </AppText>
                </View>

                <View style={styles.footer}>
                    <View style={styles.dotsContainer}>
                        {ONBOARDING_DATA.map((_, index) => (
                            <View key={index} style={[styles.dot, step === index && styles.dotActive]} />
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
    container: { flex: 1, justifyContent: 'space-between', paddingVertical: 30 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    imagePlaceholder: {
        width: width * 0.6,
        height: width * 0.6,
        backgroundColor: isDarkMode ? 'rgba(5, 150, 105, 0.2)' : '#E8F5E9',
        borderWidth: isDarkMode ? 1 : 0,
        borderColor: isDarkMode ? '#064E3B' : 'transparent',
        borderRadius: (width * 0.6) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: { textAlign: 'center', marginBottom: 16, color: colors.primary },
    description: { textAlign: 'center', lineHeight: 26, color: colors.textMedium },
    footer: { paddingBottom: 20 },
    dotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginHorizontal: 6 },
    dotActive: { width: 32, backgroundColor: colors.primary }
});
