import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import SoilTypeSelector from '../components/SoilTypeSelector';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { yieldService } from '../services/yieldService';
import { formatNumber } from '../utils/formatters';
import { useKeyboard } from '../hooks/useKeyboard';

export default function YieldInputScreen({ navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const [soilType, setSoilType] = useState('Red Laterite');
    const [rainfall, setRainfall] = useState('');
    const [age, setAge] = useState('');
    const [area, setArea] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const { keyboardHeight, isKeyboardVisible } = useKeyboard();

    const handlePredict = async () => {
        if (!soilType || !rainfall.trim() || !age.trim() || !area.trim()) {
            Alert.alert(t('error') || 'Missing Data', t('fill_all_fields') || 'Please fill in all farm parameters before predicting.');
            return;
        }

        const rainVal = parseFloat(rainfall);
        const ageVal = parseInt(age, 10);
        const areaVal = parseFloat(area);

        if (isNaN(rainVal) || rainVal <= 0) {
            Alert.alert(t('error') || 'Validation Error', 'Please enter a valid average rainfall in mm (e.g. 1200).');
            return;
        }

        if (isNaN(ageVal) || ageVal <= 0 || ageVal > 100) {
            Alert.alert(t('error') || 'Validation Error', 'Please enter a valid palm age between 1 and 100 years.');
            return;
        }

        if (isNaN(areaVal) || areaVal <= 0) {
            Alert.alert(t('error') || 'Validation Error', 'Please enter a valid plantation area in acres.');
            return;
        }

        setLoading(true);
        try {
            const result = await yieldService.predictYield({
                soilType: soilType.trim(),
                rainfall: rainfall.trim(),
                age: age.trim(),
                area: area.trim(),
            });

            navigation.navigate('YieldResult', {
                prediction: result,
                inputs: { soilType, rainfall, age, area },
            });
        } catch (error) {
            Alert.alert(t('error') || 'Prediction Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3" style={{ color: colors.text }}>{t('yield_prediction')}</AppText>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={[
                        styles.scroll,
                        { paddingBottom: isKeyboardVisible ? keyboardHeight + 60 : 40 }
                    ]}
                >

                    <AppText variant="bodyMedium" color="textMedium" style={styles.instructions}>
                        {t('calc_yield')}
                    </AppText>

                    <View style={styles.form}>
                        <SoilTypeSelector
                            selectedSoil={soilType}
                            onSelectSoil={setSoilType}
                        />

                        <AppTextInput
                            label={t('avg_rainfall')}
                            icon="cloud-rain"
                            placeholder="e.g. 1200"
                            keyboardType="numeric"
                            value={rainfall}
                            onChangeText={(text) => setRainfall(formatNumber(text))}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollRef.current?.scrollTo({ y: 240, animated: true });
                                }, 120);
                            }}
                        />

                        <AppTextInput
                            label={t('palm_age')}
                            icon="clock"
                            placeholder="e.g. 5"
                            keyboardType="numeric"
                            value={age}
                            onChangeText={(text) => setAge(formatNumber(text))}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollRef.current?.scrollTo({ y: 340, animated: true });
                                }, 120);
                            }}
                        />

                        <AppTextInput
                            label={t('area_acre')}
                            icon="maximize"
                            placeholder="e.g. 2"
                            keyboardType="numeric"
                            value={area}
                            onChangeText={(text) => setArea(formatNumber(text))}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollRef.current?.scrollTo({ y: 440, animated: true });
                                }, 120);
                            }}
                        />
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <AppButton
                        title={t('predict_yield')}
                        onPress={handlePredict}
                        loading={loading}
                    />
                </View>
            </KeyboardAvoidingView>
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
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    scroll: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 },
    instructions: {
        marginBottom: 20,
        lineHeight: 22,
        color: colors.textMedium,
    },
    form: {
        flex: 1,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    }
});
