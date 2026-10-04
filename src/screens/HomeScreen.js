import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { weatherService } from '../services/weatherService';
import { diseaseService } from '../services/diseaseService';
import { syncService } from '../services/syncService';

export default function HomeScreen({ navigation }) {
    const { userData, logout, activeFarm, switchFarm } = useContext(AuthContext);
    const { colors } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors), [colors]);

    const userName = userData?.name || 'Farmer';
    const targetLocation = activeFarm?.region || '13.9299,75.5681';

    const [weather, setWeather] = useState(null);
    const [recentScans, setRecentScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [weatherData, historyData] = await Promise.all([
                weatherService.getCurrentWeather(targetLocation),
                diseaseService.getHistory()
            ]);

            setWeather(weatherData);
            // Get exactly the last 3 scans
            setRecentScans((historyData || []).slice(0, 3));
        } catch (err) {
            console.warn("Dashboard fetch error:", err.message);
            setError(err.message || "Network Error");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
            // Attempt an imperceptible background queue flush every time we view the Dashboard
            syncService.processQueue();
        }, [activeFarm])
    );

    const getHealthStatus = () => {
        if (!recentScans || recentScans.length === 0) return { status: 'Unknown', color: colors.textMedium, icon: 'help-circle' };
        const diseases = recentScans.filter(scan => scan.disease_name.toLowerCase() !== 'healthy');
        if (diseases.length === 0) return { status: 'Optimal (All Clear)', color: '#22C55E', icon: 'check-circle' };
        if (diseases.length === 1) return { status: 'Minor Risk Detected', color: '#F59E0B', icon: 'alert-circle' };
        return { status: 'Critical Action Needed', color: '#DC2626', icon: 'alert-triangle' };
    };

    const health = getHealthStatus();

    const statusMap = {
        'Unknown': t("status_unknown"),
        'Optimal (All Clear)': t("status_optimal"),
        'Minor Risk Detected': t("status_minor"),
        'Critical Action Needed': t("status_critical")
    };

    const ActionCard = ({ title, subtitle, icon, iconLib = 'Feather', color, onPress }) => (
        <TouchableOpacity style={[styles.card, { borderColor: color + '40' }]} onPress={onPress}>
            <View style={[styles.cardIconContainer, { backgroundColor: color + '15' }]}>
                {iconLib === 'Feather' ? (
                    <Feather name={icon} size={28} color={color} />
                ) : (
                    <MaterialCommunityIcons name={icon} size={28} color={color} />
                )}
            </View>
            <View style={styles.cardTextContainer}>
                <AppText variant="heading3" style={{ color: colors.text }}>{title}</AppText>
                <AppText variant="caption" color="textMedium">{subtitle}</AppText>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textLight} />
        </TouchableOpacity>
    );

    return (
        <Screen style={styles.screen}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <TouchableOpacity onPress={switchFarm} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <AppText variant="heading2">{t("hello")}, {userName} 👋</AppText>
                            <View style={[styles.farmBadge, { backgroundColor: colors.primary + '15', marginLeft: 8 }]}>
                                <Feather name="map-pin" size={12} color={colors.primary} />
                                <AppText variant="caption" style={{ marginLeft: 4, color: colors.primary, fontWeight: '700' }}>{activeFarm.name}</AppText>
                            </View>
                        </TouchableOpacity>
                        {loading ? (
                            <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
                        ) : weather ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <Feather name="cloud" size={16} color={colors.textMedium} />
                                <AppText variant="bodyMedium" color="textMedium" style={{ marginLeft: 6 }}>
                                    {Math.round(weather.temperature)}°C • {weather.weather_condition}
                                </AppText>
                            </View>
                        ) : error ? (
                            <View>
                                <TouchableOpacity onPress={fetchDashboardData} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <Feather name="refresh-cw" size={16} color={colors.error} />
                                    <AppText variant="bodyMedium" color="error" style={{ marginLeft: 6 }}>{error}. {t("retry_sync")}</AppText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                    <Feather name="log-out" size={14} color={colors.textMedium} />
                                    <AppText variant="caption" color="textMedium" style={{ marginLeft: 6, textDecorationLine: 'underline' }}>{t("force_logout")}</AppText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <AppText variant="bodyMedium" color="textMedium" style={{ marginTop: 4 }}>
                                {t("dashboard_title")}
                            </AppText>
                        )}
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.profileBtn}>
                        <Feather name="log-out" size={20} color={colors.textMedium} />
                    </TouchableOpacity>
                </View>

                {/* Primary Action (Scan Plant) */}
                <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => navigation.navigate('ScanPlant')}
                >
                    <View style={styles.primaryActionHeader}>
                        <View>
                            <AppText variant="heading2" style={{ color: colors.white }}>{t('scan_plant')}</AppText>
                            <AppText variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                                {t("detect_disease")}
                            </AppText>
                        </View>
                        <View style={styles.cameraIconWrap}>
                            <Feather name="camera" size={24} color={colors.primary} />
                        </View>
                    </View>
                    <View style={styles.primaryActionFooter}>
                        <MaterialCommunityIcons name="leaf" size={60} color="rgba(255,255,255,0.2)" style={styles.bgIcon} />
                        <AppText variant="bodyMedium" style={{ color: colors.white, fontWeight: '600' }}>
                            {t("tap_camera")}
                        </AppText>
                        <Feather name="arrow-right" size={20} color={colors.white} />
                    </View>
                </TouchableOpacity>

                {/* Crop Health Widget */}
                {recentScans.length > 0 && (
                    <View style={[styles.healthWidget, { borderColor: health.color + '40', backgroundColor: health.color + '10' }]}>
                        <Feather name={health.icon} size={24} color={health.color} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                            <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>{t("farm_health")}: {statusMap[health.status] || health.status}</AppText>
                            <AppText variant="caption" color="textMedium" style={{ marginTop: 2 }}>{t("based_on_scans")}</AppText>
                        </View>
                    </View>
                )}

                {/* Recent Scans Carousel */}
                {!loading && recentScans.length > 0 && (
                    <View style={styles.recentSection}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <AppText variant="heading3">{t("recent_scans")}</AppText>
                            <TouchableOpacity onPress={() => navigation.navigate('History')}>
                                <AppText variant="body" color="primary">{t("view_all")}</AppText>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                            {recentScans.map((scan, index) => (
                                <View key={index} style={styles.recentCard}>
                                    <Image source={{ uri: scan.image_url }} style={styles.recentImage} />
                                    <View style={styles.recentTextWrap}>
                                        <AppText variant="bodyMedium" style={{ fontWeight: '600' }} numberOfLines={1}>{t(scan.disease_name)}</AppText>
                                        <AppText variant="caption" color="textMedium">{new Date(scan.created_at).toLocaleDateString()}</AppText>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <AppText variant="heading3" style={styles.sectionTitle}>{t("quick_tools")}</AppText>

                {/* Secondary Actions */}
                <ActionCard
                    title={t("yield_prediction")}
                    subtitle={t("calc_yield")}
                    icon="bar-chart-2"
                    color={colors.primary}
                    onPress={() => navigation.navigate('YieldInput')}
                />

                <ActionCard
                    title={t("tips_advisory")}
                    subtitle={t("seasonal_practices")}
                    icon="book-open"
                    color="#F59E0B"
                    onPress={() => navigation.navigate('Tips')}
                />

                <ActionCard
                    title={t("weather_analysis")}
                    subtitle={t("weather_insights")}
                    icon="cloud-rain"
                    color="#3B82F6"
                    onPress={() => navigation.navigate('Weather')}
                />

                <ActionCard
                    title={t("ai_chat")}
                    subtitle={t("ask_agribot")}
                    icon="message-circle"
                    color="#E11D48"
                    onPress={() => navigation.navigate('ChatAssistant')}
                />

            </ScrollView>
        </Screen>
    );
}

const getStyles = (colors) => StyleSheet.create({
    screen: { backgroundColor: colors.background },
    scroll: { paddingVertical: 10, paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    profileBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryAction: {
        backgroundColor: colors.primary,
        borderRadius: 20,
        padding: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
        marginBottom: 30,
        overflow: 'hidden',
    },
    primaryActionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    cameraIconWrap: {
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 16,
    },
    primaryActionFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    bgIcon: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        transform: [{ rotate: '-20deg' }],
    },
    sectionTitle: {
        marginBottom: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    cardIconContainer: {
        width: 50,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    farmBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    cardTextContainer: {
        flex: 1,
    },
    healthWidget: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: 1,
    },
    recentSection: {
        marginBottom: 24,
    },
    recentCard: {
        width: 140,
        backgroundColor: colors.surface,
        borderRadius: 16,
        marginRight: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    recentImage: {
        width: '100%',
        height: 90,
        backgroundColor: '#E8F5E9'
    },
    recentTextWrap: {
        padding: 12,
    }
});
