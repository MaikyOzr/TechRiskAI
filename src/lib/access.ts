import { secureStorage } from './storage';

export interface AccessStatus {
    hasAccess: boolean;
    isTrial: boolean;
    trialRemainingHours: number;
    reason?: string;
}

const TRIAL_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export async function checkAccess(): Promise<AccessStatus> {
    if (typeof window === 'undefined') {
        return { hasAccess: false, isTrial: false, trialRemainingHours: 0 };
    }

    // Check for permanent access (paid)
    const isPaid = await secureStorage.getItem<boolean>('techrisk_paid') === true;
    if (isPaid) {
        return { hasAccess: true, isTrial: false, trialRemainingHours: 0 };
    }

    // Check for trial access
    const trialStartedAt = await secureStorage.getItem<string>('techrisk_trial_start');
    if (trialStartedAt) {
        const startTime = parseInt(trialStartedAt, 10);
        const now = Date.now();
        const elapsed = now - startTime;

        if (elapsed < TRIAL_DURATION_MS) {
            const remainingMs = TRIAL_DURATION_MS - elapsed;
            return {
                hasAccess: true,
                isTrial: true,
                trialRemainingHours: Math.max(0, Math.floor(remainingMs / (60 * 60 * 1000))),
            };
        } else {
            return {
                hasAccess: false,
                isTrial: false,
                trialRemainingHours: 0,
                reason: 'Trial expired',
            };
        }
    }

    return { hasAccess: false, isTrial: false, trialRemainingHours: 0 };
}

export async function activateTrial(code: string): Promise<{ success: boolean; message: string }> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const result = await (window as any).electronAPI.validatePromoCode(code);
        if (result.success) {
            await secureStorage.setItem('techrisk_trial_start', Date.now().toString());
            return { success: true, message: 'Trial activated for 12 hours!' };
        }
        return { success: false, message: result.message || 'Invalid promo code.' };
    }
    return { success: false, message: 'Electron API connection lost.' };
}

export async function markAsPaid() {
    await secureStorage.setItem('techrisk_paid', true);
}
