import api from './api';

export const diseaseService = {
    /**
     * Upload an image to the backend for disease prediction.
     * @param {string} imageUri - The local URI of the image from expo-image-picker
     * @returns {Promise<Object>} - The backend prediction response
     */
    predict: async (imageUri) => {
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
                timeout: 30000
            });

            if (response.data.status === 'error' || response.data.status === 'invalid') {
                throw new Error(response.data.message || 'Image classification failed.');
            }

            return response.data;
        } catch (error) {
            console.error('[DiseaseService] Prediction Error:', error);

            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || error.response.data.message || 'Image prediction failed.');
            }
            throw new Error(error.message || 'Network error during prediction. Is the ML backend running?');
        }
    }
};
