/**
 * Production-Grade Geo-Intelligence & Normalization Utility
 * Cleans administrative division noise (e.g., "Mysore Division", "Belgaum Division")
 * and extracts authentic agricultural town/taluk/district hierarchies.
 */

const BLACKLISTED_TERMS = ['division', 'vibhaga', 'circle', 'range', 'zone', 'commissionerate'];

// Detects foreign diacritics, unreadable tokens, or non-local Vietnamese/East Asian geocode artifacts (e.g. "Phúc Thịnh")
const UNREADABLE_FOREIGN_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

/**
 * Checks if a string contains unreadable, foreign, or corrupted tokens.
 * @param {string} str 
 * @returns {boolean}
 */
export const isUnreadableOrForeign = (str) => {
    if (!str || typeof str !== 'string') return true;
    const trimmed = str.trim();
    if (trimmed.length < 2) return true;
    if (UNREADABLE_FOREIGN_REGEX.test(trimmed)) return true;
    // Filter out plus-codes (e.g., "8J6V+2X") or purely numeric/symbolic tokens
    if (/^[0-9+\s\-#]+$/.test(trimmed)) return true;
    return false;
};

/**
 * Checks if a string contains administrative division noise.
 * @param {string} str 
 * @returns {boolean}
 */
export const isAdministrativeNoise = (str) => {
    if (!str || typeof str !== 'string') return true;
    if (isUnreadableOrForeign(str)) return true;
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

    // Regional fallback check for coastal/Malnad Karnataka areca belt
    const isDakshinaKannada = (lat != null && lat >= 12.2 && lat <= 13.2 && lon != null && lon >= 74.7 && lon <= 75.8);
    const regionalDefault = isDakshinaKannada ? 'Sullia' : 'Local Farm';

    if (!addresses || addresses.length === 0) {
        return {
            placeName: regionalDefault,
            district: isDakshinaKannada ? 'Dakshina Kannada' : '',
            localityStr: isDakshinaKannada ? 'Sullia, Dakshina Kannada' : coordString,
            coordinates: coordString,
        };
    }

    const addr = addresses[0];

    // If country code is explicitly non-Indian (e.g. "VN"), discard foreign anomaly
    if (addr.isoCountryCode && addr.isoCountryCode.toUpperCase() !== 'IN') {
        return {
            placeName: regionalDefault,
            district: isDakshinaKannada ? 'Dakshina Kannada' : '',
            localityStr: isDakshinaKannada ? 'Sullia, Dakshina Kannada' : coordString,
            coordinates: coordString,
        };
    }

    // 1. Identify genuine local settlement, preferring City -> Subregion -> District -> Name
    const candidates = [
        addr.city,
        addr.subregion,
        addr.district,
        addr.name
    ];

    // Find the first valid settlement name that is neither noise nor foreign/unreadable
    let settlement = candidates.find(c => c && !isAdministrativeNoise(c) && !isUnreadableOrForeign(c));

    // 2. Identify authentic District (e.g., Dakshina Kannada, Shivamogga, Udupi)
    let district = '';
    if (addr.district && !isAdministrativeNoise(addr.district) && !isUnreadableOrForeign(addr.district)) {
        district = addr.district;
    } else if (addr.subregion && !isAdministrativeNoise(addr.subregion) && !isUnreadableOrForeign(addr.subregion)) {
        district = addr.subregion;
    }

    // 3. Fallback resolution if settlement was noisy or unreadable
    if (!settlement) {
        settlement = (!isUnreadableOrForeign(addr.city) && addr.city) ||
                     (!isUnreadableOrForeign(district) && district) ||
                     regionalDefault;
    }

    // 4. Build clean locality string (e.g. "Sullia, Dakshina Kannada")
    const parts = [];
    if (settlement && !isUnreadableOrForeign(settlement)) parts.push(settlement);
    if (district && district !== settlement && !isUnreadableOrForeign(district)) parts.push(district);
    if (addr.region && !parts.includes(addr.region) && !isUnreadableOrForeign(addr.region)) parts.push(addr.region);

    const localityStr = parts.join(', ');

    return {
        placeName: settlement,
        district: district,
        localityStr: localityStr || settlement,
        coordinates: coordString,
    };
};

