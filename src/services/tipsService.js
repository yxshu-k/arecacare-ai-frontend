import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getCacheKey = (lang) => `@tips_cache_${lang || 'en'}`;
const getCacheTimeKey = (lang) => `@tips_cache_timestamp_${lang || 'en'}`;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const tipsService = {
    /**
     * Generates or retrieves cached seasonal tips based on the current weather and selected language.
     */
    getSeasonalTips: async (weatherCondition = "Clear", language = "en") => {
        const cacheKey = getCacheKey(language);
        const cacheTimeKey = getCacheTimeKey(language);

        try {
            // Check cache for current language first
            const cachedTime = await AsyncStorage.getItem(cacheTimeKey);
            const cachedData = await AsyncStorage.getItem(cacheKey);

            if (cachedTime && cachedData) {
                const age = Date.now() - parseInt(cachedTime, 10);
                if (age < CACHE_DURATION_MS) {
                    console.log(`[TipsService] Returned cached advisory tips for language '${language}'.`);
                    return JSON.parse(cachedData);
                }
            }

            // Fetch new tips from Gemini backend with language parameter
            const response = await api.get(
                `/api/tips/generate?weather=${encodeURIComponent(weatherCondition)}&lang=${encodeURIComponent(language || 'en')}`
            );

            if (response.data && response.data.status === 'success') {
                const tips = response.data.tips;

                // Cache the newly generated tips under this specific language
                await AsyncStorage.setItem(cacheKey, JSON.stringify(tips));
                await AsyncStorage.setItem(cacheTimeKey, Date.now().toString());

                return tips;
            }
            throw new Error("Invalid response from server.");
        } catch (error) {
            console.error(`Error fetching seasonal tips (${language}):`, error);
            // Fallback to cache even if expired if network fails
            const cachedData = await AsyncStorage.getItem(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            throw new Error("Unable to load advisory tips. Please check your connection.");
        }
    },

    /**
     * Force refresh the tips for the selected language by bypassing the cache.
     */
    refreshTips: async (weatherCondition = "Clear", language = "en") => {
        const cacheKey = getCacheKey(language);
        const cacheTimeKey = getCacheTimeKey(language);
        await AsyncStorage.removeItem(cacheKey);
        await AsyncStorage.removeItem(cacheTimeKey);
        return tipsService.getSeasonalTips(weatherCondition, language);
    }
};
