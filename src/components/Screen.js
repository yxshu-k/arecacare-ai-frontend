import React from 'react';
import { SafeAreaView, StyleSheet, View, Platform, StatusBar } from 'react-native';
import { colors } from '../theme/colors';

const Screen = ({ children, style, noPadding = false }) => {
    return (
        <SafeAreaView style={styles.screen}>
            <View style={[styles.view, !noPadding && styles.padding, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        // Add margin top for Android since SafeAreaView only works on iOS
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    view: {
        flex: 1,
    },
    padding: {
        paddingHorizontal: 20,
    }
});

export default Screen;
