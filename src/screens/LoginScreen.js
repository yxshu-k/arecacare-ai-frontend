import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await login(email, password);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Screen>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <View style={styles.header}>
                        <AppText variant="heading1" style={styles.logo}>🌿</AppText>
                        <AppText variant="heading1">Welcome Back!</AppText>
                        <AppText variant="bodyMedium" color="textMedium" style={styles.subtitle}>
                            Log in to access smart farming tools
                        </AppText>
                    </View>

                    <View style={styles.form}>
                        <AppTextInput
                            label="Email Address"
                            icon="✉️"
                            placeholder="farmer@example.com"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                        <AppTextInput
                            label="Password"
                            icon="🔒"
                            placeholder="••••••••"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity style={styles.forgotPassword}>
                            <AppText variant="bodyMedium" color="primary">Forgot Password?</AppText>
                        </TouchableOpacity>

                        <AppButton
                            title="Login"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginBtn}
                        />

                        <AppButton
                            title="Login with Google 🌐"
                            variant="outline"
                            onPress={() => { }}
                            style={styles.googleBtn}
                        />
                    </View>

                    <View style={styles.footer}>
                        <AppText variant="bodyMedium" color="textMedium">Don't have an account? </AppText>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <AppText variant="bodyMedium" color="primary" style={styles.signupText}>Sign Up</AppText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 20 },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { fontSize: 60, marginBottom: 10 },
    subtitle: { marginTop: 8, textAlign: 'center' },
    form: { marginBottom: 30 },
    forgotPassword: { alignItems: 'flex-end', marginTop: 4, marginBottom: 24 },
    loginBtn: { marginBottom: 16 },
    googleBtn: { marginBottom: 10 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, paddingBottom: 20 },
    signupText: { fontWeight: '700' }
});
