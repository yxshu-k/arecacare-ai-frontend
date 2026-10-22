/**
 * Production-Grade Geo-Intelligence & Normalization Utility
 * Cleans administrative division noise (e.g., "Mysore Division", "Belgaum Division")
 * and extracts authentic agricultural town/taluk/district hierarchies.
 */

const BLACKLISTED_TERMS = ['division', 'vibhaga', 'circle', 'range', 'zone', 'commissionerate'];

/**
 * Checks if a string contains administrative division noise.
 * @param {string} str 
 * @returns {boolean}
 */
export const isAdministrativeNoise = (str) => {
    if (!str || typeof str !== 'string') return true;
    const lower = str.toLowerCase().trim();
    return BLACKLISTED_TERMS.some(term => lower.includes(term));
};

/**
 * Cleans and capitalizes place names.
 * @param {string} str 
 * @returns {string}
 */
export const cleanPlaceString = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.trim();
};

/**
 * Normalizes reverse geocode output from Expo Location.
 * @param {Array} addresses - Result from Location.reverseGeocodeAsync
 * @param {Object} coords - { latitude, longitude }
 * @returns {Object} { placeName, district, localityStr, coordinates }
 */
export const normalizeAddress = (addresses, coords = {}) => {
    const lat = coords.latitude != null ? coords.latitude : null;
    const lon = coords.longitude != null ? coords.longitude : null;
    const coordString = (lat != null && lon != null) ? `${lat},${lon}` : '13.9299,75.5681';

    if (!addresses || addresses.length === 0) {
        return {
            placeName: 'My Farm',
            district: '',
            localityStr: coordString,
            coordinates: coordString,
        };
    }

    const addr = addresses[0];

    // 1. Identify genuine local settlement (City, Town, Subregion, or Village Name)
    const candidates = [
        addr.city,
        addr.subregion,
        addr.district,
        addr.name
    ];

    // Find the first valid settlement name that is NOT an administrative division
    let settlement = candidates.find(c => c && !isAdministrativeNoise(c));

    // 2. Identify authentic District (e.g., Dakshina Kannada, Shivamogga, Udupi)
    let district = '';
    if (addr.district && !isAdministrativeNoise(addr.district)) {
        district = addr.district;
    } else if (addr.subregion && !isAdministrativeNoise(addr.subregion)) {
        district = addr.subregion;
    }

    // 3. Fallback resolution if settlement was noisy
    if (!settlement) {
        settlement = addr.city || addr.name || district || 'Local Farm';
    }

    // 4. Build clean locality string (e.g. "Sullia, Dakshina Kannada")
    const parts = [];
    if (settlement) parts.push(settlement);
    if (district && district !== settlement) parts.push(district);
    if (addr.region && !parts.includes(addr.region)) parts.push(addr.region);

    const localityStr = parts.join(', ');

    return {
        placeName: settlement,
        district: district,
        localityStr: localityStr || settlement,
        coordinates: coordString,
    };
};
