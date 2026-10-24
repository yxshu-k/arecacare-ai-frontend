import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { SOIL_OPTIONS } from '../utils/soilHelper';

export default function SoilTypeSelector({ selectedSoil, onSelectSoil, style }) {
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    return (
        <View style={[styles.container, style]}>
            <View style={styles.headerRow}>
                <View style={styles.labelContainer}>
                    <Feather name="map" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <AppText variant="bodyMedium" style={styles.label}>
                        {t('soil_type')}
                    </AppText>
                    <AppText variant="bodyMedium" style={{ color: colors.error, marginLeft: 4 }}>*</AppText>
                </View>
                <AppText variant="caption" color="textMedium" style={{ fontStyle: 'italic' }}>
                    {t('select_soil_type')}
                </AppText>
            </View>

            <AppText variant="caption" color="textMedium" style={styles.hintText}>
                {t('soil_type_tip')}
            </AppText>

            <View style={styles.grid}>
                {SOIL_OPTIONS.map((item) => {
                    const isSelected = (selectedSoil || '').toLowerCase() === item.key.toLowerCase();
                    return (
                        <TouchableOpacity
                            key={item.key}
                            activeOpacity={0.75}
                            onPress={() => onSelectSoil(item.key)}
                            style={[
                                styles.card,
                                isSelected
                                    ? {
                                        borderColor: colors.primary,
                                        backgroundColor: isDarkMode ? 'rgba(85, 121, 69, 0.2)' : colors.lightSage,
                                        borderWidth: 2,
                                    }
                                    : {
                                        borderColor: colors.border,
                                        backgroundColor: colors.surface,
                                    }
                            ]}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                <View style={{ flex: 1, paddingRight: 8 }}>
                                    <AppText
                                        variant="bodyMedium"
                                        style={[
                                            styles.title,
                                            { color: isSelected ? colors.primary : colors.text }
                                        ]}
                                    >
                                        {t(item.labelKey)}
                                    </AppText>
                                </View>
                                <View
                                    style={[
                                        styles.radioCircle,
                                        isSelected
                                            ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                            : { borderColor: colors.border }
                                    ]}
                                >
                                    {isSelected && <Feather name="check" size={12} color="#FFFFFF" />}
                                </View>
                            </View>

                            <AppText
                                variant="caption"
                                color="textMedium"
                                style={styles.desc}
                            >
                                {t(item.descKey)}
                            </AppText>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        color: colors.text,
        fontWeight: '600',
    },
    hintText: {
        marginBottom: 12,
        fontSize: 12,
        lineHeight: 16,
    },
    grid: {
        gap: 10,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDarkMode ? 0 : 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    desc: {
        fontSize: 12,
        lineHeight: 16,
        paddingLeft: 22,
    },
});
