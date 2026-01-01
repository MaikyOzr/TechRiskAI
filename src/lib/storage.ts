/**
 * Advanced secure storage utility for TechRiskAI using Web Crypto API.
 * Provides AES-GCM encryption for local storage data.
 */

const SECRET_KEY = 'techrisk_secret_key'; // In a real app, this might be derived from hardware/machine ID
const ALGORITHM = 'AES-GCM';

async function getKey() {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET_KEY);
    // Use SHA-256 to derive a stable 256-bit key from the secret string
    const hash = await window.crypto.subtle.digest('SHA-256', keyData);
    return window.crypto.subtle.importKey(
        'raw',
        hash,
        { name: ALGORITHM },
        false,
        ['encrypt', 'decrypt']
    );
}

async function encrypt(text: string): Promise<string> {
    if (typeof window === 'undefined') return '';
    try {
        const key = await getKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const data = encoder.encode(text);

        const encrypted = await window.crypto.subtle.encrypt(
            { name: ALGORITHM, iv },
            key,
            data
        );

        const encryptedArray = new Uint8Array(encrypted);
        const combined = new Uint8Array(iv.length + encryptedArray.length);
        combined.set(iv);
        combined.set(encryptedArray, iv.length);

        // Convert byte array to base64 string
        let binary = '';
        for (let i = 0; i < combined.length; i++) {
            binary += String.fromCharCode(combined[i]);
        }
        return btoa(binary);
    } catch (error) {
        console.error('Encryption failed:', error);
        return '';
    }
}

async function decrypt(encoded: string): Promise<string> {
    if (typeof window === 'undefined') return '';
    try {
        const binaryString = atob(encoded);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const iv = bytes.slice(0, 12);
        const data = bytes.slice(12);
        const key = await getKey();

        const decrypted = await window.crypto.subtle.decrypt(
            { name: ALGORITHM, iv },
            key,
            data
        );

        return new TextDecoder().decode(decrypted);
    } catch (error) {
        // If decryption fails, it might be the old XOR format or invalid data
        console.warn('Decryption failed, data might be in old format or corrupted.');
        return '';
    }
}

export const secureStorage = {
    setItem: async (key: string, value: any) => {
        if (typeof window === 'undefined') return;
        const stringValue = JSON.stringify(value);
        const encrypted = await encrypt(stringValue);
        localStorage.setItem(key, encrypted);
    },

    getItem: async <T>(key: string): Promise<T | null> => {
        if (typeof window === 'undefined') return null;
        const encoded = localStorage.getItem(key);
        if (!encoded) return null;

        const decoded = await decrypt(encoded);
        if (!decoded) return null;

        try {
            return JSON.parse(decoded) as T;
        } catch (e) {
            return null;
        }
    },

    removeItem: (key: string) => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    }
};
