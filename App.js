import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import OfflineNotice from './src/components/OfflineNotice';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <>
          <OfflineNotice isVisible={false} />
          <RootNavigator />
        </>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
