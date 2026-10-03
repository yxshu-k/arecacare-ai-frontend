import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';
import { notificationService } from '../services/notificationService';

const TreatmentCard = ({ type, title, description, iconLib, icon, color }) => (
    <View style={[styles.card, { borderColor: color + '30' }]}>
        <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                {iconLib === 'Feather' ? (
                    <Feather name={icon} size={24} color={color} />
                ) : (
                    <MaterialCommunityIcons name={icon} size={24} color={color} />
                )}
            </View>
            <View style={{ marginLeft: 12 }}>
                <AppText variant="caption" style={{ color: color, fontWeight: '700', textTransform: 'uppercase' }}>
                    {type}
                </AppText>
                <AppText variant="heading3">{title}</AppText>
            </View>
        </View>
        <AppText variant="bodyMedium" color="textMedium" style={{ marginTop: 12, lineHeight: 22 }}>
            {description}
        </AppText>

        <TouchableOpacity
            style={[styles.remindBtn, { backgroundColor: color + '15' }]}
            onPress={() => notificationService.scheduleTreatmentReminder(title, 5).then((success) => {
                if (success) Alert.alert("Reminder Set", "You will receive a native push notification when it's time to re-apply this treatment.");
            })}
        >
            <Feather name="bell" size={16} color={color} />
            <AppText variant="bodySmall" style={{ color: color, fontWeight: '700', marginLeft: 6 }}>
                Remind me to re-apply
            </AppText>
        </TouchableOpacity>
    </View>
);

export default function TreatmentDetailsScreen({ route, navigation }) {
    const { details, diseaseName } = route.params || {};

    const isHealthy = diseaseName?.toLowerCase().includes('healthy');
    const headerTitle = isHealthy ? "Care Guide" : "Recommended Treatment";
    const headerIconColor = isHealthy ? "#16A34A" : colors.primary;
    const headerBgColor = isHealthy ? "#DCFCE7" : "#F0FDF4";
    const headerBorder = isHealthy ? "#BBF7D0" : "#DCFCE7";

    const introText = isHealthy
        ? "Your arecanut palm appears in excellent condition! To maintain this high vitality, please follow the prophylactic maintenance recommendations below."
        : "Immediate action helps control the spread of diseases. Please follow the expert agricultural treatments recommended below.";

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">{headerTitle}</AppText>
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
                        type="Chemical Option"
                        title={details.chemical_treatment.title}
                        description={details.chemical_treatment.desc}
                        iconLib="MaterialCommunityIcons"
                        icon="flask-empty-outline"
                        color="#3B82F6"
                    />
                )}

                {details?.organic_treatment && (
                    <TreatmentCard
                        type="Organic Option"
                        title={details.organic_treatment.title}
                        description={details.organic_treatment.desc}
                        iconLib="Feather"
                        icon="shield"
                        color={colors.primary}
                    />
                )}

                {details?.preventive_measures && details.preventive_measures.length > 0 && (
                    <View style={styles.section}>
                        <AppText variant="heading3" style={styles.sectionTitle}>Preventative Practices</AppText>
                        {details.preventive_measures.map((measure, idx) => (
                            <View key={idx} style={styles.bulletRow}>
                                <View style={styles.bullet} />
                                <AppText variant="bodyMedium">{measure}</AppText>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title="Done & Return Home"
                    onPress={() => navigation.navigate('HomeMain')}
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
    summaryBox: {
        flexDirection: 'row',
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DCFCE7',
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    card: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
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
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center'
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
