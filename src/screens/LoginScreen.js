import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { login } = useContext(AuthContext);

    const validateForm = () => {
        let valid = true;
        let newErrors = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
            valid = false;
        }

        if (!password || password.length === 0) {
            newErrors.password = 'Please enter your password';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!validateForm()) return;

        setLoading(true);
        try {
            await login(email.trim(), password);
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
                        <View style={styles.iconBackground}>
                            <MaterialCommunityIcons name="leaf" size={48} color={colors.primary} />
                        </View>
                        <AppText variant="heading1">Welcome Back!</AppText>
                        <AppText variant="bodyMedium" color="textMedium" style={styles.subtitle}>
                            Log in to access smart farming tools
                        </AppText>
                    </View>

                    <View style={styles.form}>
                        <AppTextInput
                            label="Email Address"
                            icon="mail"
                            placeholder="farmer@example.com"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={(text) => { setEmail(text); setErrors({ ...errors, email: '' }) }}
                        />
                        {errors.email && <AppText style={styles.errorText}>{errors.email}</AppText>}

                        <AppTextInput
                            label="Password"
                            icon="lock"
                            placeholder="••••••••"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(text) => { setPassword(text); setErrors({ ...errors, password: '' }) }}
                            rightIcon={showPassword ? "eye" : "eye-off"}
                            onRightIconPress={() => setShowPassword(!showPassword)}
                        />
                        {errors.password && <AppText style={styles.errorText}>{errors.password}</AppText>}

                        <TouchableOpacity style={styles.forgotPassword}>
                            <AppText variant="bodyMedium" color="primary">Forgot Password?</AppText>
                        </TouchableOpacity>

                        <AppButton
                            title="Login"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginBtn}
                        />

                        <GoogleAuthButton title="Continue with Google" />
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
    iconBackground: { backgroundColor: '#E8F5E9', padding: 16, borderRadius: 24, marginBottom: 16 },
    subtitle: { marginTop: 8, textAlign: 'center' },
    form: { marginBottom: 30 },
    errorText: { color: '#DC2626', fontSize: 12, marginBottom: 16, marginTop: -8, marginLeft: 4 },
    forgotPassword: { alignItems: 'flex-end', marginTop: 4, marginBottom: 24 },
    loginBtn: { marginBottom: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, paddingBottom: 20 },
    signupText: { fontWeight: '700' }
});
