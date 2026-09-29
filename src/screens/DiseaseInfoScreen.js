import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';

const InfoSection = ({ icon, title, items }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Feather name={icon} size={20} color={colors.primary} />
            <AppText variant="heading3" style={{ marginLeft: 8 }}>{title}</AppText>
        </View>
        {items.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <AppText variant="bodyMedium" color="textMedium" style={{ flex: 1, lineHeight: 22 }}>
                    {item}
                </AppText>
            </View>
        ))}
    </View>
);

export default function DiseaseInfoScreen({ navigation }) {
    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">About Leaf Spot</AppText>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Placeholder for Disease Macro Image */}
                <View style={styles.heroImageMock}>
                    <MaterialCommunityIcons name="leaf-maple" size={60} color={colors.primary} />
                    <AppText variant="heading3" style={{ color: colors.primary, marginTop: 12 }}>Leaf Spot Disease</AppText>
                    <AppText variant="caption" color="textMedium" style={{ marginTop: 4 }}>Colletotrichum gloeosporioides</AppText>
                </View>

                <View style={styles.infoContainer}>
                    <InfoSection
                        icon="alert-circle"
                        title="Symptoms"
                        items={[
                            'Small circular reddish-brown spots on the leaves.',
                            'Yellow halo develops around older spots.',
                            'Severe infection causes leaves to turn yellow and dry up.'
                        ]}
                    />
                    <View style={styles.divider} />
                    <InfoSection
                        icon="thermometer"
                        title="Causes"
                        items={[
                            'Fungal pathogen thrives in high humidity (>80%).',
                            'Temperatures between 24°C and 28°C accelerate growth.',
                            'Poor field sanitation and overcrowding.'
                        ]}
                    />
                    <View style={styles.divider} />
                    <InfoSection
                        icon="shield"
                        title="Preventative Measures"
                        items={[
                            'Maintain proper spacing (2.7m x 2.7m) between palms.',
                            'Ensure good drainage to prevent water stagnation.',
                            'Collect and destroy infected leaves immediately.'
                        ]}
                    />
                </View>

            </ScrollView>
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    scroll: { paddingBottom: 40 },
    heroImageMock: {
        height: 220,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoContainer: {
        paddingHorizontal: 20,
    },
    section: {
        paddingVertical: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginTop: 8,
        marginRight: 12,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    }
});
