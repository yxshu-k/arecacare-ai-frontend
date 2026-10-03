import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from './syncService';

export const diseaseService = {
    /**
     * Upload an image to the backend for disease prediction, with automatic retries and progress tracking.
     * @param {string} imageUri - The local URI of the image from expo-image-picker
     * @param {function} onUploadProgress - Callback for Axios to track upload percentage
     * @param {number} retries - Number of remaining retries before failing
     * @returns {Promise<Object>} - The backend prediction response
     */
    predict: async (imageUri, onUploadProgress = null, retries = 3) => {
        try {
            // Because we are uploading a file, we MUST use multipart/form-data
            const formData = new FormData();

            // Extract the filename from the URI. If none exists, provide a generic one.
            const filename = imageUri.split('/').pop() || 'scan.jpg';

            // Extract the file extension to guess the MIME type
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            // Append the image in standard React Native FormData style
            formData.append('file', {
                uri: imageUri,
                name: filename,
                type: type,
            });

            // The 'api.js' Axios instance handles Authorization Bearer headers automatically,
            // but we MUST override the Content-Type manually for THIS request!
            const response = await api.post('/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // Extending timeout for ML Inference which might take 10+ seconds sometimes
                timeout: 30000,
                onUploadProgress: (progressEvent) => {
                    if (onUploadProgress && progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onUploadProgress(percentCompleted);
                    }
                }
            });

            if (response.data.status === 'error' || response.data.status === 'invalid') {
                throw new Error(response.data.message || 'Image classification failed.');
            }

            return response.data;
        } catch (error) {
            console.error(`[DiseaseService] Prediction Error (Retries left: ${retries}):`, error);

            if (retries > 0) {
                // Exponential backoff or simple delay before retry
                console.log(`[DiseaseService] Retrying upload...`);
                await new Promise(resolve => setTimeout(resolve, 1500));
                return diseaseService.predict(imageUri, onUploadProgress, retries - 1);
            }

            // If we've exhausted retries OR explicitly hit a hard network fault
            if (error.message === 'Network Error' || error.code === 'ECONNABORTED' || retries === 0) {
                console.log('[DiseaseService] Network faulted! Deflecting scan into SyncService Offline Queue...');
                await syncService.queueOfflineScan(imageUri);
                return {
                    disease_name: "Queued for Cloud Sync",
                    confidence: 100,
                    isOffline: true,
                    details: "Your image was saved on the device. We will analyze it instantly once a stable network connects."
                };
            }

            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || error.response.data.message || 'Image prediction failed.');
            }
            throw new Error(error.message || 'Network error during prediction. Is the ML backend running?');
        }
    },

    /**
     * Fetch user's scan history from the backend, supporting Offline Graceful Fallbacks.
     * @returns {Promise<Array>} - List of past predictions
     */
    getHistory: async () => {
        try {
            const response = await api.get('/api/predictions/history');
            await AsyncStorage.setItem('cache_disease_history', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.warn('[DiseaseService] History Network Error:', error.message);
            // Intercept standard fail with Offline Cache Hit
            const cached = await AsyncStorage.getItem('cache_disease_history');
            if (cached) {
                return JSON.parse(cached);
            }
            throw new Error(error.response?.data?.message || 'Failed to load history and no cache active.');
        }
    },

    deleteHistoryItem: async (id) => {
        try {
            const response = await api.delete(`/api/predictions/${id}`);
            // Force refresh history cache after successful deletion
            const historyResponse = await api.get('/api/predictions/history');
            await AsyncStorage.setItem('cache_disease_history', JSON.stringify(historyResponse.data));
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to delete scan.');
        }
    },

    clearAllHistory: async () => {
        try {
            const response = await api.delete('/api/predictions/clear-all');
            await AsyncStorage.removeItem('cache_disease_history');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to clear history.');
        }
    }
};
