import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';

const MOCK_HISTORY = [
    { id: '1', disease: 'Leaf Spot Disease', severity: 'High', date: '20 May 2024', color: '#DC2626', bg: '#FEF2F2' },
    { id: '2', disease: 'Yellow Leaf Disease', severity: 'Medium', date: '18 May 2024', color: '#F59E0B', bg: '#FFFBEB' },
    { id: '3', disease: 'Healthy Leaf', severity: 'None', date: '10 May 2024', color: colors.primary, bg: '#F0FDF4' },
];

export default function HistoryScreen({ navigation }) {
    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.card, { borderColor: item.color + '30' }]}>
            <View style={[styles.imageMock, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name="leaf" size={28} color={item.color} />
            </View>
            <View style={styles.cardContent}>
                <AppText variant="heading3" style={{ color: item.color }}>{item.disease}</AppText>
                <AppText variant="caption" color="textMedium" style={{ marginTop: 4 }}>
                    Severity: {item.severity}
                </AppText>
                <AppText variant="caption" color="textLight" style={{ marginTop: 2 }}>
                    {item.date}
                </AppText>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textLight} />
        </TouchableOpacity>
    );

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <AppText variant="heading2">Scan History</AppText>
                <TouchableOpacity>
                    <Feather name="filter" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_HISTORY}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
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
