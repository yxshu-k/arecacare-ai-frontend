import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';
import { useKeyboard } from '../hooks/useKeyboard';

export const FARMER_STATUS_PRESETS = [
    { id: 'busy_plantation', text: '🌿 Busy in plantation', tag: 'Field Work' },
    { id: 'harvesting', text: '🚜 Harvesting arecanut', tag: 'Harvest' },
    { id: 'irrigation', text: '💧 Irrigation in progress', tag: 'Watering' },
    { id: 'bordeaux_spray', text: '🛡️ Spraying Bordeaux mixture', tag: 'Care' },
    { id: 'drying_yard', text: '☀️ Drying areca nuts in yard', tag: 'Processing' },
    { id: 'need_labor', text: '🌾 Looking for farm labor', tag: 'Community' },
    { id: 'advice_available', text: '💬 Available for farming advice', tag: 'Mentorship' },
    { id: 'nursery_saplings', text: '🌴 Managing nursery & saplings', tag: 'Nursery' },
    { id: 'default_grower', text: '🌿 Growing healthy arecanut palms', tag: 'General' },
];

export default function FarmerStatusModal({
    visible,
    onClose,
    currentStatus = '',
    onSave,
}) {
    const { colors, isDarkMode } = useTheme();
    const [statusText, setStatusText] = useState('');
    const [saving, setSaving] = useState(false);
    const scrollRef = useRef(null);
    const { keyboardHeight, isKeyboardVisible } = useKeyboard();

    useEffect(() => {
        if (visible) {
            setStatusText(currentStatus || '🌿 Growing healthy arecanut palms');
        }
    }, [visible, currentStatus]);

    const handleSaveCustom = async (textToSave) => {
        const text = (typeof textToSave === 'string' ? textToSave : statusText).trim();
        if (!text) {
            Alert.alert('Empty Status', 'Please write a note or select one of the presets.');
            return;
        }

        try {
            setSaving(true);
            await onSave(text);
            Keyboard.dismiss();
            onClose();
        } catch (error) {
            Alert.alert('Save Failed', error?.message || 'Could not update status note.');
        } finally {
            setSaving(false);
        }
    };

    const handleSelectPreset = (presetText) => {
        setStatusText(presetText);
        handleSaveCustom(presetText);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardContainer}
                    >
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
                                {/* Drag handle */}
                                <View style={styles.indicatorContainer}>
                                    <View style={[styles.dragIndicator, { backgroundColor: colors.border }]} />
                                </View>

                                {/* Header */}
                                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                    <View style={{ flex: 1, paddingRight: 12 }}>
                                        <AppText variant="heading3" style={{ color: colors.text }}>
                                            About & Status
                                        </AppText>
                                        <AppText variant="caption" style={{ color: colors.textLight, marginTop: 2 }}>
                                            Let other farmers and buyers know what you're doing
                                        </AppText>
                                    </View>
                                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Feather name="x" size={22} color={colors.textLight} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView
                                    ref={scrollRef}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={[
                                        styles.scrollContent,
                                        { paddingBottom: isKeyboardVisible ? keyboardHeight + 40 : 30 }
                                    ]}
                                >
                                    {/* Custom Status Input Card */}
                                    <View style={[styles.inputCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F9FAFB', borderColor: colors.border }]}>
                                        <View style={styles.inputHeader}>
                                            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
                                                CURRENT NOTE
                                            </AppText>
                                            <AppText variant="caption" style={{ color: colors.textLight }}>
                                                {statusText.length}/120
                                            </AppText>
                                        </View>

                                        <View style={styles.inputRow}>
                                            <TextInput
                                                style={[styles.textInput, { color: colors.text }]}
                                                placeholder="Write your note (e.g. Busy in plantation...)"
                                                placeholderTextColor={colors.textLight}
                                                value={statusText}
                                                onChangeText={(text) => {
                                                    if (text.length <= 120) setStatusText(text);
                                                }}
                                                maxLength={120}
                                                multiline
                                                numberOfLines={2}
                                            />
                                        </View>

                                        <View style={[styles.inputFooter, { borderTopColor: colors.border }]}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.saveBtn,
                                                    { backgroundColor: colors.primary },
                                                    saving && { opacity: 0.6 },
                                                ]}
                                                onPress={() => handleSaveCustom(statusText)}
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                                ) : (
                                                    <>
                                                        <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                                                        <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                            Save Status
                                                        </AppText>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Presets Title */}
                                    <View style={styles.presetsHeader}>
                                        <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                                            Quick Presets for Areca Growers
                                        </AppText>
                                        <AppText variant="caption" style={{ color: colors.textMedium }}>
                                            Tap any preset to instantly update
                                        </AppText>
                                    </View>

                                    {/* Presets List */}
                                    <View style={styles.presetsList}>
                                        {FARMER_STATUS_PRESETS.map((preset) => {
                                            const isSelected = statusText.trim() === preset.text.trim();
                                            return (
                                                <TouchableOpacity
                                                    key={preset.id}
                                                    style={[
                                                        styles.presetItem,
                                                        { borderColor: isSelected ? colors.primary : colors.border },
                                                        isSelected && { backgroundColor: isDarkMode ? '#064E3B20' : '#ECFDF5' },
                                                    ]}
                                                    onPress={() => handleSelectPreset(preset.text)}
                                                    activeOpacity={0.7}
                                                    disabled={saving}
                                                >
                                                    <View style={{ flex: 1, paddingRight: 8 }}>
                                                        <AppText
                                                            variant="bodyMedium"
                                                            style={{
                                                                color: isSelected ? colors.primary : colors.text,
                                                                fontWeight: isSelected ? '700' : '500',
                                                            }}
                                                        >
                                                            {preset.text}
                                                        </AppText>
                                                    </View>

                                                    {isSelected ? (
                                                        <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                                                            <Feather name="check" size={12} color="#FFFFFF" />
                                                        </View>
                                                    ) : (
                                                        <View style={[styles.tagBadge, { backgroundColor: isDarkMode ? '#27272A' : '#F3F4F6' }]}>
                                                            <AppText variant="caption" style={{ fontSize: 11, color: colors.textLight }}>
                                                                {preset.tag}
                                                            </AppText>
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    keyboardContainer: {
        width: '100%',
        maxHeight: '85%',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 12,
        maxHeight: '100%',
    },
    indicatorContainer: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    dragIndicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
        marginBottom: 16,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    inputCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
    },
    inputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputRow: {
        minHeight: 52,
        justifyContent: 'center',
    },
    textInput: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
        padding: 0,
        margin: 0,
    },
    inputFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    presetsHeader: {
        marginBottom: 12,
    },
    presetsList: {
        gap: 8,
    },
    presetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
});
