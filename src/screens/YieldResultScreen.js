import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function YieldResultScreen({ navigation }) {
    return (
        <Screen style={styles.screen} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('HomeMain')}>
                    <Feather name="chevron-left" size={28} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="heading3">Prediction Result</AppText>
                <TouchableOpacity>
                    <Feather name="share-2" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                <View style={styles.metricContainer}>
                    {/* Visual Circle Gauge Wrapper */}
                    <View style={styles.outerCircle}>
                        <View style={styles.innerCircle}>
                            <AppText style={styles.metricValue}>2.45</AppText>
                            <AppText variant="bodyMedium" color="textMedium">Tonnes / Acre</AppText>
                        </View>
                    </View>

                    <View style={styles.statusBadge}>
                        <Feather name="trending-up" size={16} color={colors.primary} />
                        <AppText variant="bodyMedium" style={styles.statusText}>
                            Good Yield Potential ✨
                        </AppText>
                    </View>
                </View>

                <View style={styles.insightsCard}>
                    <AppText variant="heading3" style={{ marginBottom: 12 }}>Insights</AppText>
                    <AppText variant="body" color="textMedium" style={{ lineHeight: 24 }}>
                        Based on your Loamy soil and strong 1200mm rainfall average, your 5-year-old arecanut palms are expected to produce an optimal harvest. Maintaining regular fertilizer schedules will ensure you hit this 2.45 tonne target.
                    </AppText>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <AppButton
                    title="View Recommendations"
                    onPress={() => navigation.navigate('HomeMain')} // In reality links to Article Tips but linking to home for now 
                />
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    screen: { backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    scroll: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
    metricContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 40,
    },
    outerCircle: {
        width: width * 0.55,
        height: width * 0.55,
        borderRadius: (width * 0.55) / 2,
        borderWidth: 6,
        borderColor: '#D1FAE5', // very light green
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    innerCircle: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: (width * 0.55) / 2,
        borderWidth: 6,
        borderColor: colors.primary,
    },
    metricValue: {
        fontSize: 48,
        fontWeight: '800',
        color: colors.text,
        fontFamily: 'sans-serif', // robust fallback
        marginBottom: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        color: colors.primary,
        fontWeight: '700',
        marginLeft: 8,
    },
    insightsCard: {
        width: '100%',
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
        width: '100%',
    }
});
