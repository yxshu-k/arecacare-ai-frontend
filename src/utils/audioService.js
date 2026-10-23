/**
 * Universal Audio Service for ArecaCare AI
 * Supports modern Expo SDK 52+ / 57 via `expo-audio` (native in Expo Go)
 * with graceful fallback to `expo-av` for custom binary builds.
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

let LegacyAudio = null;
try {
    LegacyAudio = require('expo-av').Audio;
} catch (e) {
    // expo-av not available
}

export const isAudioHardwareAvailable = () => {
    return !!(ExpoAudioModule?.AudioRecorder || LegacyAudio?.Recording);
};

export const requestMicrophonePermission = async () => {
    if (ExpoAudioModule?.requestRecordingPermissionsAsync) {
        const res = await ExpoAudioModule.requestRecordingPermissionsAsync();
        return res.granted;
    }
    if (LegacyAudio?.requestPermissionsAsync) {
        const res = await LegacyAudio.requestPermissionsAsync();
        return res.status === 'granted';
    }
    return false;
};

export const createAudioRecorder = async () => {
    // Try modern expo-audio first (Expo Go compatible)
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
            console.warn('[AudioService] expo-audio start error, trying legacy fallback:', err);
        }
    }

    // Try legacy expo-av
    if (LegacyAudio?.Recording) {
        try {
            await LegacyAudio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await LegacyAudio.Recording.createAsync(
                LegacyAudio.RecordingOptionsPresets.HIGH_QUALITY
            );
            return {
                engine: 'expo-av',
                recorder: recording,
                stop: async () => {
                    await recording.stopAndUnloadAsync();
                    return recording.getURI();
                }
            };
        } catch (err) {
            console.warn('[AudioService] expo-av start error:', err);
            throw err;
        }
    }

    throw new Error('No compatible native audio recording driver found.');
};
