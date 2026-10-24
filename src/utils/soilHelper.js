// Soil Helper Constants and Utilities for Farmer-Friendly Localization

export const SOIL_OPTIONS = [
    {
        key: 'Red Laterite',
        labelKey: 'soil_red_laterite',
        descKey: 'soil_red_laterite_desc',
        color: '#DC2626',
        lightBg: '#FEF2F2',
        darkBg: '#450A0A',
        icon: 'layers',
    },
    {
        key: 'Loamy',
        labelKey: 'soil_loamy',
        descKey: 'soil_loamy_desc',
        color: '#D97706',
        lightBg: '#FFFBEB',
        darkBg: '#451A03',
        icon: 'sun',
    },
    {
        key: 'Sandy Loam',
        labelKey: 'soil_sandy_loam',
        descKey: 'soil_sandy_loam_desc',
        color: '#CA8A04',
        lightBg: '#FEFCE8',
        darkBg: '#422006',
        icon: 'droplet',
    },
    {
        key: 'Clay',
        labelKey: 'soil_clay',
        descKey: 'soil_clay_desc',
        color: '#64748B',
        lightBg: '#F8FAFC',
        darkBg: '#0F172A',
        icon: 'shield',
    },
];

export const getSoilColor = (key) => {
    if (!key) return '#16A34A';
    const lower = key.toLowerCase();
    const found = SOIL_OPTIONS.find(s => s.key.toLowerCase() === lower || lower.includes(s.key.toLowerCase()));
    return found ? found.color : '#16A34A';
};

export const getSoilLocalizedLabel = (key, t) => {
    if (!key) return '—';
    if (!t) return key;
    const lower = key.toLowerCase();
    const found = SOIL_OPTIONS.find(s => s.key.toLowerCase() === lower || lower.includes(s.key.toLowerCase()));
    if (found) {
        return t(found.labelKey) || found.key;
    }
    return key;
};
