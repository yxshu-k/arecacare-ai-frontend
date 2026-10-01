import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import AppText from '../components/AppText';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import Screen from '../components/Screen';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

export default function EditProfileScreen({ navigation }) {
    const { userData, updateUser, uploadAvatar } = useContext(AuthContext);
    const [name, setName] = useState(userData?.name || '');
    const [phone, setPhone] = useState(userData?.phone || '');
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload an avatar!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            try {
                setLoading(true);
                await uploadAvatar(result.assets[0].uri);
                Alert.alert("Success", "Profile picture updated successfully!");
            } catch (error) {
                Alert.alert("Failed", error.message || "Failed to upload image.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Name cannot be empty.");
            return;
        }

        try {
            setLoading(true);
            await updateUser({ name, phone });
            Alert.alert("Success", "Profile updated successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Failed", error.message || "Could not update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading2" style={{ color: colors.text }}>Edit Profile</AppText>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <TouchableOpacity style={styles.avatarBox} onPress={pickImage} disabled={loading}>
                        <View style={styles.avatar}>
                            {userData?.avatar_url ? (
                                <Image source={{ uri: userData.avatar_url }} style={styles.avatarImage} />
                            ) : (
                                <AppText variant="heading1" style={{ color: colors.primary }}>
                                    {name ? name.charAt(0).toUpperCase() : 'U'}
                                </AppText>
                            )}
                        </View>
                        <View style={styles.cameraBadge}>
                            <Feather name="camera" size={16} color={colors.white} />
                        </View>
                    </TouchableOpacity>

                    <AppTextInput
                        icon="user"
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                    />

                    <AppTextInput
                        icon="phone"
                        placeholder="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    <AppTextInput
                        icon="mail"
                        placeholder="Email Address"
                        value={userData?.email || ''}
                        editable={false}
                        autoCapitalize="none"
                    />
                    <AppText variant="caption" color="textLight" style={styles.helpText}>
                        Email address cannot be changed.
                    </AppText>
                </ScrollView>

                <View style={styles.footer}>
                    <AppButton
                        title="Save Changes"
                        onPress={handleSave}
                        isLoading={loading}
                    />
                </View>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: { backgroundColor: colors.background, flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    backBtn: { padding: 5 },
    container: { flex: 1 },
    scroll: { padding: 24 },
    avatarBox: { alignItems: 'center', marginBottom: 30 },
    avatar: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: '35%',
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.surface
    },
    helpText: { marginTop: 5, marginLeft: 10, marginBottom: 20 },
    footer: {
        padding: 24, paddingBottom: 40,
        backgroundColor: colors.surface,
        borderTopWidth: 1, borderTopColor: colors.border
    }
});
