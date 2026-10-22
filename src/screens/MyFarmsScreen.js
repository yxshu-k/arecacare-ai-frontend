import React, { useState, useContext, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ARECA_VARIETIES = ['Mangala', 'South Kanara', 'Sumangala', 'Mohitnagar', 'Intercropped'];
const SOIL_TYPES = ['Red Laterite', 'Loamy', 'Sandy Loam', 'Clay'];
const IRRIGATION_TYPES = ['Borewell & Drip', 'Open Well', 'River / Stream', 'Rainfed'];
const POPULAR_TALUKS = ['Sullia', 'Puttur', 'Bantwal', 'Belthangady', 'Shivamogga', 'Channagiri', 'Sirsi', 'Thirthahalli'];

export default function MyFarmsScreen({ navigation }) {
    const { userData, updateUser, activeFarm } = useContext(AuthContext);
    const { colors, isDarkMode } = useTheme();
    const styles = useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    const farms = useMemo(() => {
        if (userData?.farms && Array.isArray(userData.farms)) {
            return userData.farms;
        }
        return [];
    }, [userData]);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingFarmId, setEditingFarmId] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form fields state
    const [farmName, setFarmName] = useState('');
    const [taluk, setTaluk] = useState('');
    const [areaAcres, setAreaAcres] = useState('');
    const [palmCount, setPalmCount] = useState('');
    const [palmAge, setPalmAge] = useState('');
    const [variety, setVariety] = useState('Mangala');
    const [soilType, setSoilType] = useState('Red Laterite');
    const [irrigation, setIrrigation] = useState('Borewell & Drip');

    // Totals
    const totalAcres = useMemo(() => {
        return farms.reduce((sum, f) => sum + (parseFloat(f.area_acres) || 0), 0).toFixed(1);
    }, [farms]);

    const totalPalms = useMemo(() => {
        return farms.reduce((sum, f) => sum + (parseInt(f.palm_count, 10) || 0), 0).toLocaleString();
    }, [farms]);

    const openAddModal = () => {
        setEditingFarmId(null);
        setFarmName('');
        const detectedTaluk = (activeFarm?.name && activeFarm.name !== 'Current Location' && activeFarm.name !== 'Live GPS')
            ? activeFarm.name
            : (activeFarm?.locality || activeFarm?.district || userData?.region || '');
        setTaluk(detectedTaluk);
        setAreaAcres('');
        setPalmCount('');
        setPalmAge('');
        setVariety('Mangala');
        setSoilType('Red Laterite');
        setIrrigation('Borewell & Drip');
        setModalVisible(true);
    };

    const openEditModal = (farm) => {
        setEditingFarmId(farm.id);
        setFarmName(farm.name || '');
        setTaluk(farm.taluk || userData?.region || '');
        setAreaAcres(farm.area_acres != null ? String(farm.area_acres) : '');
        setPalmCount(farm.palm_count != null ? String(farm.palm_count) : '');
        setPalmAge(farm.palm_age_years != null ? String(farm.palm_age_years) : '');
        setVariety(farm.variety || 'Mangala');
        setSoilType(farm.soil_type || 'Red Laterite');
        setIrrigation(farm.irrigation_source || 'Borewell & Drip');
        setModalVisible(true);
    };

    const handleSaveFarm = async () => {
        if (!farmName.trim()) {
            Alert.alert('Required Field', 'Please provide a name for this plantation.');
            return;
        }

        const areaNum = parseFloat(areaAcres);
        if (isNaN(areaNum) || areaNum <= 0) {
            Alert.alert('Invalid Area', 'Please enter a valid land area in acres (e.g. 2.5).');
            return;
        }

        const palmsNum = parseInt(palmCount, 10);
        if (isNaN(palmsNum) || palmsNum <= 0) {
            Alert.alert('Invalid Palms', 'Please enter a valid number of areca palms (e.g. 1000).');
            return;
        }

        const ageNum = parseInt(palmAge, 10) || 1;
        const dynamicTaluk = taluk.trim() || activeFarm?.name || userData?.region || 'Local Farm';

        const farmPayload = {
            id: editingFarmId || `farm_${Date.now()}`,
            name: farmName.trim(),
            taluk: dynamicTaluk,
            area_acres: areaNum,
            palm_count: palmsNum,
            palm_age_years: ageNum,
            variety,
            soil_type: soilType,
            irrigation_source: irrigation,
            is_primary: editingFarmId
                ? farms.find(f => f.id === editingFarmId)?.is_primary || false
                : farms.length === 0,
        };

        try {
            setSaving(true);
            let updatedList;
            if (editingFarmId) {
                updatedList = farms.map(f => (f.id === editingFarmId ? farmPayload : f));
            } else {
                updatedList = [...farms, farmPayload];
            }

            // Ensure at least one farm is primary if farms exist
            if (!updatedList.some(f => f.is_primary) && updatedList.length > 0) {
                updatedList[0].is_primary = true;
            }

            const primaryFarm = updatedList.find(f => f.is_primary) || (updatedList.length > 0 ? updatedList[0] : null);
            await updateUser({ farms: updatedList, farm_details: primaryFarm });
            setModalVisible(false);
            Alert.alert('Success', 'Plantation profile updated successfully!');
        } catch (error) {
            Alert.alert('Update Failed', error?.message || 'Could not save plantation details.');
        } finally {
            setSaving(false);
        }
    };

    const handleSetPrimary = async (farmId) => {
        try {
            const updatedList = farms.map(f => ({
                ...f,
                is_primary: f.id === farmId,
            }));
            const primaryFarm = updatedList.find(f => f.is_primary);
            await updateUser({ farms: updatedList, farm_details: primaryFarm });
        } catch (error) {
            Alert.alert('Error', 'Could not update primary farm.');
        }
    };

    const handleDeleteFarm = (farmId, farmNameToDelete) => {
        Alert.alert(
            'Delete Plantation?',
            `Are you sure you want to delete "${farmNameToDelete}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updatedList = farms.filter(f => f.id !== farmId);
                            if (updatedList.length > 0 && !updatedList.some(f => f.is_primary)) {
                                updatedList[0].is_primary = true;
                            }
                            const primaryFarm = updatedList.find(f => f.is_primary) || (updatedList.length > 0 ? updatedList[0] : null);
                            await updateUser({ farms: updatedList, farm_details: primaryFarm });
                            Alert.alert('Deleted', `"${farmNameToDelete}" has been removed.`);
                        } catch (error) {
                            Alert.alert('Delete Failed', error?.message || 'Could not delete plantation.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <Screen style={styles.screen} noPadding>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="heading2" style={{ color: colors.text }}>
                        My Plantations
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.textMedium }}>
                        Arecanut land & palm management
                    </AppText>
                </View>
                <TouchableOpacity style={styles.addHeaderBtn} onPress={openAddModal}>
                    <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                        Add Farm
                    </AppText>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {farms.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? '#064E3B40' : '#ECFDF5' }]}>
                            <MaterialCommunityIcons name="tree" size={48} color={colors.primary} />
                        </View>
                        <AppText variant="heading2" style={{ color: colors.text, textAlign: 'center', marginTop: 16 }}>
                            No Plantations Registered Yet
                        </AppText>
                        <AppText variant="bodyMedium" style={{ color: colors.textMedium, textAlign: 'center', marginTop: 8, lineHeight: 22, paddingHorizontal: 12 }}>
                            Register your arecanut land to track palm counts, soil variety, and enable tailored microclimate forecasts for your crop.
                        </AppText>

                        <TouchableOpacity style={styles.emptyCtaBtn} onPress={openAddModal} activeOpacity={0.85}>
                            <Feather name="plus-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <AppText variant="bodyLarge" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                Register First Plantation
                            </AppText>
                        </TouchableOpacity>

                        <View style={styles.featuresCard}>
                            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700', letterSpacing: 0.6, marginBottom: 14 }}>
                                WHY REGISTER YOUR PLANTATION?
                            </AppText>

                            <View style={styles.featureItem}>
                                <Feather name="check" size={16} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
                                <AppText variant="caption" style={{ color: colors.textMedium, flex: 1, lineHeight: 18 }}>
                                    Dynamic palm age & density calculation for accurate harvest estimates.
                                </AppText>
                            </View>

                            <View style={styles.featureItem}>
                                <Feather name="check" size={16} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
                                <AppText variant="caption" style={{ color: colors.textMedium, flex: 1, lineHeight: 18 }}>
                                    Soil-specific (Laterite, Loamy, Clay) fertilizer & nutrient schedules.
                                </AppText>
                            </View>

                            <View style={styles.featureItem}>
                                <Feather name="check" size={16} color={colors.primary} style={{ marginRight: 10, marginTop: 2 }} />
                                <AppText variant="caption" style={{ color: colors.textMedium, flex: 1, lineHeight: 18 }}>
                                    Hyper-local weather risk alerts customized for your farm taluk.
                                </AppText>
                            </View>
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Summary Banner */}
                        <View style={styles.summaryBanner}>
                            <View style={styles.summaryItem}>
                                <View style={[styles.summaryIconCircle, { backgroundColor: '#ECFDF5' }]}>
                                    <MaterialCommunityIcons name="tree" size={22} color="#059669" />
                                </View>
                                <View>
                                    <AppText variant="heading3" style={{ color: colors.text }}>
                                        {totalPalms}
                                    </AppText>
                                    <AppText variant="caption" style={{ color: colors.textMedium }}>
                                        Total Palms
                                    </AppText>
                                </View>
                            </View>

                            <View style={styles.summaryDivider} />

                            <View style={styles.summaryItem}>
                                <View style={[styles.summaryIconCircle, { backgroundColor: '#EFF6FF' }]}>
                                    <Feather name="map" size={20} color="#2563EB" />
                                </View>
                                <View>
                                    <AppText variant="heading3" style={{ color: colors.text }}>
                                        {totalAcres} ac
                                    </AppText>
                                    <AppText variant="caption" style={{ color: colors.textMedium }}>
                                        Total Area
                                    </AppText>
                                </View>
                            </View>

                            <View style={styles.summaryDivider} />

                            <View style={styles.summaryItem}>
                                <View style={[styles.summaryIconCircle, { backgroundColor: '#FEF3C7' }]}>
                                    <Feather name="layers" size={20} color="#D97706" />
                                </View>
                                <View>
                                    <AppText variant="heading3" style={{ color: colors.text }}>
                                        {farms.length}
                                    </AppText>
                                    <AppText variant="caption" style={{ color: colors.textMedium }}>
                                        Plantations
                                    </AppText>
                                </View>
                            </View>
                        </View>

                        {/* Plantation Cards */}
                        <View style={styles.sectionHeader}>
                            <AppText variant="bodyLarge" style={{ fontWeight: '700', color: colors.text }}>
                                Registered Plantations
                            </AppText>
                            <AppText variant="caption" style={{ color: colors.textLight }}>
                                Primary farm used for weather & yields
                            </AppText>
                        </View>

                        {farms.map((farm) => {
                            const isPrimary = !!farm.is_primary;
                            return (
                                <View
                                    key={farm.id}
                                    style={[
                                        styles.farmCard,
                                        isPrimary && { borderColor: colors.primary, borderWidth: 1.5 },
                                    ]}
                                >
                                    {/* Card Header */}
                                    <View style={styles.cardHeader}>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.farmTitleRow}>
                                                <AppText variant="heading3" style={{ color: colors.text }} numberOfLines={1}>
                                                    {farm.name}
                                                </AppText>
                                                {isPrimary && (
                                                    <View style={styles.primaryBadge}>
                                                        <Feather name="check-circle" size={12} color="#059669" style={{ marginRight: 4 }} />
                                                        <AppText variant="caption" style={{ color: '#059669', fontWeight: 'bold', fontSize: 11 }}>
                                                            Primary
                                                        </AppText>
                                                    </View>
                                                )}
                                            </View>
                                            <View style={styles.locationRow}>
                                                <Feather name="map-pin" size={12} color={colors.textLight} style={{ marginRight: 4 }} />
                                                <AppText variant="caption" style={{ color: colors.textMedium }}>
                                                    {farm.taluk || 'Local Farm'}
                                                </AppText>
                                            </View>
                                        </View>

                                        <TouchableOpacity
                                            style={styles.cardEditBtn}
                                            onPress={() => openEditModal(farm)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Feather name="edit-2" size={16} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Metrics Grid */}
                                    <View style={styles.metricsGrid}>
                                        <View style={styles.metricPill}>
                                            <AppText variant="caption" style={styles.metricLabel}>AREA</AppText>
                                            <AppText variant="bodyMedium" style={styles.metricValue}>{farm.area_acres} Acres</AppText>
                                        </View>
                                        <View style={styles.metricPill}>
                                            <AppText variant="caption" style={styles.metricLabel}>PALMS</AppText>
                                            <AppText variant="bodyMedium" style={styles.metricValue}>{farm.palm_count} Trees</AppText>
                                        </View>
                                        <View style={styles.metricPill}>
                                            <AppText variant="caption" style={styles.metricLabel}>PALM AGE</AppText>
                                            <AppText variant="bodyMedium" style={styles.metricValue}>{farm.palm_age_years || 1} Yrs</AppText>
                                        </View>
                                        <View style={styles.metricPill}>
                                            <AppText variant="caption" style={styles.metricLabel}>VARIETY</AppText>
                                            <AppText variant="bodyMedium" style={styles.metricValue}>{farm.variety || 'Mangala'}</AppText>
                                        </View>
                                        <View style={styles.metricPill}>
                                            <AppText variant="caption" style={styles.metricLabel}>SOIL TYPE</AppText>
                                            <AppText variant="bodyMedium" style={styles.metricValue}>{farm.soil_type || 'Red Laterite'}</AppText>
                                        </View>
                                        <View style={styles.metricPill}>
                                            <AppText variant="caption" style={styles.metricLabel}>IRRIGATION</AppText>
                                            <AppText variant="bodyMedium" style={styles.metricValue}>{farm.irrigation_source || 'Drip'}</AppText>
                                        </View>
                                    </View>

                                    {/* Card Footer Actions */}
                                    <View style={styles.cardFooter}>
                                        {!isPrimary ? (
                                            <TouchableOpacity
                                                style={styles.setPrimaryBtn}
                                                onPress={() => handleSetPrimary(farm.id)}
                                            >
                                                <Feather name="star" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                                                <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
                                                    Set as Primary
                                                </AppText>
                                            </TouchableOpacity>
                                        ) : (
                                            <View />
                                        )}

                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            onPress={() => handleDeleteFarm(farm.id, farm.name)}
                                        >
                                            <Feather name="trash-2" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                                            <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '600' }}>
                                                Remove
                                            </AppText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}
            </ScrollView>

            {/* Add / Edit Plantation Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalBackdrop}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={styles.keyboardContainer}
                        >
                            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                                <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                                    {/* Drag Handle */}
                                    <View style={styles.indicatorContainer}>
                                        <View style={[styles.dragIndicator, { backgroundColor: colors.border }]} />
                                    </View>

                                    {/* Modal Header */}
                                    <View style={styles.modalHeader}>
                                        <AppText variant="heading3" style={{ color: colors.text }}>
                                            {editingFarmId ? 'Edit Plantation' : 'Add New Plantation'}
                                        </AppText>
                                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                                            <Feather name="x" size={22} color={colors.textLight} />
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                                        {/* Farm Name */}
                                        <View style={styles.inputGroup}>
                                            <AppText variant="caption" style={styles.inputLabel}>PLANTATION NAME</AppText>
                                            <TextInput
                                                style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                                                placeholder="e.g. Home Plantation or River Garden"
                                                placeholderTextColor={colors.textLight}
                                                value={farmName}
                                                onChangeText={setFarmName}
                                            />
                                        </View>

                                        {/* Taluk / Location */}
                                        <View style={styles.inputGroup}>
                                            <AppText variant="caption" style={styles.inputLabel}>TALUK / REGION</AppText>
                                            <TextInput
                                                style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                                                placeholder="e.g. Sullia, Puttur, Shivamogga"
                                                placeholderTextColor={colors.textLight}
                                                value={taluk}
                                                onChangeText={setTaluk}
                                            />
                                            {/* Quick Taluks */}
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                                                {POPULAR_TALUKS.map(item => (
                                                    <TouchableOpacity
                                                        key={item}
                                                        style={[
                                                            styles.chip,
                                                            taluk === item && { backgroundColor: colors.primary, borderColor: colors.primary }
                                                        ]}
                                                        onPress={() => setTaluk(item)}
                                                    >
                                                        <AppText
                                                            variant="caption"
                                                            style={{ color: taluk === item ? '#FFFFFF' : colors.textMedium }}
                                                        >
                                                            {item}
                                                        </AppText>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>

                                        {/* Numeric Inputs Row: Area, Palms, Age */}
                                        <View style={styles.multiInputRow}>
                                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                                <AppText variant="caption" style={styles.inputLabel}>AREA (ACRES)</AppText>
                                                <TextInput
                                                    style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                                                    placeholder="e.g. 2.5"
                                                    placeholderTextColor={colors.textLight}
                                                    value={areaAcres}
                                                    onChangeText={setAreaAcres}
                                                    keyboardType="numeric"
                                                />
                                            </View>

                                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                                <AppText variant="caption" style={styles.inputLabel}>PALM COUNT</AppText>
                                                <TextInput
                                                    style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                                                    placeholder="e.g. 1000"
                                                    placeholderTextColor={colors.textLight}
                                                    value={palmCount}
                                                    onChangeText={setPalmCount}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <AppText variant="caption" style={styles.inputLabel}>AVERAGE PALM AGE (YEARS)</AppText>
                                            <TextInput
                                                style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                                                placeholder="e.g. 7"
                                                placeholderTextColor={colors.textLight}
                                                value={palmAge}
                                                onChangeText={setPalmAge}
                                                keyboardType="numeric"
                                            />
                                        </View>

                                        {/* Variety Selector */}
                                        <View style={styles.inputGroup}>
                                            <AppText variant="caption" style={styles.inputLabel}>ARECANUT VARIETY</AppText>
                                            <View style={styles.chipsWrap}>
                                                {ARECA_VARIETIES.map(item => (
                                                    <TouchableOpacity
                                                        key={item}
                                                        style={[
                                                            styles.choiceChip,
                                                            variety === item && { backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5', borderColor: colors.primary }
                                                        ]}
                                                        onPress={() => setVariety(item)}
                                                    >
                                                        <AppText
                                                            variant="caption"
                                                            style={{
                                                                color: variety === item ? colors.primary : colors.text,
                                                                fontWeight: variety === item ? 'bold' : '500',
                                                            }}
                                                        >
                                                            {item}
                                                        </AppText>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Soil Type Selector */}
                                        <View style={styles.inputGroup}>
                                            <AppText variant="caption" style={styles.inputLabel}>SOIL TYPE</AppText>
                                            <View style={styles.chipsWrap}>
                                                {SOIL_TYPES.map(item => (
                                                    <TouchableOpacity
                                                        key={item}
                                                        style={[
                                                            styles.choiceChip,
                                                            soilType === item && { backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5', borderColor: colors.primary }
                                                        ]}
                                                        onPress={() => setSoilType(item)}
                                                    >
                                                        <AppText
                                                            variant="caption"
                                                            style={{
                                                                color: soilType === item ? colors.primary : colors.text,
                                                                fontWeight: soilType === item ? 'bold' : '500',
                                                            }}
                                                        >
                                                            {item}
                                                        </AppText>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Irrigation Source */}
                                        <View style={styles.inputGroup}>
                                            <AppText variant="caption" style={styles.inputLabel}>IRRIGATION SOURCE</AppText>
                                            <View style={styles.chipsWrap}>
                                                {IRRIGATION_TYPES.map(item => (
                                                    <TouchableOpacity
                                                        key={item}
                                                        style={[
                                                            styles.choiceChip,
                                                            irrigation === item && { backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5', borderColor: colors.primary }
                                                        ]}
                                                        onPress={() => setIrrigation(item)}
                                                    >
                                                        <AppText
                                                            variant="caption"
                                                            style={{
                                                                color: irrigation === item ? colors.primary : colors.text,
                                                                fontWeight: irrigation === item ? 'bold' : '500',
                                                            }}
                                                        >
                                                            {item}
                                                        </AppText>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Save Button */}
                                        <TouchableOpacity
                                            style={[styles.saveModalBtn, { backgroundColor: colors.primary }]}
                                            onPress={handleSaveFarm}
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <>
                                                    <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                                                    <AppText variant="bodyLarge" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                                        {editingFarmId ? 'Save Changes' : 'Register Plantation'}
                                                    </AppText>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </ScrollView>
                                </View>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        padding: 4,
    },
    addHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },
    scroll: {
        padding: 16,
        paddingBottom: 40,
    },
    summaryBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    summaryIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        height: 32,
        backgroundColor: colors.border,
    },
    sectionHeader: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    farmCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        paddingBottom: 12,
        marginBottom: 12,
    },
    farmTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    primaryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDarkMode ? '#064E3B40' : '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardEditBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
    },
    metricPill: {
        width: '31%',
        backgroundColor: isDarkMode ? '#18181B' : '#F8FAFC',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    metricLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textLight,
        marginBottom: 2,
    },
    metricValue: {
        fontWeight: '600',
        fontSize: 13,
        color: colors.text,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
    setPrimaryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    keyboardContainer: {
        width: '100%',
        maxHeight: '90%',
    },
    modalSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 24,
        maxHeight: '100%',
    },
    indicatorContainer: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    dragIndicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
        marginBottom: 16,
    },
    modalScroll: {
        paddingBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    multiInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputLabel: {
        fontWeight: '700',
        color: colors.textMedium,
        marginBottom: 6,
        fontSize: 11,
        letterSpacing: 0.5,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
    },
    chipRow: {
        flexDirection: 'row',
        marginTop: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8,
        backgroundColor: isDarkMode ? '#1E1E1E' : '#F9FAFB',
    },
    chipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    choiceChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: isDarkMode ? '#1E1E1E' : '#F9FAFB',
    },
    saveModalBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 12,
        marginBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    emptyIconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    emptyCtaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 14,
        marginTop: 22,
        width: '100%',
        elevation: 3,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    featuresCard: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 18,
        marginTop: 26,
        borderWidth: 1,
        borderColor: colors.border,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
});
