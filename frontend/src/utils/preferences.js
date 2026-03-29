export const DEFAULT_NOTIFICATION_PREFERENCES = {
    email: true,
    push: true,
    ticketUpdates: true,
    systemAlerts: false,
};

export const DEFAULT_PRIVACY_PREFERENCES = {
    profileVisibility: 'private',
    dataSharing: false,
    analytics: true,
};

export const DEFAULT_ACCESSIBILITY_PREFERENCES = {
    highContrast: false,
    reducedMotion: false,
    largeText: false,
};

export const DEFAULT_USER_PREFERENCES = {
    language: 'en',
    notifications: DEFAULT_NOTIFICATION_PREFERENCES,
    privacy: DEFAULT_PRIVACY_PREFERENCES,
    accessibility: DEFAULT_ACCESSIBILITY_PREFERENCES,
};

const STORAGE_PREFIX = 'service-tracker-preferences';

export function normalizeUserPreferences(rawPreferences = {}) {
    return {
        language: rawPreferences.language || DEFAULT_USER_PREFERENCES.language,
        notifications: {
            email: rawPreferences.notifications?.email ?? rawPreferences.emailNotifications ?? DEFAULT_NOTIFICATION_PREFERENCES.email,
            push: rawPreferences.notifications?.push ?? rawPreferences.pushNotifications ?? DEFAULT_NOTIFICATION_PREFERENCES.push,
            ticketUpdates: rawPreferences.notifications?.ticketUpdates ?? rawPreferences.ticketUpdates ?? DEFAULT_NOTIFICATION_PREFERENCES.ticketUpdates,
            systemAlerts: rawPreferences.notifications?.systemAlerts ?? rawPreferences.systemAlerts ?? DEFAULT_NOTIFICATION_PREFERENCES.systemAlerts,
        },
        privacy: {
            profileVisibility: rawPreferences.privacy?.profileVisibility ?? rawPreferences.profileVisibility ?? DEFAULT_PRIVACY_PREFERENCES.profileVisibility,
            dataSharing: rawPreferences.privacy?.dataSharing ?? rawPreferences.dataSharing ?? DEFAULT_PRIVACY_PREFERENCES.dataSharing,
            analytics: rawPreferences.privacy?.analytics ?? rawPreferences.analytics ?? DEFAULT_PRIVACY_PREFERENCES.analytics,
        },
        accessibility: {
            highContrast: rawPreferences.accessibility?.highContrast ?? rawPreferences.highContrast ?? DEFAULT_ACCESSIBILITY_PREFERENCES.highContrast,
            reducedMotion: rawPreferences.accessibility?.reducedMotion ?? rawPreferences.reducedMotion ?? DEFAULT_ACCESSIBILITY_PREFERENCES.reducedMotion,
            largeText: rawPreferences.accessibility?.largeText ?? rawPreferences.largeText ?? DEFAULT_ACCESSIBILITY_PREFERENCES.largeText,
        },
    };
}

export function getPreferenceStorageKey(email) {
    return `${STORAGE_PREFIX}:${email ?? 'guest'}`;
}

export function readStoredPreferences(email) {
    if (!email) {
        return null;
    }

    try {
        const rawValue = localStorage.getItem(getPreferenceStorageKey(email));
        return rawValue ? normalizeUserPreferences(JSON.parse(rawValue)) : null;
    } catch (error) {
        console.error('Failed to read stored preferences', error);
        return null;
    }
}

export function writeStoredPreferences(email, preferences) {
    if (!email) {
        return;
    }

    localStorage.setItem(
        getPreferenceStorageKey(email),
        JSON.stringify(normalizeUserPreferences(preferences))
    );
}

export function clearStoredPreferences(email) {
    if (!email) {
        return;
    }

    localStorage.removeItem(getPreferenceStorageKey(email));
}

export function applyAccessibilityPreferences(accessibility = DEFAULT_ACCESSIBILITY_PREFERENCES) {
    const root = document.documentElement;

    root.classList.toggle('high-contrast', Boolean(accessibility.highContrast));
    root.classList.toggle('reduced-motion', Boolean(accessibility.reducedMotion));
    root.classList.toggle('large-text', Boolean(accessibility.largeText));
}

export function clearAppliedPreferences() {
    const root = document.documentElement;

    root.classList.remove('high-contrast', 'reduced-motion', 'large-text');
    root.lang = DEFAULT_USER_PREFERENCES.language;
}

export function applyLanguagePreference(language = DEFAULT_USER_PREFERENCES.language) {
    document.documentElement.lang = language;
}

export function getLocaleForLanguage(language = DEFAULT_USER_PREFERENCES.language) {
    switch (language) {
        case 'es':
            return 'es-ES';
        case 'fr':
            return 'fr-FR';
        case 'de':
            return 'de-DE';
        case 'zh':
            return 'zh-CN';
        case 'en':
        default:
            return 'en-US';
    }
}
