package com.enterprise.service_tracker.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.enterprise.service_tracker.entity.Admin;

import java.util.Optional;

public interface AdminRepo extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmail(String email);
}