import { diseaseService } from '../services/diseaseService';
import { syncService } from '../services/syncService';
import api from '../services/api';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../services/syncService', () => ({
    syncService: {
        queueOfflineScan: jest.fn(),
        processQueue: jest.fn()
    }
}));

describe('DiseaseService Offline Architecture', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('intercepts catastrophic Network Error and pipes to SyncService Queue', async () => {
        // Arrange
        const mockError = new Error('Network Error');
        api.post.mockRejectedValueOnce(mockError);

        const dummyUri = 'file://mock/apple_leaf.jpg';

        // Act
        const result = await diseaseService.predict(dummyUri, null, 0); // 0 retries immediately forces catch block

        // Assert
        expect(api.post).toHaveBeenCalled();
        expect(syncService.queueOfflineScan).toHaveBeenCalledWith(dummyUri);
        expect(result.disease_name).toBe('Queued for Cloud Sync');
        expect(result.isOffline).toBe(true);
    });

    it('throws standard Exception if it is not a network failure', async () => {
        // Arrange
        const mockBackendError = {
            response: { data: { message: 'Image too blurry.' } }
        };
        api.post.mockRejectedValueOnce(mockBackendError);

        // Act & Assert
        await expect(diseaseService.predict('file://test.jpg', null, 0)).rejects.toThrow('Image too blurry.');
        expect(syncService.queueOfflineScan).not.toHaveBeenCalled();
    });
});
