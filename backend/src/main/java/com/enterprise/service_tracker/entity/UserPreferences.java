package com.enterprise.service_tracker.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private String language = "en";

    // Notification settings
    private boolean emailNotifications = true;
    private boolean pushNotifications = true;
    private boolean ticketUpdates = true;
    private boolean systemAlerts = true;

    // Privacy settings
    private String profileVisibility = "private";
    private boolean dataSharing = false;
    private boolean analytics = true;

    // Accessibility settings
    private boolean highContrast = false;
    private boolean reducedMotion = false;
    private boolean largeText = false;

    public UserPreferences() {}

    public UserPreferences(User user) {
        this.user = user;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public boolean isPushNotifications() {
        return pushNotifications;
    }

    public void setPushNotifications(boolean pushNotifications) {
        this.pushNotifications = pushNotifications;
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