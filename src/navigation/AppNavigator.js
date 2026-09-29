import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import Screen from '../components/Screen';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

// --- Temporary Mock Screens for Tabs (Will be replaced in later phases) ---
const DummyHome = () => {
    const { logout, userData } = useContext(AuthContext);
    return (
        <Screen>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <AppText variant="heading2" style={{ color: colors.primary }}>Home Dashboard</AppText>
                <AppText variant="body" style={{ marginVertical: 20 }}>Welcome, {userData?.name || 'Farmer'}!</AppText>
                <AppButton title="Logout" onPress={logout} variant="outline" />
            </View>
        </Screen>
    );
};

const DummyHistory = () => <Screen><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><AppText variant="heading2">History</AppText></View></Screen>;
const DummyProfile = () => <Screen><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><AppText variant="heading2">Profile</AppText></View></Screen>;
const DummySettings = () => <Screen><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><AppText variant="heading2">Settings</AppText></View></Screen>;
// -------------------------------------------------------------------------

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textLight,
            }}
        >
            <Tab.Screen
                name="Home"
                component={DummyHome}
                options={{ tabBarIcon: ({ color }) => <AppText style={{ color, fontSize: 20 }}>🏠</AppText> }}
            />
            <Tab.Screen
                name="History"
                component={DummyHistory}
                options={{ tabBarIcon: ({ color }) => <AppText style={{ color, fontSize: 20 }}>📋</AppText> }}
            />
            <Tab.Screen
                name="Profile"
                component={DummyProfile}
                options={{ tabBarIcon: ({ color }) => <AppText style={{ color, fontSize: 20 }}>👤</AppText> }}
            />
            <Tab.Screen
                name="Settings"
                component={DummySettings}
                options={{ tabBarIcon: ({ color }) => <AppText style={{ color, fontSize: 20 }}>⚙️</AppText> }}
            />
        </Tab.Navigator>
    );
}
