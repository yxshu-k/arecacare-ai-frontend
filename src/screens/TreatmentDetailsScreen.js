import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { notificationService } from '../services/notificationService';

const TreatmentCard = ({ type, title, description, iconLib, icon, color, styles, colors, t }) => (
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

        <TouchableOpacity
            style={[styles.remindBtn, { backgroundColor: color + '20' }]}
            onPress={() => notificationService.scheduleTreatmentReminder(title, 5).then((success) => {
                if (success) Alert.alert("Reminder Set", "You will receive a native push notification when it's time to re-apply this treatment.");
            })}
        >
            <Feather name="bell" size={16} color={color} />
            <AppText variant="bodySmall" style={{ color: color, fontWeight: '700', marginLeft: 6 }}>
                {t('remind_reapply')}
            </AppText>
        </TouchableOpacity>
    </View>
);

export default function TreatmentDetailsScreen({ route, navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const { details, diseaseName } = route.params || {};

    const isHealthy = diseaseName?.toLowerCase().includes('healthy');
    const headerTitle = isHealthy ? t('care_guide') : t('recommended_treatment');
    const headerIconColor = isHealthy ? "#10B981" : colors.primary;
    const headerBgColor = isHealthy
        ? (isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7')
        : (isDarkMode ? 'rgba(5, 150, 105, 0.15)' : '#F0FDF4');
    const headerBorder = isHealthy
        ? (isDarkMode ? 'rgba(16, 185, 129, 0.3)' : '#BBF7D0')
        : (isDarkMode ? 'rgba(5, 150, 105, 0.3)' : '#DCFCE7');

    const introText = isHealthy
        ? "Your arecanut palm appears in excellent condition! To maintain this high vitality, please follow the prophylactic maintenance recommendations below."
        : "Immediate action helps control the spread of diseases. Please follow the expert agricultural treatments recommended below.";

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
    },
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },
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
