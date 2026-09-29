import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';

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

export default function WeatherScreen({ navigation }) {
    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">Weather Analysis</AppText>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Main Temperature Hero Widget */}
                <View style={styles.heroWidget}>
                    <MaterialCommunityIcons name="weather-partly-cloudy" size={100} color={colors.white} />
                    <AppText variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
                        Today, 24 Nov
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 }}>
                        <AppText style={styles.tempText}>28</AppText>
                        <AppText style={styles.celsiusText}>°C</AppText>
                    </View>
                    <AppText variant="heading3" style={{ color: colors.white }}>Partly Cloudy</AppText>
                </View>

                <View style={styles.advisoryBox}>
                    <Feather name="info" size={20} color={colors.primary} />
                    <AppText variant="bodyMedium" style={{ marginLeft: 10, flex: 1, color: colors.text }}>
                        Conditions are highly optimal for fungicide spraying today. Risk of wash-off is very low.
                    </AppText>
                </View>

                <AppText variant="heading3" style={styles.sectionTitle}>Farm Metrics</AppText>

                {/* Metric Cards Grid */}
                <View style={styles.grid}>
                    <MetricCard
                        icon="droplet"
                        title="Humidity"
                        value="65"
                        unit="%"
                        color="#3B82F6"
                    />
                    <MetricCard
                        icon="cloud-rain"
                        title="Rainfall"
                        value="12"
                        unit="mm"
                        color="#6366F1"
                    />
                    <MetricCard
                        icon="wind"
                        title="Wind Speed"
                        value="14"
                        unit="km/h"
                        color="#06B6D4"
                    />
                    <MetricCard
                        icon="sun"
                        title="UV Index"
                        value="High"
                        unit=""
                        color="#F59E0B"
                    />
                </View>

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
        alignItems: 'center',
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
    }
});
