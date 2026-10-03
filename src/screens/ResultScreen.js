import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';

export default function ResultScreen({ route, navigation }) {
    const { prediction } = route.params || {};

    const diseaseName = prediction?.prediction || 'Unknown Condition';
    const confidence = prediction?.confidence || 0;
    const imageUrl = prediction?.saved_path || null;

    const isHealthy = diseaseName.toLowerCase().includes('healthy');
    const isUnknown = diseaseName.toLowerCase().includes('unknown');

    // Dynamic color theming based on prediction state
    const themeBg = isHealthy ? '#DCFCE7' : (isUnknown ? '#F3F4F6' : '#FEF2F2');
    const themeBorder = isHealthy ? '#BBF7D0' : (isUnknown ? '#E5E7EB' : '#FECACA');
    const themeText = isHealthy ? '#16A34A' : (isUnknown ? '#4B5563' : '#DC2626');
    const themeIcon = isHealthy ? 'check-circle' : (isUnknown ? 'help-circle' : 'alert-triangle');

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('HomeMain')}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">Detection Result</AppText>
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
                            {diseaseName}
                        </AppText>
                        <View style={styles.confidenceBadge}>
                            <Feather name={themeIcon} size={14} color={themeText} />
                            <AppText variant="caption" style={{ color: themeText, marginLeft: 4, fontWeight: '700' }}>
                                Confidence: {confidence.toFixed(1)}%
                            </AppText>
                        </View>
                        {!isHealthy && !isUnknown && (
                            <View style={styles.severityTag}>
                                <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>High Severity</AppText>
                            </View>
                        )}
                        {isHealthy && (
                            <View style={[styles.severityTag, { backgroundColor: '#BBF7D0' }]}>
                                <AppText variant="caption" style={{ color: '#16A34A', fontWeight: '700' }}>Plant Healthy</AppText>
                            </View>
                        )}
                    </View>
                </View>

                {/* Detailed Description */}
                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Description</AppText>
                    <AppText variant="body" color="textMedium" style={{ lineHeight: 24 }}>
                        {prediction?.details?.description || 'Detailed agricultural description is currently unavailable for this condition.'}
                    </AppText>
                </View>

                {/* Quick Symptoms List */}
                {prediction?.details?.symptoms && prediction.details.symptoms.length > 0 && (
                    <View style={styles.section}>
                        <AppText variant="heading3" style={styles.sectionTitle}>Identified Symptoms</AppText>
                        {prediction.details.symptoms.map((symp, index) => (
                            <View key={index} style={styles.symptomRow}>
                                <Feather name="alert-circle" size={20} color="#F59E0B" />
                                <AppText variant="body" style={styles.symptomText}>{symp}</AppText>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title={isHealthy ? "View Care Guide" : "View Treatment"}
                    onPress={() => navigation.navigate('TreatmentDetails', { details: prediction?.details, diseaseName })}
                    style={{ marginBottom: 12 }}
                />
                <AppButton
                    title="View Disease Info"
                    variant="outline"
                    onPress={() => navigation.navigate('DiseaseInfo', { details: prediction?.details, diseaseName })}
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
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },
    resultCard: {
        flexDirection: 'row',
        backgroundColor: '#FEF2F2', // Light red tint for disease
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#FECACA',
        alignItems: 'center',
    },
    mockImageMini: {
        width: 70,
        height: 70,
        borderRadius: 16,
        backgroundColor: '#FCA5A5',
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
        backgroundColor: '#FEE2E2',
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
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    }
});
