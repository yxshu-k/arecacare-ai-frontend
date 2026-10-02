import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';
import { AuthContext } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';

// Mock Services
jest.mock('../services/weatherService', () => ({
    weatherService: {
        getCurrentWeather: jest.fn().mockResolvedValue({ temperature: 28, weather_condition: 'Sunny' })
    }
}));
jest.mock('../services/diseaseService', () => ({
    diseaseService: {
        getHistory: jest.fn().mockResolvedValue([])
    }
}));
jest.mock('../services/syncService', () => ({
    syncService: { processQueue: jest.fn() }
}));
jest.mock('@react-navigation/native', () => {
    return {
        ...jest.requireActual('@react-navigation/native'),
        useFocusEffect: jest.fn((cb) => cb()),
    };
});

describe('HomeScreen Dashboard Rendering', () => {
    it('renders the Dashboard header effortlessly with AuthContext mock', () => {

        const mockUserData = { name: 'Ramesh', region: 'Shivamogga' };

        // Wrap screen tightly in required Context providers
        const { getByText } = render(
            <AuthContext.Provider value={{ userData: mockUserData, logout: jest.fn() }}>
                <LanguageProvider>
                    <ThemeProvider>
                        <HomeScreen navigation={{ navigate: jest.fn() }} />
                    </ThemeProvider>
                </LanguageProvider>
            </AuthContext.Provider>
        );

        // Core visual assertions matching UI elements
        expect(getByText('Hello, Ramesh 👋')).toBeTruthy();
        expect(getByText('Scan Plant')).toBeTruthy();
        expect(getByText('Yield Predictor')).toBeTruthy();
    });
});
