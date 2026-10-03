import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_CITY = 'Shivamogga';

export const weatherService = {
    /**
     * Fetch current weather conditions from OpenWeatherMap via FastAPI.
     * @param {string} city - City name (defaults to Shivamogga)
     * @returns {Promise<Object>} - Weather data: temperature, humidity, rainfall, wind_speed, etc.
     */
    getCurrentWeather: async (city = DEFAULT_CITY) => {
        try {
            const response = await api.get('/api/weather/current', {
                params: { city },
                timeout: 10000,
            });
            // Cache successful latest pull
            await AsyncStorage.setItem('cache_weather', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error('[WeatherService] Current Weather Error:', error);
            // Graceful Offline Fallback
            const cached = await AsyncStorage.getItem('cache_weather');
            if (cached) {
                console.log('[WeatherService] Network unreachable. Supplying cached weather data.');
                return JSON.parse(cached);
            }
            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || 'Failed to fetch weather data.');
            }
            throw new Error(error.message || 'Network error while fetching weather.');
        }
    },

    /**
     * Fetch comprehensive weather advisory with disease risk assessments.
     * @param {string} city - City name (defaults to Shivamogga)
     * @returns {Promise<Object>} - Advisory data: overall_risk, summary, risks[], recommendations[]
     */
    getAdvisory: async (city = DEFAULT_CITY) => {
        try {
            const response = await api.get('/api/weather/advisory', {
                params: { city },
                timeout: 15000,
            });
            // Cache successful risk data
            await AsyncStorage.setItem('cache_disease_risk', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error('[WeatherService] Advisory Error:', error);
            // Graceful Offline Fallback
            const cached = await AsyncStorage.getItem('cache_disease_risk');
            if (cached) {
                console.log('[WeatherService] Network unreachable. Supplying cached risk data.');
                return JSON.parse(cached);
            }
            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || 'Failed to fetch advisory.');
            }
            throw new Error(error.message || 'Network error while fetching advisory.');
        }
    },

    /**
     * Fetch 5-day weather forecast.
     * @param {string} city - City name (defaults to Shivamogga)
     * @returns {Promise<Object>} - Forecast data with daily breakdowns
     */
    getForecast: async (city = DEFAULT_CITY) => {
        try {
            const response = await api.get('/api/weather/forecast', {
                params: { city },
                timeout: 15000,
            });
            return response.data;
        } catch (error) {
            console.error('[WeatherService] Forecast Error:', error);
            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || 'Failed to fetch forecast.');
            }
            throw new Error(error.message || 'Network error while fetching forecast.');
        }
    },
};
