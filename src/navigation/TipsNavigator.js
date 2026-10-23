import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TipsScreen from '../screens/TipsScreen';
import TipDetailScreen from '../screens/TipDetailScreen';

const Stack = createNativeStackNavigator();

export default function TipsNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TipsMain" component={TipsScreen} />
            <Stack.Screen name="TipDetail" component={TipDetailScreen} />
        </Stack.Navigator>
    );
}
