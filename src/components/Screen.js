import React from 'react';
import { StyleSheet, View, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const Screen = ({ children, style, noPadding = false }) => {
    const { colors } = useTheme();
    const styles = React.useMemo(() => getStyles(colors), [colors]);
    return (
        <SafeAreaView style={styles.screen}>
            <View style={[styles.view, !noPadding && styles.padding, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const getStyles = (colors) => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    view: {
        flex: 1,
    },
    padding: {
        paddingHorizontal: 20,
    }
});

export default Screen;
