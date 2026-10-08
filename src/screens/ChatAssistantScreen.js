import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Animated, Dimensions, Alert, TouchableWithoutFeedback, SafeAreaView, FlatList, LogBox } from 'react-native';

LogBox.ignoreLogs(['Cannot record touch end without a touch start']);
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

let Clipboard = null;
try {
    Clipboard = require('expo-clipboard');
} catch (e) {
    console.warn("Native Clipboard drivers missing.");
}

let Audio = null;
try {
    Audio = require('expo-av').Audio;
} catch (e) {
    console.warn("[ArecaCare] Native Audio drivers missing. Voice functions will degrade gracefully.");
}

import AppText from '../components/AppText';
import { chatService } from '../services/chatService';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

// ----------------------------------------------------------------------
// Custom ArecaCare Creative Components
// ----------------------------------------------------------------------
const ChatLineAI = ({ text }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;
    const [copied, setCopied] = useState(false);

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

    return (
        <Animated.View style={[styles.chatRowAI, { opacity: fadeAnim, transform: [{ translateY }] }]}>
            <View style={styles.avatarAIContainer}>
                <LinearGradient colors={['#10B981', '#047857']} style={styles.avatarAIGradient}>
                    <MaterialCommunityIcons name="robot-outline" size={16} color="white" />
                </LinearGradient>
            </View>
            <View style={styles.aiBubbleContainer}>
                <View style={styles.aiBubbleStyle}>
                    <AppText variant="bodyMedium" style={{ color: '#1F2937', lineHeight: 22 }}>
                        {text.replace(/[*#]/g, '')}
                    </AppText>
                    <View style={styles.aiActionBar}>
                        <TouchableOpacity onPress={() => Speech.speak(text.replace(/[*#]/g, ''), { language: 'en-US', rate: 0.9 })} style={styles.actionIconBtn}>
                            <Feather name="volume-2" size={14} color="#9CA3AF" />
                            <AppText variant="caption" style={{ color: '#9CA3AF', marginLeft: 6, fontSize: 10 }}>Listen</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCopy} style={styles.actionIconBtn} disabled={copied}>
                            <Feather name={copied ? "check" : "copy"} size={14} color={copied ? "#10B981" : "#9CA3AF"} />
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
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }, [text]);

    return (
        <Animated.View style={[styles.chatRowUser, { opacity: fadeAnim }]}>
            <View style={styles.userBubbleWrapper}>
                <LinearGradient colors={['#0F766E', '#064E3B']} style={styles.bubbleUserPill}>
                    <AppText variant="bodyMedium" style={{ color: 'white', lineHeight: 22, fontWeight: '500' }}>
                        {text}
                    </AppText>
                </LinearGradient>
            </View>
        </Animated.View>
    );
};

const TypingIndicator = () => (
    <View style={styles.chatRowAI}>
        <View style={styles.avatarAIContainer}>
            <LinearGradient colors={['#10B981', '#047857']} style={styles.avatarAIGradient}>
                <MaterialCommunityIcons name="robot-outline" size={16} color="white" />
            </LinearGradient>
        </View>
        <View style={[styles.aiBubbleStyle, { flexDirection: 'row', alignItems: 'center', height: 40, width: 80, justifyContent: 'center' }]}>
            <ActivityIndicator size="small" color="#10B981" />
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
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording]);

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
            const response = await chatService.sendMessage(trimmed, sessionId);
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
        if (!Audio) return;
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

            const response = await chatService.sendVoiceMessage(uri, sessionId, language);
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

    const renderSessionItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.sidebarItem, sessionId === item.session_id && styles.sidebarItemActive]}
            onPress={() => loadSession(item.session_id)}
            onLongPress={() => confirmDeleteSession(item.session_id)}
        >
            <View style={{ flex: 1, paddingRight: 10 }}>
                <AppText variant="bodyMedium" numberOfLines={1} style={{ color: sessionId === item.session_id ? 'white' : '#1F2937', fontWeight: sessionId === item.session_id ? '600' : '400' }}>
                    {item.preview}
                </AppText>
            </View>
            <TouchableOpacity onPress={() => confirmDeleteSession(item.session_id)}>
                <Feather name="trash-2" size={14} color={sessionId === item.session_id ? 'rgba(255,255,255,0.7)' : '#9CA3AF'} />
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
                    <LinearGradient colors={['#10B981', '#047857']} style={styles.newChatBtnGradient}>
                        <Feather name="plus-circle" size={18} color="white" style={{ marginRight: 8 }} />
                        <AppText variant="bodyMedium" style={{ color: 'white', fontWeight: '700' }}>New Diagnosis</AppText>
                    </LinearGradient>
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
                {/* ArecaCare Vibrant Header */}
                <LinearGradient colors={['#0F766E', '#064E3B']} style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={openDrawer} style={styles.iconBtn}>
                            <Feather name="menu" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleBox}>
                            <AppText variant="heading3" style={{ color: 'white', fontSize: 18 }}>AgriBot AI</AppText>
                            <AppText variant="caption" style={{ color: '#A7F3D0', marginTop: 2 }}>
                                {activeFarm?.name ? `Context: ${activeFarm.name}` : `System Online`}
                            </AppText>
                        </View>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                            <Feather name="x" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View style={styles.disclaimerBanner}>
                    <Feather name="shield" size={14} color="#059669" style={{ marginRight: 6 }} />
                    <AppText variant="caption" style={styles.disclaimerText}>
                        AI Diagnostics are advisory. Consult field experts.
                    </AppText>
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
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
                                <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
                                    <TouchableOpacity
                                        style={isRecording ? styles.creativeMicBtnActive : styles.creativeMicBtnIdle}
                                        onPressIn={startAudioRecording}
                                        onPressOut={stopAudioRecording}
                                        disabled={isTyping}
                                    >
                                        <MaterialCommunityIcons name={isRecording ? "microphone" : "microphone-outline"} size={22} color={isRecording ? 'white' : '#10B981'} />
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
// ArecaCare Premium Styling
// ----------------------------------------------------------------------
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#111827' },
    chatCanvas: { flex: 1, backgroundColor: '#F9FAFB' },

    // Header
    header: {
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    headerTitleBox: {
        flex: 1,
        alignItems: 'center',
    },
    iconBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 22,
    },

    // Disclaimer
    disclaimerBanner: {
        backgroundColor: '#ECFDF5',
        paddingVertical: 8,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#D1FAE5'
    },
    disclaimerText: {
        color: '#065F46',
        flex: 1,
        lineHeight: 16,
    },

    // Scroll Canvas
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },

    // Creative Bubble Architectures
    chatRowAI: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-end',
    },
    chatRowUser: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
        alignItems: 'flex-end',
    },
    avatarAIContainer: {
        marginRight: 10,
    },
    avatarAIGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    aiBubbleContainer: {
        flex: 1,
    },
    aiBubbleStyle: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 6,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    aiActionBar: {
        flexDirection: 'row',
        marginTop: 14,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    actionIconBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    userBubbleWrapper: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    bubbleUserPill: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 6,
        maxWidth: width * 0.75,
    },

    // New Floating Dock
    inputDockLayout: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
        paddingTop: 8,
        backgroundColor: 'transparent',
    },
    inputPillElevated: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: 'white',
        borderRadius: 30,
        paddingHorizontal: 6,
        paddingVertical: 6,
        minHeight: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputPillElevatedRecording: {
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    textInputCreative: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        maxHeight: 120,
        paddingHorizontal: 16,
        paddingBottom: 14,
        paddingTop: 14,
    },
    creativeMicBtnIdle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 2,
        marginBottom: 2,
    },
    creativeMicBtnActive: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
        marginRight: 2,
        marginBottom: 2,
    },
    creativeSendBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#0F766E', // Vibrant Teal Match
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 2,
        marginBottom: 2,
        shadowColor: '#0F766E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },

    // Sidebar Slide Over
    drawerBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 100,
    },
    drawerContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: width * 0.85,
        backgroundColor: '#F9FAFB',
        zIndex: 110,
        shadowColor: '#000',
        shadowOffset: { width: 5, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
        borderTopRightRadius: 36,
        borderBottomRightRadius: 36,
    },
    drawerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    iconBtnDark: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    newChatBtnFlat: {
        marginHorizontal: 16,
        marginBottom: 20,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    newChatBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
    },
    sidebarSectionTitle: {
        color: '#9CA3AF',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 8,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    sidebarItemActive: {
        backgroundColor: '#0F766E',
        borderColor: '#0F766E',
    },
    clearHistoryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    }
});
