// Centralized Validation Regex Bundle

export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !!email && emailRegex.test(email);
};

export const isValidPhone = (phone) => {
    // Requires exactly 10 digits without exceptions.
    const phoneRegex = /^[0-9]{10}$/;
    return !!phone && phoneRegex.test(phone);
};

export const isValidPassword = (password) => {
    return !!password && password.length >= 8;
};

export const isValidName = (name) => {
    return !!name && name.trim().length >= 2;
};
