import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../Services/api';
import { useAuth } from './AuthContext';
import {
    DEFAULT_USER_PREFERENCES,
    applyAccessibilityPreferences,
    applyLanguagePreference,
    clearAppliedPreferences,
    normalizeUserPreferences,
    readStoredPreferences,
    writeStoredPreferences,
} from '../utils/preferences';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
    const { token, user } = useAuth();
    const [preferences, setPreferencesState] = useState(DEFAULT_USER_PREFERENCES);
    const [loading, setLoading] = useState(true);

    const applyPreferences = (nextPreferences, shouldPersist = true) => {
        const normalized = normalizeUserPreferences(nextPreferences);

        setPreferencesState(normalized);
        applyAccessibilityPreferences(normalized.accessibility);
        applyLanguagePreference(normalized.language);

        if (shouldPersist && user?.email) {
            writeStoredPreferences(user.email, normalized);
        }

        return normalized;
    };

    const setPreferences = (nextPreferences, shouldPersist = true) => {
        setPreferencesState((currentPreferences) => {
            const resolvedPreferences = typeof nextPreferences === 'function'
                ? nextPreferences(currentPreferences)
                : nextPreferences;
            const normalized = normalizeUserPreferences(resolvedPreferences);

            applyAccessibilityPreferences(normalized.accessibility);
            applyLanguagePreference(normalized.language);

            if (shouldPersist && user?.email) {
                writeStoredPreferences(user.email, normalized);
            }

            return normalized;
        });
    };

    const refreshPreferences = async () => {
        if (!token || !user?.email || user.role !== 'USER') {
            return preferences;
        }

        const response = await api.get('/user/preferences');
        return applyPreferences(response.data);
    };

    useEffect(() => {
        let cancelled = false;

        const bootstrapPreferences = async () => {
            if (!token || !user?.email) {
                clearAppliedPreferences();
                setPreferencesState(DEFAULT_USER_PREFERENCES);
                setLoading(false);
                return;
            }

            const storedPreferences = readStoredPreferences(user.email);

            if (storedPreferences) {
                applyPreferences(storedPreferences, false);
            } else {
                applyPreferences(DEFAULT_USER_PREFERENCES, false);
            }

            if (user.role !== 'USER') {
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const response = await api.get('/user/preferences');

                if (!cancelled) {
                    applyPreferences(response.data);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to load user preferences', error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        bootstrapPreferences();

        return () => {
            cancelled = true;
        };
    }, [token, user?.email, user?.role]);

    const value = useMemo(() => ({
        preferences,
        loading,
        refreshPreferences,
        setPreferences,
    }), [loading, preferences]);

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);

    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }

    return context;
}
