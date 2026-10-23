import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Alert,
    Keyboard,
    TextInput
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { formatEmail } from '../utils/formatters';
import { isValidEmail } from '../utils/validators';

export default function ForgotPasswordScreen({ navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    // Step state: 1 = Email, 2 = OTP, 3 = New Password, 4 = Success
    const [step, setStep] = useState(1);

    // Form inputs
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resetToken, setResetToken] = useState('');

    // State flags
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [errors, setErrors] = useState({});
    const [timer, setTimer] = useState(60);
    const [timerActive, setTimerActive] = useState(false);

    // Countdown timer for OTP resend
    useEffect(() => {
        let interval = null;
        if (timerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setTimerActive(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    // ============================================================
    // STEP 1: REQUEST OTP
    // ============================================================
    const handleRequestOtp = async () => {
        Keyboard.dismiss();
        const cleanEmail = email.trim().toLowerCase();
        if (!isValidEmail(cleanEmail)) {
            setErrors({ email: 'Please enter a valid email address' });
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            await authService.forgotPassword(cleanEmail);
            setStep(2);
            setTimer(60);
            setTimerActive(true);
        } catch (err) {
            Alert.alert(t('error') || 'Error', err.message || 'Could not send verification code.');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // STEP 2: RESEND OTP
    // ============================================================
    const handleResendOtp = async () => {
        setResending(true);
        try {
            const cleanEmail = email.trim().toLowerCase();
            await authService.forgotPassword(cleanEmail);
            setTimer(60);
            setTimerActive(true);
            Alert.alert('Code Resent', 'A fresh 6-digit verification code has been sent to your email.');
        } catch (err) {
            Alert.alert(t('error') || 'Error', err.message || 'Could not resend code.');
        } finally {
            setResending(false);
        }
    };

    // ============================================================
    // STEP 2: VERIFY OTP
    // ============================================================
    const handleVerifyOtp = async () => {
        Keyboard.dismiss();
        const cleanOtp = otp.trim();
        if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
            setErrors({ otp: 'Please enter the complete 6-digit code' });
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const cleanEmail = email.trim().toLowerCase();
            const res = await authService.verifyResetOtp(cleanEmail, cleanOtp);
            if (!res.reset_token) {
                throw new Error('Verification failed. No reset token received.');
            }
            setResetToken(res.reset_token);
            setStep(3);
        } catch (err) {
            Alert.alert(t('error') || 'Verification Failed', err.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // STEP 3: RESET PASSWORD
    // ============================================================
    const handleResetPassword = async () => {
        Keyboard.dismiss();
        let newErrors = {};

        if (!newPassword || newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters long';
        }
        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            await authService.resetPassword(resetToken, newPassword.trim());
            setStep(4); // Success screen
        } catch (err) {
            Alert.alert(t('error') || 'Reset Failed', err.message || 'Could not update password.');
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        if (!newPassword) return null;
        if (newPassword.length < 6) return { label: 'Too Short', color: '#EF4444', width: '25%' };
        const hasLetter = /[a-zA-Z]/.test(newPassword);
        const hasDigit = /\d/.test(newPassword);
        const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);

        if (newPassword.length >= 8 && hasLetter && hasDigit && hasSpecial) {
            return { label: 'Strong', color: '#16A34A', width: '100%' };
        }
        if (newPassword.length >= 6 && hasLetter && hasDigit) {
            return { label: 'Good', color: '#EAB308', width: '65%' };
        }
        return { label: 'Fair', color: '#F97316', width: '40%' };
    };

    const strength = getPasswordStrength();

    return (
        <Screen style={styles.screen}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header with back button */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => {
                            if (step > 1 && step < 4) {
                                setStep(step - 1);
                            } else {
                                navigation.goBack();
                            }
                        }}
                    >
                        <Feather name="arrow-left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <AppText variant="heading3" style={{ color: colors.text }}>
                        {step === 4 ? 'Complete' : `Step ${step} of 3`}
                    </AppText>
                    <View style={{ width: 40 }} />
                </View>

                {/* Stepper Progress Bar */}
                {step < 4 && (
                    <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${(step / 3) * 100}%` }]} />
                    </View>
                )}

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* ==================================================== */}
                    {/* STEP 1: EMAIL INPUT */}
                    {/* ==================================================== */}
                    {step === 1 && (
                        <View style={styles.stepContainer}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="shield-key-outline" size={42} color={colors.primary} />
                            </View>
                            <AppText variant="heading1" style={styles.title}>
                                Forgot Password?
                            </AppText>
                            <AppText variant="bodyMedium" color="textMedium" style={styles.subtitle}>
                                Don't worry! Enter your registered email address below and we'll send you a 6-digit verification code.
                            </AppText>

                            <View style={styles.formSection}>
                                <AppTextInput
                                    label="Registered Email Address"
                                    icon="mail"
                                    placeholder="farmer@example.com"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(formatEmail(text));
                                        setErrors({ ...errors, email: '' });
                                    }}
                                />
                                {errors.email && <AppText style={styles.errorText}>{errors.email}</AppText>}

                                <AppButton
                                    title="Send Verification Code"
                                    onPress={handleRequestOtp}
                                    loading={loading}
                                    style={styles.primaryBtn}
                                />
                            </View>
                        </View>
                    )}

                    {/* ==================================================== */}
                    {/* STEP 2: 6-DIGIT OTP INPUT */}
                    {/* ==================================================== */}
                    {step === 2 && (
                        <View style={styles.stepContainer}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="email-check-outline" size={42} color={colors.primary} />
                            </View>
                            <AppText variant="heading1" style={styles.title}>
                                Enter Verification Code
                            </AppText>
                            <AppText variant="bodyMedium" color="textMedium" style={styles.subtitle}>
                                We've sent a 6-digit code to <AppText style={{ fontWeight: '700', color: colors.text }}>{email}</AppText>.
                            </AppText>

                            <View style={styles.formSection}>
                                <View style={styles.otpInputWrapper}>
                                    <TextInput
                                        style={[
                                            styles.otpInput,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: errors.otp ? '#EF4444' : colors.primary,
                                                color: colors.text,
                                            }
                                        ]}
                                        value={otp}
                                        onChangeText={(text) => {
                                            const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                                            setOtp(cleaned);
                                            setErrors({ ...errors, otp: '' });
                                        }}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                        placeholder="••••••"
                                        placeholderTextColor={colors.textLight}
                                        autoFocus
                                    />
                                </View>
                                {errors.otp && <AppText style={styles.errorText}>{errors.otp}</AppText>}

                                {/* Resend timer */}
                                <View style={styles.timerRow}>
                                    {timerActive ? (
                                        <AppText variant="caption" color="textMedium">
                                            Resend code in <AppText style={{ color: colors.primary, fontWeight: '700' }}>00:{timer < 10 ? `0${timer}` : timer}</AppText>
                                        </AppText>
                                    ) : (
                                        <TouchableOpacity onPress={handleResendOtp} disabled={resending}>
                                            <AppText variant="bodyMedium" style={{ color: colors.primary, fontWeight: '700' }}>
                                                {resending ? 'Sending...' : 'Resend Code'}
                                            </AppText>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <AppButton
                                    title="Verify & Continue"
                                    onPress={handleVerifyOtp}
                                    loading={loading}
                                    style={styles.primaryBtn}
                                />
                            </View>
                        </View>
                    )}

                    {/* ==================================================== */}
                    {/* STEP 3: NEW PASSWORD */}
                    {/* ==================================================== */}
                    {step === 3 && (
                        <View style={styles.stepContainer}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="lock-reset" size={42} color={colors.primary} />
                            </View>
                            <AppText variant="heading1" style={styles.title}>
                                Set New Password
                            </AppText>
                            <AppText variant="bodyMedium" color="textMedium" style={styles.subtitle}>
                                Create a secure new password for your ArecaCare AI account.
                            </AppText>

                            <View style={styles.formSection}>
                                <AppTextInput
                                    label="New Password"
                                    icon="lock"
                                    placeholder="••••••••"
                                    secureTextEntry={!showNewPassword}
                                    value={newPassword}
                                    onChangeText={(text) => {
                                        setNewPassword(text);
                                        setErrors({ ...errors, newPassword: '' });
                                    }}
                                    rightIcon={showNewPassword ? "eye" : "eye-off"}
                                    onRightIconPress={() => setShowNewPassword(!showNewPassword)}
                                />
                                {errors.newPassword && <AppText style={styles.errorText}>{errors.newPassword}</AppText>}

                                {/* Strength meter */}
                                {strength && (
                                    <View style={styles.strengthWrapper}>
                                        <View style={styles.strengthBarBg}>
                                            <View style={[styles.strengthBarFill, { width: strength.width, backgroundColor: strength.color }]} />
                                        </View>
                                        <AppText variant="caption" style={{ color: strength.color, fontWeight: '600', marginTop: 4 }}>
                                            Strength: {strength.label}
                                        </AppText>
                                    </View>
                                )}

                                <AppTextInput
                                    label="Confirm New Password"
                                    icon="lock"
                                    placeholder="••••••••"
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        setErrors({ ...errors, confirmPassword: '' });
                                    }}
                                    rightIcon={showConfirmPassword ? "eye" : "eye-off"}
                                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                                {errors.confirmPassword && <AppText style={styles.errorText}>{errors.confirmPassword}</AppText>}

                                <AppButton
                                    title="Save New Password"
                                    onPress={handleResetPassword}
                                    loading={loading}
                                    style={styles.primaryBtn}
                                />
                            </View>
                        </View>
                    )}

                    {/* ==================================================== */}
                    {/* STEP 4: SUCCESS */}
                    {/* ==================================================== */}
                    {step === 4 && (
                        <View style={[styles.stepContainer, { alignItems: 'center', paddingTop: 40 }]}>
                            <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7', width: 90, height: 90, borderRadius: 45 }]}>
                                <Feather name="check" size={48} color="#16A34A" />
                            </View>
                            <AppText variant="heading1" style={[styles.title, { textAlign: 'center', marginTop: 24 }]}>
                                Password Reset Successful!
                            </AppText>
                            <AppText variant="bodyMedium" color="textMedium" style={[styles.subtitle, { textAlign: 'center' }]}>
                                Your password has been updated securely. You can now log into your account using your new credentials.
                            </AppText>

                            <AppButton
                                title="Back to Sign In"
                                onPress={() => navigation.navigate('Login')}
                                style={[styles.primaryBtn, { width: '100%', marginTop: 32 }]}
                            />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardContainer: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
    },
    backBtn: {
        padding: 8,
        borderRadius: 12,
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: isDarkMode ? '#262626' : '#E5E7EB',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 40,
    },
    stepContainer: {
        alignItems: 'flex-start',
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: colors.text,
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 24,
    },
    formSection: {
        width: '100%',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: -4,
        marginBottom: 10,
        marginLeft: 4,
    },
    primaryBtn: {
        marginTop: 18,
        borderRadius: 14,
    },
    otpInputWrapper: {
        marginVertical: 16,
        alignItems: 'center',
    },
    otpInput: {
        width: '100%',
        height: 64,
        borderRadius: 16,
        borderWidth: 2,
        textAlign: 'center',
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    timerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 12,
    },
    strengthWrapper: {
        marginTop: -4,
        marginBottom: 14,
        marginLeft: 4,
    },
    strengthBarBg: {
        height: 4,
        backgroundColor: isDarkMode ? '#333333' : '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
    },
    strengthBarFill: {
        height: '100%',
        borderRadius: 2,
    },
});
