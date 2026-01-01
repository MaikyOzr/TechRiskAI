/**
 * Input sanitization utility for TechRiskAI.
 * Detects and masks sensitive patterns (API keys, secrets) and prompt injection attempts.
 */

const SENSITIVE_PATTERNS = [
    // Google AI / Gemini Keys
    /AIzaSy[A-Za-z0-9_-]{33}/g,
    // AWS Keys
    /AKIA[0-9A-Z]{16}/g,
    // Stripe Secret Keys
    /sk_(live|test)_[0-9a-zA-Z]{24}/g,
    // Generic Secrets
    /(password|secret|key|token|auth|pwd|pass)["']?\s*[:=]\s*["']?([A-Za-z0-9/+=_.-]{8,})["']?/gi,
    // Private Keys
    /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g
];

const INJECTION_PATTERNS = [
    /ignore (all )?previous instructions/gi,
    /system override/gi,
    /you are now a/gi,
    /regardless of any previous/gi,
    /forget everything/gi,
    /stop what you are doing/gi
];

export interface SanitizationResult {
    sanitized: string;
    maskedCount: number;
    injectionDetected: boolean;
}

export function sanitizeInput(text: string): SanitizationResult {
    let sanitized = text;
    let maskedCount = 0;
    let injectionDetected = false;

    // Check for prompt injection
    INJECTION_PATTERNS.forEach(pattern => {
        if (pattern.test(sanitized)) {
            injectionDetected = true;
            // We'll mask injection attempts to neutralize them
            sanitized = sanitized.replace(pattern, '[REDACTED_SYSTEM_OVERRIDE_ATTEMPT]');
        }
    });

    // Mask sensitive data
    SENSITIVE_PATTERNS.forEach(pattern => {
        const matches = sanitized.match(pattern);
        if (matches) {
            maskedCount += matches.length;
            sanitized = sanitized.replace(pattern, '[MASKED_SENSITIVE_DATA]');
        }
    });

    return { sanitized, maskedCount, injectionDetected };
}

export function hasSensitiveData(text: string): boolean {
    return SENSITIVE_PATTERNS.some(pattern => pattern.test(text));
}
