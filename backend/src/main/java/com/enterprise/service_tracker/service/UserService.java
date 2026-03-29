package com.enterprise.service_tracker.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enterprise.service_tracker.Repo.TicketRepository;
import com.enterprise.service_tracker.Repo.UserPreferencesRepo;
import com.enterprise.service_tracker.Repo.UserRepo;
import com.enterprise.service_tracker.dto.UserPreferences.*;
import com.enterprise.service_tracker.dto.UserPreferences.AccessibilitySettings;
import com.enterprise.service_tracker.dto.UserPreferences.NotificationSettings;
import com.enterprise.service_tracker.dto.UserPreferences.PrivacySettings;
import com.enterprise.service_tracker.entity.User;
import com.enterprise.service_tracker.entity.UserPreferences;

@Service
public class UserService {

    private final UserRepo userRepository;
    private final TicketRepository ticketRepository;
    private final UserPreferencesRepo preferencesRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepo userRepository,
                       TicketRepository ticketRepository,
                       UserPreferencesRepo preferencesRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
        this.preferencesRepository = preferencesRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // GET USER BY EMAIL
    // =========================
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // =========================
    // GET USER BY ID
    // =========================
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // =========================
    // GET ALL USERS (ADMIN USE)
    // =========================
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // =========================
    // UPDATE USER PROFILE
    // =========================
    public User updateProfile(String email, String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }

        User user = getUserByEmail(email);
        user.setName(name.trim());
        return userRepository.save(user);
    }

    // =========================
    // CHANGE PASSWORD
    // =========================
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = getUserByEmail(email);

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // =========================
    // GET USER PREFERENCES
    // =========================
    public UserPreferences getUserPreferences(String email) {
        User user = getUserByEmail(email);
        return preferencesRepository.findByUser(user)
                .orElseGet(() -> createDefaultPreferences(user));
    }

    // =========================
    // CREATE DEFAULT PREFERENCES
    // =========================
    private UserPreferences createDefaultPreferences(User user) {
        UserPreferences preferences = new UserPreferences(user);
        return preferencesRepository.save(preferences);
    }

    // =========================
    // UPDATE NOTIFICATION SETTINGS
    // =========================
    public UserPreferences updateNotificationSettings(String email, NotificationSettings settings) {
        UserPreferences preferences = getUserPreferences(email);
        preferences.setEmailNotifications(settings.isEmail());
        preferences.setPushNotifications(settings.isPush());
        preferences.setTicketUpdates(settings.isTicketUpdates());
        preferences.setSystemAlerts(settings.isSystemAlerts());
        return preferencesRepository.save(preferences);
    }

    // =========================
    // UPDATE PRIVACY SETTINGS
    // =========================
    public UserPreferences updatePrivacySettings(String email, PrivacySettings settings) {
        UserPreferences preferences = getUserPreferences(email);
        preferences.setProfileVisibility(settings.getProfileVisibility());
        preferences.setDataSharing(settings.isDataSharing());
        preferences.setAnalytics(settings.isAnalytics());
        return preferencesRepository.save(preferences);
    }

    // =========================
    // UPDATE ACCESSIBILITY SETTINGS
    // =========================
    public UserPreferences updateAccessibilitySettings(String email, AccessibilitySettings settings) {
        UserPreferences preferences = getUserPreferences(email);
        preferences.setHighContrast(settings.isHighContrast());
        preferences.setReducedMotion(settings.isReducedMotion());
        preferences.setLargeText(settings.isLargeText());
        return preferencesRepository.save(preferences);
    }

    // =========================
    // UPDATE LANGUAGE SETTING
    // =========================
    public UserPreferences updateLanguage(String email, String language) {
        UserPreferences preferences = getUserPreferences(email);
        preferences.setLanguage(language.trim());
        return preferencesRepository.save(preferences);
    }

    // =========================
    // EXPORT USER DATA
    // =========================
    public Map<String, Object> exportUserData(String email) {
        User user = getUserByEmail(email);
        Map<String, Object> data = new HashMap<>();
        List<Map<String, Object>> tickets = ticketRepository.findByUserId(user.getId()).stream()
            .map(ticket -> Map.<String, Object>of(
                "id", ticket.getId(),
                "title", ticket.getTitle(),
                "description", ticket.getDescription(),
                "status", ticket.getStatus(),
                "priority", ticket.getPriority(),
                "createdAt", ticket.getCreatedAt(),
                "department", ticket.getDepartment().getName()
            ))
            .toList();

        // Basic user info
        data.put("user", Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole(),
            "createdAt", user.getId() // Using ID as proxy for creation time
        ));

        // User preferences
        UserPreferences preferences = getUserPreferences(email);
        data.put("preferences", Map.of(
            "language", preferences.getLanguage(),
            "notifications", Map.of(
                "email", preferences.isEmailNotifications(),
                "push", preferences.isPushNotifications(),
                "ticketUpdates", preferences.isTicketUpdates(),
                "systemAlerts", preferences.isSystemAlerts()
            ),
            "privacy", Map.of(
                "profileVisibility", preferences.getProfileVisibility(),
                "dataSharing", preferences.isDataSharing(),
                "analytics", preferences.isAnalytics()
            ),
            "accessibility", Map.of(
                "highContrast", preferences.isHighContrast(),
                "reducedMotion", preferences.isReducedMotion(),
                "largeText", preferences.isLargeText()
            )
        ));

        // User tickets
        data.put("tickets", tickets);

        return data;
    }

    // =========================
    // DELETE USER ACCOUNT
    // =========================
    @Transactional
    public void deleteUserAccount(String email) {
        User user = getUserByEmail(email);
        var assignedTickets = ticketRepository.findByAssignedToId(user.getId());
        assignedTickets.forEach(ticket -> ticket.setAssignedTo(null));
        ticketRepository.saveAll(assignedTickets);

        ticketRepository.deleteAll(ticketRepository.findByUserId(user.getId()));

        // Delete preferences first (due to foreign key constraint)
        preferencesRepository.findByUser(user).ifPresent(preferencesRepository::delete);

        // Delete user
        userRepository.delete(user);
    }
}
