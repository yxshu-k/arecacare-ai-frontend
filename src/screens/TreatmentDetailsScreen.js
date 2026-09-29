import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';

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
    </View>
);

export default function TreatmentDetailsScreen({ navigation }) {
    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">Recommended Treatment</AppText>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <View style={styles.summaryBox}>
                    <Feather name="info" size={20} color={colors.primary} />
                    <AppText variant="bodyMedium" style={{ marginLeft: 10, flex: 1, color: colors.text }}>
                        Immediate action is required to stop the spread of Leaf Spot. Apply treatments during early morning or late evening.
                    </AppText>
                </View>

                <TreatmentCard
                    type="Chemical Option"
                    title="Fungicide Application"
                    description="Use Mancozeb 75% WP @ 2.5g/L of water. Spray thoroughly covering both surfaces of the leaves."
                    iconLib="MaterialCommunityIcons"
                    icon="flask-empty-outline"
                    color="#3B82F6"
                />

                <TreatmentCard
                    type="Organic Option"
                    title="Bordeaux Mixture"
                    description="Apply 1% Bordeaux mixture. Best organic alternative if applied immediately upon first symptom detection."
                    iconLib="Feather"
                    icon="shield"
                    color={colors.primary}
                />

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Preventative Practices</AppText>
                    <View style={styles.bulletRow}>
                        <View style={styles.bullet} />
                        <AppText variant="bodyMedium">Provide adequate spacing between palms to ensure sunlight and aeration.</AppText>
                    </View>
                    <View style={styles.bulletRow}>
                        <View style={styles.bullet} />
                        <AppText variant="bodyMedium">Remove and immediately destroy infected leaves fallen on ground.</AppText>
                    </View>
                </View>

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
