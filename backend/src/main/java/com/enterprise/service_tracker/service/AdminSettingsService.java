package com.enterprise.service_tracker.service;

import org.springframework.stereotype.Service;

import com.enterprise.service_tracker.Repo.AdminSettingsRepo;
import com.enterprise.service_tracker.entity.AdminSettings;

@Service
public class AdminSettingsService {

    private final AdminSettingsRepo adminSettingsRepo;

    public AdminSettingsService(AdminSettingsRepo adminSettingsRepo) {
        this.adminSettingsRepo = adminSettingsRepo;
    }

    public AdminSettings getSettings() {
        return adminSettingsRepo.findTopByOrderByIdAsc()
                .orElseGet(() -> adminSettingsRepo.save(new AdminSettings()));
    }

    public AdminSettings updateSettings(AdminSettings incomingSettings) {
        AdminSettings settings = getSettings();

        // Update only the supported fields to keep the payload backward-compatible.
        if (incomingSettings.getSystemName() != null && !incomingSettings.getSystemName().isBlank()) {
            settings.setSystemName(incomingSettings.getSystemName().trim());
        }

        if (incomingSettings.getSupportEmail() != null && !incomingSettings.getSupportEmail().isBlank()) {
            settings.setSupportEmail(incomingSettings.getSupportEmail().trim());
        }

        return adminSettingsRepo.save(settings);
    }
}
