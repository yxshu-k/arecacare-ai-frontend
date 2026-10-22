import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { tipsService } from '../services/tipsService';
import { weatherService } from '../services/weatherService';

export default function TipsScreen({ navigation }) {
    const { colors } = useTheme();
    const styles = React.useMemo(() => getStyles(colors), [colors]);
    const { t } = useLanguage();
    const { activeFarm } = useContext(AuthContext);

    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [weatherLabel, setWeatherLabel] = useState("Syncing Weather...");

    const loadTips = async (forceRefresh = false) => {
        try {
            if (!forceRefresh) setLoading(true);

            let weatherCondition = "Standard Tropics";
            try {
                const targetLocation = activeFarm?.region || '13.9299,75.5681';
                const weatherData = await weatherService.getCurrentWeather(targetLocation);
                if (weatherData) {
                    weatherCondition = `${weatherData.temperature}°C, ${weatherData.weather_condition}`;
                    setWeatherLabel(weatherCondition);
                }
            } catch (e) {
                console.warn("Weather fetch failed, falling back to standard condition for tips.");
                setWeatherLabel("Offline Mode");
            }

            const data = forceRefresh
                ? await tipsService.refreshTips(weatherCondition)
                : await tipsService.getSeasonalTips(weatherCondition);

            setTips(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", error.message || "Failed to load advisory tips.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadTips();
    }, [activeFarm]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadTips(true);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            style={styles.card}
            onPress={() => navigation.navigate('TipDetail', { tip: item })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name={item.icon || 'leaf'} size={24} color="#059669" />
                </View>
                <View style={styles.badge}>
                    <AppText variant="overline" style={styles.badgeText}>{item.category?.toUpperCase()}</AppText>
                </View>
            </View>

            <AppText variant="heading3" numberOfLines={2} style={styles.titleText}>
                {item.title}
            </AppText>

            <View style={styles.cardFooter}>
                <View style={styles.footerRow}>
                    <Feather name="clock" size={14} color={colors.textLight || "#6B7280"} />
                    <AppText variant="caption" style={styles.readTimeText}>{item.readTime}</AppText>
                </View>
                <Feather name="arrow-right" size={18} color="#059669" />
            </View>
        </TouchableOpacity>
    );

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                {navigation.canGoBack() ? (
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Feather name="chevron-left" size={28} color={colors.text} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 28 }} />
                )}
                <AppText variant="heading3">{t("farming_tips")}</AppText>
                <TouchableOpacity onPress={handleRefresh} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Feather name="refresh-cw" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.subHeader}>
                <AppText variant="bodyMedium" color="textMedium" style={styles.instructions}>
                    Dynamic advisory based on current weather ({weatherLabel}).
                </AppText>
            </View>

            <View style={styles.container}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#059669" />
                        <AppText variant="bodyMedium" style={{ marginTop: 20, color: colors.textMedium }}>
                            AI is analyzing current weather...
                        </AppText>
                    </View>
                ) : (
                    <FlatList
                        data={tips}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Feather name="inbox" size={50} color={colors.textLight || "#D1D5DB"} />
                                <AppText variant="bodyMedium" style={{ marginTop: 20, color: colors.textMedium, textAlign: 'center' }}>
                                    No advisory tips immediately available.
                                </AppText>
                            </View>
                        }
                    />
                )}
            </View>
        </Screen>
    );
}

const getStyles = (colors) => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.background,
    },
    subHeader: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    instructions: {
        lineHeight: 22,
        color: colors.textMedium,
    },
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    badgeText: {
        color: '#4B5563',
        fontWeight: '600',
        fontSize: 11,
        letterSpacing: 0.5,
    },
    titleText: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 23,
        color: colors.text,
        marginBottom: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readTimeText: {
        marginLeft: 6,
        color: colors.textMedium,
        fontSize: 12,
        fontWeight: '500',
    }
});

