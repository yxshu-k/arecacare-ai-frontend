import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';

export default function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('Login');
        }, 1500);
    };

    return (
        <Screen>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <View style={styles.header}>
                        <AppText variant="heading1">Create Account</AppText>
                        <AppText variant="bodyMedium" color="textMedium" style={styles.subtitle}>
                            Join the future of smart agriculture
                        </AppText>
                    </View>

                    <View style={styles.form}>
                        <AppTextInput label="Full Name" icon="user" placeholder="Ramesh Kumar" value={name} onChangeText={setName} />
                        <AppTextInput label="Phone Number" icon="phone" placeholder="+91 98765 43210" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
                        <AppTextInput label="Email Address" icon="mail" placeholder="farmer@example.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
                        <AppTextInput label="Password" icon="lock" placeholder="••••••••" secureTextEntry value={password} onChangeText={setPassword} />

                        <AppButton title="Sign Up" onPress={handleSignup} loading={loading} style={styles.signupBtn} />
                    </View>

                    <View style={styles.footer}>
                        <AppText variant="bodyMedium" color="textMedium">Already have an account? </AppText>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <AppText variant="bodyMedium" color="primary" style={styles.loginText}>Login</AppText>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, paddingVertical: 20 },
    header: { marginBottom: 30, marginTop: 20 },
    subtitle: { marginTop: 8 },
    form: { marginBottom: 20 },
    signupBtn: { marginTop: 20 },
    footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 40, marginTop: 10 },
    loginText: { fontWeight: '700' }
});
