import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';
import { diseaseService } from '../services/diseaseService';

export default function ImagePreviewScreen({ route, navigation }) {
    const { imageUri } = route.params || {};
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleAnalyze = async () => {
        if (!imageUri) {
            Alert.alert("Missing Image", "Please select an image first.");
            return;
        }

        setAnalyzing(true);
        setProgress(0);
        try {
            // Upload the RAW multipart image to FastAPI with real progress reporting
            const prediction = await diseaseService.predict(
                imageUri,
                (val) => setProgress(val)
            );
            setAnalyzing(false);
            // Transition to result screen with real ML payload
            navigation.replace('Result', { prediction });
        } catch (error) {
            setAnalyzing(false);
            Alert.alert("Analysis Error", error.message);
        }
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

            {/* Image Container */}
            <View style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                ) : (
                    <View style={styles.mockOverlay}>
                        <MaterialCommunityIcons name="image-off" size={60} color={colors.textLight} />
                        <AppText variant="body" color="textLight" style={{ marginTop: 10 }}>
                            No image selected
                        </AppText>
                    </View>
                )}

                {/* Scanning Animation UI overlay */}
                {analyzing && (
                    <View style={styles.analyzingOverlay}>
                        <ActivityIndicator size="large" color={colors.white} />
                        <AppText variant="heading3" style={{ color: colors.white, marginTop: 16 }}>
                            {progress < 100 ? 'Uploading...' : 'AI Analyzing...'}
                        </AppText>
                        <AppText variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                            {progress < 100 ? `Transferring Image (${progress}%)` : 'Running Deep Learning Model'}
                        </AppText>

                        {/* Progress Bar Container */}
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                        </View>
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
    },
    progressBarContainer: {
        width: '60%',
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        marginTop: 20,
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3
    }
});
