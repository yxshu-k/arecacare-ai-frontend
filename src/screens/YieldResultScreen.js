import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Share } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getSoilLocalizedLabel, getSoilColor } from '../utils/soilHelper';

const { width } = Dimensions.get('window');

export default function YieldResultScreen({ navigation, route }) {
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const prediction = route.params?.prediction || {};
    const inputs = route.params?.inputs || {};

    const yieldValue = prediction.estimated_yield_tonnes != null
        ? parseFloat(prediction.estimated_yield_tonnes).toFixed(2)
        : '—';

    const yieldPerAcre = prediction.yield_per_acre != null
        ? parseFloat(prediction.yield_per_acre).toFixed(2)
        : '—';

    const qualityRating = prediction.quality_rating || 'Moderate';
    const statusLabel = prediction.status_label || 'Estimated Yield';
    const insights = prediction.insights || 'No detailed insights available at the moment.';

    const getStatusIcon = () => {
        const lower = statusLabel.toLowerCase();
        if (lower.includes('good') || lower.includes('high') || lower.includes('excellent')) return 'trending-up';
        if (lower.includes('low') || lower.includes('poor')) return 'trending-down';
        return 'activity';
    };

    const getStatusColor = () => {
        const lower = statusLabel.toLowerCase();
        if (lower.includes('good') || lower.includes('high') || lower.includes('excellent')) return colors.primary;
        if (lower.includes('low') || lower.includes('poor')) return colors.error;
        return colors.accent;
    };

    const getQualityLabel = (rating) => {
        if (!rating) return '—';
        const lower = String(rating).toLowerCase();
        if (lower.includes('optimal') || lower.includes('high') || lower.includes('excellent')) {
            return t('quality_optimal') || rating;
        }
        if (lower.includes('good')) {
            return t('quality_good') || rating;
        }
        if (lower.includes('moderate')) {
            return t('quality_moderate') || rating;
        }
        if (lower.includes('low') || lower.includes('sub') || lower.includes('poor')) {
            return t('quality_low') || rating;
        }
        return rating;
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `🌿 ArecaCare AI: ${t('yield_prediction')} — ${yieldValue} ${t('tonnes') || 'Tonnes'} (${yieldPerAcre} T/${t('acres')}) for ${inputs.area || '1'} ${t('acres')} (${getSoilLocalizedLabel(inputs.soilType, t)}).`,
            });
        } catch (e) {
            // User dismissed share
        }
    };

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3" style={{ color: colors.text }}>{t('prediction_result')}</AppText>
                <TouchableOpacity onPress={handleShare}>
                    <Feather name="share-2" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <View style={styles.metricContainer}>
                    {/* Visual Circle Gauge Wrapper */}
                    <View style={styles.outerCircle}>
                        <View style={styles.innerCircle}>
                            <AppText style={styles.metricValue}>{yieldValue}</AppText>
                            <AppText variant="bodyMedium" color="textMedium" style={{ color: colors.textMedium }}>
                                {t('tonnes') || 'Tonnes'} / {inputs.area || '1'} {t('acres')}
                            </AppText>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                        <Feather name={getStatusIcon()} size={16} color={getStatusColor()} />
                        <AppText variant="bodyMedium" style={[styles.statusText, { color: getStatusColor() }]}>
                            {statusLabel} ✨
                        </AppText>
                    </View>
                </View>

                {/* Per-Acre Metric */}
                <View style={styles.perAcreCard}>
                    <View style={styles.perAcreRow}>
                        <View>
                            <AppText variant="caption" color="textMedium" style={{ color: colors.textMedium }}>{t('yield_per_acre')}</AppText>
                            <AppText variant="heading2" style={{ color: colors.text }}>{yieldPerAcre} T</AppText>
                        </View>
                        <View>
                            <AppText variant="caption" color="textMedium" style={{ color: colors.textMedium }}>{t('quality')}</AppText>
                            <AppText variant="heading3" style={{ color: getStatusColor() }}>{getQualityLabel(qualityRating)}</AppText>
                        </View>
                    </View>
                </View>

                <View style={styles.insightsCard}>
                    <AppText variant="heading3" style={{ marginBottom: 12, color: colors.text }}>{t('ai_insights')}</AppText>
                    <AppText variant="body" color="textMedium" style={{ lineHeight: 24, color: colors.textMedium }}>
                        {insights}
                    </AppText>
                </View>

                {/* Input Summary */}
                <View style={styles.inputSummaryCard}>
                    <AppText variant="heading3" style={{ marginBottom: 12, color: colors.text }}>{t('farm_parameters')}</AppText>
                    <View style={styles.paramRow}>
                        <AppText variant="caption" color="textMedium" style={{ color: colors.textMedium }}>{t('soil_type')}</AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getSoilColor(inputs.soilType) }} />
                            <AppText variant="bodyMedium" style={{ color: colors.text, fontWeight: '600' }}>
                                {getSoilLocalizedLabel(inputs.soilType, t)}
                            </AppText>
                        </View>
                    </View>
                    <View style={styles.paramRow}>
                        <AppText variant="caption" color="textMedium" style={{ color: colors.textMedium }}>{t('rainfall')}</AppText>
                        <AppText variant="bodyMedium" style={{ color: colors.text }}>{inputs.rainfall || '—'} mm</AppText>
                    </View>
                    <View style={styles.paramRow}>
                        <AppText variant="caption" color="textMedium" style={{ color: colors.textMedium }}>{t('palm_age')}</AppText>
                        <AppText variant="bodyMedium" style={{ color: colors.text }}>{inputs.age || '—'} {t('years') || 'Years'}</AppText>
                    </View>
                    <View style={styles.paramRow}>
                        <AppText variant="caption" color="textMedium" style={{ color: colors.textMedium }}>{t('area_acre')}</AppText>
                        <AppText variant="bodyMedium" style={{ color: colors.text }}>{inputs.area || '—'} {t('acres')}</AppText>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title={t('view_recommendations')}
                    onPress={() => navigation.navigate('Tips')}
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
    scroll: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
    metricContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    outerCircle: {
        width: width * 0.55,
        height: width * 0.55,
        borderRadius: (width * 0.55) / 2,
        borderWidth: 6,
        borderColor: isDarkMode ? 'rgba(85, 121, 69, 0.25)' : colors.lightSage,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    innerCircle: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: (width * 0.55) / 2,
        borderWidth: 6,
        borderColor: colors.primary,
    },
    metricValue: {
        fontSize: 48,
        fontWeight: '800',
        color: colors.text,
        fontFamily: 'sans-serif',
        marginBottom: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        fontWeight: '700',
        marginLeft: 8,
    },
    perAcreCard: {
        width: '100%',
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
    },
    perAcreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    insightsCard: {
        width: '100%',
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.04,
        shadowRadius: 12,
        elevation: 2,
        marginBottom: 16,
    },
    inputSummaryCard: {
        width: '100%',
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
    },
    paramRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
        width: '100%',
    }
});
