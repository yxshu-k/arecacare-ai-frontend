import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@tips_cache';
const CACHE_TIME_KEY = '@tips_cache_timestamp';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const tipsService = {
    /**
     * Generates or retrieves cached seasonal tips based on the current weather.
     */
    getSeasonalTips: async (weatherCondition = "Clear") => {
        try {
            // Check cache first
            const cachedTime = await AsyncStorage.getItem(CACHE_TIME_KEY);
            const cachedData = await AsyncStorage.getItem(CACHE_KEY);

            if (cachedTime && cachedData) {
                const age = Date.now() - parseInt(cachedTime, 10);
                if (age < CACHE_DURATION_MS) {
                    console.log("[TipsService] Returned cached advisory tips.");
                    return JSON.parse(cachedData);
                }
            }

            // Fetch new tips from Gemini backend
            const response = await api.get(`/api/tips/generate?weather=${encodeURIComponent(weatherCondition)}`);

            if (response.data && response.data.status === 'success') {
                const tips = response.data.tips;

                // Cache the newly generated tips
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(tips));
                await AsyncStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

                return tips;
            }
            throw new Error("Invalid response from server.");
        } catch (error) {
            console.error("Error fetching seasonal tips:", error);
            // Fallback to cache even if expired if network fails
            const cachedData = await AsyncStorage.getItem(CACHE_KEY);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            throw new Error("Unable to load advisory tips. Please check your connection.");
        }
    },

    /**
     * Force refresh the tips by bypassing the cache.
     */
    refreshTips: async (weatherCondition = "Clear") => {
        await AsyncStorage.removeItem(CACHE_KEY);
        await AsyncStorage.removeItem(CACHE_TIME_KEY);
        return tipsService.getSeasonalTips(weatherCondition);
    }
};
