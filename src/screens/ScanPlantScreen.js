import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';
import { requestCameraPermission } from '../services/permissionsService';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

// Wait... in a real app this uses expo-camera, but right now we are building the UI blueprint.
// We will mock the camera view with a beautiful dark overlay.

export default function ScanPlantScreen({ navigation }) {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState('back');
    const [flash, setFlash] = useState('off');
    const cameraRef = React.useRef(null);

    const processImage = async (uri) => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 1080 } }], // Compress the image wildly down to 1080px to save rural bandwidth
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );
            navigation.navigate('ImagePreview', { imageUri: manipResult.uri });
        } catch (e) {
            console.error("Compression failed, reverting to original", e);
            navigation.navigate('ImagePreview', { imageUri: uri }); // Fallback
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false, // Provide raw image directly to preview screen
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            await processImage(result.assets[0].uri);
        }
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
    };

    const takePhotoNative = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 1, // Let ImageManipulator handle compression heavily
                });
                await processImage(photo.uri);
            } catch (err) {
                console.error("Camera capture failed", err);
            }
        }
    };

    if (!permission) {
        return <View style={styles.container} />; // Loading state
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionDenied}>
                <Feather name="camera-off" size={60} color="#DC2626" />
                <AppText variant="heading2" style={{ marginTop: 24, color: colors.white }}>Camera Access Denied</AppText>
                <AppText variant="bodyMedium" style={{ marginTop: 12, color: colors.textLight, textAlign: 'center', marginHorizontal: 40 }}>
                    ArecaCare needs camera access to scan your crops. Please enable it in your device settings.
                </AppText>
                <AppButton title="Grant Permission" onPress={requestPermission} style={{ marginTop: 30, width: '60%' }} />
                <AppButton title="Go Back" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: 16, width: '60%' }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Native Live Camera View */}
            <CameraView
                style={{ flex: 1 }}
                facing={facing}
                enableTorch={flash === 'on'}
                ref={cameraRef}
            />

            {/* Scanner Overlay UI */}
            <View
                style={[
                    styles.overlay,
                    { position: 'absolute', top: 0, left: 0, width: width, height: height, zIndex: 10, flex: 0 }
                ]}
                pointerEvents="box-none"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.roundBtn} onPress={() => navigation.goBack()}>
                        <Feather name="x" size={24} color={colors.white} />
                    </TouchableOpacity>
                    <AppText variant="heading2" style={{ color: colors.white }}>Scan Plant</AppText>
                    <TouchableOpacity style={[styles.roundBtn, flash === 'on' && { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]} onPress={toggleFlash}>
                        <Feather name={flash === 'on' ? "zap" : "zap-off"} size={24} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Viewfinder Target */}
                <View style={styles.targetBox} pointerEvents="none">
                    <View style={[styles.corner, styles.tl]} />
                    <View style={[styles.corner, styles.tr]} />
                    <View style={[styles.corner, styles.bl]} />
                    <View style={[styles.corner, styles.br]} />
                    <AppText variant="bodyMedium" style={styles.hintText}>
                        Align the affected leaf within the frame
                    </AppText>
                </View>

                {/* Bottom Action Bar */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
                        <Feather name="image" size={24} color={colors.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.captureBtnOuter}
                        onPress={takePhotoNative}
                    >
                        <View style={styles.captureBtnInner} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn} onPress={toggleCameraFacing}>
                        <Ionicons name="camera-reverse-outline" size={26} color={colors.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },
    cameraFrame: { flex: 1, position: 'relative' },
    placeholderBg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionDenied: {
        flex: 1,
        backgroundColor: colors.black,
        justifyContent: 'center',
        alignItems: 'center'
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 50, // safe area approx
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    roundBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    targetBox: {
        alignSelf: 'center',
        width: width * 0.75,
        height: width * 0.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hintText: {
        color: colors.white,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'absolute',
        bottom: -60,
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: colors.primary,
    },
    tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
    tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
    br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    secondaryBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureBtnOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureBtnInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.white,
    }
});
