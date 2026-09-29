import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import OfflineNotice from './src/components/OfflineNotice';

export default function App() {
  return (
    <AuthProvider>
      <>
        <OfflineNotice isVisible={false} />
        <RootNavigator />
      </>
    </AuthProvider>
  );
}
