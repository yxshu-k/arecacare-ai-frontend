import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

const MOCK_TIPS = [
    { id: '1', title: 'How to Identify Leaf Spot Disease', category: 'Disease Guide', readTime: '5 min read', icon: 'magnify-scan' },
    { id: '2', title: 'Best Fertilizers for Arecanut', category: 'Nutrients', readTime: '3 min read', icon: 'flask-outline' },
    { id: '3', title: 'Irrigation Techniques for Better Yield', category: 'Water Management', readTime: '4 min read', icon: 'water-outline' },
    { id: '4', title: 'Seasonal Care for Arecanut Palms', category: 'Maintenance', readTime: '6 min read', icon: 'calendar-clock' },
];

export default function TipsScreen({ navigation }) {
    const { t } = useLanguage();

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.imageMock}>
                <MaterialCommunityIcons name={item.icon} size={32} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
                <AppText variant="heading3" numberOfLines={2} style={styles.titleText}>
                    {t(item.title)}
                </AppText>
                <AppText variant="caption" color="primary" style={styles.categoryBadge}>
                    {t(item.category)}
                </AppText>
                <AppText variant="caption" color="textLight" style={styles.readTime}>
                    {t(item.readTime)}
                </AppText>
            </View>
            <Feather name="bookmark" size={22} color={colors.textLight} style={styles.bookmark} />
        </TouchableOpacity>
    );

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <AppText variant="heading2">{t("farming_tips")}</AppText>
                <TouchableOpacity>
                    <Feather name="search" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_TIPS}
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
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    imageMock: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
        height: '100%',
        justifyContent: 'space-between',
    },
    titleText: {
        lineHeight: 22,
        marginBottom: 6,
    },
    categoryBadge: {
        fontWeight: '600',
        marginBottom: 4,
    },
    readTime: {
        marginTop: 2,
    },
    bookmark: {
        padding: 10,
        alignSelf: 'flex-start',
    }
});
