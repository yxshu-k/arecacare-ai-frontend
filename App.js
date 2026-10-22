import React from 'react';
import { View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';
import OfflineNotice from './src/components/OfflineNotice';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomSplashScreen from './src/screens/CustomSplashScreen';
import { useState } from 'react';
import { useTheme } from './src/context/ThemeContext';

function AppContent({ isSplashComplete, setSplashComplete }) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <OfflineNotice isVisible={false} />

      {!isSplashComplete ? (
        <CustomSplashScreen onAnimationDone={() => setSplashComplete(true)} />
      ) : null}

      <RootNavigator />
    </View>
  );
}

export default function App() {
  const [isSplashComplete, setSplashComplete] = useState(false);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent
              isSplashComplete={isSplashComplete}
              setSplashComplete={setSplashComplete}
            />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
