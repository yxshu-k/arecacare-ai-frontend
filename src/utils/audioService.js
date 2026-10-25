/**
 * Modern Audio Service for ArecaCare AI
 * Uses modern Expo SDK 58 `expo-audio`.
 */

let ExpoAudioModule = null;
let RecordingPresets = null;
try {
    const expoAudio = require('expo-audio');
    ExpoAudioModule = expoAudio.AudioModule || expoAudio.default;
    RecordingPresets = expoAudio.RecordingPresets;
} catch (e) {
    // expo-audio not available
}

export const isAudioHardwareAvailable = () => {
    return !!ExpoAudioModule?.AudioRecorder;
};

export const requestMicrophonePermission = async () => {
    if (ExpoAudioModule?.requestRecordingPermissionsAsync) {
        const res = await ExpoAudioModule.requestRecordingPermissionsAsync();
        return res.granted;
    }
    return false;
};

export const createAudioRecorder = async () => {
    if (ExpoAudioModule?.AudioRecorder) {
        try {
            await ExpoAudioModule.setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
            const options = RecordingPresets?.HIGH_QUALITY || {};
            const recorder = new ExpoAudioModule.AudioRecorder(options);
            await recorder.prepareToRecordAsync();
            recorder.record();
            return {
                engine: 'expo-audio',
                recorder,
                stop: async () => {
                    await recorder.stop();
                    return recorder.uri;
                }
            };
        } catch (err) {
            console.warn('[AudioService] expo-audio record error:', err);
            throw err;
        }
    }

    throw new Error('No compatible native audio recording driver found.');
};

