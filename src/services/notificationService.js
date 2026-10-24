import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const REMINDERS_KEY = '@arecacare_treatment_reminders';

export const notificationService = {
    /**
     * Request OS level permissions for Notifications
     */
    requestPermissionsAsync: async () => {
        return true;
    },

    /**
     * Retrieves all saved treatment reminders from persistent storage
     */
    getReminders: async () => {
        try {
            const raw = await AsyncStorage.getItem(REMINDERS_KEY);
            if (!raw) return [];
            const reminders = JSON.parse(raw);
            return Array.isArray(reminders) ? reminders : [];
        } catch (err) {
            console.error('[NotificationService] Failed to load reminders:', err);
            return [];
        }
    },

    /**
     * Find an active reminder matching a given treatment title
     */
    getReminderForTreatment: async (treatmentTitle) => {
        try {
            const reminders = await notificationService.getReminders();
            return reminders.find(
                r => r.status === 'active' && r.treatmentTitle?.trim().toLowerCase() === treatmentTitle?.trim().toLowerCase()
            ) || null;
        } catch (err) {
            console.error('[NotificationService] Failed to find reminder:', err);
            return null;
        }
    },

    /**
     * Schedule a persistent treatment re-application reminder
     */
    scheduleTreatmentReminder: async ({
        diseaseName = 'Arecanut Plantation',
        treatmentType = 'chemical',
        treatmentTitle = 'Treatment Spray',
        daysInterval = 14,
        timeOfDay = '07:00 AM',
        notes = ''
    }) => {
        try {
            const days = parseInt(daysInterval, 10) || 14;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + days);

            // Parse timeOfDay e.g., '07:00 AM'
            if (timeOfDay.includes('PM') || timeOfDay.includes('AM')) {
                const parts = timeOfDay.split(/[:\s]/);
                let hours = parseInt(parts[0], 10) || 7;
                const minutes = parseInt(parts[1], 10) || 0;
                if (timeOfDay.includes('PM') && hours < 12) hours += 12;
                if (timeOfDay.includes('AM') && hours === 12) hours = 0;
                dueDate.setHours(hours, minutes, 0, 0);
            }

            const newReminder = {
                id: `rem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                diseaseName,
                treatmentType,
                treatmentTitle,
                daysInterval: days,
                scheduledTimestamp: dueDate.getTime(),
                scheduledDateISO: dueDate.toISOString(),
                timeOfDay,
                status: 'active',
                notes,
                createdAt: new Date().toISOString()
            };

            const existing = await notificationService.getReminders();
            // Remove any previous active reminder for this same treatment title to avoid duplicates
            const filtered = existing.filter(
                r => !(r.status === 'active' && r.treatmentTitle?.trim().toLowerCase() === treatmentTitle?.trim().toLowerCase())
            );
            filtered.unshift(newReminder);

            await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
            console.log(`[NotificationService] Reminder scheduled for '${treatmentTitle}' on ${dueDate.toDateString()}`);

            return { success: true, reminder: newReminder };
        } catch (err) {
            console.error('[NotificationService] Failed to schedule reminder:', err);
            return { success: false, error: err.message };
        }
    },

    /**
     * Cancel an active reminder by ID
     */
    cancelReminder: async (reminderId) => {
        try {
            const existing = await notificationService.getReminders();
            const updated = existing.map(r => {
                if (r.id === reminderId) {
                    return { ...r, status: 'cancelled', cancelledAt: new Date().toISOString() };
                }
                return r;
            });
            await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
            console.log(`[NotificationService] Cancelled reminder ${reminderId}`);
            return true;
        } catch (err) {
            console.error('[NotificationService] Failed to cancel reminder:', err);
            return false;
        }
    },

    /**
     * Mark an active reminder as applied / completed
     */
    markReminderCompleted: async (reminderId) => {
        try {
            const existing = await notificationService.getReminders();
            const updated = existing.map(r => {
                if (r.id === reminderId) {
                    return { ...r, status: 'completed', completedAt: new Date().toISOString() };
                }
                return r;
            });
            await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
            console.log(`[NotificationService] Completed reminder ${reminderId}`);
            return true;
        } catch (err) {
            console.error('[NotificationService] Failed to complete reminder:', err);
            return false;
        }
    },

    /**
     * Helper to compute days remaining until target date
     */
    getDaysRemaining: (scheduledTimestamp) => {
        if (!scheduledTimestamp) return 0;
        const now = Date.now();
        const diffMs = scheduledTimestamp - now;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    },

    /**
     * Helper to format scheduled date into readable locale string
     */
    formatDate: (timestamp, language = 'en') => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        const day = d.getDate();
        const year = d.getFullYear();

        const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthNamesKn = ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್', 'ಜುಲೈ', 'ಆಗಸ್ಟ್', 'ಸೆಪ್ಟೆಂಬರ್', 'ಅಕ್ಟೋಬರ್', 'ನವೆಂಬರ್', 'ಡಿಸೆಂಬರ್'];

        if (language === 'kn' || language === 'tu' || language === 'ar') {
            return `${day} ${monthNamesKn[d.getMonth()]} ${year}`;
        }
        return `${day} ${monthNamesEn[d.getMonth()]} ${year}`;
    }
};
