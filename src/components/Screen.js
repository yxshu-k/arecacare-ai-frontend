import React from 'react';
import { StyleSheet, View, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        // With react-native-safe-area-context we usually don't need manual pt, 
        // but just in case for strict consistency on Android:
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
