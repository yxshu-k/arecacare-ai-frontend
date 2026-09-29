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
                <View style={[styles.resultCard, { backgroundColor: diseaseName === 'Healthy' ? '#DCFCE7' : '#FEF2F2', borderColor: diseaseName === 'Healthy' ? '#BBF7D0' : '#FECACA' }]}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.mockImageMini} />
                    ) : (
                        <View style={styles.mockImageMini}>
                            <MaterialCommunityIcons name="leaf" size={40} color={colors.white} />
                        </View>
                    )}
                    <View style={styles.resultContent}>
                        <AppText variant="heading2" style={{ color: diseaseName === 'Healthy' ? '#16A34A' : '#DC2626' }}>{diseaseName}</AppText>
                        <View style={styles.confidenceBadge}>
                            <Feather name={diseaseName === 'Healthy' ? "check-circle" : "alert-triangle"} size={14} color={diseaseName === 'Healthy' ? '#16A34A' : colors.primary} />
                            <AppText variant="caption" style={{ color: diseaseName === 'Healthy' ? '#16A34A' : colors.primary, marginLeft: 4, fontWeight: '700' }}>
                                Confidence: {confidence.toFixed(1)}%
                            </AppText>
                        </View>
                        {diseaseName !== 'Healthy' && (
                            <View style={styles.severityTag}>
                                <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>High Severity</AppText>
                            </View>
                        )}
                    </View>
                </View>

                {/* Detailed Description */}
                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Description</AppText>
                    <AppText variant="body" color="textMedium" style={{ lineHeight: 24 }}>
                        Leaf Spot is a fungal disease that rapidly deteriorates the arecanut foliage. It starts as small brown circular spots surrounded by a yellow halo. As the disease progresses, these spots merge, causing the entire leaf to dry out and die, significantly impacting overall nut yield.
                    </AppText>
                </View>

                {/* Quick Symptoms List */}
                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Identified Symptoms</AppText>
                    <View style={styles.symptomRow}>
                        <Feather name="alert-circle" size={20} color="#F59E0B" />
                        <AppText variant="body" style={styles.symptomText}>Small circular spots on leaves</AppText>
                    </View>
                    <View style={styles.symptomRow}>
                        <Feather name="alert-circle" size={20} color="#F59E0B" />
                        <AppText variant="body" style={styles.symptomText}>Yellow halo around the primary infection</AppText>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title="View Treatment"
                    onPress={() => navigation.navigate('TreatmentDetails')}
                    style={{ marginBottom: 12 }}
                />
                <AppButton
                    title="View Disease Info"
                    variant="outline"
                    onPress={() => navigation.navigate('DiseaseInfo')}
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
