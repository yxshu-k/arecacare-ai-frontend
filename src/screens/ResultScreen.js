import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function ResultScreen({ route, navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const { prediction } = route.params || {};

    const diseaseName = prediction?.prediction || 'Unknown Condition';
    const confidence = prediction?.confidence || 0;
    const imageUrl = prediction?.saved_path || null;

    const isHealthy = diseaseName.toLowerCase().includes('healthy');
    const isUnknown = diseaseName.toLowerCase().includes('unknown');
    const isNonArecanut = diseaseName.toLowerCase().includes('non-arecanut');

    // Remove prefix for display
    const rawDiseaseName = diseaseName.replace(/Non-Arecanut:\s*/i, '');
    const displayDiseaseName = t(rawDiseaseName) || rawDiseaseName;

    // Dynamic color theming based on prediction state & dark mode
    const themeBg = isHealthy
        ? (isDarkMode ? 'rgba(85, 121, 69, 0.2)' : colors.lightSage)
        : ((isUnknown || isNonArecanut)
            ? (isDarkMode ? 'rgba(156, 163, 175, 0.15)' : '#F3F4F6')
            : (isDarkMode ? 'rgba(220, 38, 38, 0.15)' : '#FEF2F2'));

    const themeBorder = isHealthy
        ? (isDarkMode ? 'rgba(85, 121, 69, 0.4)' : '#D5E0D0')
        : ((isUnknown || isNonArecanut)
            ? (isDarkMode ? 'rgba(156, 163, 175, 0.3)' : colors.border)
            : (isDarkMode ? 'rgba(220, 38, 38, 0.35)' : '#FECACA'));

    const themeText = isHealthy
        ? colors.primary
        : ((isUnknown || isNonArecanut)
            ? (isDarkMode ? '#D1D5DB' : colors.textMedium)
            : colors.error);

    const themeIcon = isHealthy ? 'check-circle' : ((isUnknown || isNonArecanut) ? 'info' : 'alert-triangle');

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('HomeMain')}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3" style={{ color: colors.text }}>{t('detection_result')}</AppText>
                <TouchableOpacity>
                    <Feather name="share-2" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Result Highlight Card */}
                <View style={[styles.resultCard, { backgroundColor: themeBg, borderColor: themeBorder }]}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.mockImageMini} />
                    ) : (
                        <View style={[styles.mockImageMini, { backgroundColor: themeBorder }]}>
                            <MaterialCommunityIcons name="leaf" size={40} color={themeText} />
                        </View>
                    )}
                    <View style={styles.resultContent}>
                        <AppText variant="heading2" style={{ color: themeText, fontSize: 22 }}>
                            {displayDiseaseName}
                        </AppText>
                        <View style={styles.confidenceBadge}>
                            <Feather name={themeIcon} size={14} color={themeText} />
                            <AppText variant="caption" style={{ color: themeText, marginLeft: 4, fontWeight: '700' }}>
                                {t('confidence')}: {confidence.toFixed(1)}%
                            </AppText>
                        </View>
                        {!isHealthy && !isUnknown && !isNonArecanut && (
                            <View style={[styles.severityTag, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.25)' : '#FEE2E2' }]}>
                                <AppText variant="caption" style={{ color: isDarkMode ? '#F87171' : '#DC2626', fontWeight: '700' }}>{t('high_severity')}</AppText>
                            </View>
                        )}
                        {isHealthy && (
                            <View style={[styles.severityTag, { backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.25)' : '#BBF7D0' }]}>
                                <AppText variant="caption" style={{ color: isDarkMode ? '#34D399' : '#16A34A', fontWeight: '700' }}>{t('plant_healthy')}</AppText>
                            </View>
                        )}
                        {isNonArecanut && (
                            <View style={[styles.severityTag, { backgroundColor: isDarkMode ? 'rgba(156, 163, 175, 0.25)' : '#E5E7EB' }]}>
                                <AppText variant="caption" style={{ color: isDarkMode ? '#D1D5DB' : '#4B5563', fontWeight: '700' }}>{t('subject_identified')}</AppText>
                            </View>
                        )}
                    </View>
                </View>

                {/* Detailed Description */}
                <View style={styles.section}>
                    <AppText variant="heading3" style={[styles.sectionTitle, { color: colors.text }]}>{t('description')}</AppText>
                    <AppText variant="body" color="textMedium" style={{ lineHeight: 24, color: colors.textMedium }}>
                        {prediction?.details?.description || 'Detailed agricultural description is currently unavailable for this condition.'}
                    </AppText>
                </View>

                {/* Quick Symptoms List */}
                {prediction?.details?.symptoms && prediction.details.symptoms.length > 0 && (
                    <View style={styles.section}>
                        <AppText variant="heading3" style={[styles.sectionTitle, { color: colors.text }]}>{t('identified_symptoms')}</AppText>
                        {prediction.details.symptoms.map((symp, index) => (
                            <View key={index} style={styles.symptomRow}>
                                <Feather name="alert-circle" size={20} color={colors.accent} />
                                <AppText variant="body" style={styles.symptomText}>{symp}</AppText>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title={isHealthy ? t('view_care_guide') : t('view_treatment')}
                    onPress={() => navigation.navigate('TreatmentDetails', { details: prediction?.details, diseaseName })}
                    style={{ marginBottom: 12 }}
                />
                <AppButton
                    title={t('view_disease_info')}
                    variant="outline"
                    onPress={() => navigation.navigate('DiseaseInfo', { details: prediction?.details, diseaseName })}
                />
            </View>
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
    resultCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    mockImageMini: {
        width: 70,
        height: 70,
        borderRadius: 16,
        backgroundColor: isDarkMode ? colors.surface : '#FCA5A5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    resultContent: { flex: 1 },
    confidenceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    severityTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
    },
    symptomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    symptomText: {
        marginLeft: 12,
        color: colors.text,
        flex: 1,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    }
});
