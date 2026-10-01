import React, { useState, useContext, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import * as Location from 'expo-location';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';

const SettingToggle = ({ icon, title, description, value, onValueChange, colors, styles }) => (
    <View style={styles.menuRow}>
        <View style={styles.menuRowLeft}>
            <View style={styles.iconBox}>
                <Feather name={icon} size={20} color={colors.primary} />
            </View>
            <View style={{ marginLeft: 16, flex: 1 }}>
                <AppText variant="bodyMedium" style={{ color: colors.text }}>
                    {title}
                </AppText>
                {description && (
                    <AppText variant="caption" color="textMedium" style={{ marginTop: 2 }}>
                        {description}
                    </AppText>
                )}
            </View>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
        />
    </View>
);

export default function SettingsScreen({ navigation }) {
    const { userData, updateUser } = useContext(AuthContext);
    const { isDarkMode, toggleTheme, colors } = useTheme();

    // Memoize dynamic styles
    const styles = useMemo(() => getStyles(colors), [colors]);

    // Existing settings states
    const [pushEnabled, setPushEnabled] = useState(true);
    const [dataSaver, setDataSaver] = useState(false);

    // Auto-detect if location exists in user profile
    const [locationEnabled, setLocationEnabled] = useState(!!userData?.region);

    const handleLocationToggle = async (val) => {
        if (val) {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'GPS is required for local weather advisory.');
                setLocationEnabled(false);
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                const coords = `${location.coords.latitude.toFixed(4)},${location.coords.longitude.toFixed(4)}`;
                // Sync securely to backend profile
                await updateUser({ region: coords });
                setLocationEnabled(true);
                Alert.alert("GPS Synced!", `Your farm coordinates (${coords}) have been saved for live tracking.`);
            } catch (e) {
                Alert.alert("Error", "Could not fetch GPS.");
                setLocationEnabled(false);
            }
        } else {
            // Un-sync location
            await updateUser({ region: null });
            setLocationEnabled(false);
        }
    };

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">Settings</AppText>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Precision Agriculture</AppText>
                    <SettingToggle
                        icon="map-pin"
                        title="Farm GPS Sync"
                        description={userData?.region ? `Synced at ${userData.region}` : "Enable hyper-local weather risk alerts"}
                        value={locationEnabled}
                        onValueChange={handleLocationToggle}
                        colors={colors}
                        styles={styles}
                    />
                </View>

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Notifications</AppText>
                    <SettingToggle
                        icon="bell"
                        title="Push Notifications"
                        description="Receive alerts for weather warnings and disease outbreaks"
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                        colors={colors}
                        styles={styles}
                    />
                </View>

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Appearance & Data</AppText>
                    <SettingToggle
                        icon="moon"
                        title="Dark Mode"
                        description="Switch to a dark theme to save battery"
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        colors={colors}
                        styles={styles}
                    />
                    <SettingToggle
                        icon="wifi"
                        title="Data Saver"
                        description="Compress images before AI scanning to save cellular data"
                        value={dataSaver}
                        onValueChange={setDataSaver}
                        colors={colors}
                        styles={styles}
                    />
                </View>

            </ScrollView>
        </Screen>
    );
}

const getStyles = (colors) => StyleSheet.create({
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
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    scroll: { paddingBottom: 40 },
    section: {
        backgroundColor: colors.surface,
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
        flex: 1,
        paddingRight: 10,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border
    }
});
