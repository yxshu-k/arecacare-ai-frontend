import { Alert } from 'react-native';

export const notificationService = {
    /**
     * Request OS level permissions for Push Notifications
     */
    requestPermissionsAsync: async () => {
        return true; // Mocked for Expo Go compatibility
    },

    /**
     * Schedule a local notification without a backend server
     * @param {string} diseaseName 
     * @param {number} secondsDelay 
     */
    scheduleTreatmentReminder: async (diseaseName, secondsDelay = 5) => {
        try {
            console.log(`[Notification Service Mock] Alert requested for ${diseaseName}.`);

            // Simulating the delay for the native push
            setTimeout(() => {
                Alert.alert("🌱 Treatment Reminder", `It is time to re-apply your treatment for ${diseaseName}. Check ArecaCare AI for details.`);
            }, secondsDelay * 1000);

            return true;
        } catch (err) {
            console.error('[Notification Service] Failed to schedule reminder', err);
            return false;
        }
    }
};
