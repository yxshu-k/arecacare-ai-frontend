import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { weatherService } from '../services/weatherService';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Dynamic Gradient Based on Weather Condition
const getWeatherGradient = (condition) => {
    const lower = (condition || '').toLowerCase();
    if (lower.includes('clear') || lower.includes('sunny')) return ['#4FA8FF', '#1E88E5']; // Deep Sky Blue
    if (lower.includes('cloud')) return ['#8FA3B8', '#5F738A']; // Slate Grey
    if (lower.includes('rain') || lower.includes('drizzle')) return ['#2E4A62', '#14273E']; // Dark Storm
    if (lower.includes('thunder') || lower.includes('storm')) return ['#1F1C2C', '#000000']; // Midnight Purple
    if (lower.includes('fog') || lower.includes('mist')) return ['#A8B8C6', '#728599']; // Foggy Silver
    return ['#4FA8FF', '#1E88E5'];
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

const MetricCard = ({ icon, title, value, unit }) => (
    <View style={styles.glassMetricCard}>
        <Feather name={icon} size={22} color="rgba(255,255,255,0.7)" />
        <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>{title}</AppText>
        <View style={styles.metricRow}>
            <AppText style={styles.metricVal}>{value}</AppText>
            <AppText style={styles.metricUnit}>{unit}</AppText>
        </View>
    </View>
);

const RiskBadge = ({ disease, risk, message }) => {
    const riskGradient = {
        'High': ['#EF4444', '#B91C1C'],
        'Medium': ['#F59E0B', '#B45309'],
        'Low': ['#10B981', '#047857'],
    };
    const colors = riskGradient[risk] || ['#6B7280', '#374151'];

    return (
        <View style={styles.riskCardWrapper}>
            <LinearGradient colors={colors} style={styles.riskCardIndicator} />
            <View style={styles.riskCardBody}>
                <View style={styles.riskHeader}>
                    <AppText variant="bodyMedium" style={{ fontWeight: '800', flex: 1, color: '#1F2937' }}>{disease}</AppText>
                    <View style={[styles.riskBadge, { backgroundColor: colors[0] + '20' }]}>
                        <AppText variant="caption" style={{ color: colors[1], fontWeight: '800' }}>{risk}</AppText>
                    </View>
                </View>
                <AppText variant="caption" style={{ color: '#4B5563', marginTop: 4, lineHeight: 18 }}>
                    {message}
                </AppText>
            </View>
        </View>
    );
};

export default function WeatherScreen({ navigation }) {
    const [weather, setWeather] = useState(null);
    const [advisory, setAdvisory] = useState(null);
    const [loading, setLoading] = useState(true);
    const { activeFarm } = useContext(AuthContext);

    useEffect(() => {
        fetchWeatherData();
    }, [activeFarm]);

    const fetchWeatherData = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const gradientColors = getWeatherGradient(weather?.weather_condition);

    if (loading) {
        return (
            <Screen style={styles.screen} noPadding>
                <LinearGradient colors={['#F3F4F6', '#E5E7EB']} style={styles.loadingGradient}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AppText variant="bodyMedium" style={{ marginTop: 16, color: '#6B7280' }}>
                        Calibrating meteorological sensors...
                    </AppText>
                </LinearGradient>
            </Screen>
        );
    }

    return (
        <Screen style={{ flex: 1, backgroundColor: '#F9FAFB' }} noPadding>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Premium Weather Hero Glass Block */}
                <LinearGradient colors={gradientColors} style={styles.heroWidget} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>

                    {/* Header Overlay */}
                    <View style={styles.floatHeader}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                            <Feather name="chevron-left" size={28} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={fetchWeatherData} style={styles.iconBtn}>
                            <Feather name="refresh-cw" size={22} color="white" />
                        </TouchableOpacity>
                    </View>

                    <AppText variant="bodyMedium" style={styles.locationText}>
                        {weather?.location || 'Plantation Region'}
                    </AppText>

                    <MaterialCommunityIcons
                        name={getWeatherIcon(weather?.weather_condition)}
                        size={110}
                        color="white"
                        style={{ marginVertical: 10, alignSelf: 'center' }}
                    />

                    <View style={styles.tempWrapper}>
                        <AppText style={styles.tempText}>{Math.round(weather?.temperature || 0)}°</AppText>
                    </View>

                    <AppText style={styles.conditionText}>
                        {weather?.weather_condition || 'Scanning...'}
                    </AppText>
                    <AppText style={styles.feelsLikeText}>
                        Feels like {Math.round(weather?.feels_like || 0)}°C
                    </AppText>

                    {/* Glassmorphism Metrics Grid */}
                    <View style={styles.glassGrid}>
                        <MetricCard icon="droplet" title="Humidity" value={weather?.humidity ?? '--'} unit="%" />
                        <MetricCard icon="cloud-rain" title="Rainfall" value={weather?.rainfall != null ? weather.rainfall.toFixed(1) : '0'} unit="mm" />
                        <MetricCard icon="wind" title="Wind" value={weather?.wind_speed != null ? weather.wind_speed.toFixed(1) : '--'} unit="kmh" />
                        <MetricCard icon="cloud" title="Clouds" value={weather?.cloud_coverage ?? '--'} unit="%" />
                    </View>
                </LinearGradient>

                {/* Dashboard Intelligence Section */}
                <View style={styles.contentBody}>
                    {/* Overall Risk Summary */}
                    {advisory && (
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryIconFrame}>
                                <Feather name="activity" size={24} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <AppText variant="bodyMedium" style={{ fontWeight: '800', color: '#1F2937' }}>
                                    Farm Health Status
                                </AppText>
                                <AppText variant="caption" style={{ color: '#4B5563', marginTop: 4, lineHeight: 18 }}>
                                    {advisory.summary}
                                </AppText>
                            </View>
                        </View>
                    )}

                    {/* Pathogen Detection */}
                    {advisory?.risks && advisory.risks.length > 0 && (
                        <>
                            <AppText variant="heading3" style={styles.sectionTitle}>Pathogen Risk Analysis</AppText>
                            {advisory.risks.map((risk, index) => (
                                <RiskBadge key={index} disease={risk.disease} risk={risk.risk} message={risk.message} />
                            ))}
                        </>
                    )}

                    {/* Proactive Intelligence */}
                    {advisory?.recommendations && advisory.recommendations.length > 0 && (
                        <>
                            <AppText variant="heading3" style={[styles.sectionTitle, { marginTop: 10 }]}>Proactive Intelligence</AppText>
                            {advisory.recommendations.map((rec, index) => (
                                <View key={index} style={styles.recCard}>
                                    <View style={styles.recHeader}>
                                        <Feather name="check-circle" size={18} color="#059669" />
                                        <AppText variant="bodyMedium" style={{ fontWeight: '800', marginLeft: 10, color: '#111827' }}>
                                            {rec.disease} Directive
                                        </AppText>
                                    </View>
                                    {rec.spray_advisory ? (
                                        <AppText variant="caption" style={styles.recText}>
                                            <AppText style={{ fontWeight: '700' }}>Rx:</AppText> {rec.spray_advisory}
                                        </AppText>
                                    ) : null}
                                    {rec.prevention ? (
                                        <AppText variant="caption" style={styles.recText}>
                                            <AppText style={{ fontWeight: '700' }}>Shield:</AppText> {rec.prevention}
                                        </AppText>
                                    ) : null}
                                </View>
                            ))}
                        </>
                    )}
                </View>

            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    loadingGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroWidget: {
        paddingTop: 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    floatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 22,
    },
    locationText: {
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    tempWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    tempText: {
        fontSize: 100,
        fontWeight: '300',
        color: 'white',
        lineHeight: 110,
        letterSpacing: -4,
    },
    conditionText: {
        fontSize: 24,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
    },
    feelsLikeText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 4,
    },
    glassGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 35,
        backgroundColor: 'rgba(0,0,0,0.1)',
        padding: 16,
        borderRadius: 24,
    },
    glassMetricCard: {
        width: '23%',
        alignItems: 'center',
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    metricVal: {
        color: 'white',
        fontWeight: '800',
        fontSize: 18,
    },
    metricUnit: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        marginLeft: 2,
    },
    contentBody: {
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        alignItems: 'center',
        marginBottom: 30,
    },
    summaryIconFrame: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    sectionTitle: {
        color: '#111827',
        fontWeight: '800',
        marginBottom: 16,
        marginLeft: 4,
    },
    riskCardWrapper: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    riskCardIndicator: {
        width: 8,
        height: '100%',
    },
    riskCardBody: {
        flex: 1,
        padding: 18,
    },
    riskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    riskBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    recCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    recHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    recText: {
        color: '#4B5563',
        lineHeight: 22,
        marginBottom: 8,
    }
});
