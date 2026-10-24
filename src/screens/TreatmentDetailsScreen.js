import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import TreatmentReminderModal from '../components/TreatmentReminderModal';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { notificationService } from '../services/notificationService';

const TreatmentCard = ({
    type,
    title,
    description,
    iconLib,
    icon,
    color,
    styles,
    colors,
    t,
    language,
    activeReminder,
    onPressReminder
}) => {
    const isScheduled = !!activeReminder;
    const formattedDate = isScheduled
        ? notificationService.formatDate(activeReminder.scheduledTimestamp, language)
        : '';
    const daysLeft = isScheduled
        ? notificationService.getDaysRemaining(activeReminder.scheduledTimestamp)
        : 0;

    return (
        <View style={[styles.card, { borderColor: color + '40' }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    {iconLib === 'Feather' ? (
                        <Feather name={icon} size={24} color={color} />
                    ) : (
                        <MaterialCommunityIcons name={icon} size={24} color={color} />
                    )}
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <AppText variant="caption" style={{ color: color, fontWeight: '700', textTransform: 'uppercase' }}>
                        {type}
                    </AppText>
                    <AppText variant="heading3" style={{ color: colors.text }}>{title}</AppText>
                </View>
            </View>
            <AppText variant="bodyMedium" style={{ marginTop: 12, lineHeight: 22, color: colors.textMedium }}>
                {description}
            </AppText>

            {/* PRODUCTION-LEVEL REMINDER BUTTON / ACTIVE STATUS CAPSULE */}
            {isScheduled ? (
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.activeReminderBtn, { backgroundColor: color + '12', borderColor: color + '60' }]}
                    onPress={onPressReminder}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={[styles.activeDot, { backgroundColor: color }]} />
                        <View style={{ marginLeft: 8, flex: 1 }}>
                            <AppText variant="caption" style={{ color: color, fontWeight: '700' }}>
                                {daysLeft <= 0
                                    ? t('due_today')
                                    : (t('scheduled_active_btn') || '✓ Re-apply: {date} • Tap to manage').replace('{date}', formattedDate)}
                            </AppText>
                            <AppText variant="overline" style={{ color: colors.textMedium, marginTop: 1 }}>
                                {activeReminder.timeOfDay || '07:00 AM'} • {t('tap_to_manage')}
                            </AppText>
                        </View>
                    </View>
                    <Feather name="chevron-right" size={16} color={color} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    activeOpacity={0.75}
                    style={[styles.remindBtn, { backgroundColor: color + '15', borderColor: color + '40' }]}
                    onPress={onPressReminder}
                >
                    <Feather name="bell" size={16} color={color} />
                    <AppText variant="bodySmall" style={{ color: color, fontWeight: '700', marginLeft: 8 }}>
                        {t('remind_reapply')}
                    </AppText>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default function TreatmentDetailsScreen({ route, navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { t, language } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const { details, diseaseName } = route.params || {};

    const [remindersMap, setRemindersMap] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState(null);

    // Load active reminders from persistent storage
    const loadReminders = useCallback(async () => {
        try {
            const list = await notificationService.getReminders();
            const map = {};
            list.forEach(item => {
                if (item.status === 'active' && item.treatmentTitle) {
                    map[item.treatmentTitle.trim().toLowerCase()] = item;
                }
            });
            setRemindersMap(map);
        } catch (e) {
            console.error('Failed to load reminders map', e);
        }
    }, []);

    useEffect(() => {
        loadReminders();
    }, [loadReminders]);

    const handleOpenReminderModal = (treatmentObj) => {
        setSelectedTreatment(treatmentObj);
        setModalVisible(true);
    };

    const handleReminderSaved = (reminder) => {
        if (reminder?.treatmentTitle) {
            setRemindersMap(prev => ({
                ...prev,
                [reminder.treatmentTitle.trim().toLowerCase()]: reminder
            }));
        }
        loadReminders();
    };

    const handleReminderCancelled = (reminderId) => {
        loadReminders();
    };

    const handleReminderCompleted = (reminderId) => {
        loadReminders();
    };

    const isHealthy = diseaseName?.toLowerCase().includes('healthy');
    const headerTitle = isHealthy ? t('care_guide') : t('recommended_treatment');
    const headerIconColor = isHealthy ? colors.primary : colors.accent;
    const headerBgColor = isHealthy
        ? (isDarkMode ? 'rgba(85, 121, 69, 0.2)' : colors.lightSage)
        : (isDarkMode ? 'rgba(241, 163, 68, 0.15)' : colors.softCream);
    const headerBorder = isHealthy
        ? (isDarkMode ? 'rgba(85, 121, 69, 0.4)' : '#D5E0D0')
        : (isDarkMode ? 'rgba(241, 163, 68, 0.3)' : '#F5D0A0');

    const introText = isHealthy
        ? "Your arecanut palm appears in excellent condition! To maintain this high vitality, please follow the prophylactic maintenance recommendations below."
        : "Immediate action helps control the spread of diseases. Please follow the expert agricultural treatments recommended below.";

    const chemTitleKey = details?.chemical_treatment?.title?.trim().toLowerCase();
    const orgTitleKey = details?.organic_treatment?.title?.trim().toLowerCase();

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3" style={{ color: colors.text }}>{headerTitle}</AppText>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <View style={[styles.summaryBox, { backgroundColor: headerBgColor, borderColor: headerBorder }]}>
                    <Feather name={isHealthy ? "check-circle" : "info"} size={20} color={headerIconColor} />
                    <AppText variant="bodyMedium" style={{ marginLeft: 10, flex: 1, color: colors.text }}>
                        {introText}
                    </AppText>
                </View>

                {details?.chemical_treatment && (
                    <TreatmentCard
                        type={t('chemical_option')}
                        title={details.chemical_treatment.title}
                        description={details.chemical_treatment.desc}
                        iconLib="MaterialCommunityIcons"
                        icon="flask-empty-outline"
                        color="#3B82F6"
                        styles={styles}
                        colors={colors}
                        t={t}
                        language={language}
                        activeReminder={remindersMap[chemTitleKey]}
                        onPressReminder={() => handleOpenReminderModal({
                            type: t('chemical_option'),
                            title: details.chemical_treatment.title,
                            description: details.chemical_treatment.desc,
                            color: '#3B82F6',
                        })}
                    />
                )}

                {details?.organic_treatment && (
                    <TreatmentCard
                        type={t('organic_option')}
                        title={details.organic_treatment.title}
                        description={details.organic_treatment.desc}
                        iconLib="Feather"
                        icon="shield"
                        color={colors.primary}
                        styles={styles}
                        colors={colors}
                        t={t}
                        language={language}
                        activeReminder={remindersMap[orgTitleKey]}
                        onPressReminder={() => handleOpenReminderModal({
                            type: t('organic_option'),
                            title: details.organic_treatment.title,
                            description: details.organic_treatment.desc,
                            color: colors.primary,
                        })}
                    />
                )}

                {details?.preventive_measures && details.preventive_measures.length > 0 && (
                    <View style={styles.section}>
                        <AppText variant="heading3" style={[styles.sectionTitle, { color: colors.text }]}>{t('preventative_practices')}</AppText>
                        {details.preventive_measures.map((measure, idx) => (
                            <View key={idx} style={styles.bulletRow}>
                                <View style={styles.bullet} />
                                <AppText variant="bodyMedium" style={{ color: colors.text, flex: 1 }}>{measure}</AppText>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title={t('done_return_home')}
                    onPress={() => navigation.navigate('HomeMain')}
                />
            </View>

            {/* INTERACTIVE PRODUCTION REMINDER MODAL */}
            {selectedTreatment && (
                <TreatmentReminderModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    treatment={selectedTreatment}
                    diseaseName={diseaseName}
                    existingReminder={remindersMap[selectedTreatment?.title?.trim().toLowerCase()]}
                    onReminderSaved={handleReminderSaved}
                    onReminderCancelled={handleReminderCancelled}
                    onReminderCompleted={handleReminderCompleted}
                />
            )}
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    screen: { backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
    summaryBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    card: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    remindBtn: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    activeReminderBtn: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    section: {
        marginTop: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginTop: 8,
        marginRight: 12,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    }
});
