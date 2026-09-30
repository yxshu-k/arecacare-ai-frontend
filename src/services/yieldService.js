import api from './api';

export const yieldService = {
    /**
     * Send farm parameters to the dedicated yield prediction endpoint.
     * Targets: POST /api/yield/predict
     *
     * @param {Object} params - Farm parameters
     * @param {string} params.soilType - Type of soil (Loamy, Sandy, etc.)
     * @param {string} params.rainfall - Average rainfall in mm
     * @param {string} params.age - Age of plants in years
     * @param {string} params.area - Farm area in acres
     * @returns {Promise<Object>} - Structured yield prediction from Gemini AI
     */
    predictYield: async ({ soilType, rainfall, age, area }) => {
        try {
            const response = await api.post('/api/yield/predict', {
                soil_type: soilType.trim(),
                rainfall_mm: parseFloat(rainfall),
                plant_age_years: parseInt(age, 10),
                area_acres: parseFloat(area),
            }, {
                timeout: 30000,
            });

            return response.data;
        } catch (error) {
            console.error('[YieldService] Prediction Error:', error);

            if (error.response?.data?.detail) {
                // Handle Pydantic validation errors (array of error objects)
                const detail = error.response.data.detail;
                if (Array.isArray(detail)) {
                    const messages = detail.map(d => d.msg || d.message || JSON.stringify(d));
                    throw new Error(messages.join('\n'));
                }
                throw new Error(detail);
            }

            throw new Error(error.message || 'Network error during yield prediction.');
        }
    },
};
