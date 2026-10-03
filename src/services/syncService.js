import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const QUEUE_KEY = 'offline_scan_queue';

export const syncService = {
    /**
     * Store a failed or offline image scan into a queue.
     * @param {string} localUri - Local file path of the image.
     */
    queueOfflineScan: async (localUri) => {
        try {
            const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
            const queue = queueStr ? JSON.parse(queueStr) : [];
            queue.push({
                uri: localUri,
                timestamp: Date.now()
            });
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            console.log(`[SyncService] Queued scan offline: ${localUri}`);
        } catch (error) {
            console.error('[SyncService] Queue Error:', error);
        }
    },

    /**
     * Iterates through the offline queue and attempts to upload pending scans.
     */
    processQueue: async () => {
        try {
            const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
            if (!queueStr) return;

            const queue = JSON.parse(queueStr);
            if (queue.length === 0) return;

            console.log(`[SyncService] Processing offline queue: ${queue.length} items pending...`);
            let successfullyUploaded = 0;
            const remainingQueue = [];

            for (const item of queue) {
                try {
                    // Re-construct formData dummy to hit predict
                    const formData = new FormData();
                    formData.append('file', {
                        uri: item.uri,
                        name: 'offline_sync.jpg',
                        type: 'image/jpeg',
                    });

                    // Push directly to API to prevent circular dependencies with diseaseService
                    await api.post('/predict', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        timeout: 30000
                    });

                    successfullyUploaded += 1;
                    console.log(`[SyncService] Successfully flushed queued scan.`);
                } catch (err) {
                    // If network fails again, keep it in queue
                    remainingQueue.push(item);
                }
            }

            // Sync the remainder back to hardware
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));

            if (successfullyUploaded > 0) {
                console.log(`[SyncService] Flushed ${successfullyUploaded} items. ${remainingQueue.length} items remain queued.`);
            }

        } catch (error) {
            console.error('[SyncService] Process Error:', error);
        }
    }
};
