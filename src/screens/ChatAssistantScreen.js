import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { requestMicrophonePermission } from '../services/permissionsService';

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

export default function ChatAssistantScreen({ navigation }) {
    const [inputText, setInputText] = useState('');

    const handleVoicePress = async () => {
        const granted = await requestMicrophonePermission();
        if (!granted) {
            Alert.alert("Microphone Denied", "We need access to your microphone to use voice features.");
        } else {
            // logic to start voice recording
        }
    };

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">AgriBot Assistant</AppText>
                <TouchableOpacity>
                    <Feather name="more-vertical" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <AppText variant="caption" color="textLight" style={styles.timestamp}>Today at 9:41 AM</AppText>

                    <ChatBubble
                        isAI={true}
                        text="Hello! I am your ArecaCare AI Assistant. How can I help you with your arecanut farm today?"
                    />

                    <ChatBubble
                        isAI={false}
                        text="When is the best time to apply Neem oil spray?"
                    />

                    <ChatBubble
                        isAI={true}
                        text="For optimal results, apply Neem oil early in the morning before 9 AM or late in the evening after 5 PM. Avoid spraying during harsh sunlight to prevent leaf burning."
                    />

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
                        />
                        <TouchableOpacity style={styles.voiceBtn} onPress={handleVoicePress}>
                            <Feather name="mic" size={20} color={colors.textMedium} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.sendBtn}>
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
    voiceBtn: {
        padding: 4,
        marginLeft: 8,
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
