import React, { useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AvatarActionModal from '../components/AvatarActionModal';
import FarmerStatusModal from '../components/FarmerStatusModal';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const MenuRow = ({ icon, title, value, onPress, isDestructive, colors, isDarkMode, styles }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
        <View style={styles.menuRowLeft}>
            <View style={[styles.iconBox, isDestructive && { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2' }]}>
                <Feather name={icon} size={20} color={isDestructive ? colors.error : colors.primary} />
            </View>
            <AppText variant="bodyMedium" style={{ marginLeft: 16, color: isDestructive ? '#DC2626' : colors.text }}>
                {title}
            </AppText>
        </View>
        <View style={styles.menuRowRight}>
            {value && <AppText variant="caption" color="textMedium" style={{ marginRight: 8, color: colors.textMedium }}>{value}</AppText>}
            <Feather name="chevron-right" size={20} color={colors.textLight} />
        </View>
    </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
    const { userData, logout, deactivate, uploadAvatar, deleteAvatar, updateUser } = useContext(AuthContext);
    const { colors, isDarkMode } = useTheme();
    const { language, t } = useLanguage();
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    const currentLangNative = React.useMemo(() => {
        const map = {
            en: 'English',
            hi: 'हिन्दी',
            kn: 'ಕನ್ನಡ',
            ta: 'தமிழ்',
            te: 'తెలుగు',
            ml: 'മലയാളം',
            tu: 'ತುಳು',
            ar: 'ಅರೆಭಾಷೆ'
        };
        return map[language] || 'English';
    }, [language]);

    const handleLogout = () => {
        Alert.alert(
            t("logout"),
            t("logout_confirm_msg") || "Are you sure you want to log out of your account?",
            [
                { text: t("cancel"), style: "cancel" },
                { text: t("logout"), style: "destructive", onPress: logout }
            ]
        );
    };

    const handleDeactivate = () => {
        Alert.alert(
            t("deactivate"),
            t("deactivate_confirm_msg") || "Are you sure you want to permanently delete your ArecaCare account? This action cannot be undone.",
            [
                { text: t("cancel"), style: "cancel" },
                { text: t("delete"), style: "destructive", onPress: deactivate }
            ]
        );
    };

    return (
        <Screen style={styles.screen} noPadding>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <TouchableOpacity
                        style={styles.avatarWrapper}
                        onPress={() => setAvatarModalVisible(true)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.avatar}>
                            {userData?.avatar_url ? (
                                <Image source={{ uri: userData.avatar_url }} style={styles.avatarImage} />
                            ) : (
                                <AppText variant="heading1" style={{ color: colors.primary, fontWeight: '700' }}>
                                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'F'}
                                </AppText>
                            )}
                        </View>
                        <View style={[styles.cameraBadge, { backgroundColor: colors.accent }]}>
                            <Feather name="camera" size={14} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    <AppText variant="heading2" style={{ marginTop: 12 }}>{userData?.name || t("farmer")}</AppText>
                    <AppText variant="bodyMedium" color="textMedium" style={{ marginTop: 4 }}>
                        {userData?.phone || userData?.email || t("update_profile")}
                    </AppText>

                    {/* Farmer About / Status Bar (WhatsApp style) */}
                    <TouchableOpacity
                        style={[
                            styles.statusBar,
                            {
                                backgroundColor: isDarkMode ? '#1C241B' : colors.lightSage,
                                borderColor: isDarkMode ? colors.border : '#D5E0D0',
                            }
                        ]}
                        onPress={() => setStatusModalVisible(true)}
                        activeOpacity={0.75}
                    >
                        <View style={styles.statusBarLeft}>
                            <View style={[styles.statusIconCircle, { backgroundColor: colors.surface }]}>
                                <Feather name="message-circle" size={15} color={colors.primary} />
                            </View>
                            <View style={styles.statusBarTextWrapper}>
                                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700', letterSpacing: 0.4 }}>
                                    ABOUT / STATUS
                                </AppText>
                                <AppText variant="bodyMedium" numberOfLines={1} style={{ color: colors.text, fontWeight: '500', marginTop: 1 }}>
                                    {userData?.about || '🌿 Growing healthy arecanut palms'}
                                </AppText>
                            </View>
                        </View>
                        <View style={[styles.statusEditIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Feather name="edit-2" size={13} color={colors.textMedium} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Menu Sections */}
                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>{t("account")}</AppText>
                    <MenuRow
                        icon="map"
                        title={t("my_farms")}
                        value={
                            userData?.farms && userData.farms.length > 0
                                ? `${userData.farms.length} ${userData.farms.length === 1 ? 'Farm' : 'Farms'}`
                                : '0 Farms'
                        }
                        onPress={() => navigation.navigate('MyFarms')}
                        colors={colors}
                        isDarkMode={isDarkMode}
                        styles={styles}
                    />
                    <MenuRow
                        icon="user"
                        title={t("personal_info")}
                        value={userData?.phone || userData?.region || (userData?.name ? 'Verified' : 'Update')}
                        onPress={() => navigation.navigate('EditProfile')}
                        colors={colors}
                        isDarkMode={isDarkMode}
                        styles={styles}
                    />
                </View>

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>{t("preferences")}</AppText>
                    <MenuRow
                        icon="settings"
                        title={t("settings")}
                        value={isDarkMode ? 'Dark Mode' : 'Standard'}
                        onPress={() => navigation.navigate('Settings')}
                        colors={colors}
                        isDarkMode={isDarkMode}
                        styles={styles}
                    />
                    <MenuRow
                        icon="globe"
                        title={t("language")}
                        value={currentLangNative}
                        onPress={() => navigation.navigate('Language')}
                        colors={colors}
                        isDarkMode={isDarkMode}
                        styles={styles}
                    />
                </View>

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>{t("support")}</AppText>
                    <MenuRow
                        icon="help-circle"
                        title={t("help_center")}
                        onPress={() => navigation.navigate('HelpCenter')}
                        colors={colors}
                        isDarkMode={isDarkMode}
                        styles={styles}
                    />
                    <MenuRow
                        icon="file-text"
                        title={t("privacy_policy")}
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                        colors={colors}
                        isDarkMode={isDarkMode}
                        styles={styles}
                    />
                </View>

                <View style={styles.section}>
                    <MenuRow icon="log-out" title={t("logout")} onPress={handleLogout} colors={colors} isDarkMode={isDarkMode} styles={styles} />
                    <MenuRow icon="trash-2" title={t("deactivate")} isDestructive onPress={handleDeactivate} colors={colors} isDarkMode={isDarkMode} styles={styles} />
                </View>

                <View style={styles.footerInfo}>
                    <AppText variant="caption" color="textLight">ArecaCare AI v1.0.0</AppText>
                </View>

            </ScrollView>

            {/* WhatsApp-Style Avatar Management Modal */}
            <AvatarActionModal
                visible={avatarModalVisible}
                onClose={() => setAvatarModalVisible(false)}
                avatarUrl={userData?.avatar_url}
                userName={userData?.name}
                onUpload={uploadAvatar}
                deleteAvatar={deleteAvatar}
            />

            {/* Farmer Status Modal */}
            <FarmerStatusModal
                visible={statusModalVisible}
                onClose={() => setStatusModalVisible(false)}
                currentStatus={userData?.about}
                onSave={async (newStatus) => {
                    await updateUser({ about: newStatus });
                }}
            />
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    screen: { backgroundColor: colors.background, flex: 1 },
    scroll: { paddingBottom: 40 },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 36,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 4,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: isDarkMode ? 'rgba(5, 150, 105, 0.25)' : '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: colors.surface,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: 4,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    statusBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        marginTop: 18,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
    },
    statusBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    statusIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    statusBarTextWrapper: {
        flex: 1,
    },
    statusEditIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
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
