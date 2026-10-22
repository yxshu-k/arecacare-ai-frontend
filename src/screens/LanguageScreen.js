import React, { useContext, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const LANGUAGES = [
    { id: 'en', name: 'English', native: 'English', region: 'Global / Standard' },
    { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka Official' },
    { id: 'tu', name: 'Tulu', native: 'ತುಳು', region: 'Coastal Dakshina Kannada & Udupi' },
    { id: 'ar', name: 'Arebhashe', native: 'ಅರೆಭಾಷೆ', region: 'Sullia & Kodagu Malnad' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'National Language' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu & Kerala Borders' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు', region: 'Andhra & Telangana' },
    { id: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'Kerala Kasaragod Region' },
];

export default function LanguageScreen({ navigation }) {
    const { language, changeLanguage, t } = useLanguage();
    const { userData, updateUser } = useContext(AuthContext);
    const { colors, isDarkMode } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    const handleSelectLanguage = async (langId) => {
        await changeLanguage(langId);
        try {
            await updateUser({
                preferences: {
                    ...(userData?.preferences || {}),
                    language: langId,
                }
            });
        } catch (e) {}
    };

    const LanguageRow = ({ lang }) => {
        const isSelected = language === lang.id;
        return (
            <TouchableOpacity
                style={[
                    styles.langRow,
                    isSelected && [
                        styles.langRowSelected,
                        { backgroundColor: isDarkMode ? '#064E3B30' : '#ECFDF5' }
                    ]
                ]}
                onPress={() => handleSelectLanguage(lang.id)}
                activeOpacity={0.75}
            >
                <View style={styles.langNameContainer}>
                    <View>
                        <AppText
                            variant="heading3"
                            style={{
                                color: isSelected ? colors.primary : colors.text,
                                fontWeight: isSelected ? '700' : '600',
                            }}
                        >
                            {lang.native}
                        </AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            <AppText variant="caption" style={{ color: colors.textMedium }}>
                                {lang.name}
                            </AppText>
                            <AppText variant="caption" style={{ color: colors.textLight, marginHorizontal: 6 }}>
                                •
                            </AppText>
                            <AppText variant="caption" style={{ color: colors.textLight, fontSize: 11 }}>
                                {lang.region}
                            </AppText>
                        </View>
                    </View>
                </View>

                <View style={[styles.radioItem, isSelected && { borderColor: colors.primary }]}>
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Screen style={styles.screen} noPadding>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="heading2" style={{ color: colors.text }}>
                        {t('lang_title')}
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.textMedium }}>
                        {t('lang_subtitle')}
                    </AppText>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={[styles.infoBox, { backgroundColor: isDarkMode ? 'rgba(5, 150, 105, 0.15)' : '#ECFDF5', borderColor: isDarkMode ? 'rgba(5, 150, 105, 0.3)' : '#A7F3D0' }]}>
                    <Feather name="globe" size={20} color={colors.primary} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <AppText variant="bodyMedium" style={{ color: colors.text, fontWeight: '700' }}>
                            {t('lang_info_title')}
                        </AppText>
                        <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 2, lineHeight: 18 }}>
                            {t('lang_info_desc')}
                        </AppText>
                    </View>
                </View>

                <View style={styles.listContainer}>
                    {LANGUAGES.map(lang => (
                        <LanguageRow key={lang.id} lang={lang} />
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title={t('apply_language')}
                    onPress={() => {
                        Alert.alert(t('lang_applied_title'), t('lang_applied_msg'), [
                            { text: t('ok'), onPress: () => navigation.goBack() }
                        ]);
                    }}
                />
            </View>
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    screen: {
        backgroundColor: colors.background,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        padding: 4,
    },
    scroll: {
        padding: 16,
        paddingBottom: 40,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    listContainer: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    langRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    langRowSelected: {
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    langNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: 10,
    },
    radioItem: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    footer: {
        padding: 16,
        paddingBottom: 28,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
});
