import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { chatService } from '../services/chatService';

const ChatBubble = ({ text, isAI }) => (
    <View style={[styles.bubbleWrapper, isAI ? styles.bubbleWrapperAI : styles.bubbleWrapperUser]}>
        {isAI && (
            <View style={styles.avatarAI}>
                <MaterialCommunityIcons name="robot-outline" size={16} color={colors.white} />
            </View>
        )}
        <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
            <AppText variant="bodyMedium" style={{ color: isAI ? colors.text : colors.white, lineHeight: 22 }}>
                {text}
            </AppText>
        </View>
    </View>
);

const TypingIndicator = () => (
    <View style={[styles.bubbleWrapper, styles.bubbleWrapperAI]}>
        <View style={styles.avatarAI}>
            <MaterialCommunityIcons name="robot-outline" size={16} color={colors.white} />
        </View>
        <View style={[styles.bubble, styles.bubbleAI, { flexDirection: 'row', alignItems: 'center' }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText variant="caption" color="textMedium" style={{ marginLeft: 8 }}>AgriBot is thinking...</AppText>
        </View>
    </View>
);

export default function ChatAssistantScreen({ navigation }) {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello! I am your ArecaCare AI Assistant. How can I help you with your arecanut farm today?', isAI: true },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // Load chat history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const history = await chatService.getHistory();
            if (history && history.length > 0) {
                const historicalMessages = [];
                history.forEach((item, index) => {
                    if (item.message) {
                        historicalMessages.push({
                            id: `hist_user_${index}`,
                            text: item.message,
                            isAI: false,
                        });
                    }
                    if (item.response) {
                        historicalMessages.push({
                            id: `hist_ai_${index}`,
                            text: item.response,
                            isAI: true,
                        });
                    }
                });
                if (historicalMessages.length > 0) {
                    setMessages([
                        { id: '1', text: 'Hello! I am your ArecaCare AI Assistant. How can I help you with your arecanut farm today?', isAI: true },
                        ...historicalMessages,
                    ]);
                }
            }
        } catch (err) {
            // Silently fail — history is optional
        }
    };

    const handleSend = async () => {
        const trimmed = inputText.trim();
        if (!trimmed || isTyping) return;

        const userMessage = {
            id: `user_${Date.now()}`,
            text: trimmed,
            isAI: false,
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Auto-scroll down
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const response = await chatService.sendMessage(trimmed);

            const aiMessage = {
                id: `ai_${Date.now()}`,
                text: response.response || 'Sorry, I could not generate a response.',
                isAI: true,
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = {
                id: `err_${Date.now()}`,
                text: `⚠️ ${error.message}`,
                isAI: true,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">AgriBot Assistant</AppText>
                <TouchableOpacity onPress={() => {
                    setMessages([{ id: '1', text: 'Hello! I am your ArecaCare AI Assistant. How can I help you with your arecanut farm today?', isAI: true }]);
                }}>
                    <Feather name="trash-2" size={22} color={colors.textMedium} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                >
                    <AppText variant="caption" color="textLight" style={styles.timestamp}>Today at {timeString}</AppText>

                    {messages.map(msg => (
                        <ChatBubble key={msg.id} text={msg.text} isAI={msg.isAI} />
                    ))}

                    {isTyping && <TypingIndicator />}

                </ScrollView>

                <View style={styles.inputArea}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type your agricultural question..."
                            placeholderTextColor={colors.textLight}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            onSubmitEditing={handleSend}
                            editable={!isTyping}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.sendBtn, (!inputText.trim() || isTyping) && { opacity: 0.5 }]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isTyping}
                    >
                        <Feather name="send" size={20} color={colors.white} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: { backgroundColor: colors.background, flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    scroll: { padding: 20, paddingBottom: 40 },
    timestamp: {
        textAlign: 'center',
        marginBottom: 20,
    },
    bubbleWrapper: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
        maxWidth: '85%',
    },
    bubbleWrapperAI: {
        alignSelf: 'flex-start',
    },
    bubbleWrapperUser: {
        alignSelf: 'flex-end',
    },
    avatarAI: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    bubble: {
        padding: 16,
        borderRadius: 20,
    },
    bubbleAI: {
        backgroundColor: '#F3F4F6',
        borderBottomLeftRadius: 4,
    },
    bubbleUser: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    inputArea: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontFamily: 'sans-serif',
        maxHeight: 100,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    }
});
