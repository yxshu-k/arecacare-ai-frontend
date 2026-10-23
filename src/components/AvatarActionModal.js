import React, { useState } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';

export default function AvatarActionModal({
    visible,
    onClose,
    avatarUrl,
    userName = 'Profile Photo',
    onUpload,
    onDelete,
}) {
    const { colors, isDarkMode } = useTheme();
    const [viewerVisible, setViewerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const handleCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Camera Permission Needed',
                    'Please grant camera access in settings to capture your profile photo.'
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets[0]?.uri) {
                onClose();
                setLoading(true);
                setLoadingMessage('Uploading photo...');
                try {
                    await onUpload(result.assets[0].uri);
                } catch (err) {
                    Alert.alert('Upload Failed', err?.message || 'Could not update profile photo.');
                } finally {
                    setLoading(false);
                }
            }
        } catch (error) {
            Alert.alert('Error', error?.message || 'Could not launch camera.');
        }
    };

    const handleGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Photo Library Permission Needed',
                    'Please grant photo library access in settings to choose a profile photo.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets[0]?.uri) {
                onClose();
                setLoading(true);
                setLoadingMessage('Uploading photo...');
                try {
                    await onUpload(result.assets[0].uri);
                } catch (err) {
                    Alert.alert('Upload Failed', err?.message || 'Could not update profile photo.');
                } finally {
                    setLoading(false);
                }
            }
        } catch (error) {
            Alert.alert('Error', error?.message || 'Could not open photo gallery.');
        }
    };

    const handleViewPhoto = () => {
        onClose();
        setViewerVisible(true);
    };

    const handleDeletePhoto = () => {
        Alert.alert(
            'Remove Profile Photo?',
            'Are you sure you want to remove your profile picture? It will be replaced with your initial.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        onClose();
                        if (viewerVisible) setViewerVisible(false);
                        setLoading(true);
                        setLoadingMessage('Removing photo...');
                        try {
                            await onDelete();
                        } catch (err) {
                            Alert.alert('Delete Failed', err?.message || 'Could not remove profile photo.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <>
            {/* Loading Overlay */}
            <Modal visible={loading} transparent animationType="fade">
                <View style={styles.loadingBackdrop}>
                    <View style={[styles.loadingBox, { backgroundColor: colors.surface }]}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <AppText variant="bodyMedium" style={{ marginTop: 12, color: colors.text }}>
                            {loadingMessage}
                        </AppText>
                    </View>
                </View>
            </Modal>

            {/* Bottom Action Sheet Modal */}
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.sheetBackdrop}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
                                {/* Top Drag Indicator */}
                                <View style={styles.indicatorContainer}>
                                    <View style={[styles.dragIndicator, { backgroundColor: colors.border }]} />
                                </View>

                                {/* Title Header */}
                                <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
                                    <AppText variant="heading3" style={{ color: colors.text }}>
                                        Profile photo
                                    </AppText>
                                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Feather name="x" size={20} color={colors.textLight} />
                                    </TouchableOpacity>
                                </View>

                                {/* Action Grid / Rows */}
                                <View style={styles.actionGrid}>
                                    {/* Camera */}
                                    <TouchableOpacity style={styles.actionItem} onPress={handleCamera}>
                                        <View style={[styles.actionIconBox, { backgroundColor: isDarkMode ? 'rgba(5, 150, 105, 0.2)' : '#ECFDF5' }]}>
                                            <Feather name="camera" size={22} color="#059669" />
                                        </View>
                                        <AppText variant="caption" style={[styles.actionLabel, { color: colors.text }]}>Camera</AppText>
                                    </TouchableOpacity>

                                    {/* Gallery */}
                                    <TouchableOpacity style={styles.actionItem} onPress={handleGallery}>
                                        <View style={[styles.actionIconBox, { backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF' }]}>
                                            <Feather name="image" size={22} color="#2563EB" />
                                        </View>
                                        <AppText variant="caption" style={[styles.actionLabel, { color: colors.text }]}>Gallery</AppText>
                                    </TouchableOpacity>

                                    {/* View Photo (if available) */}
                                    {!!avatarUrl && (
                                        <TouchableOpacity style={styles.actionItem} onPress={handleViewPhoto}>
                                            <View style={[styles.actionIconBox, { backgroundColor: isDarkMode ? 'rgba(124, 58, 237, 0.2)' : '#F5F3FF' }]}>
                                                <Feather name="eye" size={22} color="#7C3AED" />
                                            </View>
                                            <AppText variant="caption" style={[styles.actionLabel, { color: colors.text }]}>View photo</AppText>
                                        </TouchableOpacity>
                                    )}

                                    {/* Remove Photo (if available) */}
                                    {!!avatarUrl && (
                                        <TouchableOpacity style={styles.actionItem} onPress={handleDeletePhoto}>
                                            <View style={[styles.actionIconBox, { backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.2)' : '#FEF2F2' }]}>
                                                <Feather name="trash-2" size={22} color="#DC2626" />
                                            </View>
                                            <AppText variant="caption" style={[styles.actionLabel, { color: '#DC2626' }]}>
                                                Remove
                                            </AppText>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* WhatsApp-Style Fullscreen Image Viewer Modal */}
            <Modal
                visible={viewerVisible}
                transparent={false}
                animationType="fade"
                onRequestClose={() => setViewerVisible(false)}
            >
                <SafeAreaView style={styles.viewerContainer}>
                    <StatusBar barStyle="light-content" backgroundColor="#000000" />
                    {/* Top Bar */}
                    <View style={styles.viewerHeader}>
                        <TouchableOpacity
                            style={styles.viewerBackBtn}
                            onPress={() => setViewerVisible(false)}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        >
                            <Feather name="arrow-left" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <AppText variant="bodyLarge" style={{ color: '#FFFFFF', fontWeight: 'bold' }} numberOfLines={1}>
                                {userName || 'Profile photo'}
                            </AppText>
                            <AppText variant="caption" style={{ color: '#9CA3AF' }}>
                                Profile photo
                            </AppText>
                        </View>

                        <View style={styles.viewerActions}>
                            <TouchableOpacity
                                style={styles.viewerActionBtn}
                                onPress={() => {
                                    setViewerVisible(false);
                                    handleCamera();
                                }}
                            >
                                <Feather name="camera" size={20} color="#FFFFFF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.viewerActionBtn}
                                onPress={handleDeletePhoto}
                            >
                                <Feather name="trash-2" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Centered Image */}
                    <View style={styles.viewerImageWrapper}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={styles.viewerImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <AppText variant="bodyLarge" style={{ color: '#9CA3AF' }}>
                                No profile picture available
                            </AppText>
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    loadingBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingBox: {
        paddingVertical: 24,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    sheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 12,
    },
    indicatorContainer: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    dragIndicator: {
        width: 38,
        height: 4,
        borderRadius: 2,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
        marginBottom: 16,
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
    },
    actionItem: {
        alignItems: 'center',
        minWidth: 70,
    },
    actionIconBox: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontWeight: '600',
        textAlign: 'center',
    },
    viewerContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    viewerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#27272A',
    },
    viewerBackBtn: {
        padding: 4,
    },
    viewerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    viewerActionBtn: {
        padding: 6,
    },
    viewerImageWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerImage: {
        width: '100%',
        height: '100%',
    },
});
