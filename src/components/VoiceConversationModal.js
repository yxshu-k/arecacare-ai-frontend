import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    Platform,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    Easing,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

import AppText from './AppText';
import { 
    isAudioHardwareAvailable, 
    requestMicrophonePermission, 
    createAudioRecorder 
} from '../utils/audioService';
import { chatService } from '../services/chatService';

const { width, height } = Dimensions.get('window');

const SPEECH_LANG_MAP = {
    en: 'en-IN',
    kn: 'kn-IN',
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    tu: 'kn-IN',
};

const STATUS_TEXT = {
    en: {
        listening: 'Listening to your voice...',
        thinking: 'AgriBot is thinking...',
        speaking: 'AgriBot is speaking...',
        idle: 'Tap the orb to start talking',
        tapToStop: 'Tap orb when done',
        tapToInterrupt: 'Tap orb to interrupt',
        end: 'End Voice Mode',
    },
    kn: {
        listening: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...',
        thinking: 'ಅಗ್ರೋಬಾಟ್ ಆಲೋಚಿಸುತ್ತಿದೆ...',
        speaking: 'ಅಗ್ರೋಬಾಟ್ ಮಾತನಾಡುತ್ತಿದೆ...',
        idle: 'ಮಾತನಾಡಲು ಆಬ್೯ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ',
        tapToStop: 'ಮಾತನಾಡಿ ಮುಗಿದ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ',
        tapToInterrupt: 'ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
        end: 'ಧ್ವನಿ ಮೋಡ್ ಮುಕ್ತಾಯ',
    },
    hi: {
        listening: 'आपकी आवाज़ सुनी जा रही है...',
        thinking: 'एग्रीबॉट सोच रहा है...',
        speaking: 'एग्रीबॉट बोल रहा है...',
        idle: 'बात करने के लिए ऑर्ब पर टैप करें',
        tapToStop: 'बोलने के बाद टैप करें',
        tapToInterrupt: 'रोकने के लिए टैप करें',
        end: 'वॉयस मोड समाप्त करें',
    },
    ta: {
        listening: 'உங்கள் குரலைக் கேட்கிறது...',
        thinking: 'அக்ரிபாட் யோசிக்கிறது...',
        speaking: 'அக்ரிபாட் பேசுகிறது...',
        idle: 'பேச உருண்டையைத் தொடவும்',
        tapToStop: 'பேசி முடித்ததும் தொடவும்',
        tapToInterrupt: 'நிறுத்த தொடவும்',
        end: 'குரல் பயன்முறையை முடிக்கவும்',
    },
    te: {
        listening: 'మీ స్వరాన్ని వింటోంది...',
        thinking: 'అగ్రిబాట్ ఆలోచిస్తోంది...',
        speaking: 'అగ్రిబాట్ మాట్లాడుతోంది...',
        idle: 'మాట్లాడటానికి ఆర్బ్‌పై నొక్కండి',
        tapToStop: 'మాట్లాడటం పూర్తయ్యాక నొక్కండి',
        tapToInterrupt: 'ఆపడానికి నొక్కండి',
        end: 'వాయిస్ మోడ్ ముగించు',
    },
    ml: {
        listening: 'നിങ്ങളുടെ ശബ്ദം കേൾക്കുന്നു...',
        thinking: 'അഗ്രിബോട്ട് ചിന്തിക്കുന്നു...',
        speaking: 'അഗ്രിബോട്ട് സംസാരിക്കുന്നു...',
        idle: 'സംസാരിക്കാൻ ഓർബിൽ തൊടുക',
        tapToStop: 'സംസാരിച്ച ശേഷം തൊടുക',
        tapToInterrupt: 'നിർത്താൻ തൊടുക',
        end: 'വോയ്‌സ് മോഡ് അവസാനിപ്പിക്കുക',
    },
};

export default function VoiceConversationModal({
    visible,
    onClose,
    sessionId,
    language = 'en',
    activeFarm = null,
    onNewTurn = null,
}) {
    // Mode: 'idle' | 'listening' | 'thinking' | 'speaking'
    const [mode, setMode] = useState('idle');
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [currentReply, setCurrentReply] = useState('');
    const [autoLoop, setAutoLoop] = useState(true);

    // Recording reference & state
    const recorderRef = useRef(null);
    const isRecordingRef = useRef(false);
    const isStoppingRef = useRef(false);
    const activeRef = useRef(visible);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rippleAnim1 = useRef(new Animated.Value(1)).current;
    const rippleAnim2 = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const loc = STATUS_TEXT[language] || STATUS_TEXT.en;

    // Keep activeRef in sync
    useEffect(() => {
        activeRef.current = visible;
        if (visible) {
            setCurrentTranscript('');
            setCurrentReply('');
            // Auto start first listening turn after modal opens smoothly
            const timer = setTimeout(() => {
                if (activeRef.current) {
                    startListening();
                }
            }, 600);
            return () => clearTimeout(timer);
        } else {
            cleanupAll();
        }
    }, [visible]);

    // Cleanup when closing
    const cleanupAll = () => {
        Speech.stop().catch(() => {});
        if (recorderRef.current?.stop) {
            recorderRef.current.stop().catch(() => {});
            recorderRef.current = null;
        }
        isRecordingRef.current = false;
        isStoppingRef.current = false;
        setMode('idle');
    };

    // Continuous Orb Animations based on mode
    useEffect(() => {
        if (!visible) return;

        let pulseLoop = null;
        let rippleLoop = null;

        if (mode === 'listening') {
            // Organic breath & ripple
            pulseLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.95, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            );
            rippleLoop = Animated.loop(
                Animated.parallel([
                    Animated.sequence([
                        Animated.timing(rippleAnim1, { toValue: 1.6, duration: 1600, useNativeDriver: true }),
                        Animated.timing(rippleAnim1, { toValue: 1, duration: 0, useNativeDriver: true }),
                    ]),
                    Animated.sequence([
                        Animated.delay(800),
                        Animated.timing(rippleAnim2, { toValue: 1.6, duration: 1600, useNativeDriver: true }),
                        Animated.timing(rippleAnim2, { toValue: 1, duration: 0, useNativeDriver: true }),
                    ]),
                ])
            );
            pulseLoop.start();
            rippleLoop.start();
        } else if (mode === 'thinking') {
            // Fast rotation & glow shimmer
            pulseLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
                ])
            );
            rippleLoop = Animated.loop(
                Animated.timing(rotateAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
            );
            pulseLoop.start();
            rippleLoop.start();
        } else if (mode === 'speaking') {
            // Rapid speech waveform vibration
            pulseLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.25, duration: 300, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1.05, duration: 250, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1.3, duration: 350, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                ])
            );
            pulseLoop.start();
        } else {
            pulseAnim.setValue(1);
            rippleAnim1.setValue(1);
            rippleAnim2.setValue(1);
            glowAnim.setValue(0.4);
            rotateAnim.setValue(0);
        }

        return () => {
            pulseLoop?.stop();
            rippleLoop?.stop();
        };
    }, [mode, visible]);

    // Start Listening
    const startListening = async () => {
        if (!activeRef.current || isRecordingRef.current) return;
        Speech.stop().catch(() => {});

        try {
            const hasPerm = await requestMicrophonePermission();
            if (!hasPerm) {
                Alert.alert("Permission Required", "Microphone access is needed for voice chat.");
                setMode('idle');
                return;
            }

            setMode('listening');
            isRecordingRef.current = true;

            const handle = await createAudioRecorder();
            recorderRef.current = handle;
        } catch (err) {
            console.error('[VoiceMode] Failed to start recorder:', err);
            isRecordingRef.current = false;
            setMode('idle');
        }
    };

    // Stop Listening and Send to Gemini
    const finishListeningAndSend = async () => {
        if (!isRecordingRef.current || isStoppingRef.current || !recorderRef.current) return;
        isStoppingRef.current = true;
        setMode('thinking');

        try {
            const uri = await recorderRef.current.stop();
            recorderRef.current = null;
            isRecordingRef.current = false;
            isStoppingRef.current = false;

            if (!uri) {
                setMode('idle');
                return;
            }

            // Send voice packet directly to Gemini Voice Assistant
            const locationHint = activeFarm?.region || activeFarm?.locality || activeFarm?.name || null;
            const res = await chatService.sendVoiceMessage(uri, sessionId, language || 'en', locationHint);

            if (!activeRef.current) return;

            const userQuestion = res.transcript || '...';
            const aiAnswer = res.response || '';

            setCurrentTranscript(userQuestion);
            setCurrentReply(aiAnswer);

            if (onNewTurn) {
                onNewTurn({ userQuestion, aiAnswer, sessionId });
            }

            // Speak the AI response aloud
            speakReply(aiAnswer);

        } catch (err) {
            console.error('[VoiceMode] Send error:', err);
            isRecordingRef.current = false;
            isStoppingRef.current = false;
            if (activeRef.current) {
                setMode('idle');
                Alert.alert("Voice Error", err.message || "Failed to process voice note.");
            }
        }
    };

    // Speak AI Response
    const speakReply = (text) => {
        if (!activeRef.current || !text) {
            setMode('idle');
            return;
        }

        setMode('speaking');
        Speech.stop().catch(() => {});

        const speechLang = SPEECH_LANG_MAP[language] || 'en-IN';
        const cleanText = text.replace(/[*#_~]/g, '');

        Speech.speak(cleanText, {
            language: speechLang,
            rate: 0.95,
            onDone: () => {
                if (!activeRef.current) return;
                // Seamless Turn-by-Turn loop like ChatGPT Voice:
                // Once AI finishes talking, automatically start listening for user's reply!
                if (autoLoop) {
                    setTimeout(() => {
                        if (activeRef.current) {
                            startListening();
                        }
                    }, 400);
                } else {
                    setMode('idle');
                }
            },
            onStopped: () => {
                if (activeRef.current) setMode('idle');
            },
            onError: () => {
                if (activeRef.current) setMode('idle');
            }
        });
    };

    // Orb Tap Action (Intuitive single-tap control)
    const handleOrbPress = () => {
        if (mode === 'listening') {
            // Farmer finished speaking -> send to AI
            finishListeningAndSend();
        } else if (mode === 'speaking') {
            // Interrupt AI speaking -> start listening to farmer immediately
            Speech.stop().catch(() => {});
            setTimeout(() => {
                if (activeRef.current) {
                    startListening();
                }
            }, 200);
        } else if (mode === 'idle') {
            // Start speaking
            startListening();
        }
    };

    const handleClose = () => {
        cleanupAll();
        onClose();
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const getGradientColors = () => {
        switch (mode) {
            case 'listening':
                return ['#10B981', '#059669', '#047857'];
            case 'thinking':
                return ['#6366F1', '#8B5CF6', '#A855F7'];
            case 'speaking':
                return ['#06B6D4', '#0EA5E9', '#3B82F6'];
            default:
                return ['#10B981', '#059669', '#047857'];
        }
    };

    const getStatusIcon = () => {
        switch (mode) {
            case 'listening':
                return 'mic';
            case 'thinking':
                return 'cpu';
            case 'speaking':
                return 'volume-2';
            default:
                return 'mic-off';
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={handleClose}
        >
            <View style={styles.modalBackdrop}>
                <LinearGradient
                    colors={['#051510', '#061D15', '#020C08']}
                    style={StyleSheet.absoluteFillObject}
                />

                <SafeAreaView style={styles.safeArea}>
                    {/* Header */}
                    <View style={styles.topBar}>
                        <View style={styles.liveIndicatorRow}>
                            <View style={[styles.liveDot, { backgroundColor: mode === 'listening' ? '#10B981' : mode === 'speaking' ? '#0EA5E9' : '#8B5CF6' }]} />
                            <AppText variant="caption" style={styles.liveBadgeText}>
                                {mode.toUpperCase()}
                            </AppText>
                        </View>

                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.8}>
                            <Feather name="x" size={22} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Central Voice Orb Canvas */}
                    <View style={styles.orbCanvas}>
                        {/* Ripple Waves */}
                        {mode === 'listening' && (
                            <>
                                <Animated.View
                                    style={[
                                        styles.rippleWave,
                                        {
                                            transform: [{ scale: rippleAnim1 }],
                                            opacity: rippleAnim1.interpolate({ inputRange: [1, 1.6], outputRange: [0.6, 0] })
                                        }
                                    ]}
                                />
                                <Animated.View
                                    style={[
                                        styles.rippleWave,
                                        {
                                            transform: [{ scale: rippleAnim2 }],
                                            opacity: rippleAnim2.interpolate({ inputRange: [1, 1.6], outputRange: [0.4, 0] })
                                        }
                                    ]}
                                />
                            </>
                        )}

                        {/* Interactive Main Orb */}
                        <TouchableOpacity
                            onPress={handleOrbPress}
                            activeOpacity={0.9}
                            style={styles.orbTouchable}
                            disabled={mode === 'thinking'}
                        >
                            <Animated.View
                                style={[
                                    styles.orbCore,
                                    {
                                        transform: [
                                            { scale: pulseAnim },
                                            ...(mode === 'thinking' ? [{ rotate: spin }] : [])
                                        ]
                                    }
                                ]}
                            >
                                <LinearGradient
                                    colors={getGradientColors()}
                                    style={styles.orbGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    {mode === 'thinking' ? (
                                        <ActivityIndicator size="large" color="white" />
                                    ) : (
                                        <Feather name={getStatusIcon()} size={46} color="white" />
                                    )}
                                </LinearGradient>
                            </Animated.View>
                        </TouchableOpacity>

                        {/* Status Label */}
                        <View style={styles.statusBox}>
                            <AppText variant="titleMedium" style={styles.statusTitle}>
                                {loc[mode] || loc.idle}
                            </AppText>
                            <AppText variant="caption" style={styles.statusSubtitle}>
                                {mode === 'listening' ? loc.tapToStop : mode === 'speaking' ? loc.tapToInterrupt : ''}
                            </AppText>
                        </View>
                    </View>

                    {/* Live Captions / Transcript Card */}
                    <View style={styles.transcriptSection}>
                        {currentTranscript ? (
                            <View style={styles.transcriptCardUser}>
                                <Feather name="user" size={14} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
                                <AppText variant="bodySmall" numberOfLines={2} style={styles.transcriptTextUser}>
                                    "{currentTranscript}"
                                </AppText>
                            </View>
                        ) : null}

                        {currentReply ? (
                            <View style={styles.transcriptCardAI}>
                                <MaterialCommunityIcons name="robot-outline" size={16} color="#34D399" style={{ marginRight: 8, marginTop: 2 }} />
                                <AppText variant="bodySmall" numberOfLines={3} style={styles.transcriptTextAI}>
                                    {currentReply.replace(/[*#]/g, '')}
                                </AppText>
                            </View>
                        ) : null}
                    </View>

                    {/* Bottom Controls */}
                    <View style={styles.bottomBar}>
                        <TouchableOpacity
                            style={[styles.autoLoopToggle, autoLoop && styles.autoLoopActive]}
                            onPress={() => setAutoLoop(prev => !prev)}
                            activeOpacity={0.7}
                        >
                            <Feather name="repeat" size={16} color={autoLoop ? '#10B981' : '#9CA3AF'} />
                            <AppText variant="caption" style={[styles.autoLoopText, autoLoop && { color: '#10B981' }]}>
                                {autoLoop ? "Continuous Flow ON" : "Continuous Flow OFF"}
                            </AppText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.endConversationBtn}
                            onPress={handleClose}
                            activeOpacity={0.8}
                        >
                            <Feather name="phone-off" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                            <AppText variant="bodyMedium" style={{ color: '#EF4444', fontWeight: '600' }}>
                                {loc.end}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackdrop: {
        flex: 1,
        backgroundColor: '#051510',
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 20 : 24,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
    },
    liveIndicatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    liveBadgeText: {
        color: '#E5E7EB',
        fontWeight: '700',
        letterSpacing: 1.2,
        fontSize: 11,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbCanvas: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    orbTouchable: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbCore: {
        width: 170,
        height: 170,
        borderRadius: 85,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 28,
        elevation: 16,
    },
    orbGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 85,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rippleWave: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 2,
        borderColor: 'rgba(16, 185, 129, 0.4)',
    },
    statusBox: {
        marginTop: 36,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    statusTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    statusSubtitle: {
        color: '#9CA3AF',
        marginTop: 6,
        fontSize: 13,
        textAlign: 'center',
    },
    transcriptSection: {
        minHeight: 120,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    transcriptCardUser: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginBottom: 8,
    },
    transcriptTextUser: {
        color: '#D1FAE5',
        flex: 1,
        lineHeight: 18,
    },
    transcriptCardAI: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
    },
    transcriptTextAI: {
        color: '#E5E7EB',
        flex: 1,
        lineHeight: 18,
    },
    bottomBar: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
    },
    autoLoopToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    autoLoopActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: '#10B981',
        borderWidth: 1,
    },
    autoLoopText: {
        color: '#9CA3AF',
        marginLeft: 8,
        fontWeight: '600',
    },
    endConversationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        marginTop: 4,
    },
});
