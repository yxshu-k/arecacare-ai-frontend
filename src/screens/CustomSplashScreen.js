import React, { useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import { WebView } from 'react-native-webview';
import { splashHtml } from '../constants/splashHtml';
import { useTheme } from '../context/ThemeContext';

export default function CustomSplashScreen({ onAnimationDone }) {
    const { isDarkMode } = useTheme();
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const isFinishedRef = useRef(false);

    const finishSplash = useCallback(() => {
        if (isFinishedRef.current) return;
        isFinishedRef.current = true;

        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400, // Crisp 400ms cross-fade into next screen
            useNativeDriver: true,
        }).start(() => {
            if (onAnimationDone) onAnimationDone();
        });
    }, [fadeAnim, onAnimationDone]);

    useEffect(() => {
        // Hold for 2.8s so animated logo completes full draw, sweep & pulse sequence
        const timer = setTimeout(() => {
            finishSplash();
        }, 2800);

        return () => clearTimeout(timer);
    }, [finishSplash]);

    // Pass the system color context dynamically to the WebView
    const themedHtml = isDarkMode
        ? splashHtml.replace('<html lang="en">', '<html lang="en" data-theme="dark">')
        : splashHtml;

    const bgColor = isDarkMode ? '#121611' : '#ffffff';

    return (
        <TouchableWithoutFeedback onPress={finishSplash}>
            <Animated.View style={[styles.container, { backgroundColor: bgColor, opacity: fadeAnim }]}>
                <WebView
                    originWhitelist={['*']}
                    source={{ html: themedHtml }}
                    style={[styles.webview, { backgroundColor: bgColor }]}
                    scrollEnabled={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    androidHardwareAccelerationDisabled={false}
                    overScrollMode="never"
                    pointerEvents="none"
                />
            </Animated.View>
        </TouchableWithoutFeedback>
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


