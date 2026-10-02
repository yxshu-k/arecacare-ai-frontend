// Helper utilities to enforce masking on string inputs safely.

/**
 * Strips all non-numeric characters and slices to max length of 10.
 * Automatically masks an input field stream physically on-typing.
 * @param {string} text - Raw input stream
 * @returns {string} - Masked numerical string
 */
export const formatPhone = (text) => {
    if (!text) return '';
    // Strip everything except numbers, then restrict to 10 max natively.
    return text.replace(/\D/g, '').substring(0, 10);
};

/**
 * Strips any spaces. Email addresses should strictly lack whitespace boundaries natively.
 * @param {string} text - Raw input stream
 * @returns {string} - Stripped string
 */
export const formatEmail = (text) => {
    if (!text) return '';
    return text.replace(/\s/g, '').toLowerCase();
};

/**
 * Only permits numerical inputs.
 * @param {string} text - Raw input stream
 * @returns {string}
 */
export const formatNumber = (text) => {
    if (!text) return '';
    return text.replace(/[^0-9.]/g, ''); // Allow decimal for yield inputs
};
