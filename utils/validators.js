// utils/validators.js

export function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());
}

export function isEmpty(value) {
    return value === null || value === undefined || String(value).trim() === "";
}

export function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

export function minLength(value, length) {
    return String(value).trim().length >= length;
}

export function validatePassword(password) {
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password)
    );
}

export function validateFile(file, allowedTypes = [], maxSizeMB = 5) {
    if (!file) return false;

    const sizeOK = file.size <= maxSizeMB * 1024 * 1024;
    const typeOK = allowedTypes.length === 0 || allowedTypes.includes(file.type);

    return sizeOK && typeOK;
}

export function validateAmount(amount) {
    return isNumber(amount) && Number(amount) > 0;
}
