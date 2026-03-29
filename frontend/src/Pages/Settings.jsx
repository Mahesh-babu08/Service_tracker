import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Save,
    Key,
    Moon,
    Sun,
    User,
    Bell,
    Shield,
    Globe,
    Database,
    Trash2,
    Eye,
    EyeOff,
    Download,
    RefreshCw,
    AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../Components/ui/Card';
import { Input } from '../Components/ui/Input';
import { Button } from '../Components/ui/Button';
import api from '../Services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { useNotifications } from '../context/NotificationContext';
import { useNotification } from '../hooks/useNotification';
import { applyLanguagePreference } from '../utils/preferences';

const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Espanol' },
    { value: 'fr', label: 'Francais' },
    { value: 'de', label: 'Deutsch' },
    { value: 'zh', label: 'Zhongwen' },
];

export default function Settings() {
    const { user, logout, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { preferences, loading: preferencesLoading, setPreferences } = usePreferences();
    const { clearNotifications } = useNotifications();
    const { showNotification } = useNotification();

    const isDark = theme === 'dark';
    const supportsServerSettings = user?.role === 'USER';

    const [name, setName] = useState(user?.name || '');
    const [notifications, setNotifications] = useState(preferences.notifications);
    const [privacy, setPrivacy] = useState(preferences.privacy);
    const [language, setLanguage] = useState(preferences.language);
    const [accessibility, setAccessibility] = useState(preferences.accessibility);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [busySection, setBusySection] = useState('');

    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user?.name]);

    useEffect(() => {
        setNotifications(preferences.notifications);
        setPrivacy(preferences.privacy);
        setLanguage(preferences.language);
        setAccessibility(preferences.accessibility);
    }, [preferences]);

    const persistPreferences = (overrides = {}) => {
        setPreferences((currentPreferences) => ({
            ...currentPreferences,
            language: overrides.language ?? currentPreferences.language,
            notifications: overrides.notifications ?? currentPreferences.notifications,
            privacy: overrides.privacy ?? currentPreferences.privacy,
            accessibility: overrides.accessibility ?? currentPreferences.accessibility,
        }));
    };

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    const handleLanguageChange = async (event) => {
        const nextLanguage = event.target.value;
        const previousLanguage = language;

        setLanguage(nextLanguage);
        applyLanguagePreference(nextLanguage);

        if (!supportsServerSettings) {
            persistPreferences({ language: nextLanguage });
            return;
        }

        setBusySection('language');

        try {
            await api.put('/user/preferences/language', { language: nextLanguage });
            persistPreferences({ language: nextLanguage });
            showNotification('Language preference updated.', 'success', 'Language Saved');
        } catch (error) {
            setLanguage(previousLanguage);
            applyLanguagePreference(previousLanguage);
            showNotification(error.response?.data?.error || 'Failed to update language.', 'error');
        } finally {
            setBusySection('');
        }
    };

    const saveProfile = async () => {
        if (!name.trim()) {
            showNotification('Please enter your full name.', 'error');
            return;
        }

        setBusySection('profile');

        try {
            const response = await api.put('/user/profile', { name: name.trim() });
            updateUser({ name: response.data?.name || name.trim() });
            showNotification('Profile updated successfully.', 'success');
        } catch (error) {
            showNotification(error.response?.data?.error || 'Failed to update profile.', 'error');
        } finally {
            setBusySection('');
        }
    };

    const saveNotifications = async () => {
        setBusySection('notifications');

        try {
            await api.put('/user/preferences/notifications', notifications);
            persistPreferences({ notifications });
            showNotification('Notification preferences updated.', 'success', 'Notifications Saved');
        } catch (error) {
            showNotification(error.response?.data?.error || 'Failed to update notifications.', 'error');
        } finally {
            setBusySection('');
        }
    };

    const savePrivacy = async () => {
        setBusySection('privacy');

        try {
            await api.put('/user/preferences/privacy', privacy);
            persistPreferences({ privacy });
            showNotification('Privacy settings updated.', 'success', 'Privacy Saved');
        } catch (error) {
            showNotification(error.response?.data?.error || 'Failed to update privacy settings.', 'error');
        } finally {
            setBusySection('');
        }
    };

    const saveAccessibility = async () => {
        setBusySection('accessibility');

        try {
            await api.put('/user/preferences/accessibility', accessibility);
            persistPreferences({ accessibility });
            showNotification('Accessibility settings updated.', 'success', 'Accessibility Saved');
        } catch (error) {
            showNotification(error.response?.data?.error || 'Failed to update accessibility settings.', 'error');
        } finally {
            setBusySection('');
        }
    };

    const changePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Please fill in all password fields.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match.', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showNotification('Password must be at least 8 characters long.', 'error');
            return;
        }

        setBusySection('password');

        try {
            await api.put('/user/password', {
                currentPassword,
                newPassword,
                confirmPassword,
            });

            showNotification('Password changed successfully.', 'success', 'Password Updated');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            showNotification(error.response?.data?.error || 'Failed to change password.', 'error');
        } finally {
            setBusySection('');
        }
    };

    const exportData = async () => {
        setBusySection('export');

        try {
            const response = await api.get('/user/export', { responseType: 'blob' });
            const blob = response.data instanceof Blob
                ? response.data
                : new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = downloadUrl;
            link.download = `${(user?.email || 'user').split('@')[0]}-service-tracker-data.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            showNotification('Your account data export is ready.', 'success', 'Export Complete');
        } catch (error) {
            showNotification(error.response?.data?.error || 'Failed to export your data.', 'error');
        } finally {
            setBusySection('');
        }
    };

    const clearCache = async () => {
        setBusySection('cache');

        try {
            sessionStorage.clear();
            clearNotifications();

            if ('caches' in window) {
                const cacheKeys = await caches.keys();
                await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
            }

            showNotification('Local cache and notification history cleared.', 'success', 'Cache Cleared');
        } catch (error) {
            console.error('Failed to clear cache', error);
            showNotification('Failed to clear local cache.', 'error');
        } finally {
            setBusySection('');
        }
    };

    const deleteAccount = async () => {
        const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');

        if (!confirmed) {
            return;
        }

        setBusySection('delete');

        try {
            await api.delete('/user/account');
            showNotification('Your account has been deleted.', 'success', 'Account Removed');
            logout();
        } catch (error) {
            showNotification(error.response?.data?.error || 'Failed to delete account.', 'error');
        } finally {
            setBusySection('');
        }
    };

    if (preferencesLoading && supportsServerSettings) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center text-foreground/60">
                Loading your settings...
            </div>
        );
    }

    if (!supportsServerSettings) {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-foreground/60 mt-1">Account settings are currently available for standard user accounts only.</p>
                </div>

                <Card className="border-border/50 shadow-soft">
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle size={20} />
                            Limited Availability
                        </CardTitle>
                        <CardDescription>
                            Admin accounts can still use the quick theme toggle in the header, but the full settings API is only modeled for end-user accounts in this project.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-foreground/60 mt-1">Manage your account, preferences, and system settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <Card className="border-border/50 shadow-soft">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>Update your personal information and account details.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <Input
                                label="Full Name"
                                icon={User}
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                            <Input
                                label="Email Address"
                                icon={Key}
                                value={user?.email || 'N/A'}
                                disabled={true}
                                className="bg-muted/50 cursor-not-allowed opacity-70"
                            />
                            <div className="text-sm text-foreground/60">
                                <span className="font-medium">Role:</span> {user?.role || 'USER'}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                            <Button onClick={saveProfile} disabled={busySection !== ''}>
                                <Save size={16} className="mr-2" />
                                {busySection === 'profile' ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <Card className="border-border/50 shadow-soft">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize your visual experience and language preference.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div className="flex items-center gap-3">
                                    {isDark ? <Moon className="text-primary" /> : <Sun className="text-warning" />}
                                    <div>
                                        <h4 className="font-medium text-sm">Dark Mode</h4>
                                        <p className="text-xs text-foreground/60">Toggle between light and dark themes</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${isDark ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDark ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Language</h4>
                                <select
                                    value={language}
                                    onChange={handleLanguageChange}
                                    className="w-full p-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    disabled={busySection !== '' && busySection !== 'language'}
                                >
                                    {LANGUAGE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-foreground/60">
                                    {busySection === 'language' ? 'Saving language preference...' : 'Language saves automatically when you change it.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                <Card className="border-border/50 shadow-soft">
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Bell size={20} />
                            Notification Preferences
                        </CardTitle>
                        <CardDescription>Control how and when you receive notifications about your account and tickets.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div>
                                    <h4 className="font-medium text-sm">Email Notifications</h4>
                                    <p className="text-xs text-foreground/60">Receive updates via email</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotifications((current) => ({ ...current, email: !current.email }))}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${notifications.email ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.email ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div>
                                    <h4 className="font-medium text-sm">Push Notifications</h4>
                                    <p className="text-xs text-foreground/60">Browser push notifications</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotifications((current) => ({ ...current, push: !current.push }))}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${notifications.push ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.push ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div>
                                    <h4 className="font-medium text-sm">Ticket Updates</h4>
                                    <p className="text-xs text-foreground/60">Status and priority changes</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotifications((current) => ({ ...current, ticketUpdates: !current.ticketUpdates }))}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${notifications.ticketUpdates ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.ticketUpdates ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div>
                                    <h4 className="font-medium text-sm">System Alerts</h4>
                                    <p className="text-xs text-foreground/60">Maintenance and system updates</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNotifications((current) => ({ ...current, systemAlerts: !current.systemAlerts }))}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${notifications.systemAlerts ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications.systemAlerts ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                        <Button onClick={saveNotifications} disabled={busySection !== ''}>
                            <Save size={16} className="mr-2" />
                            {busySection === 'notifications' ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                    <Card className="border-border/50 shadow-soft">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Shield size={20} />
                                Security
                            </CardTitle>
                            <CardDescription>Manage your account security and password settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Change Password</h4>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Input
                                            type={showPasswords ? 'text' : 'password'}
                                            label="Current Password"
                                            value={currentPassword}
                                            onChange={(event) => setCurrentPassword(event.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords((current) => !current)}
                                            className="absolute right-3 top-8 text-foreground/50 hover:text-foreground"
                                        >
                                            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <Input
                                        type={showPasswords ? 'text' : 'password'}
                                        label="New Password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                    />
                                    <Input
                                        type={showPasswords ? 'text' : 'password'}
                                        label="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                            <Button onClick={changePassword} disabled={busySection !== ''}>
                                <Key size={16} className="mr-2" />
                                {busySection === 'password' ? 'Updating...' : 'Change Password'}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                    <Card className="border-border/50 shadow-soft">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Eye size={20} />
                                Privacy & Data
                            </CardTitle>
                            <CardDescription>Control your privacy settings and data management.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Profile Visibility</h4>
                                <select
                                    value={privacy.profileVisibility}
                                    onChange={(event) => setPrivacy((current) => ({ ...current, profileVisibility: event.target.value }))}
                                    className="w-full p-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="team">Team Only</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div>
                                    <h4 className="font-medium text-sm">Data Sharing</h4>
                                    <p className="text-xs text-foreground/60">Share anonymized usage data</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPrivacy((current) => ({ ...current, dataSharing: !current.dataSharing }))}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${privacy.dataSharing ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${privacy.dataSharing ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div>
                                    <h4 className="font-medium text-sm">Analytics</h4>
                                    <p className="text-xs text-foreground/60">Help improve the service</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPrivacy((current) => ({ ...current, analytics: !current.analytics }))}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${privacy.analytics ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${privacy.analytics ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                            <Button onClick={savePrivacy} disabled={busySection !== ''}>
                                <Save size={16} className="mr-2" />
                                {busySection === 'privacy' ? 'Saving...' : 'Save Privacy Settings'}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                    <Card className="border-border/50 shadow-soft">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Globe size={20} />
                                Accessibility
                            </CardTitle>
                            <CardDescription>Customize the interface to meet your accessibility needs.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div>
                                    <h4 className="font-medium text-sm">High Contrast</h4>
                                    <p className="text-xs text-foreground/60">Increase color contrast</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAccessibility((current) => ({ ...current, highContrast: !current.highContrast }))}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${accessibility.highContrast ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${accessibility.highContrast ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div>
                                    <h4 className="font-medium text-sm">Reduced Motion</h4>
                                    <p className="text-xs text-foreground/60">Minimize animations</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAccessibility((current) => ({ ...current, reducedMotion: !current.reducedMotion }))}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${accessibility.reducedMotion ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${accessibility.reducedMotion ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/20">
                                <div>
                                    <h4 className="font-medium text-sm">Large Text</h4>
                                    <p className="text-xs text-foreground/60">Increase text size</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAccessibility((current) => ({ ...current, largeText: !current.largeText }))}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${accessibility.largeText ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${accessibility.largeText ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-border/50 pt-4">
                            <Button onClick={saveAccessibility} disabled={busySection !== ''}>
                                <Save size={16} className="mr-2" />
                                {busySection === 'accessibility' ? 'Saving...' : 'Save Accessibility Settings'}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
                    <Card className="border-border/50 shadow-soft">
                        <CardHeader className="border-b border-border/50 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Database size={20} />
                                Data Management
                            </CardTitle>
                            <CardDescription>Manage your data, exports, and account actions.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                <Button variant="outline" onClick={exportData} disabled={busySection !== ''} className="w-full justify-start">
                                    <Download size={16} className="mr-2" />
                                    {busySection === 'export' ? 'Preparing Export...' : 'Export My Data'}
                                </Button>

                                <Button variant="outline" onClick={clearCache} disabled={busySection !== ''} className="w-full justify-start">
                                    <RefreshCw size={16} className="mr-2" />
                                    {busySection === 'cache' ? 'Clearing Cache...' : 'Clear Cache'}
                                </Button>

                                <div className="border-t border-border/50 pt-4">
                                    <h4 className="font-medium text-sm text-destructive mb-2">Danger Zone</h4>
                                    <Button variant="destructive" onClick={deleteAccount} disabled={busySection !== ''} className="w-full justify-start">
                                        <Trash2 size={16} className="mr-2" />
                                        {busySection === 'delete' ? 'Deleting Account...' : 'Delete Account'}
                                    </Button>
                                    <p className="text-xs text-foreground/60 mt-2">
                                        This action cannot be undone. All your data will be permanently deleted.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
