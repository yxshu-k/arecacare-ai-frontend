import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు' },
    { id: 'ml', name: 'Malayalam', native: 'മലയാളം' },
];

export default function LanguageScreen({ navigation }) {
    const { language, changeLanguage, t } = useLanguage();
    const { colors } = useTheme();
    const styles = React.useMemo(() => getStyles(colors), [colors]);

    const LanguageRow = ({ lang }) => {
        const isSelected = language === lang.id;
        return (
            <TouchableOpacity
                style={[styles.langRow, isSelected && styles.langRowSelected]}
                onPress={() => changeLanguage(lang.id)}
            >
                <View style={styles.langNameContainer}>
                    <AppText variant="heading3" style={{ color: isSelected ? colors.primary : colors.text }}>
                        {lang.native}
                    </AppText>
                    <AppText variant="bodyMedium" color="textMedium" style={{ marginLeft: 12 }}>
                        {lang.name}
                    </AppText>
                </View>
                <View style={[styles.radioItem, isSelected && styles.radioItemSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">{t("app_language")}</AppText>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <View style={styles.infoBox}>
                    <Feather name="globe" size={20} color={colors.primary} />
                    <AppText variant="bodyMedium" style={styles.infoText}>
                        Select your preferred language. This will change the entire application interface, including AI recommendations.
                    </AppText>
                </View>

                <View style={styles.listContainer}>
                    {LANGUAGES.map(lang => (
                        <LanguageRow key={lang.id} lang={lang} />
                    ))}
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title="Save Language"
                    onPress={() => navigation.goBack()}
                />
            </View>
        </Screen>
    );
}

const getStyles = (colors) => StyleSheet.create({
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
    scroll: { padding: 20, paddingBottom: 40 },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DCFCE7',
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    infoText: {
        marginLeft: 12,
        color: colors.text,
        flex: 1,
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
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.background,
    },
    langRowSelected: {
        backgroundColor: '#F7FEE7', // slight tint
    },
    langNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioItem: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioItemSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    }
});
