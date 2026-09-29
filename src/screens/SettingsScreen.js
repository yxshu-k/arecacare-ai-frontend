import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { colors } from '../theme/colors';

const SettingToggle = ({ icon, title, description, value, onValueChange }) => (
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
    const [pushEnabled, setPushEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [dataSaver, setDataSaver] = useState(false);

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
                    <AppText variant="heading3" style={styles.sectionTitle}>Notifications</AppText>
                    <SettingToggle
                        icon="bell"
                        title="Push Notifications"
                        description="Receive alerts for weather warnings and disease outbreaks"
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                    />
                </View>

                <View style={styles.section}>
                    <AppText variant="heading3" style={styles.sectionTitle}>Appearance & Data</AppText>
                    <SettingToggle
                        icon="moon"
                        title="Dark Mode"
                        description="Switch to a dark theme to save battery"
                        value={darkMode}
                        onValueChange={setDarkMode}
                    />
                    <SettingToggle
                        icon="wifi"
                        title="Data Saver"
                        description="Compress images before AI scanning to save cellular data"
                        value={dataSaver}
                        onValueChange={setDataSaver}
                    />
                </View>

            </ScrollView>
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
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
