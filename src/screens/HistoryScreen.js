import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { diseaseService } from '../services/diseaseService';

export default function HistoryScreen({ navigation }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await diseaseService.getHistory();
            setHistory(data);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to authenticate secure connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const getDiseaseColor = (name) => {
        if (!name) return { color: colors.primary, bg: '#F0FDF4' };
        const lower = name.toLowerCase();
        if (lower.includes('healthy')) return { color: colors.primary, bg: '#F0FDF4' };
        if (lower.includes('unknown')) return { color: '#6B7280', bg: '#F3F4F6' };
        return { color: '#DC2626', bg: '#FEF2F2' };
    };
    const renderItem = ({ item }) => {
        const style = getDiseaseColor(item.disease_name);
        const dateStr = new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        return (
            <TouchableOpacity style={[styles.card, { borderColor: style.color + '30' }]}>
                {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.imageMock} />
                ) : (
                    <View style={[styles.imageMock, { backgroundColor: style.bg }]}>
                        <MaterialCommunityIcons name="leaf" size={28} color={style.color} />
                    </View>
                )}

                <View style={styles.cardContent}>
                    <AppText variant="heading3" style={{ color: style.color, fontSize: 16 }}>{item.disease_name || 'Unknown'}</AppText>
                    <AppText variant="caption" color="textMedium" style={{ marginTop: 4 }}>
                        Confidence: {item.confidence}%
                    </AppText>
                    <AppText variant="caption" color="textLight" style={{ marginTop: 2 }}>
                        {dateStr}
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

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : error ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                    <Feather name="wifi-off" size={48} color={colors.danger || '#DC2626'} />
                    <AppText variant="heading3" style={{ marginTop: 16, textAlign: 'center' }}>Network Required</AppText>
                    <AppText variant="bodyMedium" color="textMedium" style={{ marginTop: 8, textAlign: 'center', marginBottom: 20 }}>
                        {error}
                    </AppText>
                    <TouchableOpacity onPress={fetchHistory} style={[styles.card, { backgroundColor: colors.primary }]}>
                        <AppText variant="bodyMedium" style={{ color: colors.white, fontWeight: '700' }}>Tap to Retry</AppText>
                    </TouchableOpacity>
                </View>
            ) : history.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="inbox" size={48} color={colors.border} />
                    <AppText variant="bodyMedium" color="textLight" style={{ marginTop: 16 }}>No scan history found.</AppText>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
