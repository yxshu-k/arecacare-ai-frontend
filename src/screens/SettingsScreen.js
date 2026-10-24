import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { syncService } from '../services/syncService';

const SettingToggle = ({ icon, iconFamily = 'Feather', title, description, value, onValueChange, colors, styles, disabled = false }) => (
    <View style={[styles.menuRow, disabled && { opacity: 0.5 }]}>
        <View style={styles.menuRowLeft}>
            <View style={styles.iconBox}>
                {iconFamily === 'MaterialCommunityIcons' ? (
                    <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
                ) : (
                    <Feather name={icon} size={20} color={colors.primary} />
                )}
            </View>
            <View style={{ marginLeft: 14, flex: 1, paddingRight: 8 }}>
                <AppText variant="bodyMedium" style={{ color: colors.text, fontWeight: '600' }}>
                    {title}
                </AppText>
                {description && (
                    <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 2, lineHeight: 16 }}>
                        {description}
                    </AppText>
                )}
            </View>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={Platform.OS === 'android' ? (value ? '#FFFFFF' : '#F4F3F4') : '#FFFFFF'}
        />
    </View>
);

export default function SettingsScreen({ navigation }) {
    const { userData, updateUser, activeFarm, refreshLocation } = useContext(AuthContext);
    const { isDarkMode, toggleTheme, colors } = useTheme();
    const { t } = useLanguage();
    const styles = useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    const [loadingSettings, setLoadingSettings] = useState(true);

    // Precision GPS state
    const [gpsEnabled, setGpsEnabled] = useState(true);
    const [gpsRefreshing, setGpsRefreshing] = useState(false);

    // Notification states
    const [pushEnabled, setPushEnabled] = useState(true);
    const [rainAlerts, setRainAlerts] = useState(true);
    const [diseaseAlerts, setDiseaseAlerts] = useState(true);
    const [dailyTips, setDailyTips] = useState(true);

    // Bandwidth & camera states
    const [dataSaver, setDataSaver] = useState(false);
    const [wifiOnlySync, setWifiOnlySync] = useState(false);

    // Offline diagnostics & storage
    const [queueCount, setQueueCount] = useState(0);
    const [syncingNow, setSyncingNow] = useState(false);

    // Load persistent preferences from SecureStore on mount
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const [
                    savedGps,
                    savedPush,
                    savedRain,
                    savedDisease,
                    savedTips,
                    savedDataSaver,
                    savedWifiOnly,
                    count,
                ] = await Promise.all([
                    SecureStore.getItemAsync('pref_gps_tracking'),
                    SecureStore.getItemAsync('pref_push_notifications'),
                    SecureStore.getItemAsync('pref_rain_alerts'),
                    SecureStore.getItemAsync('pref_disease_alerts'),
                    SecureStore.getItemAsync('pref_daily_tips'),
                    SecureStore.getItemAsync('pref_data_saver'),
                    SecureStore.getItemAsync('pref_wifi_only_sync'),
                    syncService.getQueueCount(),
                ]);

                if (savedGps !== null) setGpsEnabled(savedGps === 'true');
                if (savedPush !== null) setPushEnabled(savedPush === 'true');
                else if (userData?.preferences?.notifications !== undefined) {
                    setPushEnabled(!!userData.preferences.notifications);
                }

                if (savedRain !== null) setRainAlerts(savedRain === 'true');
                if (savedDisease !== null) setDiseaseAlerts(savedDisease === 'true');
                if (savedTips !== null) setDailyTips(savedTips === 'true');
                if (savedDataSaver !== null) setDataSaver(savedDataSaver === 'true');
                if (savedWifiOnly !== null) setWifiOnlySync(savedWifiOnly === 'true');

                setQueueCount(count);
            } catch (e) {
                console.warn('[Settings] Preferences load error:', e);
            } finally {
                setLoadingSettings(false);
            }
        };

        loadPreferences();
    }, [userData]);

    // Handle GPS toggle
    const handleToggleGps = async (val) => {
        setGpsEnabled(val);
        await SecureStore.setItemAsync('pref_gps_tracking', String(val));

        if (val) {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Needed', 'Location permission is required for live GPS weather forecasts.');
                setGpsEnabled(false);
                await SecureStore.setItemAsync('pref_gps_tracking', 'false');
                return;
            }
            if (refreshLocation) {
                await refreshLocation();
            }
        }
    };

    // Manual GPS recalibration
    const handleRefreshGps = async () => {
        try {
            setGpsRefreshing(true);
            if (refreshLocation) {
                await refreshLocation();
            }
            Alert.alert(
                'Location Synchronized',
                `Current plantation location: ${activeFarm?.name || activeFarm?.locality || 'Detected'}`
            );
        } catch (e) {
            Alert.alert('GPS Sync Error', 'Could not refresh satellite coordinates.');
        } finally {
            setGpsRefreshing(false);
        }
    };

    // Notification Handlers
    const handleTogglePush = async (val) => {
        setPushEnabled(val);
        await SecureStore.setItemAsync('pref_push_notifications', String(val));
        try {
            await updateUser({
                preferences: {
                    ...(userData?.preferences || {}),
                    notifications: val,
                }
            });
        } catch (e) {
            console.log('Backend preferences sync failed silently, saved locally.');
        }
    };

    const handleToggleRain = async (val) => {
        setRainAlerts(val);
        await SecureStore.setItemAsync('pref_rain_alerts', String(val));
    };

    const handleToggleDisease = async (val) => {
        setDiseaseAlerts(val);
        await SecureStore.setItemAsync('pref_disease_alerts', String(val));
    };

    const handleToggleDailyTips = async (val) => {
        setDailyTips(val);
        await SecureStore.setItemAsync('pref_daily_tips', String(val));
    };

    // Data Saver Handler
    const handleToggleDataSaver = async (val) => {
        setDataSaver(val);
        await SecureStore.setItemAsync('pref_data_saver', String(val));
        if (val) {
            Alert.alert(
                'Data Saver Activated',
                'Disease diagnosis scans will be compressed to 640px to ensure rapid uploads over 2G/3G rural networks.'
            );
        }
    };

    const handleToggleWifiOnly = async (val) => {
        setWifiOnlySync(val);
        await SecureStore.setItemAsync('pref_wifi_only_sync', String(val));
    };

    // Dark Mode Handler
    const handleToggleDarkMode = async (val) => {
        await toggleTheme(val);
        try {
            await updateUser({
                preferences: {
                    ...(userData?.preferences || {}),
                    theme: val ? 'dark' : 'light',
                }
            });
        } catch (e) {}
    };

    // Cloud Synchronization Handler
    const handleSyncNow = async () => {
        try {
            setSyncingNow(true);
            const result = await syncService.processQueue();
            const count = await syncService.getQueueCount();
            setQueueCount(count);

            if (result && result.uploaded > 0) {
                Alert.alert('Sync Successful', `Successfully uploaded ${result.uploaded} offline plant scans to the cloud.`);
            } else if (count === 0) {
                Alert.alert('All Synced', 'All diagnostics and plant scans are already up to date with the cloud.');
            } else {
                Alert.alert('Sync Incomplete', `${count} items remain in offline queue. Check internet connection.`);
            }
        } catch (e) {
            Alert.alert('Sync Error', 'Could not complete cloud synchronization.');
        } finally {
            setSyncingNow(false);
        }
    };

    // Clear Cache Handler
    const handleClearCache = () => {
        Alert.alert(
            'Clear Diagnostic Cache',
            'This will clear temporary offline scan queues. Any unsynced scans will be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await syncService.clearQueue();
                        setQueueCount(0);
                        Alert.alert('Cache Cleared', 'Offline temporary queue has been cleaned.');
                    }
                }
            ]
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
                        {t('settings')}
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.textMedium }}>
                        {t('preferences')}
                    </AppText>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {/* Section 1: Precision Agriculture & GPS */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Feather name="navigation" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                        <AppText variant="caption" style={styles.sectionTitle}>
                            PRECISION AGRICULTURE & SATELLITE GPS
                        </AppText>
                    </View>

                    <SettingToggle
                        icon="map-pin"
                        title="Live Farm GPS Tracking"
                        description="Continuously tracks your current location for hyper-local microclimate alerts"
                        value={gpsEnabled}
                        onValueChange={handleToggleGps}
                        colors={colors}
                        styles={styles}
                    />

                    {/* GPS Status Banner */}
                    <View style={[styles.locationBanner, { backgroundColor: isDarkMode ? 'rgba(85, 121, 69, 0.15)' : (colors.lightSage || '#E8F0E4') }]}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={styles.liveDot} />
                                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700', fontSize: 11 }}>
                                    ACTIVE RADAR STATION
                                </AppText>
                            </View>
                            <AppText variant="bodyMedium" style={{ color: colors.text, fontWeight: '700', marginTop: 2 }}>
                                {activeFarm?.name || userData?.region || 'Current Location'}
                            </AppText>
                            <AppText variant="caption" style={{ color: colors.textMedium }}>
                                {activeFarm?.locality || activeFarm?.district || 'Satellite GPS Coords'}
                            </AppText>
                        </View>

                        <TouchableOpacity
                            style={[styles.refreshGpsBtn, { backgroundColor: colors.surface }]}
                            onPress={handleRefreshGps}
                            disabled={gpsRefreshing}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            {gpsRefreshing ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <>
                                    <Feather name="refresh-cw" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                                    <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
                                        Fix GPS
                                    </AppText>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section 2: Smart Agricultural Notifications */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Feather name="bell" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                        <AppText variant="caption" style={styles.sectionTitle}>
                            AGRICULTURAL NOTIFICATIONS & WARNINGS
                        </AppText>
                    </View>

                    <SettingToggle
                        icon="bell"
                        title="Master Push Notifications"
                        description="Enable all real-time alerts on your device"
                        value={pushEnabled}
                        onValueChange={handleTogglePush}
                        colors={colors}
                        styles={styles}
                    />

                    <SettingToggle
                        icon="cloud-rain"
                        title="Rain & Treatment Timing Alerts"
                        description="Advises optimal window before rains to spray Bordeaux mixture"
                        value={rainAlerts}
                        onValueChange={handleToggleRain}
                        colors={colors}
                        styles={styles}
                        disabled={!pushEnabled}
                    />

                    <SettingToggle
                        icon="alert-triangle"
                        title="Regional Disease Outbreak Warnings"
                        description="Alerts when Koleroga or Bud Rot is reported in your taluk"
                        value={diseaseAlerts}
                        onValueChange={handleToggleDisease}
                        colors={colors}
                        styles={styles}
                        disabled={!pushEnabled}
                    />

                    <SettingToggle
                        icon="book-open"
                        title="Weekly Agronomy Tips"
                        description="Seasonal recommendations for fertilizer & palm nutrition"
                        value={dailyTips}
                        onValueChange={handleToggleDailyTips}
                        colors={colors}
                        styles={styles}
                        disabled={!pushEnabled}
                    />
                </View>

                {/* Section 3: Bandwidth & AI Camera Scanning */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Feather name="wifi" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                        <AppText variant="caption" style={styles.sectionTitle}>
                            DATA BANDWIDTH & AI SCANNING
                        </AppText>
                    </View>

                    <SettingToggle
                        icon="zap"
                        title="Data Saver Mode"
                        description="Compresses scans to 640px to ensure rapid AI inference on 2G/3G networks"
                        value={dataSaver}
                        onValueChange={handleToggleDataSaver}
                        colors={colors}
                        styles={styles}
                    />

                    <SettingToggle
                        icon="wifi"
                        title="Sync Diagnostics on Wi-Fi Only"
                        description="Restricts large sync queues until phone is connected to Wi-Fi"
                        value={wifiOnlySync}
                        onValueChange={handleToggleWifiOnly}
                        colors={colors}
                        styles={styles}
                    />
                </View>

                {/* Section 4: Display & Appearance */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Feather name="moon" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                        <AppText variant="caption" style={styles.sectionTitle}>
                            VISUAL COMFORT & THEME
                        </AppText>
                    </View>

                    <SettingToggle
                        icon="moon"
                        title="Dark Mode"
                        description="High-contrast dark theme designed for night field inspections & battery saving"
                        value={isDarkMode}
                        onValueChange={handleToggleDarkMode}
                        colors={colors}
                        styles={styles}
                    />
                </View>

                {/* Section 5: Offline Diagnostics & Queue Management */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Feather name="hard-drive" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                        <AppText variant="caption" style={styles.sectionTitle}>
                            OFFLINE STORAGE & CLOUD QUEUE
                        </AppText>
                    </View>

                    <View style={styles.storageStatusBox}>
                        <View style={{ flex: 1 }}>
                            <AppText variant="bodyMedium" style={{ color: colors.text, fontWeight: '700' }}>
                                Pending Offline Scans
                            </AppText>
                            <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 2 }}>
                                {queueCount === 0
                                    ? 'All offline diagnostics have been synced to cloud.'
                                    : `${queueCount} scan${queueCount === 1 ? '' : 's'} waiting for cloud synchronization.`}
                            </AppText>
                        </View>
                        <View style={[styles.queueCountBadge, { backgroundColor: queueCount > 0 ? (colors.softCream || '#FFF3E2') : (colors.lightSage || '#E8F0E4') }]}>
                            <AppText
                                variant="caption"
                                style={{
                                    fontWeight: 'bold',
                                    color: queueCount > 0 ? (colors.secondary || '#F1A344') : colors.primary,
                                }}
                            >
                                {queueCount}
                            </AppText>
                        </View>
                    </View>

                    <View style={styles.storageActionsRow}>
                        <TouchableOpacity
                            style={[styles.syncActionBtn, { backgroundColor: colors.primary }]}
                            onPress={handleSyncNow}
                            disabled={syncingNow}
                        >
                            {syncingNow ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Feather name="upload-cloud" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                                    <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                        Sync Queue Now
                                    </AppText>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.clearActionBtn, { borderColor: colors.border }]}
                            onPress={handleClearCache}
                            disabled={syncingNow}
                        >
                            <Feather name="trash-2" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                            <AppText variant="caption" style={{ color: '#DC2626', fontWeight: 'bold' }}>
                                Clear Cache
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section 6: App Diagnostics & Version */}
                <View style={styles.metaCard}>
                    <View style={styles.metaRow}>
                        <AppText variant="caption" style={{ color: colors.textMedium }}>Application Version</AppText>
                        <AppText variant="caption" style={{ color: colors.text, fontWeight: '600' }}>ArecaCare AI v1.0.0 (Production)</AppText>
                    </View>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaRow}>
                        <AppText variant="caption" style={{ color: colors.textMedium }}>AI Model Pipeline</AppText>
                        <AppText variant="caption" style={{ color: colors.text, fontWeight: '600' }}>YOLOv8 + ResNet50 Classifier</AppText>
                    </View>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaRow}>
                        <AppText variant="caption" style={{ color: colors.textMedium }}>Radar Network</AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.greenDot} />
                            <AppText variant="caption" style={{ color: colors.primary, fontWeight: 'bold' }}>Live Satellites Active</AppText>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
    sectionCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 2,
    },
    sectionTitle: {
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: 0.6,
        fontSize: 11,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    menuRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : (colors.lightSage || '#E8F0E4'),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    locationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        marginTop: 12,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginRight: 6,
    },
    refreshGpsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    storageStatusBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    queueCountBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    storageActionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 14,
    },
    syncActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
    },
    clearActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: isDarkMode ? '#1E1E1E' : '#F8FAFC',
    },
    metaCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    metaDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginVertical: 10,
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginRight: 6,
    },
});
