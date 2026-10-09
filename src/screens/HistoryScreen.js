import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, Modal, Alert } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { diseaseService } from '../services/diseaseService';
import { colors } from '../theme/colors';

const SkeletonItem = () => (
    <View style={styles.card}>
        <View style={[styles.imageMock, { backgroundColor: '#F3F4F6' }]} />
        <View style={styles.cardContent}>
            <View style={{ height: 16, width: '60%', backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8 }} />
            <View style={{ height: 12, width: '40%', backgroundColor: '#F3F4F6', borderRadius: 4 }} />
        </View>
    </View>
);

export default function HistoryScreen({ navigation }) {
    const { userToken } = useContext(AuthContext);
    const { t } = useLanguage();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Filtering State
    const [filterMenuVisible, setFilterMenuVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    const fetchHistory = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const data = await diseaseService.getHistory();
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('[HistoryScreen] History Fetch Error:', err);
            setError(err.message || 'Failed to sync history.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory])
    );

    const handleDelete = (id, name) => {
        Alert.alert(
            "Delete Scan",
            `Are you sure you want to permanently delete the record for ${name || 'this scan'}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setRefreshing(true);
                        try {
                            await diseaseService.deleteHistoryItem(id);
                            setHistory(prev => prev.filter(item => item.id !== id));
                        } catch (err) {
                            Alert.alert('Delete Failed', err.message);
                        }
                        setRefreshing(false);
                    }
                }
            ]
        );
    };

    const handleClearAll = () => {
        if (history.length === 0) return;
        Alert.alert(
            "Clear History",
            "This will permanently wipe all history from our secure servers. This cannot be undone.",
            [
                { text: "Keep Scans", style: "cancel" },
                {
                    text: "Wipe All",
                    style: "destructive",
                    onPress: async () => {
                        setRefreshing(true);
                        try {
                            await diseaseService.clearAllHistory();
                            setHistory([]);
                        } catch (err) {
                            Alert.alert('Clear Failed', err.message);
                        }
                        setRefreshing(false);
                    }
                }
            ]
        );
    };

    const getDiseaseColor = (name) => {
        if (!name) return { color: colors.primary, bg: '#F0FDF4' };
        const lower = name.toLowerCase();
        if (lower.includes('healthy')) return { color: '#16A34A', bg: '#DCFCE7' };
        if (lower.includes('unknown')) return { color: '#6B7280', bg: '#F3F4F6' };
        return { color: '#DC2626', bg: '#FEF2F2' };
    };

    // Filter Logic
    const filteredHistory = history.filter(item => {
        const isHealthy = item.disease_name?.toLowerCase().includes('healthy') || item.disease?.toLowerCase().includes('healthy');
        if (activeFilter === 'Healthy') return isHealthy;
        if (activeFilter === 'Diseased') return !isHealthy;
        return true;
    });

    const renderItem = ({ item }) => {
        const rawDiseaseName = item.disease_name || item.disease || item.prediction || 'Unknown Condition';
        const diseaseName = t ? t(rawDiseaseName) : rawDiseaseName;
        const style = getDiseaseColor(rawDiseaseName);
        const dateStr = item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : (item.date || 'Recently');

        return (
            <TouchableOpacity
                style={[styles.card, { borderColor: style.bg }]}
                onPress={() => navigation.navigate('Dashboard', {
                    screen: 'Result',
                    params: {
                        prediction: {
                            prediction: rawDiseaseName,
                            confidence: item.confidence || 95,
                            saved_path: item.image_url || item.saved_path,
                            details: item.details
                        }
                    }
                })}
            >
                {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.imageMock} />
                ) : (
                    <View style={[styles.imageMock, { backgroundColor: style.bg }]}>
                        <MaterialCommunityIcons name="leaf" size={28} color={style.color} />
                    </View>
                )}

                <View style={styles.cardContent}>
                    <AppText variant="heading3" style={{ color: style.color, fontSize: 16 }}>
                        {diseaseName}
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                        {item.confidence && <AppText variant="caption" color="textMedium">Conf: {item.confidence}%</AppText>}
                        <AppText variant="caption" color="textLight">{dateStr}</AppText>
                    </View>
                </View>

                {/* Trash Icon */}
                <TouchableOpacity onPress={() => handleDelete(item.id || item._id, rawDiseaseName)} style={styles.deleteBtn}>
                    <Feather name="trash-2" size={20} color="#DC2626" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AppText variant="heading2">{t ? t("scan_history") : "Scan History"}</AppText>
                    {history.length > 0 && (
                        <TouchableOpacity onPress={handleClearAll} style={{ marginLeft: 16 }}>
                            <AppText variant="bodySmall" style={{ color: '#DC2626', fontWeight: '700' }}>{t ? t("clear_all") : "CLEAR"}</AppText>
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity onPress={() => setFilterMenuVisible(true)} style={styles.filterIcon}>
                    <Feather name="filter" size={22} color={activeFilter !== 'All' ? colors.primary : colors.text} />
                    {activeFilter !== 'All' && <View style={styles.filterDot} />}
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.list}>
                    {[1, 2, 3, 4, 5].map(k => <SkeletonItem key={k} />)}
                </View>
            ) : error && history.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="wifi-off" size={48} color={colors.danger || '#DC2626'} />
                    <AppText variant="heading3" style={{ marginTop: 16, textAlign: 'center' }}>Offline Mode</AppText>
                    <AppText variant="bodyMedium" color="textMedium" style={{ marginTop: 8, textAlign: 'center' }}>
                        {error}
                    </AppText>
                    <TouchableOpacity onPress={() => fetchHistory()} style={[styles.card, { backgroundColor: colors.primary, marginTop: 20 }]}>
                        <AppText variant="bodyMedium" style={{ color: colors.white, fontWeight: '700' }}>Retry Sync</AppText>
                    </TouchableOpacity>
                </View>
            ) : history.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="inbox" size={48} color={colors.border} />
                    <AppText variant="bodyMedium" color="textLight" style={{ marginTop: 16 }}>No scan history found on our servers.</AppText>
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    keyExtractor={(item, idx) => String(item.id || item._id || idx)}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchHistory(true)} tintColor={colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Feather name="filter" size={40} color={colors.border} />
                            <AppText variant="bodyMedium" color="textLight" style={{ marginTop: 16 }}>No scans match this filter.</AppText>
                        </View>
                    }
                />
            )}

            {/* Bottom Sheet Filter Modal */}
            <Modal visible={filterMenuVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHeader}>
                            <AppText variant="heading3">Filter Scans</AppText>
                            <TouchableOpacity onPress={() => setFilterMenuVisible(false)}>
                                <Feather name="x" size={24} color={colors.textMedium} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterOptions}>
                            {['All', 'Healthy', 'Diseased'].map(f => (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                                    onPress={() => { setActiveFilter(f); setFilterMenuVisible(false); }}
                                >
                                    <AppText variant="bodyMedium" style={{ color: activeFilter === f ? colors.white : colors.text }}>
                                        {f}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
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
    filterIcon: {
        position: 'relative'
    },
    filterDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderColor: colors.surface
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
    },
    deleteBtn: {
        padding: 10,
        marginLeft: 10,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
    },
    emptyState: {
        flex: 1,
        justify: 'center',
        alignItems: 'center',
        padding: 40,
        marginTop: 60
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    filterOptions: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap'
    },
    filterChip: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary
    }
});
