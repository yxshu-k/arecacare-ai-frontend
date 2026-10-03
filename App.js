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

export default function App() {
  const [isSplashComplete, setSplashComplete] = useState(false);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <View style={{ flex: 1 }}>
              <OfflineNotice isVisible={false} />

              {!isSplashComplete ? (
                <CustomSplashScreen onAnimationDone={() => setSplashComplete(true)} />
              ) : null}

              <RootNavigator />
            </View>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
