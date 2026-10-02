import api from './api';

export const chatService = {
    /**
     * Send a chat message to the Gemini-powered AI assistant.
     * @param {string} message - The user's question
     * @param {string} sessionId - Session ID for conversation memory
     * @returns {Promise<Object>} - AI response with message, response, session_id
     */
    sendMessage: async (message, sessionId = 'mobile_chat') => {
        try {
            const response = await api.post('/api/assistant/chat', {
                message: message,
                session_id: sessionId,
                language: 'en',
            }, {
                timeout: 30000,
            });
            return response.data;
        } catch (error) {
            console.error('[ChatService] Send Error:', error);
            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || 'AI Assistant failed to respond.');
            }
            throw new Error(error.message || 'Network error while contacting AI Assistant.');
        }
    },

    /**
     * Upload an audio snippet to Gemini AI Assistant.
     * @param {string} audioUri - Audio file URI
     * @param {string} sessionId - Chat session ID
     * @param {string} language - Target language code
     */
    sendVoiceMessage: async (audioUri, sessionId = 'mobile_chat', language = 'en') => {
        try {
            const formData = new FormData();

            // Generate basic name + infer type
            const filename = audioUri.split('/').pop() || 'voice.m4a';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `audio/${match[1]}` : `audio/mp4`;

            formData.append('file', {
                uri: audioUri,
                name: filename,
                type: type,
            });
            formData.append('session_id', sessionId);
            formData.append('language', language);

            console.log(`[ChatService] Sending voice upload to backend: `, filename);
            const response = await api.post('/api/assistant/chat/voice', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000,
            });
            return response.data;
        } catch (error) {
            console.error('[ChatService] Voice Upload Error:', error);
            if (error.response && error.response.data) {
                throw new Error(error.response.data.detail || 'Failed to process voice command.');
            }
            throw new Error(error.message || 'Network error while contacting AI Assistant.');
        }
    },

    /**
     * Fetch chat history for a given session.
     * @param {string} sessionId - Session ID
     * @returns {Promise<Array>} - Array of chat history items
     */
    getHistory: async (sessionId = 'mobile_chat') => {
        try {
            const response = await api.get(`/api/assistant/chat/history/${sessionId}`, {
                timeout: 15000,
            });
            return response.data;
        } catch (error) {
            console.error('[ChatService] History Error:', error);
            return [];
        }
    },
};
