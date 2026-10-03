import React, { useCallback, useContext, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import FullScreenLoader from '../components/FullScreenLoader';
import { AuthContext } from '../context/AuthContext';
import { diseaseService } from '../services/diseaseService';
import { colors } from '../theme/colors';

const MOCK_HISTORY = [
    { id: '1', disease: 'Leaf Spot Disease', severity: 'High', date: '20 May 2024', color: '#DC2626', bg: '#FEF2F2' },
    { id: '2', disease: 'Yellow Leaf Disease', severity: 'Medium', date: '18 May 2024', color: '#F59E0B', bg: '#FFFBEB' },
    { id: '3', disease: 'Healthy Leaf', severity: 'None', date: '10 May 2024', color: colors.primary, bg: '#F0FDF4' },
];

export default function HistoryScreen() {
    const { userToken } = useContext(AuthContext);
    const [history, setHistory] = useState(MOCK_HISTORY);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const isDemoMode = userToken === 'demo-token-123';

    const fetchHistory = useCallback(async ({ isRefresh = false, isActive = () => true } = {}) => {
        if (isRefresh) {
            setRefreshing(true);
        }

        try {
            if (isDemoMode) {
                console.warn('[HistoryScreen] Demo Mode active. Using mock scan history.');
                if (isActive()) {
                    setHistory(MOCK_HISTORY);
                }
                return;
            }

            const historyItems = await diseaseService.getHistory();
            if (!Array.isArray(historyItems)) {
                throw new Error('Disease history response must be an array.');
            }

            if (isActive()) {
                setHistory(historyItems);
            }
        } catch (error) {
            console.warn('[HistoryScreen] Could not load scan history. Using mock data.', error);
            if (isActive()) {
                setHistory(MOCK_HISTORY);
            }
        } finally {
            if (isActive()) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [isDemoMode]);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            fetchHistory({ isActive: () => isActive });

            return () => {
                isActive = false;
            };
        }, [fetchHistory])
    );

    const handleRefresh = useCallback(() => {
        fetchHistory({ isRefresh: true });
    }, [fetchHistory]);

    const renderItem = ({ item }) => {
        const disease = item.disease || item.disease_name || item.prediction || 'Unknown Condition';
        const severity = item.severity || (disease.toLowerCase().includes('healthy') ? 'None' : 'Unknown');
        const date = item.date || item.created_at || item.timestamp || 'Date unavailable';
        const itemColor = item.color || (severity === 'None' ? colors.primary : colors.error);
        const itemBackground = item.bg || (severity === 'None' ? '#F0FDF4' : '#FEF2F2');

        return (
            <TouchableOpacity style={[styles.card, { borderColor: `${itemColor}30` }]}>
                <View style={[styles.imageMock, { backgroundColor: itemBackground }]}>
                    <MaterialCommunityIcons name="leaf" size={28} color={itemColor} />
                </View>
                <View style={styles.cardContent}>
                    <AppText variant="heading3" style={{ color: itemColor }}>{disease}</AppText>
                    <AppText variant="caption" color="textMedium" style={{ marginTop: 4 }}>
                        Severity: {severity}
                    </AppText>
                    <AppText variant="caption" color="textLight" style={{ marginTop: 2 }}>
                        {date}
                    </AppText>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textLight} />
            </TouchableOpacity>
        );
    };

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <AppText variant="heading2">Scan History</AppText>
                <TouchableOpacity>
                    <Feather name="filter" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item, index) => String(item.id || item._id || item.prediction_id || index)}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={(
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                )}
            />
            <FullScreenLoader visible={loading && !refreshing} message="Loading history..." />
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    list: { padding: 20 },
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
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    imageMock: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    }
});
