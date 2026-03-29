package com.enterprise.service_tracker.dto;

public class UserPreferences {
    private String language = "en";
    private NotificationSettings notifications = new NotificationSettings();
    private PrivacySettings privacy = new PrivacySettings();
    private AccessibilitySettings accessibility = new AccessibilitySettings();

    public UserPreferences() {}

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public NotificationSettings getNotifications() {
        return notifications;
    }

    public void setNotifications(NotificationSettings notifications) {
        this.notifications = notifications;
    }

    public PrivacySettings getPrivacy() {
        return privacy;
    }

    public void setPrivacy(PrivacySettings privacy) {
        this.privacy = privacy;
    }

    public AccessibilitySettings getAccessibility() {
        return accessibility;
    }

    public void setAccessibility(AccessibilitySettings accessibility) {
        this.accessibility = accessibility;
    }

    public static class NotificationSettings {
        private boolean email = true;
        private boolean push = true;
        private boolean ticketUpdates = true;
        private boolean systemAlerts = true;

        public NotificationSettings() {}

        public boolean isEmail() {
            return email;
        }

        public void setEmail(boolean email) {
            this.email = email;
        }

        public boolean isPush() {
            return push;
        }

        public void setPush(boolean push) {
            this.push = push;
        }

        public boolean isTicketUpdates() {
            return ticketUpdates;
        }

        public void setTicketUpdates(boolean ticketUpdates) {
            this.ticketUpdates = ticketUpdates;
        }

        public boolean isSystemAlerts() {
            return systemAlerts;
        }

        public void setSystemAlerts(boolean systemAlerts) {
            this.systemAlerts = systemAlerts;
        }
    }

    public static class PrivacySettings {
        private String profileVisibility = "private";
        private boolean dataSharing = false;
        private boolean analytics = true;

        public PrivacySettings() {}

        public String getProfileVisibility() {
            return profileVisibility;
        }

        public void setProfileVisibility(String profileVisibility) {
            this.profileVisibility = profileVisibility;
        }

        public boolean isDataSharing() {
            return dataSharing;
        }

        public void setDataSharing(boolean dataSharing) {
            this.dataSharing = dataSharing;
        }

        public boolean isAnalytics() {
            return analytics;
        }

        public void setAnalytics(boolean analytics) {
            this.analytics = analytics;
        }
    }

    public static class AccessibilitySettings {
        private boolean highContrast = false;
        private boolean reducedMotion = false;
        private boolean largeText = false;

        public AccessibilitySettings() {}

        public boolean isHighContrast() {
            return highContrast;
        }

        public void setHighContrast(boolean highContrast) {
            this.highContrast = highContrast;
        }

        public boolean isReducedMotion() {
            return reducedMotion;
        }

        public void setReducedMotion(boolean reducedMotion) {
            this.reducedMotion = reducedMotion;
        }

        public boolean isLargeText() {
            return largeText;
        }

        public void setLargeText(boolean largeText) {
            this.largeText = largeText;
        }
    }
}