import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

const MenuRow = ({ icon, title, value, isDestructive, onPress }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
        <View style={styles.menuRowLeft}>
            <View style={[styles.iconBox, isDestructive && { backgroundColor: '#FEF2F2' }]}>
                <Feather name={icon} size={20} color={isDestructive ? '#DC2626' : colors.primary} />
            </View>
            <AppText variant="bodyMedium" style={{ marginLeft: 16, color: isDestructive ? '#DC2626' : colors.text }}>
                {title}
            </AppText>
        </View>
        <View style={styles.menuRowRight}>
            {value && <AppText variant="caption" color="textMedium" style={{ marginRight: 8 }}>{value}</AppText>}
            <Feather name="chevron-right" size={20} color={colors.textLight} />
        </View>
    </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
    const { userData, logout } = useContext(AuthContext);

    return (
        <Screen style={styles.screen} noPadding>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <AppText variant="heading2" style={{ color: colors.primary }}>
                            {userData?.name?.charAt(0) || 'R'}
                        </AppText>
                    </View>
                    <AppText variant="heading2" style={{ marginTop: 12 }}>{userData?.name || 'Ramesh B.'}</AppText>
                    <AppText variant="bodyMedium" color="textMedium" style={{ marginTop: 4 }}>+91 98765 43210</AppText>
                </View>

                {/* Menu Sections */}
                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Account</AppText>
                    <MenuRow icon="map" title="My Farms" />
                    <MenuRow icon="user" title="Personal Information" />
                </View>

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Preferences</AppText>
                    <MenuRow icon="bell" title="Notifications" onPress={() => navigation.navigate('Settings')} />
                    <MenuRow icon="globe" title="App Language" value="English" onPress={() => navigation.navigate('Language')} />
                </View>

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Support</AppText>
                    <MenuRow icon="help-circle" title="Help & Support" />
                    <MenuRow icon="shield" title="Privacy Policy" />
                    <MenuRow icon="file-text" title="Terms & Conditions" />
                </View>

                <View style={styles.section}>
                    <MenuRow icon="log-out" title="Log Out" isDestructive onPress={logout} />
                </View>

                <View style={styles.footerInfo}>
                    <AppText variant="caption" color="textLight">ArecaCare AI v1.0.0</AppText>
                </View>

            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: { backgroundColor: colors.background },
    scroll: { paddingBottom: 40 },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
        paddingVertical: 8,
        marginBottom: 20,
    },
    sectionTitle: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        color: colors.textMedium,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.background,
    },
    menuRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerInfo: {
        alignItems: 'center',
        marginTop: 20,
    }
});
