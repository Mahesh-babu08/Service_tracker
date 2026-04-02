package com.enterprise.service_tracker.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.enterprise.service_tracker.entity.AdminSettings;

public interface AdminSettingsRepo extends JpaRepository<AdminSettings, Long> {
    Optional<AdminSettings> findTopByOrderByIdAsc();
}
