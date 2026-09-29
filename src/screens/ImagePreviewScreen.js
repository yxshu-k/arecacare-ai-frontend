import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';

export default function ImagePreviewScreen({ navigation }) {
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = () => {
        setAnalyzing(true);
        // Simulate AI inference time
        setTimeout(() => {
            setAnalyzing(false);
            navigation.replace('Result'); // push to results
        }, 2500);
    };

    return (
        <Screen style={styles.screen} noPadding>
            {/* Native-style header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">Preview Image</AppText>
                <View style={{ width: 28 }} />
            </View>

            {/* Image Container Mock */}
            <View style={styles.imageContainer}>
                {/* Placeholder for the taken photo */}
                <View style={styles.mockOverlay}>
                    <MaterialCommunityIcons name="leaf" size={120} color={colors.primary} />
                    <AppText variant="body" color="textMedium" style={{ marginTop: 20 }}>
                        Arecanut Leaf Sample
                    </AppText>
                </View>

                {/* Scanning Animation UI overlay */}
                {analyzing && (
                    <View style={styles.analyzingOverlay}>
                        <ActivityIndicator size="large" color={colors.white} />
                        <AppText variant="heading3" style={{ color: colors.white, marginTop: 16 }}>
                            AI Analyzing...
                        </AppText>
                        <AppText variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                            Running Core-ML Deep Learning Model
                        </AppText>
                    </View>
                )}
            </View>

            {/* Action Bar */}
            <View style={styles.footer}>
                <AppButton
                    title="Retake"
                    variant="outline"
                    onPress={() => navigation.goBack()}
                    style={styles.retakeBtn}
                    disabled={analyzing}
                />
                <AppButton
                    title="Analyze"
                    onPress={handleAnalyze}
                    style={styles.analyzeBtn}
                    loading={analyzing}
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
    imageContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginVertical: 10,
        backgroundColor: '#E8F5E9',
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    mockOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    analyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 16,
    },
    retakeBtn: {
        flex: 1,
    },
    analyzeBtn: {
        flex: 2,
    }
});
