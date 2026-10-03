import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { splashHtml } from '../constants/splashHtml';
import { useTheme } from '../context/ThemeContext';

export default function CustomSplashScreen({ onAnimationDone }) {
    const { isDarkMode } = useTheme();
    const fadeAnim = useRef(new Animated.Value(1)).current; // Highly reliable vs useState

    useEffect(() => {
        // Some older Android phones take 1.5s just to mount the WebView Chromium engine.
        // We give the animation a generous 6.5s total hold time so it renders perfectly.
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 600, // 600ms fade out transition
                useNativeDriver: true,
            }).start(() => {
                onAnimationDone(); // Trigger the actual app mount
            });
        }, 4500);

        return () => clearTimeout(timer);
    }, [fadeAnim, onAnimationDone]);

    // Pass the system color context dynamically to the WebView by augmenting the HTML
    const themedHtml = isDarkMode
        ? splashHtml.replace('<html lang="en">', '<html lang="en" data-theme="dark">')
        : splashHtml;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <WebView
                originWhitelist={['*']}
                source={{ html: themedHtml, baseUrl: 'https://localhost' }} // Prevents Android HTML silent blanking bugs
                style={styles.webview}
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
        zIndex: 9999, // Ensure it sits on top of everything before app loads
        backgroundColor: '#ffffff',
        elevation: 99, // Force over Android root elevation
    },
    webview: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent'
    }
});
