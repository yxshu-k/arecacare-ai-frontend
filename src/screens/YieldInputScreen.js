import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import { colors } from '../theme/colors';
import { yieldService } from '../services/yieldService';

export default function YieldInputScreen({ navigation }) {
    const [soilType, setSoilType] = useState('Loamy');
    const [rainfall, setRainfall] = useState('1200');
    const [age, setAge] = useState('5');
    const [area, setArea] = useState('2');
    const [loading, setLoading] = useState(false);

    const handlePredict = async () => {
        if (!soilType.trim() || !rainfall.trim() || !age.trim() || !area.trim()) {
            Alert.alert('Missing Data', 'Please fill in all farm parameters before predicting.');
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
            Alert.alert('Prediction Error', error.message);
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
                <AppText variant="heading3">Yield Prediction</AppText>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    <AppText variant="bodyMedium" color="textMedium" style={styles.instructions}>
                        Enter your farm data accurately to get An AI-powered estimation of your arecanut harvest.
                    </AppText>

                    <View style={styles.form}>
                        <AppTextInput
                            label="Soil Type"
                            icon="map"
                            placeholder="e.g. Loamy, Sandy"
                            value={soilType}
                            onChangeText={setSoilType}
                        />

                        <AppTextInput
                            label="Avg. Rainfall (mm)"
                            icon="cloud-rain"
                            placeholder="e.g. 1200"
                            keyboardType="numeric"
                            value={rainfall}
                            onChangeText={setRainfall}
                        />

                        <AppTextInput
                            label="Age of Plants (Years)"
                            icon="clock"
                            placeholder="e.g. 5"
                            keyboardType="numeric"
                            value={age}
                            onChangeText={setAge}
                        />

                        <AppTextInput
                            label="Area (Acre)"
                            icon="maximize"
                            placeholder="e.g. 2"
                            keyboardType="numeric"
                            value={area}
                            onChangeText={setArea}
                        />
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <AppButton
                        title="Predict Yield"
                        onPress={handlePredict}
                        loading={loading}
                    />
                </View>
            </KeyboardAvoidingView>
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
    instructions: {
        marginBottom: 20,
        lineHeight: 22,
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
