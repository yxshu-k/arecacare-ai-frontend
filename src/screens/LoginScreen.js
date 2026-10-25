import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert, Keyboard, Image } from 'react-native';
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
import { useKeyboard } from '../hooks/useKeyboard';

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
    const { keyboardHeight, isKeyboardVisible } = useKeyboard();

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
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={[
                        styles.scroll,
                        { paddingBottom: isKeyboardVisible ? keyboardHeight + 40 : 20 }
                    ]}
                >
                    <View style={styles.header}>
                        <View style={styles.iconBackground}>
                            <Image
                                source={require('../../assets/icon.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
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

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword')}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <AppText variant="bodyMedium" style={{ color: colors.primary, fontWeight: '600' }}>{t('forgot_password')}</AppText>
                        </TouchableOpacity>

                        <AppButton
                            title={t('sign_in')}
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginBtn}
                        />

                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <AppText variant="caption" style={styles.dividerText}>or continue with</AppText>
                            <View style={styles.dividerLine} />
                        </View>

                        <GoogleAuthButton title={t('continue_google')} />
                    </View>

                    <View style={styles.footer}>
                        <AppText variant="bodyMedium" color="textMedium">{t('dont_have_account')} </AppText>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <AppText variant="bodyMedium" style={styles.signupText}>{t('sign_up')}</AppText>
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
    header: { alignItems: 'center', marginBottom: 32 },
    iconBackground: {
        width: 88,
        height: 88,
        backgroundColor: isDarkMode ? 'rgba(85, 121, 69, 0.2)' : '#E8F0E4',
        borderWidth: 1.5,
        borderColor: isDarkMode ? '#2D3A2B' : '#DCE5D7',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: colors.primaryDark || '#1C241B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDarkMode ? 0.35 : 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    logoImage: {
        width: 66,
        height: 66,
    },
    subtitle: { marginTop: 8, textAlign: 'center', color: colors.textMedium },
    form: { marginBottom: 20 },
    errorText: { color: colors.error, fontSize: 12, marginBottom: 12, marginTop: -4, marginLeft: 4, fontWeight: '500' },
    forgotPassword: { alignItems: 'flex-end', marginTop: 4, marginBottom: 20 },
    loginBtn: { marginBottom: 16 },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        paddingHorizontal: 12,
        color: colors.textLight,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, paddingBottom: 20, alignItems: 'center' },
    signupText: { fontWeight: '700', color: colors.primary }
});

