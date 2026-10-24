import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { diseaseService } from '../services/diseaseService';
import * as ImageManipulator from 'expo-image-manipulator';

export default function ImagePreviewScreen({ route, navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const { imageUri } = route.params || {};
    const [currentUri, setCurrentUri] = useState(imageUri);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleAnalyze = async () => {
        if (!currentUri) {
            Alert.alert(t('error') || "Missing Image", t('no_image_selected') || "Please select an image first.");
            return;
        }

        setAnalyzing(true);
        setProgress(0);
        try {
            // Upload the RAW multipart image to FastAPI with real progress reporting
            const prediction = await diseaseService.predict(
                currentUri,
                (val) => setProgress(val)
            );
            setAnalyzing(false);
            // Transition to result screen with real ML payload
            navigation.replace('Result', { prediction });
        } catch (error) {
            setAnalyzing(false);
            Alert.alert(t('error') || "Analysis Error", error.message);
        }
    };

    return (
        <Screen style={styles.screen} noPadding>
            {/* Native-style header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3" style={{ color: colors.text }}>{t('preview_image')}</AppText>
                <View style={{ width: 28 }} />
            </View>

            {/* Image Container */}
            <View style={styles.imageContainer}>
                {currentUri ? (
                    <Image source={{ uri: currentUri }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                ) : (
                    <View style={styles.mockOverlay}>
                        <MaterialCommunityIcons name="image-off" size={60} color={colors.textLight} />
                        <AppText variant="body" color="textLight" style={{ marginTop: 10 }}>
                            {t('no_image_selected')}
                        </AppText>
                    </View>
                )}

                {/* Scanning Animation UI overlay */}
                {analyzing && (
                    <View style={styles.analyzingOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <AppText variant="heading3" style={{ color: '#FFFFFF', marginTop: 16 }}>
                            {progress < 100 ? t('uploading') : t('ai_analyzing')}
                        </AppText>
                        <AppText variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                            {progress < 100 ? `${t('uploading')} (${progress}%)` : t('running_model')}
                        </AppText>

                        {/* Progress Bar Container */}
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
                        </View>
                    </View>
                )}
            </View>

            {/* Edit Toolbar Row */}
            {!analyzing && (
                <View style={styles.editToolbar}>
                    <TouchableOpacity
                        style={styles.toolbarBtn}
                        onPress={async () => {
                            if (!currentUri) return;
                            try {
                                const res = await ImageManipulator.manipulateAsync(currentUri, [{ rotate: -90 }], { format: ImageManipulator.SaveFormat.JPEG });
                                setCurrentUri(res.uri);
                            } catch (e) {
                                console.error(e);
                            }
                        }}>
                        <MaterialCommunityIcons name="rotate-left" size={24} color={colors.text} />
                        <AppText variant="small" style={{ marginTop: 4, color: colors.textMedium }}>{t('rotate')}</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toolbarBtn}
                        onPress={async () => {
                            if (!currentUri) return;
                            try {
                                const { width, height } = await new Promise((res, rej) => {
                                    import('react-native').then(RN => {
                                        RN.Image.getSize(currentUri, (w, h) => res({ width: w, height: h }), rej);
                                    });
                                });
                                // Smart Trim: Hack away 15% edges for a tight diagnostic crop
                                const trimX = Math.round(width * 0.15);
                                const trimY = Math.round(height * 0.15);
                                const cropWidth = width - (trimX * 2);
                                const cropHeight = height - (trimY * 2);

                                const res = await ImageManipulator.manipulateAsync(
                                    currentUri,
                                    [{ crop: { originX: trimX, originY: trimY, width: cropWidth, height: cropHeight } }],
                                    { format: ImageManipulator.SaveFormat.JPEG }
                                );
                                setCurrentUri(res.uri);
                            } catch (e) {
                                console.error("Zoom failure:", e);
                            }
                        }}>
                        <MaterialCommunityIcons name="magnify-plus-outline" size={24} color={colors.text} />
                        <AppText variant="small" style={{ marginTop: 4, color: colors.textMedium }}>{t('zoom_in')}</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toolbarBtn}
                        onPress={() => {
                            Alert.alert(
                                "Manual Crop Unavailable",
                                "React Native Expo Go requires a custom native module (like react-native-image-crop-picker) to manually draw crop boxes, which isn't supported in the basic Expo Go app."
                            );
                        }}>
                        <MaterialCommunityIcons name="crop" size={24} color={colors.text} />
                        <AppText variant="small" style={{ marginTop: 4, color: colors.textMedium }}>{t('crop')}</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toolbarBtn}
                        onPress={async () => {
                            if (!currentUri) return;
                            try {
                                const res = await ImageManipulator.manipulateAsync(currentUri, [{ flip: ImageManipulator.FlipType.Horizontal }], { format: ImageManipulator.SaveFormat.JPEG });
                                setCurrentUri(res.uri);
                            } catch (e) {
                                console.error(e);
                            }
                        }}>
                        <MaterialCommunityIcons name="flip-horizontal" size={24} color={colors.text} />
                        <AppText variant="small" style={{ marginTop: 4, color: colors.textMedium }}>{t('flip')}</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toolbarBtn}
                        onPress={() => {
                            setCurrentUri(imageUri); // Reset to original
                        }}>
                        <MaterialCommunityIcons name="restore" size={24} color={colors.text} />
                        <AppText variant="small" style={{ marginTop: 4, color: colors.textMedium }}>{t('reset')}</AppText>
                    </TouchableOpacity>
                </View>
            )}

            {/* Action Bar */}
            <View style={styles.footer}>
                <AppButton
                    title={t('retake')}
                    variant="outline"
                    onPress={() => navigation.goBack()}
                    style={styles.retakeBtn}
                    disabled={analyzing}
                />
                <AppButton
                    title={t('upload_and_predict')}
                    onPress={handleAnalyze}
                    style={styles.analyzeBtn}
                    loading={analyzing}
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
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    imageContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginVertical: 10,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
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
        backgroundColor: colors.background,
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
        borderRadius: 3
    },
    editToolbar: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    toolbarBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    }
});
