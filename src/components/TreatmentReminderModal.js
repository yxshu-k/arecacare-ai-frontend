import React, { useState, useEffect } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Dimensions
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from './AppText';
import AppButton from './AppButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { notificationService } from '../services/notificationService';

const { width } = Dimensions.get('window');

export default function TreatmentReminderModal({
    visible,
    onClose,
    treatment,
    diseaseName,
    existingReminder,
    onReminderSaved,
    onReminderCancelled,
    onReminderCompleted,
}) {
    const { colors, isDarkMode } = useTheme();
    const { t, language } = useLanguage();

    const [selectedInterval, setSelectedInterval] = useState(14);
    const [timeSlot, setTimeSlot] = useState('07:00 AM');
    const [isManaging, setIsManaging] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial setup when modal opens
    useEffect(() => {
        if (visible) {
            if (existingReminder) {
                setIsManaging(true);
                setSelectedInterval(existingReminder.daysInterval || 14);
                setTimeSlot(existingReminder.timeOfDay || '07:00 AM');
            } else {
                setIsManaging(false);
                // Default 14 days for chemical, 21 for organic
                const isOrganic = treatment?.type?.toLowerCase()?.includes('organic') ||
                                  treatment?.title?.toLowerCase()?.includes('pseudomonas') ||
                                  treatment?.title?.toLowerCase()?.includes('trichoderma');
                setSelectedInterval(isOrganic ? 21 : 14);
                setTimeSlot('07:00 AM');
            }
        }
    }, [visible, existingReminder, treatment]);

    if (!treatment) return null;

    const themeColor = treatment.color || colors.primary;

    // Calculate preview target date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + selectedInterval);
    const formattedTargetDate = notificationService.formatDate(targetDate.getTime(), language);

    // Days remaining for existing reminder
    const daysRemaining = existingReminder
        ? notificationService.getDaysRemaining(existingReminder.scheduledTimestamp)
        : selectedInterval;

    const formattedExistingDate = existingReminder
        ? notificationService.formatDate(existingReminder.scheduledTimestamp, language)
        : '';

    const handleSave = async () => {
        try {
            setSaving(true);
            const result = await notificationService.scheduleTreatmentReminder({
                diseaseName: diseaseName || 'Arecanut Plantation',
                treatmentType: treatment.type || 'chemical',
                treatmentTitle: treatment.title,
                daysInterval: selectedInterval,
                timeOfDay: timeSlot,
                notes: treatment.description || ''
            });

            if (result.success) {
                Alert.alert(
                    t('reapply_reminder_title'),
                    t('reminder_saved_msg')
                        .replace('{date}', formattedTargetDate)
                        .replace('{title}', treatment.title)
                );
                if (onReminderSaved) onReminderSaved(result.reminder);
                onClose();
            } else {
                Alert.alert(t('error'), result.error || 'Failed to save reminder.');
            }
        } catch (err) {
            console.error('Save reminder error:', err);
            Alert.alert(t('error'), 'Could not schedule reminder.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelReminder = () => {
        if (!existingReminder) return;
        Alert.alert(
            t('cancel_reminder'),
            t('confirm') + '?',
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('cancel_reminder'),
                    style: 'destructive',
                    onPress: async () => {
                        await notificationService.cancelReminder(existingReminder.id);
                        if (onReminderCancelled) onReminderCancelled(existingReminder.id);
                        onClose();
                    }
                }
            ]
        );
    };

    const handleMarkCompleted = async () => {
        if (!existingReminder) return;
        await notificationService.markReminderCompleted(existingReminder.id);
        Alert.alert(t('success'), t('treatment_completed_msg') || 'Marked treatment as applied.');
        if (onReminderCompleted) onReminderCompleted(existingReminder.id);
        onClose();
    };

    const styles = getStyles(colors, isDarkMode, themeColor);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.sheetContainer}>
                    {/* Top Grabber */}
                    <View style={styles.grabber} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleRow}>
                            <View style={[styles.headerIconBox, { backgroundColor: themeColor + '20' }]}>
                                <Feather name="bell" size={20} color={themeColor} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <View style={[styles.typeBadge, { backgroundColor: themeColor + '15' }]}>
                                    <AppText variant="overline" style={{ color: themeColor, fontWeight: '700' }}>
                                        {treatment.type || 'TREATMENT'}
                                    </AppText>
                                </View>
                                <AppText variant="heading3" numberOfLines={1} style={{ color: colors.text, marginTop: 2 }}>
                                    {isManaging ? t('manage_reminder') : t('reapply_reminder_title')}
                                </AppText>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Feather name="x" size={22} color={colors.textMedium} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Treatment Title Card */}
                        <View style={styles.treatmentInfoBox}>
                            <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                                {treatment.title}
                            </AppText>
                            <AppText variant="caption" numberOfLines={2} style={{ color: colors.textMedium, marginTop: 4 }}>
                                {treatment.description}
                            </AppText>
                        </View>

                        {/* MODE 1: ACTIVE REMINDER MANAGEMENT */}
                        {isManaging && existingReminder ? (
                            <View style={styles.managingSection}>
                                <View style={[styles.activeStatusCard, { borderColor: themeColor + '50' }]}>
                                    <View style={styles.statusHeaderRow}>
                                        <View style={[styles.statusIconWrap, { backgroundColor: colors.lightSage || '#E8F0E4' }]}>
                                            <Feather name="check-circle" size={20} color={colors.primary} />
                                        </View>
                                        <View style={{ marginLeft: 10, flex: 1 }}>
                                            <AppText variant="bodySmall" style={{ color: colors.primary, fontWeight: '700' }}>
                                                {t('reminder_active') || 'Reminder Scheduled'}
                                            </AppText>
                                            <AppText variant="heading3" style={{ color: colors.text, marginTop: 2 }}>
                                                {formattedExistingDate}
                                            </AppText>
                                        </View>
                                    </View>

                                    <View style={styles.statusDetailRow}>
                                        <View style={styles.detailItem}>
                                            <Feather name="clock" size={14} color={colors.textMedium} />
                                            <AppText variant="caption" style={{ color: colors.textMedium, marginLeft: 6 }}>
                                                {existingReminder.timeOfDay || '07:00 AM'}
                                            </AppText>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Feather name="calendar" size={14} color={colors.textMedium} />
                                            <AppText variant="caption" style={{ color: colors.textMedium, marginLeft: 6 }}>
                                                {daysRemaining <= 0
                                                    ? t('due_today')
                                                    : t('due_in_days').replace('{days}', daysRemaining)}
                                            </AppText>
                                        </View>
                                    </View>
                                </View>

                                {/* Action Buttons for Active Reminder */}
                                <View style={styles.manageActions}>
                                    <TouchableOpacity
                                        style={[styles.manageBtn, { backgroundColor: colors.primary }]}
                                        onPress={handleMarkCompleted}
                                    >
                                        <Feather name="check" size={18} color="#FFFFFF" />
                                        <AppText variant="bodyMedium" style={styles.manageBtnTextWhite}>
                                            {t('mark_as_applied')}
                                        </AppText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.manageBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
                                        onPress={() => setIsManaging(false)}
                                    >
                                        <Feather name="refresh-cw" size={18} color={colors.text} />
                                        <AppText variant="bodyMedium" style={[styles.manageBtnText, { color: colors.text }]}>
                                            {t('reschedule')}
                                        </AppText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.manageBtn, styles.cancelBtn]}
                                        onPress={handleCancelReminder}
                                    >
                                        <Feather name="trash-2" size={18} color="#EF4444" />
                                        <AppText variant="bodyMedium" style={{ color: '#EF4444', fontWeight: '700', marginLeft: 8 }}>
                                            {t('cancel_reminder')}
                                        </AppText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            /* MODE 2: SCHEDULE / RESCHEDULE INTERVAL SELECTOR */
                            <View>
                                <AppText variant="bodySmall" style={{ color: colors.textMedium, marginBottom: 12 }}>
                                    {t('reapply_reminder_desc')}
                                </AppText>

                                {/* Interval Selection Title */}
                                <AppText variant="bodySmall" style={{ fontWeight: '700', color: colors.text, marginBottom: 10 }}>
                                    {t('interval_select')}
                                </AppText>

                                {/* Preset Interval Options */}
                                <View style={styles.intervalCards}>
                                    {/* 7 Days Option */}
                                    <TouchableOpacity
                                        style={[
                                            styles.intervalCard,
                                            selectedInterval === 7 && styles.intervalCardSelected,
                                            selectedInterval === 7 && { borderColor: themeColor }
                                        ]}
                                        onPress={() => setSelectedInterval(7)}
                                    >
                                        <View style={styles.intervalCardTop}>
                                            <AppText variant="heading2" style={{ color: selectedInterval === 7 ? themeColor : colors.text }}>
                                                7
                                            </AppText>
                                            <AppText variant="caption" style={{ color: colors.textMedium, marginLeft: 4 }}>
                                                {t('days') || 'Days'}
                                            </AppText>
                                        </View>
                                        <AppText variant="caption" style={{ color: selectedInterval === 7 ? themeColor : colors.textMedium, marginTop: 4 }}>
                                            {t('interval_7_days')}
                                        </AppText>
                                    </TouchableOpacity>

                                    {/* 14 Days Option */}
                                    <TouchableOpacity
                                        style={[
                                            styles.intervalCard,
                                            selectedInterval === 14 && styles.intervalCardSelected,
                                            selectedInterval === 14 && { borderColor: themeColor }
                                        ]}
                                        onPress={() => setSelectedInterval(14)}
                                    >
                                        <View style={styles.intervalCardTop}>
                                            <AppText variant="heading2" style={{ color: selectedInterval === 14 ? themeColor : colors.text }}>
                                                14
                                            </AppText>
                                            <AppText variant="caption" style={{ color: colors.textMedium, marginLeft: 4 }}>
                                                {t('days') || 'Days'}
                                            </AppText>
                                            <View style={[styles.recBadge, { backgroundColor: themeColor + '20' }]}>
                                                <AppText variant="overline" style={{ color: themeColor, fontWeight: '700', fontSize: 9 }}>
                                                    REC
                                                </AppText>
                                            </View>
                                        </View>
                                        <AppText variant="caption" style={{ color: selectedInterval === 14 ? themeColor : colors.textMedium, marginTop: 4 }}>
                                            {t('interval_14_days')}
                                        </AppText>
                                    </TouchableOpacity>

                                    {/* 21 Days Option */}
                                    <TouchableOpacity
                                        style={[
                                            styles.intervalCard,
                                            selectedInterval === 21 && styles.intervalCardSelected,
                                            selectedInterval === 21 && { borderColor: themeColor }
                                        ]}
                                        onPress={() => setSelectedInterval(21)}
                                    >
                                        <View style={styles.intervalCardTop}>
                                            <AppText variant="heading2" style={{ color: selectedInterval === 21 ? themeColor : colors.text }}>
                                                21
                                            </AppText>
                                            <AppText variant="caption" style={{ color: colors.textMedium, marginLeft: 4 }}>
                                                {t('days') || 'Days'}
                                            </AppText>
                                        </View>
                                        <AppText variant="caption" style={{ color: selectedInterval === 21 ? themeColor : colors.textMedium, marginTop: 4 }}>
                                            {t('interval_21_days')}
                                        </AppText>
                                    </TouchableOpacity>
                                </View>

                                {/* Custom Day Stepper */}
                                <View style={styles.stepperRow}>
                                    <AppText variant="bodySmall" style={{ color: colors.text, fontWeight: '600' }}>
                                        {t('custom_days')}
                                    </AppText>
                                    <View style={styles.stepperControls}>
                                        <TouchableOpacity
                                            style={styles.stepBtn}
                                            onPress={() => setSelectedInterval(prev => Math.max(1, prev - 1))}
                                        >
                                            <Feather name="minus" size={18} color={colors.text} />
                                        </TouchableOpacity>
                                        <View style={styles.stepValueBox}>
                                            <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                                                {selectedInterval} {t('days') || 'days'}
                                            </AppText>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.stepBtn}
                                            onPress={() => setSelectedInterval(prev => Math.min(60, prev + 1))}
                                        >
                                            <Feather name="plus" size={18} color={colors.text} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Scheduled Target Date Highlight Preview */}
                                <View style={[styles.targetDateCard, { borderColor: themeColor + '40' }]}>
                                    <View style={[styles.calIconWrap, { backgroundColor: themeColor + '15' }]}>
                                        <Feather name="calendar" size={22} color={themeColor} />
                                    </View>
                                    <View style={{ marginLeft: 12, flex: 1 }}>
                                        <AppText variant="caption" style={{ color: colors.textMedium }}>
                                            {t('scheduled_target_date')}
                                        </AppText>
                                        <AppText variant="heading3" style={{ color: colors.text, marginTop: 2 }}>
                                            {formattedTargetDate}
                                        </AppText>
                                        <AppText variant="caption" style={{ color: themeColor, fontWeight: '600', marginTop: 2 }}>
                                            {t('due_in_days').replace('{days}', selectedInterval)}
                                        </AppText>
                                    </View>
                                </View>

                                {/* Preferred Time Slot */}
                                <View style={styles.timeSlotSection}>
                                    <AppText variant="bodySmall" style={{ fontWeight: '700', color: colors.text, marginBottom: 8 }}>
                                        {t('preferred_time_slot')}
                                    </AppText>
                                    <View style={styles.timeSlotRow}>
                                        <TouchableOpacity
                                            style={[
                                                styles.timeSlotCard,
                                                timeSlot === '07:00 AM' && styles.timeSlotCardActive,
                                                timeSlot === '07:00 AM' && { borderColor: themeColor }
                                            ]}
                                            onPress={() => setTimeSlot('07:00 AM')}
                                        >
                                            <MaterialCommunityIcons
                                                name="weather-sunny"
                                                size={18}
                                                color={timeSlot === '07:00 AM' ? themeColor : colors.textMedium}
                                            />
                                            <AppText
                                                variant="caption"
                                                style={[
                                                    styles.timeSlotText,
                                                    timeSlot === '07:00 AM' && { color: themeColor, fontWeight: '700' }
                                                ]}
                                            >
                                                {t('morning_slot')}
                                            </AppText>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.timeSlotCard,
                                                timeSlot === '04:30 PM' && styles.timeSlotCardActive,
                                                timeSlot === '04:30 PM' && { borderColor: themeColor }
                                            ]}
                                            onPress={() => setTimeSlot('04:30 PM')}
                                        >
                                            <MaterialCommunityIcons
                                                name="weather-sunset"
                                                size={18}
                                                color={timeSlot === '04:30 PM' ? themeColor : colors.textMedium}
                                            />
                                            <AppText
                                                variant="caption"
                                                style={[
                                                    styles.timeSlotText,
                                                    timeSlot === '04:30 PM' && { color: themeColor, fontWeight: '700' }
                                                ]}
                                            >
                                                {t('evening_slot')}
                                            </AppText>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Agronomist Tip */}
                                <View style={[styles.agriTipBox, { backgroundColor: isDarkMode ? 'rgba(241, 163, 68, 0.12)' : (colors.softCream || '#FFF3E2') }]}>
                                    <Feather name="info" size={16} color={colors.secondary || '#F1A344'} />
                                    <AppText variant="caption" style={{ color: colors.text, marginLeft: 8, flex: 1, lineHeight: 18 }}>
                                        {t('agri_spray_tip')}
                                    </AppText>
                                </View>

                                {/* Bottom Confirm Action */}
                                <View style={styles.confirmSection}>
                                    <AppButton
                                        title={t('confirm_schedule')}
                                        onPress={handleSave}
                                        loading={saving}
                                        style={{ backgroundColor: themeColor }}
                                    />
                                    {existingReminder && (
                                        <TouchableOpacity
                                            style={styles.backToManageBtn}
                                            onPress={() => setIsManaging(true)}
                                        >
                                            <AppText variant="bodySmall" style={{ color: colors.textMedium }}>
                                                {t('back')}
                                            </AppText>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (colors, isDarkMode, themeColor) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    backdrop: {
        flex: 1,
    },
    sheetContainer: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: Dimensions.get('window').height * 0.88,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    grabber: {
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border + '50',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    closeBtn: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    treatmentInfoBox: {
        backgroundColor: colors.background,
        padding: 14,
        borderRadius: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    intervalCards: {
        gap: 10,
        marginBottom: 16,
    },
    intervalCard: {
        backgroundColor: colors.surface,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    intervalCardSelected: {
        backgroundColor: themeColor + '10',
    },
    intervalCardTop: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    recBadge: {
        marginLeft: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    stepperRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.background,
        borderRadius: 12,
        marginBottom: 16,
    },
    stepperControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepBtn: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepValueBox: {
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    targetDateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        backgroundColor: themeColor + '12',
        borderWidth: 1,
        marginBottom: 16,
    },
    calIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeSlotSection: {
        marginBottom: 16,
    },
    timeSlotRow: {
        gap: 8,
    },
    timeSlotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    timeSlotCardActive: {
        backgroundColor: themeColor + '10',
    },
    timeSlotText: {
        marginLeft: 8,
        color: colors.text,
    },
    agriTipBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    confirmSection: {
        marginTop: 4,
    },
    backToManageBtn: {
        alignSelf: 'center',
        paddingVertical: 10,
        marginTop: 6,
    },
    managingSection: {
        paddingTop: 4,
    },
    activeStatusCard: {
        backgroundColor: isDarkMode ? 'rgba(85, 121, 69, 0.2)' : (colors.lightSage || '#E8F0E4'),
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    statusHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusDetailRow: {
        flexDirection: 'row',
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border + '40',
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    manageActions: {
        gap: 10,
    },
    manageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
    },
    manageBtnTextWhite: {
        color: '#FFFFFF',
        fontWeight: '700',
        marginLeft: 8,
    },
    manageBtnText: {
        fontWeight: '600',
        marginLeft: 8,
    },
    cancelBtn: {
        backgroundColor: '#FEE2E220',
        borderWidth: 1,
        borderColor: '#EF444440',
        marginTop: 4,
    }
});
