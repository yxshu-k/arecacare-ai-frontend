import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ScanPlantScreen from '../screens/ScanPlantScreen';
import ImagePreviewScreen from '../screens/ImagePreviewScreen';
import ResultScreen from '../screens/ResultScreen';
import TreatmentDetailsScreen from '../screens/TreatmentDetailsScreen';
import YieldInputScreen from '../screens/YieldInputScreen';
import YieldResultScreen from '../screens/YieldResultScreen';
import WeatherScreen from '../screens/WeatherScreen';
import DiseaseInfoScreen from '../screens/DiseaseInfoScreen';
import ChatAssistantScreen from '../screens/ChatAssistantScreen';

const Stack = createNativeStackNavigator();

export default function HomeNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="ScanPlant" component={ScanPlantScreen} />
            <Stack.Screen name="ImagePreview" component={ImagePreviewScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="TreatmentDetails" component={TreatmentDetailsScreen} />
            <Stack.Screen name="YieldInput" component={YieldInputScreen} />
            <Stack.Screen name="YieldResult" component={YieldResultScreen} />
            <Stack.Screen name="Weather" component={WeatherScreen} />
            <Stack.Screen name="DiseaseInfo" component={DiseaseInfoScreen} />
            <Stack.Screen name="ChatAssistant" component={ChatAssistantScreen} />
        </Stack.Navigator>
    );
}
