import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function YieldResultScreen({ navigation, route }) {
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
        if (lower.includes('low') || lower.includes('poor')) return '#DC2626';
        return '#F59E0B';
    };

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('HomeMain')}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">Prediction Result</AppText>
                <TouchableOpacity>
                    <Feather name="share-2" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <View style={styles.metricContainer}>
                    {/* Visual Circle Gauge Wrapper */}
                    <View style={styles.outerCircle}>
                        <View style={styles.innerCircle}>
                            <AppText style={styles.metricValue}>{yieldValue}</AppText>
                            <AppText variant="bodyMedium" color="textMedium">Tonnes / {inputs.area || '1'} Acre</AppText>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
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
                            <AppText variant="caption" color="textMedium">Yield Per Acre</AppText>
                            <AppText variant="heading2">{yieldPerAcre} T</AppText>
                        </View>
                        <View>
                            <AppText variant="caption" color="textMedium">Quality</AppText>
                            <AppText variant="heading3" style={{ color: getStatusColor() }}>{qualityRating}</AppText>
                        </View>
                    </View>
                </View>

                <View style={styles.insightsCard}>
                    <AppText variant="heading3" style={{ marginBottom: 12 }}>AI Insights</AppText>
                    <AppText variant="body" color="textMedium" style={{ lineHeight: 24 }}>
                        {insights}
                    </AppText>
                </View>

                {/* Input Summary */}
                <View style={styles.inputSummaryCard}>
                    <AppText variant="heading3" style={{ marginBottom: 12 }}>Farm Parameters</AppText>
                    <View style={styles.paramRow}>
                        <AppText variant="caption" color="textMedium">Soil Type</AppText>
                        <AppText variant="bodyMedium">{inputs.soilType || '—'}</AppText>
                    </View>
                    <View style={styles.paramRow}>
                        <AppText variant="caption" color="textMedium">Rainfall</AppText>
                        <AppText variant="bodyMedium">{inputs.rainfall || '—'} mm</AppText>
                    </View>
                    <View style={styles.paramRow}>
                        <AppText variant="caption" color="textMedium">Plant Age</AppText>
                        <AppText variant="bodyMedium">{inputs.age || '—'} years</AppText>
                    </View>
                    <View style={styles.paramRow}>
                        <AppText variant="caption" color="textMedium">Farm Area</AppText>
                        <AppText variant="bodyMedium">{inputs.area || '—'} acres</AppText>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title="View Recommendations"
                    onPress={() => navigation.navigate('Tips')}
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: { backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    scroll: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
    metricContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 40,
    },
    outerCircle: {
        width: width * 0.55,
        height: width * 0.55,
        borderRadius: (width * 0.55) / 2,
        borderWidth: 6,
        borderColor: '#D1FAE5',
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
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
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
