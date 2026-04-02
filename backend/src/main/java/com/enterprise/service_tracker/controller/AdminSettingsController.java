package com.enterprise.service_tracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.enterprise.service_tracker.entity.AdminSettings;
import com.enterprise.service_tracker.service.AdminSettingsService;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    public AdminSettingsController(AdminSettingsService adminSettingsService) {
        this.adminSettingsService = adminSettingsService;
    }

    @GetMapping
    public ResponseEntity<AdminSettings> getSettings() {
        return ResponseEntity.ok(adminSettingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<AdminSettings> updateSettings(@RequestBody AdminSettings settings) {
        return ResponseEntity.ok(adminSettingsService.updateSettings(settings));
    }
}
