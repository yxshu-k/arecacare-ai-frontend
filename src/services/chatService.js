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
