import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Animated, Dimensions, Alert, TouchableWithoutFeedback, SafeAreaView, FlatList, LogBox } from 'react-native';

LogBox.ignoreLogs(['Cannot record touch end without a touch start', 'Ended a touch event']);
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

import AppText from '../components/AppText';
import { chatService } from '../services/chatService';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import * as Clipboard from 'expo-clipboard';

let Audio = null;
try {
    Audio = require('expo-av').Audio;
} catch (e) {
    console.warn("[ArecaCare] Native Audio drivers missing.");
}

const { width, height } = Dimensions.get('window');

// ----------------------------------------------------------------------
// Custom ArecaCare Creative Components
// ----------------------------------------------------------------------
const ChatLineAI = ({ text }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;
    const [copied, setCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start();
    }, [text]);

    const handleCopy = async () => {
        if (!Clipboard) return;
        await Clipboard.setStringAsync(text.replace(/[*#]/g, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSpeak = async () => {
        try {
            const isSpeakingState = await Speech.isSpeakingAsync();
            if (isSpeakingState) {
                await Speech.stop();
                setIsSpeaking(false);
            } else {
                setIsSpeaking(true);
                Speech.speak(text.replace(/[*#]/g, ''), {
                    language: 'en-US',
                    rate: 0.9,
                    onDone: () => setIsSpeaking(false),
                    onStopped: () => setIsSpeaking(false),
                    onError: () => setIsSpeaking(false)
                });
            }
        } catch (e) {
            console.log("Speech toggle error", e);
            setIsSpeaking(false);
        }
    };

    return (
        <Animated.View style={[styles.chatRowAI, { opacity: fadeAnim, transform: [{ translateY }] }]}>
            <View style={styles.avatarAIContainer}>
                <View style={styles.avatarAIBox}>
                    <MaterialCommunityIcons name="robot-outline" size={18} color="#059669" />
                </View>
            </View>
            <View style={styles.aiBubbleContainer}>
                <View style={styles.aiBubbleStyle}>
                    <AppText variant="bodyMedium" style={{ color: '#1F2937', lineHeight: 22, fontSize: 15 }}>
                        {text.replace(/[*#]/g, '')}
                    </AppText>
                    <View style={styles.aiActionBar}>
                        <TouchableOpacity onPress={handleSpeak} style={styles.actionIconBtn}>
                            <Feather name={isSpeaking ? "volume-x" : "volume-2"} size={14} color={isSpeaking ? "#EF4444" : "#6B7280"} />
                            <AppText variant="caption" style={{ color: isSpeaking ? '#EF4444' : '#6B7280', marginLeft: 6, fontSize: 11, fontWeight: '500' }}>
                                {isSpeaking ? "Stop" : "Listen"}
                            </AppText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCopy} style={styles.actionIconBtn} disabled={copied}>
                            <Feather name={copied ? "check" : "copy"} size={14} color={copied ? "#059669" : "#6B7280"} />
                            <AppText variant="caption" style={{ color: copied ? '#059669' : '#6B7280', marginLeft: 6, fontSize: 11, fontWeight: '500' }}>
                                {copied ? "Copied" : "Copy"}
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};

const ChatLineUser = ({ text }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }, [text]);

    return (
        <Animated.View style={[styles.chatRowUser, { opacity: fadeAnim }]}>
            <View style={styles.userBubbleWrapper}>
                <View style={styles.bubbleUserPill}>
                    <AppText variant="bodyMedium" style={styles.userBubbleText}>
                        {text}
                    </AppText>
                </View>
            </View>
        </Animated.View>
    );
};

const TypingIndicator = () => (
    <View style={styles.chatRowAI}>
        <View style={styles.avatarAIContainer}>
            <View style={styles.avatarAIBox}>
                <MaterialCommunityIcons name="robot-outline" size={18} color="#059669" />
            </View>
        </View>
        <View style={[styles.aiBubbleStyle, { flexDirection: 'row', alignItems: 'center', height: 42, width: 72, justifyContent: 'center' }]}>
            <ActivityIndicator size="small" color="#059669" />
        </View>
    </View>
);

// ----------------------------------------------------------------------
// Main Application Screen
// ----------------------------------------------------------------------
export default function ChatAssistantScreen({ navigation }) {
    const { language } = useLanguage();
    const { activeFarm } = useContext(AuthContext);

    // Core state
    const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Audio engine
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isRecordingSTT, setIsRecordingSTT] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Drawer/Sidebar state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [sessionsList, setSessionsList] = useState([]);
    const drawerAnim = useRef(new Animated.Value(-width * 0.85)).current;

    const scrollRef = useRef(null);

    useEffect(() => {
        const prepareAudio = async () => {
            if (!Audio) return;
            try {
                await Audio.requestPermissionsAsync();
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
            } catch (err) {
                console.log("Audio permissions failed:", err);
            }
        };
        prepareAudio();
        startNewChat();
        fetchSidebarSessions();
    }, []);

    useEffect(() => {
        if (isRecording || isRecordingSTT) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording, isRecordingSTT]);

    const fetchSidebarSessions = async () => {
        try {
            const data = await chatService.getSessions();
            if (data && data.sessions) {
                setSessionsList(data.sessions);
            }
        } catch (e) {
            console.error("Failed to load sidebar", e);
        }
    };

    const startNewChat = () => {
        const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        setSessionId(newId);
        setMessages([{ id: 'init', text: 'Hello! I am your ArecaCare Digital Assistant.\nHow can I help support your farm today?', isAI: true }]);
        closeDrawer();
    };

    const loadSession = async (targetSessionId) => {
        setSessionId(targetSessionId);
        closeDrawer();
        setMessages([]);
        setIsTyping(true);
        try {
            const history = await chatService.getHistory(targetSessionId);
            if (history && history.length > 0) {
                const historicalMessages = [];
                history.forEach((item, index) => {
                    if (item.message) historicalMessages.push({ id: `hist_u_${index}`, text: item.message, isAI: false });
                    if (item.response) historicalMessages.push({ id: `hist_a_${index}`, text: item.response, isAI: true });
                });
                setMessages([...historicalMessages]);
            }
        } catch (err) {
            setMessages([{ id: 'init', text: 'Failed to retrieve session data.', isAI: true }]);
        } finally {
            setIsTyping(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const confirmDeleteSession = (targetSessionId) => {
        Alert.alert(
            "Delete Entry",
            "Permanently erase this consultation from history?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => execDeleteSession(targetSessionId) }
            ]
        );
    };

    const execDeleteSession = async (targetSessionId) => {
        try {
            await chatService.deleteSession(targetSessionId);
            setSessionsList(prev => prev.filter(s => s.session_id !== targetSessionId));
            if (sessionId === targetSessionId) startNewChat();
        } catch (e) {
            Alert.alert("Error", "Could not delete session.");
        }
    };

    const confirmClearHistory = () => {
        if (sessionsList.length === 0) return;
        Alert.alert(
            "Clear Everything?",
            "This will permanently wipe your entire AI consultation memory.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Nuke Memory", style: "destructive", onPress: execClearHistory }
            ]
        );
    };

    const execClearHistory = async () => {
        try {
            await chatService.deleteAllSessions();
            setSessionsList([]);
            startNewChat();
            Alert.alert("Memory Cleared", "All chat memory has been purged.");
        } catch (e) {
            Alert.alert("Error", "Could not clear history.");
        }
    };

    const openDrawer = () => {
        fetchSidebarSessions();
        setIsDrawerOpen(true);
        Animated.timing(drawerAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeDrawer = () => {
        Animated.timing(drawerAnim, {
            toValue: -width * 0.85,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setIsDrawerOpen(false));
    };

    const handleSendText = async () => {
        const trimmed = inputText.trim();
        if (!trimmed || isTyping || isRecording) return;

        const userMessage = { id: `user_${Date.now()}`, text: trimmed, isAI: false };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const locationHint = activeFarm?.region || activeFarm?.locality || activeFarm?.name || null;
            const response = await chatService.sendMessage(trimmed, sessionId, language || 'en', locationHint);
            fetchSidebarSessions();
            setMessages(prev => [...prev, { id: `ai_${Date.now()}`, text: response.response || 'System Error.', isAI: true }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: `err_${Date.now()}`, text: `⚠️ ${error.message}`, isAI: true }]);
        } finally {
            setIsTyping(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const startAudioRecording = async () => {
        if (!Audio) {
            Alert.alert(
                "Microphone Disabled",
                "Your mobile app binary (APK) is physically missing the native C++ 'expo-av' hardware drivers. You MUST rebuild the app exactly as stated below to fix this:\n\nnpx expo run:android\n\nRun that in your PC terminal to install the new drivers to your phone."
            );
            return;
        }
        try {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== 'granted') return;
            setIsRecording(true);
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
        } catch (err) {
            setIsRecording(false);
        }
    };

    const stopAudioRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        setIsTyping(true);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            setMessages(prev => [...prev, { id: `voice_${Date.now()}`, text: '🎙️ Processing voice packet...', isAI: false }]);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

            const locationHint = activeFarm?.region || activeFarm?.locality || activeFarm?.name || null;
            const response = await chatService.sendVoiceMessage(uri, sessionId, language || 'en', locationHint);
            fetchSidebarSessions();

            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { id: `v_trans_${Date.now()}`, text: response.transcript || "🎙️ Voice input analyzed.", isAI: false };
                return updated;
            });
            setMessages(prev => [...prev, { id: `ai_v_${Date.now()}`, text: response.response || 'Voice analysis complete.', isAI: true }]);
            Speech.speak(response.response.replace(/[*#]/g, ''), { language: 'en-US', rate: 0.95 });

        } catch (err) {
            setMessages(prev => [...prev, { id: `err_${Date.now()}`, text: `⚠️ Error: ${err.message}`, isAI: true }]);
        } finally {
            setIsTyping(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const startSTTRecording = async () => {
        if (!Audio) {
            Alert.alert(
                "Microphone Disabled",
                "Your mobile app binary (APK) is physically missing the native C++ 'expo-av' hardware drivers. You MUST rebuild the app exactly as stated below to fix this:\n\nnpx expo run:android\n\nRun that in your PC terminal to install the new drivers to your phone."
            );
            return;
        }
        try {
            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== 'granted') return;
            setIsRecordingSTT(true);
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
        } catch (err) {
            setIsRecordingSTT(false);
        }
    };

    const stopSTTRecording = async () => {
        if (!recording) return;
        setIsRecordingSTT(false);
        setIsTyping(true);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            const response = await chatService.sendSpeechToText(uri, language);
            if (response && response.text) {
                setInputText(prev => (prev ? prev + ' ' + response.text : response.text));
            }
        } catch (err) {
            Alert.alert("Transcription Error", err.message);
        } finally {
            setIsTyping(false);
        }
    };

    const renderSessionItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.sidebarItem, sessionId === item.session_id && styles.sidebarItemActive]}
            onPress={() => loadSession(item.session_id)}
            onLongPress={() => confirmDeleteSession(item.session_id)}
        >
            <View style={{ flex: 1, paddingRight: 10 }}>
                <AppText
                    variant="bodyMedium"
                    numberOfLines={1}
                    style={[styles.sessionText, sessionId === item.session_id && styles.sessionTextActive]}
                >
                    {item.preview}
                </AppText>
            </View>
            <TouchableOpacity onPress={() => confirmDeleteSession(item.session_id)}>
                <Feather
                    name="trash-2"
                    size={14}
                    color={sessionId === item.session_id ? '#059669' : '#9CA3AF'}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>

            {/* ---------------------------------------------------- */}
            {/* ArecaCare Slider Drawer                              */}
            {/* ---------------------------------------------------- */}
            {isDrawerOpen && (
                <TouchableWithoutFeedback onPress={closeDrawer}>
                    <View style={styles.drawerBackdrop} />
                </TouchableWithoutFeedback>
            )}

            <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: drawerAnim }] }]}>
                <View style={styles.drawerHeader}>
                    <View>
                        <AppText variant="heading3" style={{ color: '#111827' }}>Chat Logs</AppText>
                        <AppText variant="caption" style={{ color: '#059669', marginTop: 2 }}>Encrypted History</AppText>
                    </View>
                    <TouchableOpacity onPress={closeDrawer} style={styles.iconBtnDark}>
                        <Feather name="x" size={20} color="#4B5563" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.newChatBtnFlat} onPress={startNewChat}>
                    <View style={styles.newChatBtnSolid}>
                        <Feather name="plus-circle" size={18} color="white" style={{ marginRight: 8 }} />
                        <AppText variant="bodyMedium" style={{ color: 'white', fontWeight: '700' }}>New Diagnosis</AppText>
                    </View>
                </TouchableOpacity>

                <AppText variant="caption" style={styles.sidebarSectionTitle}>Previous Sessions</AppText>

                <FlatList
                    data={sessionsList}
                    keyExtractor={item => item.session_id}
                    renderItem={renderSessionItem}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Feather name="inbox" size={32} color="#D1D5DB" />
                            <AppText variant="bodyMedium" style={{ color: '#9CA3AF', marginTop: 12, textAlign: 'center' }}>No diagnostic history found.</AppText>
                        </View>
                    )}
                />

                <TouchableOpacity
                    style={styles.clearHistoryBtn}
                    onPress={confirmClearHistory}
                    disabled={sessionsList.length === 0}
                >
                    <Feather name="trash" size={16} color={sessionsList.length === 0 ? "#D1D5DB" : "#EF4444"} style={{ marginRight: 8 }} />
                    <AppText variant="bodyMedium" style={{ color: sessionsList.length === 0 ? "#D1D5DB" : "#EF4444", fontWeight: '600' }}>Clear Full History</AppText>
                </TouchableOpacity>
            </Animated.View>

            {/* ---------------------------------------------------- */}
            {/* Main Application Canvas                              */}
            {/* ---------------------------------------------------- */}

            <View style={styles.chatCanvas}>
                {/* Clean Yield Prediction Style Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={openDrawer} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.headerIconBtn}>
                        <Feather name="menu" size={24} color="#111827" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleBox}>
                        <AppText variant="heading3" style={styles.headerTitleText}>AgriBot AI</AppText>
                        <AppText variant="caption" style={styles.headerSubText}>
                            {activeFarm?.name ? `Context: ${activeFarm.name}` : `System Online`}
                        </AppText>
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.headerIconBtn}>
                        <Feather name="x" size={24} color="#111827" />
                    </TouchableOpacity>
                </View>

                {/* Subtle Advisory Banner */}
                <View style={styles.disclaimerBanner}>
                    <Feather name="shield" size={14} color="#059669" style={{ marginRight: 6 }} />
                    <AppText variant="caption" style={styles.disclaimerText}>
                        AI Diagnostics are advisory. Consult field experts.
                    </AppText>
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <ScrollView
                        style={{ flex: 1 }}
                        ref={scrollRef}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                        keyboardShouldPersistTaps="handled"
                    >
                        {messages.map(msg => msg.isAI ?
                            <ChatLineAI key={msg.id} text={msg.text} /> :
                            <ChatLineUser key={msg.id} text={msg.text} />
                        )}
                        {isTyping && <TypingIndicator />}
                        <View style={{ height: 60 }} />
                    </ScrollView>

                    {/* Creative Dynamic Input Array */}
                    <View style={styles.inputDockLayout}>
                        <View style={[styles.inputPillElevated, isRecording && styles.inputPillElevatedRecording]}>
                            <TextInput
                                style={styles.textInputCreative}
                                placeholder={isRecording ? "Capturing voice..." : "Ask AgriBot..."}
                                placeholderTextColor={isRecording ? "#FCA5A5" : "#9CA3AF"}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                editable={!isTyping && !isRecording}
                            />

                            {inputText.trim().length > 0 ? (
                                <TouchableOpacity style={styles.creativeSendBtn} onPress={handleSendText} disabled={isTyping}>
                                    <Feather name="send" size={18} color="white" />
                                </TouchableOpacity>
                            ) : (
                                <Animated.View style={[{ transform: [{ scale: pulseAnim }], flexDirection: 'row', alignItems: 'center' }]}>
                                    <TouchableOpacity
                                        style={styles.micBtnSTT}
                                        onPressIn={startSTTRecording}
                                        onPressOut={stopSTTRecording}
                                        disabled={isTyping || isRecording}
                                    >
                                        <Feather name="mic" size={20} color={isRecordingSTT ? '#EF4444' : '#6B7280'} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={isRecording ? styles.creativeMicBtnActive : styles.creativeMicBtnIdle}
                                        onPressIn={startAudioRecording}
                                        onPressOut={stopAudioRecording}
                                        disabled={isTyping || isRecordingSTT}
                                    >
                                        <MaterialCommunityIcons name="waveform" size={20} color="white" />
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
}

// ----------------------------------------------------------------------
// ArecaCare Yield-Consistent Clean Styling
// ----------------------------------------------------------------------
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
    chatCanvas: { flex: 1, backgroundColor: '#F9FAFB' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 16,
        paddingBottom: 12,
        backgroundColor: '#FFFFFF',
    },
    headerTitleBox: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitleText: {
        color: '#111827',
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubText: {
        color: '#6B7280',
        marginTop: 2,
        fontSize: 12,
    },
    headerIconBtn: {
        width: 38,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Disclaimer
    disclaimerBanner: {
        backgroundColor: '#F0FDF4',
        marginHorizontal: 20,
        marginTop: 4,
        marginBottom: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DCFCE7',
        flexDirection: 'row',
        alignItems: 'center',
    },
    disclaimerText: {
        color: '#166534',
        flex: 1,
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
    },

    // Scroll Canvas
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 30,
    },

    // Creative Bubble Architectures
    chatRowAI: {
        flexDirection: 'row',
        marginBottom: 18,
        alignItems: 'flex-start',
    },
    chatRowUser: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 18,
        alignItems: 'flex-end',
    },
    avatarAIContainer: {
        marginRight: 10,
        marginTop: 2,
    },
    avatarAIBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#D1FAE5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiBubbleContainer: {
        flex: 1,
    },
    aiBubbleStyle: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    aiActionBar: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionIconBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    userBubbleWrapper: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    bubbleUserPill: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: '#16A34A', // Matches Screenshot 3 Predict Yield CTA
        maxWidth: width * 0.78,
    },
    userBubbleText: {
        color: '#FFFFFF',
        fontSize: 15,
        lineHeight: 22,
    },

    // Floating Input Dock
    inputDockLayout: {
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 24 : 14,
        paddingTop: 8,
        backgroundColor: 'transparent',
    },
    inputPillElevated: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 10,
        paddingVertical: 6,
        minHeight: 52,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputPillElevatedRecording: {
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    textInputCreative: {
        flex: 1,
        fontSize: 15,
        color: '#1F2937',
        maxHeight: 100,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    micBtnSTT: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    creativeMicBtnIdle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#16A34A', // Vibrant Green matching Predict Yield button
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    creativeMicBtnActive: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 5,
    },
    creativeSendBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#16A34A', // Matching Predict Yield CTA
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },

    // Sidebar Slide Over
    drawerBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 100,
    },
    drawerContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: width * 0.82,
        backgroundColor: '#FFFFFF',
        zIndex: 110,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    iconBtnDark: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 18,
    },
    newChatBtnFlat: {
        marginHorizontal: 16,
        marginBottom: 20,
    },
    newChatBtnSolid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: '#16A34A',
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    sidebarSectionTitle: {
        color: '#9CA3AF',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: 20,
        marginBottom: 12,
        fontSize: 11,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sidebarItemActive: {
        backgroundColor: '#ECFDF5',
        borderColor: '#059669',
    },
    sessionText: {
        color: '#1F2937',
        fontSize: 14,
    },
    sessionTextActive: {
        color: '#065F46',
        fontWeight: '600',
    },
    clearHistoryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    }
});
