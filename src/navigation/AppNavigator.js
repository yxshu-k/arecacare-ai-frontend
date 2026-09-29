import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import Screen from '../components/Screen';
import { AuthContext } from '../context/AuthContext';
import HomeScreen from '../screens/HomeScreen';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

// --- Temporary Mock Screens for Tabs (Will be replaced in later phases) ---
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
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    elevation: 10,
                    shadowColor: colors.black,
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                }
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={HomeScreen}
                options={{ tabBarIcon: ({ color }) => <Feather name="grid" size={24} color={color} /> }}
            />
            <Tab.Screen
                name="History"
                component={DummyHistory}
                options={{ tabBarIcon: ({ color }) => <Feather name="clock" size={24} color={color} /> }}
            />
            <Tab.Screen
                name="Profile"
                component={DummyProfile}
                options={{ tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} /> }}
            />
            <Tab.Screen
                name="Settings"
                component={DummySettings}
                options={{ tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} /> }}
            />
        </Tab.Navigator>
    );
}
