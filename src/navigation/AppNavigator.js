import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import Screen from '../components/Screen';
import { AuthContext } from '../context/AuthContext';
import HomeNavigator from './HomeNavigator';
import HistoryScreen from '../screens/HistoryScreen';
import TipsScreen from '../screens/TipsScreen';
import ProfileNavigator from './ProfileNavigator';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

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
                component={HomeNavigator}
                options={{ tabBarIcon: ({ color }) => <Feather name="grid" size={24} color={color} /> }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ tabBarIcon: ({ color }) => <Feather name="clock" size={24} color={color} /> }}
            />
            <Tab.Screen
                name="Tips"
                component={TipsScreen}
                options={{ tabBarIcon: ({ color }) => <Feather name="book-open" size={24} color={color} /> }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileNavigator}
                options={{ tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} /> }}
            />
        </Tab.Navigator>
    );
}
