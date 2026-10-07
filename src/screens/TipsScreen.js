import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Dimensions, ImageBackground } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { tipsService } from '../services/tipsService';
import { weatherService } from '../services/weatherService';

const { width } = Dimensions.get('window');

export default function TipsScreen({ navigation }) {
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
            activeOpacity={0.9}
            style={styles.cardWrapper}
            onPress={() => navigation.navigate('TipDetail', { tip: item })}
        >
            <LinearGradient
                colors={['#ffffff', '#f8fbf8']}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconBox}>
                        <MaterialCommunityIcons name={item.icon || 'leaf'} size={28} color={colors.primary} />
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
                        <Feather name="clock" size={14} color={colors.textLight} />
                        <AppText variant="caption" style={styles.readTimeText}>{item.readTime}</AppText>
                    </View>
                    <Feather name="arrow-right" size={20} color={colors.primary} />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <Screen style={styles.screen} noPadding>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <AppText variant="heading2" color="white" style={styles.headerTitle}>
                            {t("farming_tips")}
                        </AppText>
                        <AppText variant="bodyMedium" color="white" style={styles.headerSubtitle}>
                            Dynamic Advisory for {weatherLabel}
                        </AppText>
                    </View>
                    <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
                        <Feather name="refresh-cw" size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.container}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.primary} />
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
                                <Feather name="inbox" size={50} color={colors.textLight} />
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

const styles = StyleSheet.create({
    screen: {
        flex: 1, // CRITICAL FIX: Forces full screen scroll bonds
        backgroundColor: colors.background
    },
    container: {
        flex: 1, // CRITICAL FIX: Ensures FlatList inherits remaining scroll height
    },
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontWeight: '800',
        fontSize: 28,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        opacity: 0.9,
        marginTop: 4,
    },
    refreshBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingTop: 24,
        paddingBottom: 100, // Padding for Tab Bar breathing room
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    cardWrapper: {
        marginBottom: 20,
        borderRadius: 24,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 15,
        elevation: 4,
    },
    card: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconBox: {
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: '#ECFDF5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    badgeText: {
        color: colors.textMedium,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    titleText: {
        fontSize: 19,
        fontWeight: '700',
        lineHeight: 26,
        color: colors.text,
        marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.04)',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readTimeText: {
        marginLeft: 6,
        color: colors.textMedium,
        fontWeight: '500',
    }
});
