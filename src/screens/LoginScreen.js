import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert, Keyboard } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatEmail } from '../utils/formatters';
import { isValidEmail } from '../utils/validators';

export default function LoginScreen({ navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { login } = useContext(AuthContext);

    const validateForm = () => {
        let valid = true;
        let newErrors = {};

        if (!isValidEmail(email)) {
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
            await login(email.trim().toLowerCase(), password);
        } catch (e) {
            Alert.alert(t('error') || "Login Failed", e.message || "Invalid email or password. Please verify your credentials and internet connection.");
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
                        <AppText variant="heading1" style={{ color: colors.text }}>{t('welcome_back_title')}</AppText>
                        <AppText variant="bodyMedium" color="textMedium" style={styles.subtitle}>
                            {t('login_header_subtitle')}
                        </AppText>
                    </View>

                    <View style={styles.form}>
                        <AppTextInput
                            label={t('email_address')}
                            icon="mail"
                            placeholder="farmer@example.com"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={(text) => { setEmail(formatEmail(text)); setErrors({ ...errors, email: '' }) }}
                        />
                        {errors.email && <AppText style={styles.errorText}>{errors.email}</AppText>}

                        <AppTextInput
                            label={t('password')}
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
                            <AppText variant="bodyMedium" color="primary">{t('forgot_password')}</AppText>
                        </TouchableOpacity>

                        <AppButton
                            title={t('sign_in')}
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginBtn}
                        />

                        <GoogleAuthButton title={t('continue_google')} />
                    </View>

                    <View style={styles.footer}>
                        <AppText variant="bodyMedium" color="textMedium">{t('dont_have_account')} </AppText>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <AppText variant="bodyMedium" color="primary" style={styles.signupText}>{t('sign_up')}</AppText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 20 },
    header: { alignItems: 'center', marginBottom: 40 },
    iconBackground: {
        backgroundColor: isDarkMode ? 'rgba(5, 150, 105, 0.2)' : '#E8F5E9',
        borderWidth: isDarkMode ? 1 : 0,
        borderColor: isDarkMode ? '#064E3B' : 'transparent',
        padding: 16,
        borderRadius: 24,
        marginBottom: 16
    },
    subtitle: { marginTop: 8, textAlign: 'center' },
    form: { marginBottom: 30 },
    errorText: { color: '#DC2626', fontSize: 12, marginBottom: 16, marginTop: -8, marginLeft: 4 },
    forgotPassword: { alignItems: 'flex-end', marginTop: 4, marginBottom: 24 },
    loginBtn: { marginBottom: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, paddingBottom: 20 },
    signupText: { fontWeight: '700' }
});
