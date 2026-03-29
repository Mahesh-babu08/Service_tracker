package com.enterprise.service_tracker.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.enterprise.service_tracker.dto.ChangePasswordRequest;
import com.enterprise.service_tracker.dto.UpdateProfileRequest;
import com.enterprise.service_tracker.entity.User;
import com.enterprise.service_tracker.service.UserService;
import com.enterprise.service_tracker.entity.UserPreferences;

import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // =========================
    // GET CURRENT USER PROFILE
    // =========================
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(java.security.Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return ResponseEntity.ok(user);
    }

    // =========================
    // UPDATE USER PROFILE
    // =========================
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request, java.security.Principal principal) {
        try {
            User updatedUser = userService.updateProfile(principal.getName(), request.getName());
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // =========================
    // CHANGE PASSWORD
    // =========================
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request, java.security.Principal principal) {
        try {
            // Validate passwords match
            if (!request.getNewPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "New passwords do not match"));
            }

            userService.changePassword(principal.getName(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // =========================
    // GET USER PREFERENCES
    // =========================
    @GetMapping("/preferences")
    public ResponseEntity<UserPreferences> getPreferences(java.security.Principal principal) {
        UserPreferences preferences = userService.getUserPreferences(principal.getName());
        return ResponseEntity.ok(preferences);
    }

    // =========================
    // UPDATE NOTIFICATION SETTINGS
    // =========================
    @PutMapping("/preferences/notifications")
    public ResponseEntity<UserPreferences> updateNotificationSettings(
            @RequestBody com.enterprise.service_tracker.dto.UserPreferences.NotificationSettings settings,
            java.security.Principal principal) {
        UserPreferences updated = userService.updateNotificationSettings(principal.getName(), settings);
        return ResponseEntity.ok(updated);
    }

    // =========================
    // UPDATE PRIVACY SETTINGS
    // =========================
    @PutMapping("/preferences/privacy")
    public ResponseEntity<UserPreferences> updatePrivacySettings(
            @RequestBody com.enterprise.service_tracker.dto.UserPreferences.PrivacySettings settings,
            java.security.Principal principal) {
        UserPreferences updated = userService.updatePrivacySettings(principal.getName(), settings);
        return ResponseEntity.ok(updated);
    }

    // =========================
    // UPDATE ACCESSIBILITY SETTINGS
    // =========================
    @PutMapping("/preferences/accessibility")
    public ResponseEntity<UserPreferences> updateAccessibilitySettings(
            @RequestBody com.enterprise.service_tracker.dto.UserPreferences.AccessibilitySettings settings,
            java.security.Principal principal) {
        UserPreferences updated = userService.updateAccessibilitySettings(principal.getName(), settings);
        return ResponseEntity.ok(updated);
    }

    // =========================
    // UPDATE LANGUAGE SETTING
    // =========================
    @PutMapping("/preferences/language")
    public ResponseEntity<UserPreferences> updateLanguage(@RequestBody Map<String, String> request, java.security.Principal principal) {
        String language = request.get("language");
        if (language == null || language.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .build();
        }
        UserPreferences updated = userService.updateLanguage(principal.getName(), language);
        return ResponseEntity.ok(updated);
    }

    // =========================
    // EXPORT USER DATA
    // =========================
    @GetMapping("/export")
    public ResponseEntity<Map<String, Object>> exportUserData(java.security.Principal principal) {
        Map<String, Object> data = userService.exportUserData(principal.getName());
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=user-data.json")
                .body(data);
    }

    // =========================
    // DELETE USER ACCOUNT
    // =========================
    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(java.security.Principal principal) {
        try {
            userService.deleteUserAccount(principal.getName());
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
