import api from './api';
import { Platform } from 'react-native';

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
            const token = Platform.OS === 'web'
                ? localStorage.getItem('auth_token')
                : await require('expo-secure-store').getItemAsync('auth_token');
            const res = await fetch(`${api.defaults.baseURL}/api/assistant/chat/voice`, {
                method: 'POST',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Failed to process voice command.');
            }
            return await res.json();
        } catch (error) {
            console.error('[ChatService] Voice Upload Error:', error);
            throw new Error(error.message || 'Network error while contacting AI Assistant.');
        }
    },

    /**
     * Fetch RAW Speech-to-Text transcription without triggering Gemini.
     */
    sendSpeechToText: async (audioUri, language = 'en') => {
        try {
            const formData = new FormData();
            const filename = audioUri.split('/').pop() || 'voice.m4a';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `audio/${match[1]}` : `audio/mp4`;

            formData.append('file', { uri: audioUri, name: filename, type: type });
            formData.append('language', language);

            console.log(`[ChatService] Sending STT audio...`);
            const token = Platform.OS === 'web'
                ? localStorage.getItem('auth_token')
                : await require('expo-secure-store').getItemAsync('auth_token');
            const res = await fetch(`${api.defaults.baseURL}/api/assistant/chat/speech-to-text`, {
                method: 'POST',
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Audio transcription failed.');
            }
            return await res.json(); // { text: "...", language: "..." }
        } catch (error) {
            console.error('[ChatService] STT Error:', error);
            throw new Error('Audio transcription failed.');
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

    /**
     * Fetch all aggregated chat sessions.
     */
    getSessions: async () => {
        try {
            const response = await api.get('/api/assistant/chat/sessions', {
                timeout: 10000,
            });
            return response.data; // returns { sessions: [...] }
        } catch (error) {
            console.error('[ChatService] Fetch Sessions Error:', error);
            return { sessions: [] };
        }
    },

    /**
     * Delete a specific chat session by ID.
     */
    deleteSession: async (sessionId) => {
        try {
            const response = await api.delete(`/api/assistant/chat/sessions/${sessionId}`);
            return response.data;
        } catch (error) {
            console.error('[ChatService] Delete Session Error:', error);
            throw new Error('Failed to delete session');
        }
    },

    /**
     * Wipes the entire history database for the user.
     */
    deleteAllSessions: async () => {
        try {
            const response = await api.delete('/api/assistant/chat/sessions');
            return response.data;
        } catch (error) {
            console.error('[ChatService] Clear History Error:', error);
            throw new Error('Failed to clear diagnostic history');
        }
    },
};
