const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16 bytes

// Derive 32-byte key from ENCRYPTION_SECRET
const getSecretKey = () => {
    const secret = process.env.ENCRYPTION_SECRET || 'hrshield_default_encryption_secret_key_32_bytes_long!!';
    return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypt a text string
 * Returns formatted string: "iv:encryptedHex"
 */
function encrypt(text) {
    if (text === null || text === undefined || text === '') {
        return text;
    }
    
    // If text is already an object or number, convert to string
    const stringValue = typeof text === 'object' ? JSON.stringify(text) : String(text);
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
    
    let encrypted = cipher.update(stringValue, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an encrypted text string ("iv:encryptedHex")
 */
function decrypt(encryptedText) {
    if (!encryptedText || typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
        return encryptedText; // Return original if not formatted as iv:encrypted
    }

    try {
        const textParts = encryptedText.split(':');
        if (textParts.length !== 2) return encryptedText;

        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedData = textParts[1];

        // Ensure IV is 16 bytes
        if (iv.length !== IV_LENGTH) return encryptedText;

        const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // Check if stringified JSON
        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted;
        }
    } catch (error) {
        console.error('Decryption failed:', error.message);
        return '[Encrypted Data - Decryption Failed]';
    }
}

/**
 * Helper to check if string appears to be encrypted by HRShield
 */
function isEncrypted(value) {
    if (typeof value !== 'string') return false;
    const parts = value.split(':');
    return parts.length === 2 && parts[0].length === 32 && /^[0-9a-fA-F]+$/.test(parts[0]) && /^[0-9a-fA-F]+$/.test(parts[1]);
}

module.exports = {
    encrypt,
    decrypt,
    isEncrypted
};
