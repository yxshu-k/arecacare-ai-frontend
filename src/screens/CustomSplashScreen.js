import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { splashHtml } from '../constants/splashHtml';
import { useTheme } from '../context/ThemeContext';

export default function CustomSplashScreen({ onAnimationDone }) {
    const { isDarkMode } = useTheme();
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Generous hold time so the animated logo completes its full draw & pulse sequence
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 600, // Smooth 600ms fade out transition
                useNativeDriver: true,
            }).start(() => {
                if (onAnimationDone) onAnimationDone();
            });
        }, 4500);

        return () => clearTimeout(timer);
    }, [fadeAnim, onAnimationDone]);

    // Pass the system color context dynamically to the WebView by augmenting the HTML
    const themedHtml = isDarkMode
        ? splashHtml.replace('<html lang="en">', '<html lang="en" data-theme="dark">')
        : splashHtml;

    const bgColor = isDarkMode ? '#06130E' : '#ffffff';

    return (
        <Animated.View style={[styles.container, { backgroundColor: bgColor, opacity: fadeAnim }]}>
            <WebView
                originWhitelist={['*']}
                source={{ html: themedHtml, baseUrl: 'https://localhost' }}
                style={[styles.webview, { backgroundColor: bgColor }]}
                scrollEnabled={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onLoadEnd={() => console.log("[CustomSplashScreen] WebView engine fully initialized.")}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        elevation: 99,
    },
    webview: {
        flex: 1,
        width: '100%',
        height: '100%',
    }
});


