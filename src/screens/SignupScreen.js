import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPhone, formatEmail } from '../utils/formatters';
import { isValidEmail, isValidPhone, isValidPassword, isValidName } from '../utils/validators';

export default function SignupScreen({ navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext);

    const validateForm = () => {
        let valid = true;
        let newErrors = {};

        if (!isValidName(name)) {
            newErrors.name = 'Name must be at least 2 characters';
            valid = false;
        }

        if (!isValidEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
            valid = false;
        }

        if (phone && phone.length > 0 && !isValidPhone(phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
            valid = false;
        }

        if (!isValidPassword(password)) {
            newErrors.password = 'Password must be at least 8 characters long';
            valid = false;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            valid = false;
        }

        if (!agreePrivacy) {
            newErrors.agreePrivacy = 'You must agree to the App Privacy Policy & Data Usage Terms explicitly to create an account.';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSignup = async () => {
        Keyboard.dismiss();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await register({ name, phone, email, password });
        } catch (error) {
            Alert.alert(t('error') || "Registration Failed", error.message);
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
                        <AppText variant="heading1" style={{ color: colors.text }}>{t('create_account_title')}</AppText>
                        <AppText variant="bodyMedium" color="textMedium" style={styles.subtitle}>
                            {t('signup_subtitle')}
                        </AppText>
                    </View>

                    <View style={styles.form}>
                        <GoogleAuthButton title={t('signup_google')} style={{ marginBottom: 12 }} />

                        <AppTextInput label={t('full_name')} icon="user" placeholder="Ramesh Kumar" value={name} onChangeText={(text) => { setName(text); setErrors({ ...errors, name: '' }) }} />
                        {errors.name && <AppText style={styles.errorText}>{errors.name}</AppText>}

                        <AppTextInput label={t('phone_number')} icon="phone" placeholder="9876543210" keyboardType="phone-pad" value={phone} onChangeText={(text) => { setPhone(formatPhone(text)); setErrors({ ...errors, phone: '' }) }} />
                        {errors.phone && <AppText style={styles.errorText}>{errors.phone}</AppText>}

                        <AppTextInput label={t('email_address')} icon="mail" placeholder="farmer@example.com" keyboardType="email-address" value={email} onChangeText={(text) => { setEmail(formatEmail(text)); setErrors({ ...errors, email: '' }) }} />
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

                        <AppTextInput
                            label={t('confirm_password')}
                            icon="lock"
                            placeholder="••••••••"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={(text) => { setConfirmPassword(text); setErrors({ ...errors, confirmPassword: '' }) }}
                            rightIcon={showConfirmPassword ? "eye" : "eye-off"}
                            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                        {errors.confirmPassword && <AppText style={styles.errorText}>{errors.confirmPassword}</AppText>}

                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => { setAgreePrivacy(!agreePrivacy); setErrors({ ...errors, agreePrivacy: '' }); }}
                        >
                            <View style={[styles.checkbox, agreePrivacy && styles.checkboxActive]}>
                                {agreePrivacy && <Feather name="check" size={14} color="#FFFFFF" />}
                            </View>
                            <AppText variant="bodySmall" color="textMedium" style={styles.checkboxText}>
                                {t('consent_checkbox')}
                            </AppText>
                        </TouchableOpacity>
                        {errors.agreePrivacy && <AppText style={styles.errorText}>{errors.agreePrivacy}</AppText>}

                        <AppButton title={t('create_account')} onPress={handleSignup} loading={loading} style={styles.signupBtn} />
                    </View>

                    <View style={styles.footer}>
                        <AppText variant="bodyMedium" color="textMedium">{t('already_have_account')} </AppText>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <AppText variant="bodyMedium" color="primary" style={styles.loginText}>{t('sign_in')}</AppText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, paddingVertical: 20 },
    header: { marginBottom: 30, marginTop: 20 },
    subtitle: { marginTop: 8 },
    form: { marginBottom: 20 },
    signupBtn: { marginBottom: 16, marginTop: 10 },
    errorText: { color: '#DC2626', fontSize: 12, marginBottom: 16, marginTop: -8, marginLeft: 4 },
    footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 40, marginTop: 10 },
    loginText: { fontWeight: '700' },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxText: {
        flex: 1,
        lineHeight: 18,
    }
});
