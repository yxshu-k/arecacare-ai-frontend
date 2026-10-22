import React, { useState, useContext, useMemo, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import AppTextInput from '../components/AppTextInput';
import Screen from '../components/Screen';
import AvatarActionModal from '../components/AvatarActionModal';
import FarmerStatusModal from '../components/FarmerStatusModal';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useKeyboard } from '../hooks/useKeyboard';
import { formatPhone } from '../utils/formatters';
import { isValidPhone, isValidName } from '../utils/validators';

const POPULAR_TALUKS = ['Sullia', 'Puttur', 'Bantwal', 'Belthangady', 'Shivamogga', 'Thirthahalli', 'Sirsi', 'Channagiri'];

const QUICK_NOTES = [
    '🌿 Organic Arecanut Cultivator',
    '🌴 Traditional Intercropping (Areca + Pepper)',
    '🚜 Progressive Farmer',
    '🌾 Busy in plantation — reach via AgriBot',
];

export default function EditProfileScreen({ navigation }) {
    const { userData, updateUser, uploadAvatar, deleteAvatar, activeFarm, refreshLocation } = useContext(AuthContext);
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    const [name, setName] = useState(userData?.name || '');
    const [phone, setPhone] = useState(userData?.phone || '');
    const [region, setRegion] = useState(userData?.region || '');
    const [about, setAbout] = useState(userData?.about || '🌿 Growing healthy arecanut palms');
    const [loading, setLoading] = useState(false);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [statusModalVisible, setStatusModalVisible] = useState(false);

    const scrollRef = useRef(null);
    const { keyboardHeight, isKeyboardVisible } = useKeyboard();

    // Profile Completeness metric
    const profileCompleteness = useMemo(() => {
        let score = 0;
        if (name.trim().length >= 2) score += 25;
        if (phone.trim().length >= 10) score += 25;
        if (region.trim().length > 0) score += 25;
        if (userData?.avatar_url) score += 25;
        return score;
    }, [name, phone, region, userData?.avatar_url]);

    // Member Since formatted string
    const memberSince = useMemo(() => {
        if (!userData?.created_at) return 'Active Member';
        try {
            const d = new Date(userData.created_at);
            if (isNaN(d.getTime())) return 'Active Member';
            return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch {
            return 'Active Member';
        }
    }, [userData?.created_at]);

    // Unsaved changes check
    const hasChanges = useMemo(() => {
        return (
            name.trim() !== (userData?.name || '').trim() ||
            phone.trim() !== (userData?.phone || '').trim() ||
            region.trim() !== (userData?.region || '').trim() ||
            about.trim() !== (userData?.about || '').trim()
        );
    }, [name, phone, region, about, userData]);

    const handleBack = () => {
        if (hasChanges) {
            Alert.alert(
                'Discard Changes?',
                'You have unsaved changes. Are you sure you want to discard them?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    const handleUseCurrentLocation = () => {
        const detected = (activeFarm?.name && activeFarm.name !== 'Current Location' && activeFarm.name !== 'Live GPS')
            ? activeFarm.name
            : (activeFarm?.district || activeFarm?.locality || '');
        if (detected) {
            setRegion(detected);
        } else {
            Alert.alert('GPS Location', 'Acquiring live location...');
            refreshLocation?.().then(() => {
                if (activeFarm?.name) setRegion(activeFarm.name);
            });
        }
    };

    const handleSave = async () => {
        if (!isValidName(name)) {
            Alert.alert('Required Field', 'Please enter a valid full name (at least 2 characters).');
            return;
        }

        if (phone && phone.trim().length > 0 && !isValidPhone(phone)) {
            Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
            return;
        }

        try {
            setLoading(true);
            await updateUser({
                name: name.trim(),
                phone: phone.trim() || null,
                region: region.trim() || null,
                about: about.trim() || null,
            });
            Alert.alert('Profile Saved', 'Your personal information has been updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Save Failed', error.message || 'Could not update personal information.');
        } finally {
            setLoading(false);
        }
    };

    const farmerIdCode = useMemo(() => {
        const rawId = userData?.id || userData?._id || '';
        return rawId ? `AC-${rawId.slice(-6).toUpperCase()}` : 'AC-FARMER';
    }, [userData]);

    return (
        <Screen style={styles.screen} noPadding>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={handleBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="heading2" style={{ color: colors.text }}>
                        {t('personal_information')}
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.textMedium }}>
                        {t('manage_profile_details')}
                    </AppText>
                </View>

                {hasChanges && (
                    <TouchableOpacity
                        style={[styles.headerSaveBtn, { backgroundColor: colors.primary }]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                {t('save')}
                            </AppText>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                style={styles.container}
            >
                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={[
                        styles.scroll,
                        { paddingBottom: isKeyboardVisible ? keyboardHeight + 80 : 40 }
                    ]}
                >
                    {/* Completeness Card */}
                    <View style={styles.completenessCard}>
                        <View style={styles.completenessHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="shield" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700', letterSpacing: 0.5 }}>
                                    {t('profile_completeness')}
                                </AppText>
                            </View>
                            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '800' }}>
                                {profileCompleteness}%
                            </AppText>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: `${profileCompleteness}%`, backgroundColor: colors.primary }]} />
                        </View>

                        <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 6 }}>
                            {profileCompleteness === 100
                                ? '✓ Your farmer account is complete and fully verified.'
                                : profileCompleteness >= 75
                                ? 'Add remaining details to enable localized SMS weather alerts.'
                                : 'Complete your name, phone, and taluk to unlock all farm advisory tools.'}
                        </AppText>
                    </View>

                    {/* Hero Identity Card */}
                    <View style={styles.heroCard}>
                        <TouchableOpacity
                            style={styles.avatarWrapper}
                            onPress={() => setAvatarModalVisible(true)}
                            activeOpacity={0.85}
                            disabled={loading}
                        >
                            <View style={styles.avatar}>
                                {userData?.avatar_url ? (
                                    <Image source={{ uri: userData.avatar_url }} style={styles.avatarImage} />
                                ) : (
                                    <AppText variant="heading1" style={{ color: colors.primary, fontWeight: '700' }}>
                                        {name ? name.charAt(0).toUpperCase() : 'F'}
                                    </AppText>
                                )}
                            </View>
                            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
                                <Feather name="camera" size={14} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>

                        <AppText variant="heading2" style={{ color: colors.text, marginTop: 10 }}>
                            {name || t('farmer')}
                        </AppText>

                        <View style={styles.badgeRow}>
                            <View style={styles.idBadge}>
                                <AppText variant="caption" style={{ color: colors.textMedium, fontWeight: '700', fontSize: 11 }}>
                                    {farmerIdCode}
                                </AppText>
                            </View>
                            <View style={[styles.verifiedBadge, { backgroundColor: isDarkMode ? '#064E3B40' : '#ECFDF5' }]}>
                                <Feather name="check-circle" size={12} color="#059669" style={{ marginRight: 4 }} />
                                <AppText variant="caption" style={{ color: '#059669', fontWeight: 'bold', fontSize: 11 }}>
                                    {t('registered_farmer')}
                                </AppText>
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => setAvatarModalVisible(true)} style={{ marginTop: 8 }}>
                            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                                Tap to change photo ›
                            </AppText>
                        </TouchableOpacity>
                    </View>

                    {/* Section 1: Basic Identity */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Feather name="user" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                            <AppText variant="caption" style={styles.sectionTitle}>
                                {t('full_name')}
                            </AppText>
                        </View>

                        <AppTextInput
                            label={t('full_name')}
                            icon="user"
                            placeholder="e.g. Ramesh Gowda"
                            value={name}
                            onChangeText={setName}
                            maxLength={60}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollRef.current?.scrollTo({ y: 160, animated: true });
                                }, 120);
                            }}
                        />
                    </View>

                    {/* Section 2: Contact Information */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Feather name="phone-call" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                            <AppText variant="caption" style={styles.sectionTitle}>
                                {t('phone_number')}
                            </AppText>
                        </View>

                        <AppTextInput
                            label={t('phone_number')}
                            icon="phone"
                            placeholder="10-digit mobile number"
                            value={phone}
                            onChangeText={(text) => setPhone(formatPhone(text))}
                            keyboardType="phone-pad"
                            maxLength={10}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollRef.current?.scrollTo({ y: 280, animated: true });
                                }, 120);
                            }}
                        />
                        <AppText variant="caption" style={styles.inputHelpText}>
                            Used for Kisan Call Center advisories & harvest alerts.
                        </AppText>

                        <View style={{ marginTop: 12 }}>
                            <AppTextInput
                                label="Registered Email (Account ID)"
                                icon="mail"
                                placeholder="Email address"
                                value={userData?.email || ''}
                                editable={false}
                                rightIcon="lock"
                            />
                            <View style={styles.emailBadgeRow}>
                                <Feather name="check" size={12} color="#059669" style={{ marginRight: 4 }} />
                                <AppText variant="caption" style={{ color: '#059669', fontSize: 11, fontWeight: '600' }}>
                                    Primary Login Account • Cannot be edited directly
                                </AppText>
                            </View>
                        </View>
                    </View>

                    {/* Section 3: Geographic Region & Native Taluk */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderBetween}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="map-pin" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                                <AppText variant="caption" style={styles.sectionTitle}>
                                    {t('taluk_region')}
                                </AppText>
                            </View>
                            <TouchableOpacity
                                style={styles.gpsAutoBtn}
                                onPress={handleUseCurrentLocation}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Feather name="navigation" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700', fontSize: 11 }}>
                                    {t('use_gps_location')}
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        <AppTextInput
                            label={t('taluk_region')}
                            icon="map"
                            placeholder="e.g. Sullia, Puttur, Shivamogga"
                            value={region}
                            onChangeText={setRegion}
                            maxLength={50}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollRef.current?.scrollTo({ y: 460, animated: true });
                                }, 120);
                            }}
                        />

                        {/* Popular Taluks */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                            {POPULAR_TALUKS.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.chip,
                                        region === item && { backgroundColor: colors.primary, borderColor: colors.primary }
                                    ]}
                                    onPress={() => setRegion(item)}
                                >
                                    <AppText
                                        variant="caption"
                                        style={{ color: region === item ? '#FFFFFF' : colors.textMedium }}
                                    >
                                        {item}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Section 4: Farmer Bio / WhatsApp Status Note */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeaderBetween}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="message-circle" size={16} color={colors.primary} style={{ marginRight: 8 }} />
                                <AppText variant="caption" style={styles.sectionTitle}>
                                    ABOUT / STATUS NOTE
                                </AppText>
                            </View>
                            <TouchableOpacity
                                onPress={() => setStatusModalVisible(true)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
                                    All Presets ›
                                </AppText>
                            </TouchableOpacity>
                        </View>

                        <AppTextInput
                            icon="message-square"
                            placeholder="e.g. 🌿 Growing healthy arecanut palms"
                            value={about}
                            onChangeText={setAbout}
                            maxLength={120}
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollRef.current?.scrollTo({ y: 640, animated: true });
                                }, 120);
                            }}
                        />

                        <View style={styles.charCountRow}>
                            <AppText variant="caption" style={{ color: colors.textLight, fontSize: 11 }}>
                                Visible on your public grower profile
                            </AppText>
                            <AppText variant="caption" style={{ color: colors.textLight, fontSize: 11 }}>
                                {about.length}/120
                            </AppText>
                        </View>

                        {/* Quick Note Pills */}
                        <View style={styles.quickNotesWrap}>
                            {QUICK_NOTES.map((note) => (
                                <TouchableOpacity
                                    key={note}
                                    style={[
                                        styles.quickNotePill,
                                        about === note && { backgroundColor: isDarkMode ? '#064E3B40' : '#ECFDF5', borderColor: colors.primary }
                                    ]}
                                    onPress={() => setAbout(note)}
                                >
                                    <AppText
                                        variant="caption"
                                        numberOfLines={1}
                                        style={{
                                            color: about === note ? colors.primary : colors.textMedium,
                                            fontWeight: about === note ? 'bold' : 'normal',
                                            fontSize: 11,
                                        }}
                                    >
                                        {note}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Section 5: Account Metadata */}
                    <View style={styles.metaCard}>
                        <View style={styles.metaRow}>
                            <AppText variant="caption" style={{ color: colors.textMedium }}>Member Since</AppText>
                            <AppText variant="caption" style={{ color: colors.text, fontWeight: '600' }}>{memberSince}</AppText>
                        </View>
                        <View style={styles.metaDivider} />
                        <View style={styles.metaRow}>
                            <AppText variant="caption" style={{ color: colors.textMedium }}>Login Provider</AppText>
                            <AppText variant="caption" style={{ color: colors.text, fontWeight: '600' }}>
                                {userData?.auth_provider === 'google' ? 'Google Account' : 'Email & Password'}
                            </AppText>
                        </View>
                        <View style={styles.metaDivider} />
                        <View style={styles.metaRow}>
                            <AppText variant="caption" style={{ color: colors.textMedium }}>Cloud Synchronization</AppText>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={styles.greenDot} />
                                <AppText variant="caption" style={{ color: '#059669', fontWeight: 'bold' }}>Active & Synced</AppText>
                            </View>
                        </View>
                    </View>

                    {/* Bottom Primary Save Button */}
                    <TouchableOpacity
                        style={[
                            styles.bottomSaveBtn,
                            { backgroundColor: hasChanges ? colors.primary : (isDarkMode ? '#27272A' : '#E2E8F0') }
                        ]}
                        onPress={handleSave}
                        disabled={loading || !hasChanges}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Feather
                                    name="check"
                                    size={18}
                                    color={hasChanges ? '#FFFFFF' : colors.textLight}
                                    style={{ marginRight: 8 }}
                                />
                                <AppText
                                    variant="bodyLarge"
                                    style={{
                                        color: hasChanges ? '#FFFFFF' : colors.textLight,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {hasChanges ? t('save_changes') : t('save_profile')}
                                </AppText>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* WhatsApp-Style Avatar Management Modal */}
            <AvatarActionModal
                visible={avatarModalVisible}
                onClose={() => setAvatarModalVisible(false)}
                avatarUrl={userData?.avatar_url}
                userName={name || userData?.name}
                onUpload={uploadAvatar}
                onDelete={deleteAvatar}
            />

            {/* Farmer Status Modal */}
            <FarmerStatusModal
                visible={statusModalVisible}
                onClose={() => setStatusModalVisible(false)}
                currentStatus={about}
                onSave={async (newStatus) => {
                    setAbout(newStatus);
                    await updateUser({ name, phone, region, about: newStatus });
                }}
            />
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    screen: {
        backgroundColor: colors.background,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        padding: 4,
    },
    headerSaveBtn: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    container: {
        flex: 1,
    },
    scroll: {
        padding: 16,
        paddingBottom: 40,
    },
    completenessCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    completenessHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressBarTrack: {
        height: 6,
        backgroundColor: isDarkMode ? '#27272A' : '#E2E8F0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    heroCard: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 20,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: isDarkMode ? '#064E3B40' : '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: colors.surface,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
        borderColor: '#FFFFFF',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    idBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: isDarkMode ? '#27272A' : '#F1F5F9',
        borderWidth: 1,
        borderColor: colors.border,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    sectionCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    sectionHeaderBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    sectionTitle: {
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: 0.6,
        fontSize: 11,
    },
    gpsAutoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: isDarkMode ? '#064E3B40' : '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    inputHelpText: {
        color: colors.textLight,
        fontSize: 11,
        marginTop: -4,
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    emailBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -4,
        paddingHorizontal: 4,
    },
    chipRow: {
        flexDirection: 'row',
        marginTop: 10,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8,
        backgroundColor: isDarkMode ? '#1E1E1E' : '#F9FAFB',
    },
    charCountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -4,
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    quickNotesWrap: {
        flexDirection: 'column',
        gap: 6,
        marginTop: 6,
    },
    quickNotePill: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: isDarkMode ? '#18181B' : '#F8FAFC',
    },
    metaCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    metaDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginVertical: 10,
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#059669',
        marginRight: 6,
    },
    bottomSaveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
});
