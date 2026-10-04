import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { weatherService } from '../services/weatherService';
import { AuthContext } from '../context/AuthContext';

const MetricCard = ({ icon, title, value, unit, color }) => (
    <View style={styles.metricCard}>
        <View style={[styles.metricIconBox, { backgroundColor: color + '15' }]}>
            <Feather name={icon} size={24} color={color} />
        </View>
        <AppText variant="caption" color="textMedium" style={{ marginTop: 12 }}>{title}</AppText>
        <View style={styles.metricRow}>
            <AppText variant="heading2" style={{ color: colors.text }}>{value}</AppText>
            <AppText variant="caption" color="textLight" style={{ marginLeft: 4, paddingBottom: 4 }}>{unit}</AppText>
        </View>
    </View>
);

const RiskBadge = ({ disease, risk, message }) => {
    const riskColors = {
        'High': '#DC2626',
        'Medium': '#F59E0B',
        'Low': '#22C55E',
    };
    const badgeColor = riskColors[risk] || '#6B7280';

    return (
        <View style={styles.riskCard}>
            <View style={styles.riskHeader}>
                <AppText variant="bodyMedium" style={{ fontWeight: '700', flex: 1 }}>{disease}</AppText>
                <View style={[styles.riskBadge, { backgroundColor: badgeColor + '20' }]}>
                    <AppText variant="caption" style={{ color: badgeColor, fontWeight: '700' }}>{risk}</AppText>
                </View>
            </View>
            <AppText variant="caption" color="textMedium" style={{ marginTop: 6 }}>{message}</AppText>
        </View>
    );
};

const getWeatherIcon = (condition) => {
    const lower = (condition || '').toLowerCase();
    if (lower.includes('clear') || lower.includes('sunny')) return 'weather-sunny';
    if (lower.includes('cloud')) return 'weather-partly-cloudy';
    if (lower.includes('rain') || lower.includes('drizzle')) return 'weather-rainy';
    if (lower.includes('thunder') || lower.includes('storm')) return 'weather-lightning-rainy';
    if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) return 'weather-fog';
    return 'weather-partly-cloudy';
};

export default function WeatherScreen({ navigation }) {
    const [weather, setWeather] = useState(null);
    const [advisory, setAdvisory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userData, activeFarm } = useContext(AuthContext);

    useEffect(() => {
        fetchWeatherData();
    }, [activeFarm]);

    const fetchWeatherData = async () => {
        setLoading(true);
        setError(null);
        try {
            const targetLocation = activeFarm?.region || '13.9299,75.5681';
            const [weatherData, advisoryData] = await Promise.all([
                weatherService.getCurrentWeather(targetLocation),
                weatherService.getAdvisory(targetLocation),
            ]);
            setWeather(weatherData);
            setAdvisory(advisoryData);
        } catch (err) {
            console.error('[WeatherScreen] Fetch Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

    if (loading) {
        return (
            <Screen style={styles.screen} noPadding>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="chevron-left" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <AppText variant="heading3">Weather Analysis</AppText>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AppText variant="bodyMedium" color="textMedium" style={{ marginTop: 16 }}>
                        Fetching live weather data...
                    </AppText>
                </View>
            </Screen>
        );
    }

    if (error) {
        return (
            <Screen style={styles.screen} noPadding>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="chevron-left" size={28} color={colors.text} />
                    </TouchableOpacity>
                    <AppText variant="heading3">Weather Analysis</AppText>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <Feather name="cloud-off" size={60} color="#DC2626" />
                    <AppText variant="heading3" style={{ marginTop: 16 }}>Unable to Load Weather</AppText>
                    <AppText variant="bodyMedium" color="textMedium" style={{ marginTop: 8, textAlign: 'center', marginHorizontal: 40 }}>
                        {error}
                    </AppText>
                    <TouchableOpacity style={styles.retryBtn} onPress={fetchWeatherData}>
                        <Feather name="refresh-cw" size={18} color={colors.white} />
                        <AppText variant="bodyMedium" style={{ color: colors.white, marginLeft: 8 }}>Retry</AppText>
                    </TouchableOpacity>
                </View>
            </Screen>
        );
    }

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">Weather Analysis</AppText>
                <TouchableOpacity onPress={fetchWeatherData} style={styles.backBtn}>
                    <Feather name="refresh-cw" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Main Temperature Hero Widget */}
                <View style={styles.heroWidget}>
                    <MaterialCommunityIcons
                        name={getWeatherIcon(weather?.weather_condition)}
                        size={100}
                        color={colors.white}
                    />
                    <AppText variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
                        {dateString} • {weather?.location || 'Live'}
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 }}>
                        <AppText style={styles.tempText}>{Math.round(weather?.temperature || 0)}</AppText>
                        <AppText style={styles.celsiusText}>°C</AppText>
                    </View>
                    <AppText variant="heading3" style={{ color: colors.white }}>
                        {weather?.weather_condition || 'Loading...'}
                    </AppText>
                    <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                        Feels like {Math.round(weather?.feels_like || 0)}°C
                    </AppText>
                </View>

                {/* Advisory Box */}
                {advisory && (
                    <View style={[
                        styles.advisoryBox,
                        advisory.overall_risk === 'High' && { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }
                    ]}>
                        <Feather
                            name={advisory.overall_risk === 'High' ? 'alert-triangle' : 'info'}
                            size={20}
                            color={advisory.overall_risk === 'High' ? '#DC2626' : colors.primary}
                        />
                        <View style={{ marginLeft: 10, flex: 1 }}>
                            <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                                Overall Risk: {advisory.overall_risk}
                            </AppText>
                            <AppText variant="caption" color="textMedium" style={{ marginTop: 4 }}>
                                {advisory.summary}
                            </AppText>
                        </View>
                    </View>
                )}

                <AppText variant="heading3" style={styles.sectionTitle}>Farm Metrics</AppText>

                {/* Metric Cards Grid */}
                <View style={styles.grid}>
                    <MetricCard
                        icon="droplet"
                        title="Humidity"
                        value={weather?.humidity ?? '--'}
                        unit="%"
                        color="#3B82F6"
                    />
                    <MetricCard
                        icon="cloud-rain"
                        title="Rainfall"
                        value={weather?.rainfall != null ? weather.rainfall.toFixed(1) : '0'}
                        unit="mm"
                        color="#6366F1"
                    />
                    <MetricCard
                        icon="wind"
                        title="Wind Speed"
                        value={weather?.wind_speed != null ? weather.wind_speed.toFixed(1) : '--'}
                        unit="km/h"
                        color="#06B6D4"
                    />
                    <MetricCard
                        icon="cloud"
                        title="Cloud Cover"
                        value={weather?.cloud_coverage ?? '--'}
                        unit="%"
                        color="#8B5CF6"
                    />
                </View>

                {/* Disease Risk Assessment */}
                {advisory?.risks && advisory.risks.length > 0 && (
                    <>
                        <AppText variant="heading3" style={styles.sectionTitle}>Disease Risk Assessment</AppText>
                        {advisory.risks.map((risk, index) => (
                            <RiskBadge key={index} disease={risk.disease} risk={risk.risk} message={risk.message} />
                        ))}
                    </>
                )}

                {/* Recommendations */}
                {advisory?.recommendations && advisory.recommendations.length > 0 && (
                    <>
                        <AppText variant="heading3" style={[styles.sectionTitle, { marginTop: 8 }]}>Recommendations</AppText>
                        {advisory.recommendations.map((rec, index) => (
                            <View key={index} style={styles.recCard}>
                                <View style={styles.recHeader}>
                                    <Feather name="check-circle" size={18} color={colors.primary} />
                                    <AppText variant="bodyMedium" style={{ fontWeight: '700', marginLeft: 10 }}>{rec.disease}</AppText>
                                </View>
                                {rec.spray_advisory ? (
                                    <AppText variant="caption" color="textMedium" style={{ marginTop: 6 }}>
                                        💊 {rec.spray_advisory}
                                    </AppText>
                                ) : null}
                                {rec.prevention ? (
                                    <AppText variant="caption" color="textMedium" style={{ marginTop: 4 }}>
                                        🛡️ {rec.prevention}
                                    </AppText>
                                ) : null}
                            </View>
                        ))}
                    </>
                )}

            </ScrollView>
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
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    scroll: { paddingBottom: 40, paddingHorizontal: 20 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroWidget: {
        backgroundColor: colors.primary,
        borderRadius: 24,
        alignItems: 'center',
        paddingVertical: 40,
        marginBottom: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    tempText: {
        fontSize: 72,
        fontWeight: '700',
        color: colors.white,
        lineHeight: 80,
    },
    celsiusText: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.white,
        marginTop: 8,
    },
    advisoryBox: {
        flexDirection: 'row',
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#DCFCE7',
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    sectionTitle: {
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    metricCard: {
        width: '48%',
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    metricIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 4,
    },
    riskCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    riskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    riskBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    recCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    recHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    retryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 24,
    },
});
