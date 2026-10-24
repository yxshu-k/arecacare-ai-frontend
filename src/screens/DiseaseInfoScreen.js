import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const InfoSection = ({ icon, title, items, colors, styles }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Feather name={icon} size={20} color={colors.primary} />
            <AppText variant="heading3" style={{ marginLeft: 8, color: colors.text }}>{title}</AppText>
        </View>
        {items.map((item, index) => (
            <View key={index} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <AppText variant="bodyMedium" color="textMedium" style={{ flex: 1, lineHeight: 22, color: colors.textMedium }}>
                    {item}
                </AppText>
            </View>
        ))}
    </View>
);

export default function DiseaseInfoScreen({ route, navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const { details, diseaseName } = route.params || {};

    const isHealthy = diseaseName?.toLowerCase().includes('healthy');
    const heroColor = isHealthy ? colors.primary : colors.primary;
    const heroBg = isDarkMode ? 'rgba(85, 121, 69, 0.18)' : colors.lightSage;

    const localizedDisease = t(diseaseName) || diseaseName || t('condition_overview');

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3" style={{ color: colors.text }}>{localizedDisease}</AppText>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Disease Macro Profile Image */}
                <View style={[styles.heroImageMock, { backgroundColor: heroBg }]}>
                    <MaterialCommunityIcons
                        name={isHealthy ? "leaf" : "leaf-maple"}
                        size={60}
                        color={heroColor}
                    />
                    <AppText variant="heading3" style={{ color: heroColor, marginTop: 12, textAlign: 'center', paddingHorizontal: 20 }}>
                        {localizedDisease}
                    </AppText>
                </View>

                <View style={styles.infoContainer}>
                    <InfoSection
                        icon="info"
                        title={t('description')}
                        items={[details?.description || 'No detailed description available for this condition.']}
                        colors={colors}
                        styles={styles}
                    />

                    {details?.symptoms && details.symptoms.length > 0 && (
                        <>
                            <View style={styles.divider} />
                            <InfoSection
                                icon="alert-circle"
                                title={t('characteristics_symptoms')}
                                items={details.symptoms}
                                colors={colors}
                                styles={styles}
                            />
                        </>
                    )}

                    {details?.preventive_measures && details.preventive_measures.length > 0 && (
                        <>
                            <View style={styles.divider} />
                            <InfoSection
                                icon="shield"
                                title={t('prevention_measures')}
                                items={details.preventive_measures}
                                colors={colors}
                                styles={styles}
                            />
                        </>
                    )}
                </View>
            </ScrollView>
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
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
