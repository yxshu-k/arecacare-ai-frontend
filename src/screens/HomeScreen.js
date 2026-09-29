import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
    const { userData, logout } = useContext(AuthContext);

    const userName = userData?.name || 'Ramesh';

    const ActionCard = ({ title, subtitle, icon, iconLib = 'Feather', color, onPress }) => (
        <TouchableOpacity style={[styles.card, { borderColor: color + '40' }]} onPress={onPress}>
            <View style={[styles.cardIconContainer, { backgroundColor: color + '15' }]}>
                {iconLib === 'Feather' ? (
                    <Feather name={icon} size={28} color={color} />
                ) : (
                    <MaterialCommunityIcons name={icon} size={28} color={color} />
                )}
            </View>
            <View style={styles.cardTextContainer}>
                <AppText variant="heading3" style={{ color: colors.text }}>{title}</AppText>
                <AppText variant="caption" color="textMedium">{subtitle}</AppText>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textLight} />
        </TouchableOpacity>
    );

    return (
        <Screen style={styles.screen}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <AppText variant="heading2">Hello, {userName} 👋</AppText>
                        <AppText variant="bodyMedium" color="textMedium" style={{ marginTop: 4 }}>
                            Areca Farm Dashboard
                        </AppText>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.profileBtn}>
                        <Feather name="log-out" size={20} color={colors.textMedium} />
                    </TouchableOpacity>
                </View>

                {/* Primary Action (Scan Plant) */}
                <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => { /* Wait for Phase 7 */ }}
                >
                    <View style={styles.primaryActionHeader}>
                        <View>
                            <AppText variant="heading2" style={{ color: colors.white }}>Scan Plant</AppText>
                            <AppText variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                                Detect disease instantly with AI
                            </AppText>
                        </View>
                        <View style={styles.cameraIconWrap}>
                            <Feather name="camera" size={24} color={colors.primary} />
                        </View>
                    </View>
                    <View style={styles.primaryActionFooter}>
                        <MaterialCommunityIcons name="leaf" size={60} color="rgba(255,255,255,0.2)" style={styles.bgIcon} />
                        <AppText variant="bodyMedium" style={{ color: colors.white, fontWeight: '600' }}>
                            Tap to open camera
                        </AppText>
                        <Feather name="arrow-right" size={20} color={colors.white} />
                    </View>
                </TouchableOpacity>

                <AppText variant="heading3" style={styles.sectionTitle}>Quick Tools</AppText>

                {/* Secondary Actions */}
                <ActionCard
                    title="Yield Prediction"
                    subtitle="Calculate arecanut output per acre"
                    icon="bar-chart-2"
                    color={colors.primary}
                    onPress={() => { }}
                />

                <ActionCard
                    title="Tips & Advisory"
                    subtitle="Seasonal farming practices"
                    icon="book-open"
                    color="#F59E0B"
                    onPress={() => { }}
                />

                <ActionCard
                    title="Weather Analysis"
                    subtitle="Rainfall and humidity insights"
                    icon="cloud-rain"
                    color="#3B82F6"
                    onPress={() => { }}
                />

            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: { backgroundColor: colors.background },
    scroll: { paddingVertical: 10, paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    profileBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryAction: {
        backgroundColor: colors.primary,
        borderRadius: 20,
        padding: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
        marginBottom: 30,
        overflow: 'hidden',
    },
    primaryActionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    cameraIconWrap: {
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 16,
    },
    primaryActionFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    bgIcon: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        transform: [{ rotate: '-20deg' }],
    },
    sectionTitle: {
        marginBottom: 16,
    },
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
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    cardIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTextContainer: {
        flex: 1,
    }
});
