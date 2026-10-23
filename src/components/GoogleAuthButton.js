import React, { useContext, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AppText from './AppText';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

// Completes the Auth session properly when returning from the Google Web browser
WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuthButton({ title = "Continue with Google", style }) {
    const { googleLogin } = useContext(AuthContext);
    const { colors, isDarkMode } = useTheme();

    // Native Google Sign-In SDK configuration
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "429235800354-b4fn2n92u704i1pch6uvdq5j3sk0gj7l.apps.googleusercontent.com",
        webClientId: "429235800354-b4fn2n92u704i1pch6uvdq5j3sk0gj7l.apps.googleusercontent.com",
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.idToken) {
                // Send native Google Token to FastAPI for Verification
                googleLogin(authentication.idToken).catch((e) => Alert.alert("Server Error", e.message));
            }
        }
    }, [response]);

    return (
        <TouchableOpacity
            style={[
                styles.googleBtn,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
                style
            ]}
            disabled={!request}
            onPress={() => promptAsync()}
        >
            <MaterialCommunityIcons name="google" size={22} color="#DB4437" style={{ marginRight: 12 }} />
            <AppText style={[styles.googleBtnText, { color: colors.text }]}>{title}</AppText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    googleBtnText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'sans-serif',
    },
});
