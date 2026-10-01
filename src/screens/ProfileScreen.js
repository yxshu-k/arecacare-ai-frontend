import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const MenuRow = ({ icon, title, value, onPress, isDestructive, colors, styles }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
        <View style={styles.menuRowLeft}>
            <View style={[styles.iconBox, isDestructive && { backgroundColor: '#FEF2F2' }]}>
                <Feather name={icon} size={20} color={isDestructive ? colors.error : colors.primary} />
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
    const { userData, logout, deactivate } = useContext(AuthContext);
    const { colors } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors), [colors]);

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out of your account?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Log Out", style: "destructive", onPress: logout }
            ]
        );
    };

    const handleDeactivate = () => {
        Alert.alert(
            "Deactivate Account",
            "Are you sure you want to permanently delete your ArecaCare account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: deactivate }
            ]
        );
    };

    return (
        <Screen style={styles.screen} noPadding>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        {userData?.avatar_url ? (
                            <Image source={{ uri: userData.avatar_url }} style={styles.avatarImage} />
                        ) : (
                            <AppText variant="heading2" style={{ color: colors.primary }}>
                                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'F'}
                            </AppText>
                        )}
                    </View>
                    <AppText variant="heading2" style={{ marginTop: 12 }}>{userData?.name || t("farmer")}</AppText>
                    <AppText variant="bodyMedium" color="textMedium" style={{ marginTop: 4 }}>
                        {userData?.phone || userData?.email || t("update_profile")}
                    </AppText>
                </View>

                {/* Menu Sections */}
                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>{t("account")}</AppText>
                    <MenuRow icon="map" title={t("my_farms")} colors={colors} styles={styles} />
                    <MenuRow icon="user" title={t("personal_info")} onPress={() => navigation.navigate('EditProfile')} colors={colors} styles={styles} />
                </View>

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>{t("preferences")}</AppText>
                    <MenuRow icon="settings" title={t("settings")} onPress={() => navigation.navigate('Settings')} colors={colors} styles={styles} />
                    <MenuRow icon="globe" title={t("language")} onPress={() => navigation.navigate('Language')} colors={colors} styles={styles} />
                </View>

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>{t("support")}</AppText>
                    <MenuRow icon="help-circle" title={t("help_center")} colors={colors} styles={styles} />
                    <MenuRow icon="file-text" title={t("privacy_policy")} colors={colors} styles={styles} />
                </View>

                <View style={styles.section}>
                    <MenuRow icon="log-out" title={t("logout")} onPress={handleLogout} colors={colors} styles={styles} />
                    <MenuRow icon="trash-2" title={t("deactivate")} isDestructive onPress={handleDeactivate} colors={colors} styles={styles} />
                </View>

                <View style={styles.footerInfo}>
                    <AppText variant="caption" color="textLight">ArecaCare AI v1.0.0</AppText>
                </View>

            </ScrollView>
        </Screen>
    );
}

const getStyles = (colors) => StyleSheet.create({
    screen: { backgroundColor: colors.background, flex: 1 },
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
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border
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
