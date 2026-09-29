import React, { useState, useEffect } from 'react';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Temporary components just for demonstrating what happens after "Get Started"
import { View } from 'react-native';
import Screen from './src/components/Screen';
import AppText from './src/components/AppText';
import AppButton from './src/components/AppButton';
import Card from './src/components/Card';
import { colors } from './src/theme/colors';

export default function App() {
  // Navigation State: 'splash' -> 'onboarding' -> 'home'
  const [currentScreen, setCurrentScreen] = useState('splash');

  useEffect(() => {
    if (currentScreen === 'splash') {
      // Simulate backend connections and app loading for 2.5 seconds
      const timer = setTimeout(() => {
        setCurrentScreen('onboarding');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleOnboardingFinish = () => {
    setCurrentScreen('home'); // User clicks Get Started, moves to Home
  };

  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  // Temporary Home Screen (Phase 2 Component Test)
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
        <AppText variant="heading1">ArecaCare AI</AppText>
        <AppText variant="bodyMedium" style={{ color: colors.primary, marginBottom: 32 }}>
          Smart Arecanut Disease Detection
        </AppText>

        <Card style={{ marginBottom: 40 }}>
          <AppText variant="heading3">Phase 3 Complete! 🎉</AppText>
          <AppText variant="body" color="textMedium" style={{ marginTop: 8 }}>
            We've successfully built the Splash and Onboarding experience. Our official multi-screen Navigation architecture will be built in Phase 5.
          </AppText>
        </Card>

        <AppButton
          title="Restart App Setup"
          variant="outline"
          onPress={() => setCurrentScreen('splash')}
        />
      </View>
    </Screen>
  );
}
